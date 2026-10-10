// @vitest-environment jsdom
import * as Blockly from 'blockly/core';
import 'blockly/blocks';
import { execFileSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';

import '@/blocks/cmac';
import '@/blocks/data/number';
import '@/generators/javascript';
import '@/generators/javascript/cmac';
import '@/generators/python';
import '@/generators/python/cmac';

import { javascriptGenerator } from 'blockly/javascript';
import { pythonGenerator } from 'blockly/python';

const pythonCommand = process.env.CIPHER_CAT_PYTHON ||
  (process.platform === 'win32' ? 'python' : 'python3');

const key = [
  0x2b, 0x7e, 0x15, 0x16, 0x28, 0xae, 0xd2, 0xa6,
  0xab, 0xf7, 0x15, 0x88, 0x09, 0xcf, 0x4f, 0x3c,
];

const message = [
  0x6b, 0xc1, 0xbe, 0xe2, 0x2e, 0x40, 0x9f, 0x96,
  0xe9, 0x3d, 0x7e, 0x11, 0x73, 0x93, 0x17, 0x2a,
  0xae, 0x2d, 0x8a, 0x57, 0x1e, 0x03, 0xac, 0x9c,
  0x9e, 0xb7, 0x6f, 0xac, 0x45, 0xaf, 0x8e, 0x51,
  0x30, 0xc8, 0x1c, 0x46, 0xa3, 0x5c, 0xe4, 0x11,
  0xe5, 0xfb, 0xc1, 0x19, 0x1a, 0x0a, 0x52, 0xef,
  0xf6, 0x9f, 0x24, 0x45, 0xdf, 0x4f, 0x9b, 0x17,
  0xad, 0x2b, 0x41, 0x7b, 0xe6, 0x6c, 0x37, 0x10,
];

function generate(
  language: 'javascript' | 'python',
  inputKey: number[],
  inputMessage: number[],
): string {
  const workspace = new Blockly.Workspace();
  try {
    const cmac = workspace.newBlock('cmac_mac');
    cmac.setFieldValue('aes', 'CIPHER');

    const keyBlock = workspace.newBlock('data_value');
    keyBlock.setFieldValue(`[${inputKey.join(', ')}]`, 'NUM');
    cmac.getInput('KEY')!.connection!.connect(keyBlock.outputConnection!);

    const messageBlock = workspace.newBlock('data_value');
    messageBlock.setFieldValue(`[${inputMessage.join(', ')}]`, 'NUM');
    cmac.getInput('MSG')!.connection!.connect(messageBlock.outputConnection!);

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

describe('CMAC Blockly block contract', () => {
  it.each([
    { length: 0, expected: 'bb1d6929e95937287fa37d129b756746' },
    { length: 16, expected: '070a16b46b4d4144f79bdd9dd04a287c' },
    { length: 40, expected: 'dfa66747de9ae63030ca32611497c827' },
    { length: 64, expected: '51f0bebf7e3b9d92fc49741779363cfe' },
  ])('matches RFC 4493 AES-CMAC for a $length-byte message in both languages', ({ length, expected }) => {
    const inputMessage = message.slice(0, length);
    expect(evaluateJavaScript(generate('javascript', key, inputMessage))).toBe(expected);
    expect(evaluatePython(generate('python', key, inputMessage))).toBe(expected);
  });

  it.each([15, 17])('rejects a %i-byte AES key in both languages', (length) => {
    const invalidKey = Array(length).fill(0x2b);
    expect(() => evaluateJavaScript(generate('javascript', invalidKey, []))).toThrow();
    expect(() => evaluatePython(generate('python', invalidKey, []))).toThrow();
  });
});
