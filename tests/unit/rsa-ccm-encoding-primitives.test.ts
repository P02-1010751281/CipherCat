// @vitest-environment jsdom
import * as Blockly from 'blockly/core';
import 'blockly/blocks';
import { execFileSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';

import '@/blocks/rsa';
import '@/blocks/ccm';
import '@/blocks/data/number';
import '@/generators/javascript';
import '@/generators/javascript/rsa';
import '@/generators/javascript/ccm';
import '@/generators/python';
import '@/generators/python/rsa';
import '@/generators/python/ccm';

import { javascriptGenerator } from 'blockly/javascript';
import { pythonGenerator } from 'blockly/python';

const pythonCommand = process.env.CIPHER_CAT_PYTHON ||
  (process.platform === 'win32' ? 'python' : 'python3');

const SEED = Array.from(Buffer.from('mgf1-seed'));
const MSG = Array.from(Buffer.from('abc'));

function generate(
  language: 'javascript' | 'python',
  blockType: string,
  lists: Record<string, number[]>,
  numbers: Record<string, number> = {},
): string {
  const workspace = new Blockly.Workspace();
  try {
    const block = workspace.newBlock(blockType);
    for (const [input, values] of Object.entries(lists)) {
      const source = workspace.newBlock('data_value');
      source.setFieldValue(`[${values.join(', ')}]`, 'NUM');
      block.getInput(input)!.connection!.connect(source.outputConnection!);
    }
    for (const [input, value] of Object.entries(numbers)) {
      const source = workspace.newBlock('data_value');
      source.setFieldValue(String(value), 'NUM');
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

/** 独立参考：直接用 Python hashlib 按 RFC 8017 B.2.1 重写 MGF1 */
function referenceMgf1(seed: number[], length: number): string {
  return execFileSync(pythonCommand, ['-c', [
    'import hashlib',
    `seed = bytes(${JSON.stringify(seed)})`,
    `length = ${length}`,
    'out = b""',
    'counter = 0',
    'while len(out) < length:',
    '    out += hashlib.sha256(seed + counter.to_bytes(4, "big")).digest()',
    '    counter += 1',
    'print(out[:length].hex())',
  ].join('\n')], { encoding: 'utf8' }).trim();
}

/** 独立参考：按 RFC 8017 §9.2 用 hashlib 重写 EMSA-PKCS1-v1_5（SHA-256） */
function referenceEmsa(msg: number[], emLen: number): string {
  return execFileSync(pythonCommand, ['-c', [
    'import hashlib',
    `msg = bytes(${JSON.stringify(msg)})`,
    `em_len = ${emLen}`,
    'pre = bytes([0x30,0x31,0x30,0x0d,0x06,0x09,0x60,0x86,0x48,0x01,0x65,0x03,0x04,0x02,0x01,0x05,0x00,0x04,0x20])',
    't = pre + hashlib.sha256(msg).digest()',
    'ps = em_len - len(t) - 3',
    'assert ps >= 8',
    'print((b"\\x00\\x01" + b"\\xff" * ps + b"\\x00" + t).hex())',
  ].join('\n')], { encoding: 'utf8' }).trim();
}

describe('RSA encoding primitives (RFC 8017)', () => {
  it('MGF1(seed, len) matches an independent hashlib implementation for several lengths', () => {
    for (const length of [0, 1, 32, 33, 48, 100]) {
      const expected = referenceMgf1(SEED, length);
      expect(evaluateJavaScript(generate('javascript', 'rsa_mgf1', { SEED }, { LEN: length }))).toBe(expected);
      expect(evaluatePython(generate('python', 'rsa_mgf1', { SEED }, { LEN: length }))).toBe(expected);
    }
  });

  it('EMSA-PKCS1-v1_5 encoding matches an independent hashlib implementation', () => {
    for (const emLen of [62, 128, 256]) {
      const expected = referenceEmsa(MSG, emLen);
      expect(evaluateJavaScript(generate('javascript', 'rsa_emsa_pkcs1_v15_encode', { MSG }, { EMLEN: emLen }))).toBe(expected);
      expect(evaluatePython(generate('python', 'rsa_emsa_pkcs1_v15_encode', { MSG }, { EMLEN: emLen }))).toBe(expected);
    }
  });

  it('rejects an emLen that cannot hold the SHA-256 DigestInfo', () => {
    expect(() => evaluateJavaScript(generate('javascript', 'rsa_emsa_pkcs1_v15_encode', { MSG }, { EMLEN: 61 }))).toThrow();
    expect(() => evaluatePython(generate('python', 'rsa_emsa_pkcs1_v15_encode', { MSG }, { EMLEN: 61 }))).toThrow();
  });
});

describe('CCM AAD length prefix (SP 800-38C §A.2.2)', () => {
  it('uses two big-endian bytes below 0xFF00 and 0xFFFE + four bytes otherwise', () => {
    const cases: Array<[number, string]> = [
      [0, '0000'],
      [8, '0008'],
      [0xfeff, 'feff'],
      [0xff00, 'fffe0000ff00'],
      [0x01020304, 'fffe01020304'],
    ];
    for (const [aadLen, expected] of cases) {
      expect(evaluateJavaScript(generate('javascript', 'ccm_aad_len_prefix', {}, { AADLEN: aadLen }))).toBe(expected);
      expect(evaluatePython(generate('python', 'ccm_aad_len_prefix', {}, { AADLEN: aadLen }))).toBe(expected);
    }
  });

  it('rejects a negative or out-of-range AAD length', () => {
    expect(() => evaluateJavaScript(generate('javascript', 'ccm_aad_len_prefix', {}, { AADLEN: -1 }))).toThrow();
    expect(() => evaluatePython(generate('python', 'ccm_aad_len_prefix', {}, { AADLEN: 4294967296 }))).toThrow();
  });
});
