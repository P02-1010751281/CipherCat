// @vitest-environment jsdom
import * as Blockly from 'blockly/core';
import 'blockly/blocks';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';

import '@/blocks/argon2';
import '@/blocks/data/number';
import '@/generators/javascript';
import '@/generators/javascript/argon2';
import '@/generators/python';
import '@/generators/python/argon2';

import { javascriptGenerator } from 'blockly/javascript';
import { pythonGenerator } from 'blockly/python';

const pythonCommand = process.env.CIPHER_CAT_PYTHON ||
  (process.platform === 'win32' ? 'python' : 'python3');

/** 两个确定性的 1024 字节块（内容由 SHA-256 计数器流生成，测试内可复现） */
function block1024(tag: string): number[] {
  const out: number[] = [];
  let counter = 0;
  while (out.length < 1024) {
    out.push(...createHash('sha256').update(`${tag}:${counter}`).digest());
    counter += 1;
  }
  return out.slice(0, 1024);
}

const X = block1024('argon2-g-x');
const Y = block1024('argon2-g-y');

function generate(language: 'javascript' | 'python', x: number[], y: number[]): string {
  const workspace = new Blockly.Workspace();
  try {
    const block = workspace.newBlock('argon2_g');
    for (const [input, values] of [['X', x], ['Y', y]] as const) {
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
 * 独立参考：按 RFC 9106 §3.5–§3.6 从零写一遍 G（BLAKE2b 轮 + 2·trunc 乘法，
 * 行列两轮 P 置换），不引用项目生成器中的任何代码。
 */
function referenceG(x: number[], y: number[]): string {
  return execFileSync(pythonCommand, ['-c', [
    'M64 = 0xFFFFFFFFFFFFFFFF',
    'M32 = 0xFFFFFFFF',
    `X = bytes(${JSON.stringify(x)})`,
    `Y = bytes(${JSON.stringify(y)})`,
    'def rotr(x, n): return ((x >> n) | (x << (64 - n))) & M64',
    'def gb(v, a, b, c, d):',
    '    v[a] = (v[a] + v[b] + 2 * (v[a] & M32) * (v[b] & M32)) & M64; v[d] = rotr(v[d] ^ v[a], 32)',
    '    v[c] = (v[c] + v[d] + 2 * (v[c] & M32) * (v[d] & M32)) & M64; v[b] = rotr(v[b] ^ v[c], 24)',
    '    v[a] = (v[a] + v[b] + 2 * (v[a] & M32) * (v[b] & M32)) & M64; v[d] = rotr(v[d] ^ v[a], 16)',
    '    v[c] = (v[c] + v[d] + 2 * (v[c] & M32) * (v[d] & M32)) & M64; v[b] = rotr(v[b] ^ v[c], 63)',
    'def p_round(w):',
    '    gb(w,0,4,8,12); gb(w,1,5,9,13); gb(w,2,6,10,14); gb(w,3,7,11,15)',
    '    gb(w,0,5,10,15); gb(w,1,6,11,12); gb(w,2,7,8,13); gb(w,3,4,9,14)',
    'def load(data): return [int.from_bytes(data[i*8:(i+1)*8], "little") for i in range(128)]',
    'A, B = load(X), load(Y)',
    'R = [A[i] ^ B[i] for i in range(128)]',
    'R0 = list(R)',
    'for i in range(8):',
    '    w = R[16*i:16*i+16]; p_round(w); R[16*i:16*i+16] = w',
    'for i in range(8):',
    '    w = []',
    '    for k in range(8): w += [R[2*i+16*k], R[2*i+16*k+1]]',
    '    p_round(w)',
    '    for k in range(8): R[2*i+16*k], R[2*i+16*k+1] = w[2*k], w[2*k+1]',
    'out = b"".join(((R0[i] ^ R[i]) & M64).to_bytes(8, "little") for i in range(128))',
    'print(out.hex())',
  ].join('\n')], { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 }).trim();
}

describe('Argon2 compression function G (RFC 9106 §3.5)', () => {
  it('matches an independent spec implementation in both languages', () => {
    const expected = referenceG(X, Y);
    expect(expected).toHaveLength(2048); // 1024 字节
    expect(evaluateJavaScript(generate('javascript', X, Y))).toBe(expected);
    expect(evaluatePython(generate('python', X, Y))).toBe(expected);
  });

  it('is symmetric in its inputs because R = X ⊕ Y', () => {
    expect(evaluateJavaScript(generate('javascript', Y, X))).toBe(evaluateJavaScript(generate('javascript', X, Y)));
  });

  it('rejects blocks that are not 1024 bytes', () => {
    expect(() => evaluateJavaScript(generate('javascript', X.slice(0, 1023), Y))).toThrow();
    expect(() => evaluatePython(generate('python', X, Y.slice(0, 512)))).toThrow();
  });
});
