// @vitest-environment jsdom
import * as Blockly from 'blockly/core';
import 'blockly/blocks';
import { execFileSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';

import '@/blocks/drbg';
import '@/blocks/data/number';
import '@/generators/javascript';
import '@/generators/javascript/drbg';
import '@/generators/python';
import '@/generators/python/drbg';

import { javascriptGenerator } from 'blockly/javascript';
import { pythonGenerator } from 'blockly/python';

const pythonCommand = process.env.CIPHER_CAT_PYTHON ||
  (process.platform === 'win32' ? 'python' : 'python3');

/** SP 800-90A §10.1.2.2 的初始状态 K = 0x00×32、V = 0x01×32 */
const INITIAL_STATE = [...new Array(32).fill(0x00), ...new Array(32).fill(0x01)];
const ENTROPY = [0xca, 0x85, 0x19, 0x11, 0x34, 0x93, 0x84, 0xbf, 0xfe, 0x89, 0xde, 0x1c, 0xbd, 0xc4, 0x6e, 0x68];
const NONCE = [0x31, 0xe4, 0x4d, 0x34, 0xa4, 0xfb, 0x93, 0x5e, 0xe2, 0x85, 0xdd, 0x14, 0xb7, 0x1a, 0x74, 0x88];

function generate(language: 'javascript' | 'python', state: number[], provided: number[]): string {
  const workspace = new Blockly.Workspace();
  try {
    const block = workspace.newBlock('drbg_update');
    for (const [input, values] of [['STATE', state], ['PROVIDED', provided]] as const) {
      const source = workspace.newBlock('data_value');
      source.setFieldValue(`[${values.join(', ')}]`, 'NUM');
      block.getInput(input)!.connection!.connect(source.outputConnection!);
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
  return execFileSync(process.execPath, ['-e', [
    ...lines,
    `const result = ${expression};`,
    'console.log(Buffer.from(result).toString("hex"));',
  ].join('\n')], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
}

function evaluatePython(program: string): string {
  const lines = program.trim().split('\n');
  const expression = lines.pop()!;
  return execFileSync(pythonCommand, ['-c', [
    ...lines,
    `result = ${expression}`,
    'print(bytes(result).hex())',
  ].join('\n')], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
}

/**
 * 独立参考实现：直接按 SP 800-90A §10.1.2.2 用 Python 标准库重写一遍 Update，
 * 与生成代码的输出比对（不调用项目生成器里的同一段代码）。
 */
function referenceUpdate(kv: number[], provided: number[]): string {
  return execFileSync(pythonCommand, ['-c', [
    'import hmac, hashlib',
    `kv = bytes(${JSON.stringify(kv)})`,
    `data = bytes(${JSON.stringify(provided)})`,
    'k, v = kv[:32], kv[32:]',
    'k = hmac.new(k, v + b"\\x00" + data, hashlib.sha256).digest()',
    'v = hmac.new(k, v, hashlib.sha256).digest()',
    'k = hmac.new(k, v + b"\\x01" + data, hashlib.sha256).digest()',
    'v = hmac.new(k, v, hashlib.sha256).digest()',
    'print((k + v).hex())',
  ].join('\n')], { encoding: 'utf8' }).trim();
}

describe('HMAC_DRBG update block contract (SP 800-90A §10.1.2.2)', () => {
  it('updates K‖V with provided data and matches an independent implementation', () => {
    const provided = [...ENTROPY, ...NONCE];
    const expected = referenceUpdate(INITIAL_STATE, provided);
    expect(evaluateJavaScript(generate('javascript', INITIAL_STATE, provided))).toBe(expected);
    expect(evaluatePython(generate('python', INITIAL_STATE, provided))).toBe(expected);
    expect(expected).toHaveLength(128);
  });

  it('returns a 64-byte state and both languages agree for empty provided data', () => {
    const js = evaluateJavaScript(generate('javascript', INITIAL_STATE, []));
    const py = evaluatePython(generate('python', INITIAL_STATE, []));
    expect(js).toHaveLength(128);
    expect(js).toBe(py);
    expect(js).toBe(referenceUpdate(INITIAL_STATE, []));
  });

  it('rejects a state that is not 64 bytes in both languages', () => {
    expect(() => evaluateJavaScript(generate('javascript', new Array(32).fill(0), ENTROPY))).toThrow();
    expect(() => evaluatePython(generate('python', new Array(32).fill(0), ENTROPY))).toThrow();
  });
});
