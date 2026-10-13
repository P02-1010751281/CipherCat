// @vitest-environment jsdom
import * as Blockly from 'blockly/core';
import 'blockly/blocks';
import { execFileSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';

import '@/blocks/sm2enc';
import '@/blocks/data/number';
import '@/generators/javascript';
import '@/generators/javascript/sm2enc';
import '@/generators/python';
import '@/generators/python/sm2enc';

import { javascriptGenerator } from 'blockly/javascript';
import { pythonGenerator } from 'blockly/python';

const pythonCommand = process.env.CIPHER_CAT_PYTHON ||
  (process.platform === 'win32' ? 'python' : 'python3');

const Z = Array.from(Buffer.from('sm2-kdf-shared-secret'));

function generate(language: 'javascript' | 'python', klen: number): string {
  const workspace = new Blockly.Workspace();
  try {
    const block = workspace.newBlock('sm2_kdf');
    const zBlock = workspace.newBlock('data_value');
    zBlock.setFieldValue(`[${Z.join(', ')}]`, 'NUM');
    block.getInput('Z')!.connection!.connect(zBlock.outputConnection!);
    const lenBlock = workspace.newBlock('data_value');
    lenBlock.setFieldValue(String(klen), 'NUM');
    block.getInput('KLEN')!.connection!.connect(lenBlock.outputConnection!);
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
 * 独立参考：直接用 Python 标准库（hashlib 的 SM3 由 OpenSSL 提供）按
 * GB/T 32918.4 §5.4.3 重写一遍 KDF，不调用项目生成器的同一段代码。
 */
function referenceKdf(z: number[], klen: number): string {
  return execFileSync(pythonCommand, ['-c', [
    'import hashlib',
    `Z = bytes(${JSON.stringify(z)})`,
    `klen = ${klen}`,
    'out = b""',
    'ct = 1',
    'while len(out) * 8 < klen:',
    '    out += hashlib.new("sm3", Z + ct.to_bytes(4, "big")).digest()',
    '    ct += 1',
    'nbytes = (klen + 7) // 8',
    'out = bytearray(out[:nbytes])',
    'if klen % 8:',
    '    out[-1] &= (0xFF << (8 - (klen % 8))) & 0xFF',
    'assert any(out)',
    'print(bytes(out).hex())',
  ].join('\n')], { encoding: 'utf8' }).trim();
}

describe('SM2-KDF block contract (GB/T 32918.4 §5.4.3)', () => {
  it.each([128, 256, 264, 512])('matches an independent SM3 reference for klen=%i', (klen) => {
    const expected = referenceKdf(Z, klen);
    expect(evaluateJavaScript(generate('javascript', klen))).toBe(expected);
    expect(evaluatePython(generate('python', klen))).toBe(expected);
  });

  it('masks the trailing bits when klen is not a multiple of 8', () => {
    const output = evaluateJavaScript(generate('javascript', 132));
    // 132 bit = 16.5 字节 → 末字节低 4 位必须为 0
    expect(parseInt(output.slice(-2), 16) & 0x0f).toBe(0);
    expect(evaluatePython(generate('python', 132))).toBe(output);
  });

  it('rejects a non-positive or over-large klen in both languages', () => {
    expect(() => evaluateJavaScript(generate('javascript', 0))).toThrow();
    expect(() => evaluatePython(generate('python', 0))).toThrow();
    expect(() => evaluateJavaScript(generate('javascript', 1048577))).toThrow();
  });
});
