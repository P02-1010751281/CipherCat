// @vitest-environment jsdom
import * as Blockly from 'blockly/core';
import 'blockly/blocks';
import { execFileSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';

import '@/blocks/data/number';
import '@/blocks/hkdf/blocks';
import '@/blocks/pbkdf2/blocks';
import '@/generators/javascript';
import '@/generators/python';
import { javascriptGenerator } from 'blockly/javascript';
import { pythonGenerator } from 'blockly/python';
import { isNativeUint8Array } from './helpers/native-bytes';

const pythonCommand = process.env.CIPHER_CAT_PYTHON ||
  (process.platform === 'win32' ? 'python' : 'python3');

function generateCode(
  language: 'javascript' | 'python',
  type: 'hkdf' | 'pbkdf2',
  inputs: Record<string, string>,
  fields: Record<string, string> = {},
): string {
  const workspace = new Blockly.Workspace();
  try {
    const block = workspace.newBlock(type);
    for (const [name, value] of Object.entries(fields)) block.setFieldValue(value, name);
    for (const [name, expression] of Object.entries(inputs)) {
      const value = workspace.newBlock('data_value');
      value.setFieldValue(expression, 'NUM');
      block.getInput(name)!.connection!.connect(value.outputConnection!);
    }
    return (language === 'javascript' ? javascriptGenerator : pythonGenerator).workspaceToCode(workspace);
  } finally {
    workspace.dispose();
  }
}

function splitProgram(program: string): { helpers: string[]; expression: string } {
  const lines = program.trim().split('\n');
  return { helpers: lines.slice(0, -1), expression: lines.at(-1)!.replace(/;$/, '') };
}

function runJavaScript(program: string): unknown {
  const { helpers, expression } = splitProgram(program);
  return new Function([...helpers, `return ${expression};`].join('\n'))();
}

function expectJavaScriptBytes(value: unknown): asserts value is Uint8Array {
  expect(isNativeUint8Array(value)).toBe(true);
}

function runPython(program: string): { isBytes: boolean; hex: string } {
  const { helpers, expression } = splitProgram(program);
  const output = execFileSync(pythonCommand, ['-c', [
    ...helpers,
    `result = ${expression}`,
    'print(str(type(result) is bytes) + ":" + result.hex())',
  ].join('\n')], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim().split(':', 2);
  return { isBytes: output[0] === 'True', hex: output[1] };
}

function capturePythonError(program: string): string | null {
  const { helpers, expression } = splitProgram(program);
  const wrapped = [
    ...helpers,
    'try:',
    `    result = ${expression}`,
    'except Exception as error:',
    '    print(type(error).__name__ + ":" + str(error))',
    'else:',
    '    print("no error")',
  ].join('\n');
  const output = execFileSync(pythonCommand, ['-c', wrapped], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
  return output === 'no error' ? null : output;
}

describe('HKDF and PBKDF2 parameter contracts', () => {
  it('rejects negative, fractional, boolean, and oversized HKDF output lengths in both languages', () => {
    for (const [jsLength, pyLength] of [['-1', '-1'], ['1.5', '1.5'], ['8161', '8161'], ['true', 'True']]) {
      const javascript = generateCode('javascript', 'hkdf', {
        SALT: 'new Uint8Array(0)',
        IKM: 'new Uint8Array([1])',
        INFO: 'new Uint8Array(0)',
        LEN: jsLength,
      });
      const python = generateCode('python', 'hkdf', {
        SALT: 'bytes()',
        IKM: 'bytes([1])',
        INFO: 'bytes()',
        LEN: pyLength,
      });
      const message = 'HKDF output length must be an integer from 0 to 8160 bytes';

      expect(() => runJavaScript(javascript)).toThrow(message);
      expect(capturePythonError(python)).toContain(message);
    }
  });

  it('matches RFC 5869 Appendix A.1 and returns the declared byte type', () => {
    const javascript = generateCode('javascript', 'hkdf', {
      SALT: 'Uint8Array.from([0,1,2,3,4,5,6,7,8,9,10,11,12])',
      IKM: 'Uint8Array.from([' + Array(22).fill(11).join(',') + '])',
      INFO: 'Uint8Array.from([240,241,242,243,244,245,246,247,248,249])',
      LEN: '42',
    });
    const python = generateCode('python', 'hkdf', {
      SALT: 'bytes(range(13))',
      IKM: 'bytes([11] * 22)',
      INFO: 'bytes(range(240, 250))',
      LEN: '42',
    });
    const expected = '3cb25f25faacd57a90434f64d0362f2a2d2d0a90cf1a5a4c5db02d56ecc4c5bf34007208d5b887185865';
    const javascriptResult = runJavaScript(javascript);
    expectJavaScriptBytes(javascriptResult);
    expect(Buffer.from(javascriptResult).toString('hex')).toBe(expected);
    expect(runPython(python)).toEqual({ isBytes: true, hex: expected });
  });

  it('accepts integer-valued numeric literals in both generated languages', () => {
    const javascriptHkdf = generateCode('javascript', 'hkdf', {
      SALT: 'new Uint8Array(0)', IKM: 'new Uint8Array([1])', INFO: 'new Uint8Array(0)', LEN: '1.0',
    });
    const pythonHkdf = generateCode('python', 'hkdf', {
      SALT: 'bytes()', IKM: 'bytes([1])', INFO: 'bytes()', LEN: '1.0',
    });
    const jsHkdf = runJavaScript(javascriptHkdf);
    const pyHkdf = runPython(pythonHkdf);
    expectJavaScriptBytes(jsHkdf);
    expect(jsHkdf).toHaveLength(1);
    expect(pyHkdf.isBytes).toBe(true);
    expect(pyHkdf.hex).toHaveLength(2);
    expect(Buffer.from(jsHkdf).toString('hex')).toBe(pyHkdf.hex);

    const javascriptPbkdf2 = generateCode('javascript', 'pbkdf2', {
      PASSWORD: 'new TextEncoder().encode("passwd")',
      SALT: 'new TextEncoder().encode("salt")',
      ITER: '1.0',
      KEYLEN: '16.0',
    }, { HASH: 'sha256' });
    const pythonPbkdf2 = generateCode('python', 'pbkdf2', {
      PASSWORD: 'b"passwd"',
      SALT: 'b"salt"',
      ITER: '1.0',
      KEYLEN: '16.0',
    }, { HASH: 'sha256' });
    const jsPbkdf2 = runJavaScript(javascriptPbkdf2);
    expectJavaScriptBytes(jsPbkdf2);
    expect(Buffer.from(jsPbkdf2).toString('hex')).toBe('55ac046e56e3089fec1691c22544b605');
    expect(runPython(pythonPbkdf2)).toEqual({ isBytes: true, hex: '55ac046e56e3089fec1691c22544b605' });
  });

  it('rejects Fraction values for Python KDF numeric parameters', () => {
    const fraction = "__import__('fractions').Fraction(3, 2)";
    const hkdf = generateCode('python', 'hkdf', {
      SALT: 'bytes()', IKM: 'bytes([1])', INFO: 'bytes()', LEN: fraction,
    });
    const pbkdf2Iterations = generateCode('python', 'pbkdf2', {
      PASSWORD: 'b"passwd"', SALT: 'b"salt"', ITER: fraction, KEYLEN: '16',
    }, { HASH: 'sha256' });
    const pbkdf2Length = generateCode('python', 'pbkdf2', {
      PASSWORD: 'b"passwd"', SALT: 'b"salt"', ITER: '1', KEYLEN: fraction,
    }, { HASH: 'sha256' });

    expect(capturePythonError(hkdf)).toContain('HKDF output length must be an integer');
    expect(capturePythonError(pbkdf2Iterations)).toContain('PBKDF2 iteration count must be a positive integer');
    expect(capturePythonError(pbkdf2Length)).toContain('PBKDF2 derived-key length must be a positive integer');
  });

  it('allows the HKDF 255-block output limit and a zero-length result', () => {
    for (const length of ['8160', '0']) {
      const javascript = generateCode('javascript', 'hkdf', {
        SALT: 'new Uint8Array(0)', IKM: 'new Uint8Array([1])', INFO: 'new Uint8Array(0)', LEN: length,
      });
      const python = generateCode('python', 'hkdf', {
        SALT: 'bytes()', IKM: 'bytes([1])', INFO: 'bytes()', LEN: length,
      });
      const javascriptResult = runJavaScript(javascript);
      expectJavaScriptBytes(javascriptResult);
      expect(javascriptResult).toHaveLength(Number(length));
      const pythonResult = runPython(python);
      expect(pythonResult.isBytes).toBe(true);
      expect(pythonResult.hex).toHaveLength(Number(length) * 2);
    }
  });

  it('rejects non-positive, fractional, boolean, or unsafe PBKDF2 iteration counts in both languages', () => {
    for (const [jsIterations, pyIterations] of [
      ['0', '0'], ['-1', '-1'], ['1.5', '1.5'], ['9007199254740992', '9007199254740992'], ['true', 'True'],
    ]) {
      const javascript = generateCode('javascript', 'pbkdf2', {
        PASSWORD: 'new Uint8Array([1])',
        SALT: 'new Uint8Array([2])',
        ITER: jsIterations,
        KEYLEN: '16',
      });
      const python = generateCode('python', 'pbkdf2', {
        PASSWORD: 'bytes([1])',
        SALT: 'bytes([2])',
        ITER: pyIterations,
        KEYLEN: '16',
      });
      const message = 'PBKDF2 iteration count must be a positive integer';

      expect(() => runJavaScript(javascript)).toThrow(message);
      expect(capturePythonError(python)).toContain(message);
    }
  });

  it('matches RFC 7914 Section 11 PBKDF2-HMAC-SHA-256, including a partial final block', () => {
    const expected = '55ac046e56e3089fec1691c22544b605f94185216dde0465e68b9d57c20dacbc49ca9cccf179b645991664b39d77ef317c71b845b1e30bd509112041d3a19783';
    for (const keyLength of [64, 33]) {
      const javascript = generateCode('javascript', 'pbkdf2', {
        PASSWORD: 'new TextEncoder().encode("passwd")',
        SALT: 'new TextEncoder().encode("salt")',
        ITER: '1',
        KEYLEN: String(keyLength),
      }, { HASH: 'sha256' });
      const python = generateCode('python', 'pbkdf2', {
        PASSWORD: 'b"passwd"',
        SALT: 'b"salt"',
        ITER: '1',
        KEYLEN: String(keyLength),
      }, { HASH: 'sha256' });
      const expectedPrefix = expected.slice(0, keyLength * 2);
      const javascriptResult = runJavaScript(javascript);
      expectJavaScriptBytes(javascriptResult);
      expect(Buffer.from(javascriptResult).toString('hex')).toBe(expectedPrefix);
      expect(runPython(python)).toEqual({ isBytes: true, hex: expectedPrefix });
    }
  });

  it('matches an independent PBKDF2-HMAC-SM3 result and returns the declared byte type', () => {
    // Reference derived with OpenSSL 3: openssl kdf -keylen 32 -kdfopt digest:SM3
    // -kdfopt pass:passwd -kdfopt salt:salt -kdfopt iter:1 PBKDF2.
    const expected = '30530b86537c85ea33fbe26ee0adea8d8bd91d283b87936f400e83ad2364ef26';
    const javascript = generateCode('javascript', 'pbkdf2', {
      PASSWORD: 'new TextEncoder().encode("passwd")',
      SALT: 'new TextEncoder().encode("salt")',
      ITER: '1',
      KEYLEN: '32',
    }, { HASH: 'sm3' });
    const python = generateCode('python', 'pbkdf2', {
      PASSWORD: 'b"passwd"',
      SALT: 'b"salt"',
      ITER: '1',
      KEYLEN: '32',
    }, { HASH: 'sm3' });
    const javascriptResult = runJavaScript(javascript);
    expectJavaScriptBytes(javascriptResult);
    expect(Buffer.from(javascriptResult).toString('hex')).toBe(expected);
    expect(runPython(python)).toEqual({ isBytes: true, hex: expected });
    // 让“独立参考”可重复：用 Python 的 hashlib（OpenSSL 后端）现场复算同一组 PBKDF2-HMAC-SM3 参数，
    // 比较对象就是这个用例的 expected（30530b86…）。环境不支持 SM3 时该断言会直接失败，不会静默跳过。
    const sm3Recomputed = execFileSync(process.platform === 'win32' ? 'python' : 'python3', ['-c',
      'import hashlib; print(hashlib.pbkdf2_hmac("sm3", b"passwd", b"salt", 1, 32).hex())',
    ], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
    expect(sm3Recomputed).toBe(expected);
  });

  it('rejects non-positive, fractional, boolean, or oversized PBKDF2 key lengths in both languages', () => {
    for (const [jsKeyLength, pyKeyLength] of [
      ['0', '0'], ['-1', '-1'], ['1.5', '1.5'], ['137438953441', '137438953441'], ['true', 'True'],
    ]) {
      const javascript = generateCode('javascript', 'pbkdf2', {
        PASSWORD: 'new Uint8Array([1])',
        SALT: 'new Uint8Array([2])',
        ITER: '1',
        KEYLEN: jsKeyLength,
      });
      const python = generateCode('python', 'pbkdf2', {
        PASSWORD: 'bytes([1])',
        SALT: 'bytes([2])',
        ITER: '1',
        KEYLEN: pyKeyLength,
      });
      const message = 'PBKDF2 derived-key length must be a positive integer within the RFC limit';

      expect(() => runJavaScript(javascript)).toThrow(message);
      expect(capturePythonError(python)).toContain(message);
    }
  });
});
