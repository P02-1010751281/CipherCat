// @vitest-environment jsdom
import * as Blockly from 'blockly/core';
import 'blockly/blocks';
import { execFileSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';

import '@/blocks/data/number';
import '@/blocks/gmdrbg';
import '@/generators/javascript';
import '@/generators/python';
import { TYPE_BYTES, TYPE_NUMBER } from '@/constants/block-types';
import { javascriptGenerator } from 'blockly/javascript';
import { pythonGenerator } from 'blockly/python';
import { isNativeUint8Array } from './helpers/native-bytes';

const pythonCommand = process.env.CIPHER_CAT_PYTHON ||
  (process.platform === 'win32' ? 'python' : 'python3');

const demoInputs = {
  ENTROPY: '[0,17,34,51,68,85,102,119,136,153,170,187,204,221,238,255]',
  NONCE: '[1,2,3,4,5,6,7,8]',
  PERSO: '[15,14,13,12,11,10,9,8]',
};

function generateCode(language: 'javascript' | 'python', length: string): string {
  const workspace = new Blockly.Workspace();
  try {
    const block = workspace.newBlock('gm_rng');
    for (const [name, expression] of Object.entries(demoInputs)) {
      const value = workspace.newBlock('data_value');
      value.setFieldValue(language === 'javascript'
        ? `Uint8Array.from(${expression})`
        : `bytes(${expression})`, 'NUM');
      value.outputConnection!.setCheck(TYPE_BYTES);
      block.getInput(name)!.connection!.connect(value.outputConnection!);
    }
    const lengthValue = workspace.newBlock('data_value');
    lengthValue.setFieldValue(length, 'NUM');
    lengthValue.outputConnection!.setCheck(TYPE_NUMBER);
    block.getInput('LEN')!.connection!.connect(lengthValue.outputConnection!);

    const generator = language === 'javascript' ? javascriptGenerator : pythonGenerator;
    return generator.workspaceToCode(workspace);
  } finally {
    workspace.dispose();
  }
}

function splitProgram(program: string): { helpers: string[]; expression: string } {
  const lines = program.trim().split('\n');
  return { helpers: lines.slice(0, -1), expression: lines.at(-1)!.replace(/;$/, '') };
}

function runJavaScript(program: string): Uint8Array {
  const { helpers, expression } = splitProgram(program);
  return new Function([...helpers, `return ${expression};`].join('\n'))() as Uint8Array;
}

function runPython(program: string): string {
  const { helpers, expression } = splitProgram(program);
  return execFileSync(pythonCommand, ['-c', [
    ...helpers,
    `result = ${expression}`,
    'assert type(result) is bytes',
    'print(result.hex())',
  ].join('\n')], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}

function capturePythonError(program: string): string | null {
  const { helpers, expression } = splitProgram(program);
  const output = execFileSync(pythonCommand, ['-c', [
    ...helpers,
    'try:',
    `    result = ${expression}`,
    'except Exception as error:',
    '    print(type(error).__name__ + ":" + str(error))',
    'else:',
    '    print("no error")',
  ].join('\n')], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  return output === 'no error' ? null : output;
}

describe('GM-RNG Blockly output contract', () => {
  it('matches an independent OpenSSL-backed SM3-HMAC reference for the Demo sample', () => {
    const expected = 'e83283b6eeaa9c4fe07594f21369041ad8203c395400cf03136f7a18ce2a9721';
    // 该参考值由 Node.js crypto/OpenSSL（createHmac('sm3')）在开发期派生并记录在这里，
    // 仓库内不重新推导（DRBG 构造需要多步 K/V 更新，不是单次 HMAC）。它只是独立实现交叉，
    // 不是 GM/T 或 NIST 官方向量，也不代表熵源质量。
    const javascript = runJavaScript(generateCode('javascript', '32'));
    expect(isNativeUint8Array(javascript)).toBe(true);
    expect(Buffer.from(javascript).toString('hex')).toBe(expected);
    expect(runPython(generateCode('python', '32'))).toBe(expected);
  });

  // 该用例在双语言下求值 65536 字节，52 worker 并行时可能超过 vitest 默认 5s 预算；
  // 显式给 30s 预算，避免负载导致的假失败（不等于放宽算法断言）。
  it('enforces an integer output length from 0 through 65536 bytes in both languages', { timeout: 30_000 }, () => {
    const message = 'GM-RNG output length must be an integer from 0 to 65536 bytes';
    const javascriptEmpty = runJavaScript(generateCode('javascript', '0'));
    expect(isNativeUint8Array(javascriptEmpty)).toBe(true);
    expect(javascriptEmpty).toHaveLength(0);
    expect(runPython(generateCode('python', '0'))).toBe('');

    for (const length of ['-1', '1.5', '65537']) {
      expect(() => runJavaScript(generateCode('javascript', length))).toThrow(message);
      expect(capturePythonError(generateCode('python', length))).toBe(`ValueError:${message}`);
    }

    const javascript = runJavaScript(generateCode('javascript', '65536'));
    expect(isNativeUint8Array(javascript)).toBe(true);
    expect(javascript).toHaveLength(65536);
    const python = runPython(generateCode('python', '65536'));
    expect(python).toHaveLength(65536 * 2);
  });
});
