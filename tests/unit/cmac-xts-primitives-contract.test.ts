// @vitest-environment jsdom
import * as Blockly from 'blockly/core';
import 'blockly/blocks';
import { execFileSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';

import '@/blocks/cmac';
import '@/blocks/xts';
import '@/blocks/data/number';
import '@/generators/javascript';
import '@/generators/javascript/cmac';
import '@/generators/javascript/xts';
import '@/generators/python';
import '@/generators/python/cmac';
import '@/generators/python/xts';

import { javascriptGenerator } from 'blockly/javascript';
import { pythonGenerator } from 'blockly/python';

const pythonCommand = process.env.CIPHER_CAT_PYTHON ||
  (process.platform === 'win32' ? 'python' : 'python3');

/** RFC 4493 §4：K = 2b7e…，L、K1、K2 是公开的子密钥向量 */
const KEY = [0x2b, 0x7e, 0x15, 0x16, 0x28, 0xae, 0xd2, 0xa6, 0xab, 0xf7, 0x15, 0x88, 0x09, 0xcf, 0x4f, 0x3c];
const L = [0x7d, 0xf7, 0x6b, 0x0c, 0x1a, 0xb8, 0x99, 0xb3, 0x3e, 0x42, 0xf0, 0x47, 0xb9, 0x1b, 0x54, 0x6f];
const K1 = 'fbeed618357133667c85e08f7236a8de';
const K2 = 'f7ddac306ae266ccf90bc11ee46d513b';

function generate(
  language: 'javascript' | 'python',
  blockType: string,
  lists: Record<string, number[]>,
): string {
  const workspace = new Blockly.Workspace();
  try {
    const block = workspace.newBlock(blockType);
    for (const [input, values] of Object.entries(lists)) {
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

function runBoth(blockType: string, lists: Record<string, number[]>): [string, string] {
  return [
    evaluateJavaScript(generate('javascript', blockType, lists)),
    evaluatePython(generate('python', blockType, lists)),
  ];
}

describe('CMAC subkey primitives (RFC 4493 §4)', () => {
  it('doubling maps L → K1 and K1 → K2', () => {
    const [jsK1, pyK1] = runBoth('cmac_double', { X: L });
    expect(jsK1).toBe(K1);
    expect(pyK1).toBe(K1);
    const [jsK2, pyK2] = runBoth('cmac_double', { X: K1.match(/../g)!.map((pair) => parseInt(pair, 16)) });
    expect(jsK2).toBe(K2);
    expect(pyK2).toBe(K2);
  });

  it('CMAC subkeys block returns K1‖K2 for the RFC 4493 key', () => {
    const [js, py] = runBoth('cmac_subkeys', { KEY });
    expect(js).toBe(K1 + K2);
    expect(py).toBe(K1 + K2);
  });
});

describe('XTS tweak multiply (SP 800-38E / IEEE 1619)', () => {
  it('shifts the little-endian tweak and reduces with 0x87', () => {
    const zero = new Array(16).fill(0);
    const [jsZero, pyZero] = runBoth('xts_tweak_mul', { TWEAK: zero });
    expect(jsZero).toBe('00'.repeat(16));
    expect(pyZero).toBe('00'.repeat(16));

    const lowBit = [0x01, ...new Array(15).fill(0)];
    const [jsOne, pyOne] = runBoth('xts_tweak_mul', { TWEAK: lowBit });
    expect(jsOne).toBe('02' + '00'.repeat(15));
    expect(pyOne).toBe('02' + '00'.repeat(15));

    const highBit = [...new Array(15).fill(0), 0x80];
    const [jsHi, pyHi] = runBoth('xts_tweak_mul', { TWEAK: highBit });
    expect(jsHi).toBe('87' + '00'.repeat(15));
    expect(pyHi).toBe('87' + '00'.repeat(15));
  });
});
