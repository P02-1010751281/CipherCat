// @vitest-environment jsdom
import * as Blockly from 'blockly/core';
import 'blockly/blocks';
import { execFileSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';

import '@/blocks/ccm';
import '@/blocks/data/number';
import '@/generators/javascript';
import '@/generators/javascript/ccm';
import '@/generators/python';
import '@/generators/python/ccm';

import { javascriptGenerator } from 'blockly/javascript';
import { pythonGenerator } from 'blockly/python';

const pythonCommand = process.env.CIPHER_CAT_PYTHON ||
  (process.platform === 'win32' ? 'python' : 'python3');

/** SP 800-38C 附录 C.1 Example 1：Tlen=32、Nlen=56、Alen=64、Plen=32 */
const KEY = [0x40, 0x41, 0x42, 0x43, 0x44, 0x45, 0x46, 0x47, 0x48, 0x49, 0x4a, 0x4b, 0x4c, 0x4d, 0x4e, 0x4f];
const NONCE = [0x10, 0x11, 0x12, 0x13, 0x14, 0x15, 0x16];
const AAD = [0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07];
const MSG = [0x20, 0x21, 0x22, 0x23];
const TAG_LEN = 4;
/** C.1 公布的密文段（不含标签）与首块 */
const EXPECTED_CT = '7162015b';
/** C.1 公布的 B 首块：4f101112 13141516 00000000 00000004 */
const EXPECTED_B0 = '4f101112131415160000000000000004';

function generate(
  language: 'javascript' | 'python',
  blockType: string,
  lists: Record<string, number[]>,
  numbers: Record<string, number> = {},
  tagLen = TAG_LEN,
): string {
  const workspace = new Blockly.Workspace();
  try {
    const block = workspace.newBlock(blockType);
    if (block.getField('TAGLEN')) block.setFieldValue(String(tagLen), 'TAGLEN');
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

function runBoth(
  blockType: string,
  lists: Record<string, number[]>,
  numbers: Record<string, number> = {},
): [string, string] {
  return [
    evaluateJavaScript(generate('javascript', blockType, lists, numbers)),
    evaluatePython(generate('python', blockType, lists, numbers)),
  ];
}

describe('CCM primitive block contract (SP 800-38C Appendix C Example 1)', () => {
  it('B0 matches flags ‖ nonce ‖ l(m) for Example 1', () => {
    const [js, py] = runBoth('ccm_b0', { NONCE }, { MSGLEN: MSG.length, AADLEN: AAD.length });
    expect(js).toBe(EXPECTED_B0);
    expect(py).toBe(EXPECTED_B0);
  });

  it('counter blocks A_0 and A_1 use flags = L−1 and a big-endian counter', () => {
    const [js0, py0] = runBoth('ccm_counter_block', { NONCE }, { I: 0 });
    const [js1, py1] = runBoth('ccm_counter_block', { NONCE }, { I: 1 });
    // C.1 公布：Ctr0 = 07101112 13141516 00000000 00000000，Ctr1 末 32 位为 1
    const prefix = '07' + NONCE.map((b) => b.toString(16).padStart(2, '0')).join('');
    expect(js0).toBe(prefix + '0000000000000000');
    expect(py0).toBe(prefix + '0000000000000000');
    expect(js1).toBe(prefix + '0000000000000001');
    expect(py1).toBe(prefix + '0000000000000001');
  });

  it('CTR part reproduces the published Example 1 ciphertext', () => {
    const [js, py] = runBoth('ccm_ctr', { KEY, NONCE, MSG });
    expect(js).toBe(EXPECTED_CT);
    expect(py).toBe(EXPECTED_CT);
  });

  it('CBC-MAC returns 16 bytes and both languages agree', () => {
    const [js, py] = runBoth('ccm_cbc_mac', { KEY, NONCE, AAD, MSG });
    expect(js).toHaveLength(32);
    expect(js).toBe(py);
  });

  it('rejects a nonce shorter than 7 bytes in both languages', () => {
    const short = NONCE.slice(0, 5);
    expect(() => evaluateJavaScript(generate('javascript', 'ccm_b0', { NONCE: short }, { MSGLEN: 4, AADLEN: 0 }))).toThrow();
    expect(() => evaluatePython(generate('python', 'ccm_b0', { NONCE: short }, { MSGLEN: 4, AADLEN: 0 }))).toThrow();
  });
});
