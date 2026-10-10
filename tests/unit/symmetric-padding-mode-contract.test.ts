// @vitest-environment jsdom
import * as Blockly from 'blockly/core';
import 'blockly/blocks';
import { execFileSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';

import '@/blocks/data/number';
import '@/blocks/symmetric/modes/blocks';
import '@/blocks/symmetric/padding/blocks';
import '@/generators/javascript';
import '@/generators/javascript/symmetric/modes/blocks';
import '@/generators/javascript/symmetric/padding/blocks';
import '@/generators/python';
import '@/generators/python/symmetric/modes/blocks';
import '@/generators/python/symmetric/padding/blocks';

import { javascriptGenerator } from 'blockly/javascript';
import { pythonGenerator } from 'blockly/python';
import { isNativeUint8Array } from './helpers/native-bytes';

const pythonCommand = process.env.CIPHER_CAT_PYTHON ||
  (process.platform === 'win32' ? 'python' : 'python3');

function generatePadding(
  language: 'javascript' | 'python',
  type: 'pad_pkcs7' | 'pad_zero',
  data: number[],
  blockSize: number,
): string {
  const workspace = new Blockly.Workspace();
  try {
    const padding = workspace.newBlock(type);
    const dataBlock = workspace.newBlock('data_value');
    dataBlock.setFieldValue(
      language === 'javascript' ? `Uint8Array.from([${data.join(', ')}])` : `bytes([${data.join(', ')}])`,
      'NUM',
    );
    padding.getInput('DATA')!.connection!.connect(dataBlock.outputConnection!);

    const blockSizeBlock = workspace.newBlock('data_value');
    blockSizeBlock.setFieldValue(String(blockSize), 'NUM');
    padding.getInput('BLOCK_SIZE')!.connection!.connect(blockSizeBlock.outputConnection!);

    const generator = language === 'javascript' ? javascriptGenerator : pythonGenerator;
    return generator.workspaceToCode(workspace);
  } finally {
    workspace.dispose();
  }
}

function generateEcbDecrypt(
  language: 'javascript' | 'python',
  ciphertext: number[],
  key: number[],
): string {
  const workspace = new Blockly.Workspace();
  try {
    const decrypt = workspace.newBlock('mode_ecb_decrypt');
    const dataBlock = workspace.newBlock('data_value');
    dataBlock.setFieldValue(
      language === 'javascript'
        ? `Uint8Array.from([${ciphertext.join(', ')}])`
        : `bytes([${ciphertext.join(', ')}])`,
      'NUM',
    );
    decrypt.getInput('DATA')!.connection!.connect(dataBlock.outputConnection!);

    const keyBlock = workspace.newBlock('data_value');
    keyBlock.setFieldValue(
      language === 'javascript' ? `Uint8Array.from([${key.join(', ')}])` : `bytes([${key.join(', ')}])`,
      'NUM',
    );
    decrypt.getInput('KEY')!.connection!.connect(keyBlock.outputConnection!);

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

function expectByteOutput(program: { javascript: string; python: string }): void {
  const javascriptLines = program.javascript.trim().split('\n');
  const javascriptExpression = javascriptLines.pop()!.replace(/;$/, '');
  const javascriptValue = new Function([
    ...javascriptLines,
    `return ${javascriptExpression};`,
  ].join('\n'))();
  expect(isNativeUint8Array(javascriptValue)).toBe(true);

  const pythonLines = program.python.trim().split('\n');
  const pythonExpression = pythonLines.pop()!;
  expect(execFileSync(pythonCommand, ['-c', [
    ...pythonLines,
    `value = ${pythonExpression}`,
    'assert type(value) is bytes',
  ].join('\n')], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })).toBe('');
}

describe('symmetric padding and ECB decryption block contracts', () => {
  it.each([0, 1, 15, 16, 17])('applies PKCS#7 padding to a %i-byte input in both languages', (length) => {
    const data = Array(length).fill(0x41);
    const padLength = 16 - (length % 16);
    const expected = [...data, ...Array(padLength).fill(padLength)]
      .map((byte) => byte.toString(16).padStart(2, '0')).join('');

    const javascript = generatePadding('javascript', 'pad_pkcs7', data, 16);
    const python = generatePadding('python', 'pad_pkcs7', data, 16);
    expectByteOutput({ javascript, python });
    expect(evaluateJavaScript(javascript)).toBe(expected);
    expect(evaluatePython(python)).toBe(expected);
  });

  it.each([0, -1, 1.5, 256])('rejects PKCS#7 block size %s in both languages', (blockSize) => {
    expect(() => evaluateJavaScript(generatePadding('javascript', 'pad_pkcs7', [], blockSize))).toThrow();
    expect(() => evaluatePython(generatePadding('python', 'pad_pkcs7', [], blockSize))).toThrow();
  });

  it.each([1, 16])('zero-pads a %i-byte input using the documented project contract', (length) => {
    const data = Array(length).fill(0x41);
    const padLength = 16 - (length % 16);
    const expected = [...data, ...Array(padLength).fill(0)]
      .map((byte) => byte.toString(16).padStart(2, '0')).join('');

    const javascript = generatePadding('javascript', 'pad_zero', data, 16);
    const python = generatePadding('python', 'pad_zero', data, 16);
    expectByteOutput({ javascript, python });
    expect(evaluateJavaScript(javascript)).toBe(expected);
    expect(evaluatePython(python)).toBe(expected);
  });

  it.each([0, -1, 1.5])('rejects a zero-padding block size of %s in both languages', (blockSize) => {
    expect(() => evaluateJavaScript(generatePadding('javascript', 'pad_zero', [], blockSize))).toThrow();
    expect(() => evaluatePython(generatePadding('python', 'pad_zero', [], blockSize))).toThrow();
  });

  it('matches the FIPS 197 AES-128 inverse-cipher example in both languages', () => {
    const key = Array.from({ length: 16 }, (_, index) => index);
    const ciphertext = [
      0x69, 0xc4, 0xe0, 0xd8, 0x6a, 0x7b, 0x04, 0x30,
      0xd8, 0xcd, 0xb7, 0x80, 0x70, 0xb4, 0xc5, 0x5a,
    ];
    const expected = '00112233445566778899aabbccddeeff';

    expect(evaluateJavaScript(generateEcbDecrypt('javascript', ciphertext, key))).toBe(expected);
    expect(evaluatePython(generateEcbDecrypt('python', ciphertext, key))).toBe(expected);
  });

  it.each([1, 15, 17])('rejects an ECB ciphertext with %i bytes in both languages', (length) => {
    const key = Array.from({ length: 16 }, (_, index) => index);
    const ciphertext = Array(length).fill(0);
    expect(() => evaluateJavaScript(generateEcbDecrypt('javascript', ciphertext, key))).toThrow();
    expect(() => evaluatePython(generateEcbDecrypt('python', ciphertext, key))).toThrow();
  });
});
