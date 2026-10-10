// @vitest-environment jsdom
import * as Blockly from 'blockly/core';
import 'blockly/blocks';
import { execFileSync } from 'node:child_process';
import { createHmac } from 'node:crypto';
import { describe, expect, it } from 'vitest';

import '@/blocks/data/number';
import '@/blocks/remaining';
import '@/generators/javascript';
import '@/generators/javascript/remaining';
import '@/generators/python';
import '@/generators/python/remaining';

import { javascriptGenerator } from 'blockly/javascript';
import { pythonGenerator } from 'blockly/python';

const pythonCommand = process.env.CIPHER_CAT_PYTHON ||
  (process.platform === 'win32' ? 'python' : 'python3');

function generate(
  language: 'javascript' | 'python',
  hash: 'SHA-256' | 'SM3',
  key: string,
  message: string,
  composeToHex = false,
): string {
  const workspace = new Blockly.Workspace();
  try {
    const hmac = workspace.newBlock('hash_hmac');
    hmac.setFieldValue(hash, 'HASH');

    const keyBlock = workspace.newBlock('data_value');
    keyBlock.setFieldValue(key, 'NUM');
    hmac.getInput('KEY')!.connection!.connect(keyBlock.outputConnection!);

    const messageBlock = workspace.newBlock('data_value');
    messageBlock.setFieldValue(message, 'NUM');
    hmac.getInput('MSG')!.connection!.connect(messageBlock.outputConnection!);

    if (composeToHex) {
      const toHex = workspace.newBlock('bytes_to_hex');
      toHex.getInput('INPUT')!.connection!.connect(hmac.outputConnection!);
    }

    const generator = language === 'javascript' ? javascriptGenerator : pythonGenerator;
    return generator.workspaceToCode(workspace);
  } finally {
    workspace.dispose();
  }
}

function evaluateJavaScript(program: string): string {
  const lines = program.trim().split('\n');
  const expression = lines.pop()!.replace(/;$/, '');
  const source = [
    ...lines,
    `const result = ${expression};`,
    'if (result && typeof result.then === "function") throw new TypeError("expected a synchronous Blockly result");',
    'console.log(typeof result === "string" ? result : Buffer.from(result).toString("hex"));',
  ].join('\n');
  return execFileSync(process.execPath, ['-e', source], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  }).trim();
}

function evaluatePython(program: string): string {
  const lines = program.trim().split('\n');
  const expression = lines.pop()!;
  return execFileSync(pythonCommand, ['-c', [
    ...lines,
    `result = ${expression}`,
    'print(result if isinstance(result, str) else bytes(result).hex())',
  ].join('\n')], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
}

function evaluatesToUint8Array(program: string): boolean {
  const lines = program.trim().split('\n');
  const expression = lines.pop()!.replace(/;$/, '');
  return execFileSync(process.execPath, ['-e', [
    ...lines,
    `console.log((value => ArrayBuffer.isView(value) && Object.getOwnPropertyDescriptor(Object.getPrototypeOf(Uint8Array.prototype), Symbol.toStringTag).get.call(value) === 'Uint8Array' && Object.getPrototypeOf(value) === Uint8Array.prototype)(${expression}));`,
  ].join('\n')], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim() === 'true';
}

function evaluatesToBytes(program: string): boolean {
  const lines = program.trim().split('\n');
  const expression = lines.pop()!;
  return execFileSync(pythonCommand, ['-c', [
    ...lines,
    `result = ${expression}`,
    'print(type(result) is bytes)',
  ].join('\n')], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim() === 'True';
}

describe('HMAC Blockly block contract', () => {
  it.each(['SHA-256', 'SM3'] as const)('returns the declared Bytes runtime type for %s', (hash) => {
    expect(evaluatesToUint8Array(generate('javascript', hash, '[1]', '[2]'))).toBe(true);
    expect(evaluatesToBytes(generate('python', hash, '[1]', '[2]'))).toBe(true);
  });

  it.each([
    {
      name: 'RFC 4231 case 1',
      key: Buffer.alloc(20, 0x0b),
      message: Buffer.from('Hi There'),
      keyJavaScript: 'new Uint8Array(20).fill(0x0b)',
      keyPython: 'bytes([0x0b] * 20)',
      messageJavaScript: 'new TextEncoder().encode("Hi There")',
      messagePython: 'b"Hi There"',
      expected: 'b0344c61d8db38535ca8afceaf0bf12b881dc200c9833da726e9376c2e32cff7',
    },
    {
      name: 'RFC 4231 case 6 (key longer than block size)',
      key: Buffer.alloc(131, 0xaa),
      message: Buffer.from('Test Using Larger Than Block-Size Key - Hash Key First'),
      keyJavaScript: 'new Uint8Array(131).fill(0xaa)',
      keyPython: 'bytes([0xaa] * 131)',
      messageJavaScript: 'new TextEncoder().encode("Test Using Larger Than Block-Size Key - Hash Key First")',
      messagePython: 'b"Test Using Larger Than Block-Size Key - Hash Key First"',
      expected: '60e431591ee0b67f0d8a26aacbf5b77f8e0bc6213728c5140546040f0ee37f54',
    },
  ])('matches $name with the SHA-256 option in both languages', (vector) => {
    expect(createHmac('sha256', vector.key).update(vector.message).digest('hex')).toBe(vector.expected);
    expect(evaluateJavaScript(generate('javascript', 'SHA-256', vector.keyJavaScript, vector.messageJavaScript)))
      .toBe(vector.expected);
    expect(evaluatePython(generate('python', 'SHA-256', vector.keyPython, vector.messagePython)))
      .toBe(vector.expected);
  });

  it.each([
    { name: 'short key', key: Buffer.from('key'), keyJavaScript: 'new TextEncoder().encode("key")', keyPython: 'b"key"' },
    { name: 'long key', key: Buffer.alloc(131, 0xaa), keyJavaScript: 'new Uint8Array(131).fill(0xaa)', keyPython: 'bytes([0xaa] * 131)' },
  ])('matches the native SM3 HMAC reference with a $name', (vector) => {
    const message = Buffer.from('abc');
    const expected = createHmac('sm3', vector.key).update(message).digest('hex');
    expect(evaluateJavaScript(generate('javascript', 'SM3', vector.keyJavaScript, 'new TextEncoder().encode("abc")')))
      .toBe(expected);
    expect(evaluatePython(generate('python', 'SM3', vector.keyPython, 'b"abc"'))).toBe(expected);
  });

  it('rejects malformed byte arrays in either input for both algorithms and languages', () => {
    const invalidValues = [
      { javascript: '[-1]', python: '[-1]' },
      { javascript: '[256]', python: '[256]' },
      { javascript: '[1.5]', python: '[1.5]' },
      { javascript: 'new Array(1)', python: '[None]' },
      { javascript: '["1"]', python: '["1"]' },
      { javascript: '[true]', python: '[True]' },
    ];

    for (const hash of ['SHA-256', 'SM3'] as const) {
      for (const value of invalidValues) {
        expect(() => evaluateJavaScript(generate('javascript', hash, value.javascript, 'new Uint8Array([1])')))
          .toThrow();
        expect(() => evaluatePython(generate('python', hash, value.python, 'bytes([1])'))).toThrow();
        expect(() => evaluateJavaScript(generate('javascript', hash, 'new Uint8Array([1])', value.javascript)))
          .toThrow();
        expect(() => evaluatePython(generate('python', hash, 'bytes([1])', value.python))).toThrow();
      }
    }
  });

  it('treats integer-valued numeric bytes identically in JavaScript and Python', () => {
    for (const hash of ['SHA-256', 'SM3'] as const) {
      for (const language of ['javascript', 'python'] as const) {
        const floatBytes = language === 'javascript'
          ? evaluateJavaScript(generate(language, hash, '[1.0]', '[2.0]'))
          : evaluatePython(generate(language, hash, '[1.0]', '[2.0]'));
        const integerBytes = language === 'javascript'
          ? evaluateJavaScript(generate(language, hash, '[1]', '[2]'))
          : evaluatePython(generate(language, hash, '[1]', '[2]'));
        expect(floatBytes).toBe(integerBytes);
      }
    }
  });

  it.each(['SHA-256', 'SM3'] as const)('encodes valid Unicode text identically for %s', (hash) => {
    const key = '密钥🧪';
    const message = 'café 𝄞';
    const expected = createHmac(hash === 'SM3' ? 'sm3' : 'sha256', Buffer.from(key, 'utf8'))
      .update(Buffer.from(message, 'utf8'))
      .digest('hex');

    expect(evaluateJavaScript(generate('javascript', hash, JSON.stringify(key), JSON.stringify(message))))
      .toBe(expected);
    expect(evaluatePython(generate('python', hash, JSON.stringify(key), JSON.stringify(message))))
      .toBe(expected);
  });

  it.each(['SHA-256', 'SM3'] as const)('rejects unpaired Unicode surrogates for %s', (hash) => {
    const invalidTexts = [String.fromCharCode(0xd800), String.fromCharCode(0xdc00)];
    for (const invalidText of invalidTexts) {
      const invalidExpression = JSON.stringify(invalidText);
      const validExpression = JSON.stringify('valid text');
      for (const invalidPosition of ['key', 'message'] as const) {
        const key = invalidPosition === 'key' ? invalidExpression : validExpression;
        const message = invalidPosition === 'message' ? invalidExpression : validExpression;
        expect(() => evaluateJavaScript(generate('javascript', hash, key, message))).toThrow();
        expect(() => evaluatePython(generate('python', hash, key, message))).toThrow();
      }
    }
  });

  it.each(['SHA-256', 'SM3'] as const)('can compose the $hash result into a synchronous bytes consumer', (hash) => {
    const key = Buffer.from([1, 2, 3]);
    const message = Buffer.from([4, 5, 6]);
    const expected = createHmac(hash === 'SM3' ? 'sm3' : 'sha256', key).update(message).digest('hex');

    expect(evaluateJavaScript(generate('javascript', hash, '[1, 2, 3]', '[4, 5, 6]', true))).toBe(expected);
    expect(evaluatePython(generate('python', hash, '[1, 2, 3]', '[4, 5, 6]', true))).toBe(expected);
  });
});
