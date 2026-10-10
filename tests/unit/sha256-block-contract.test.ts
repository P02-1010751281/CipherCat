// @vitest-environment jsdom
import * as Blockly from 'blockly/core';
import 'blockly/blocks';
import { execFileSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';

import '@/blocks/data/number';
import '@/blocks/hash/sha256';
import '@/generators/javascript';
import '@/generators/javascript/hash/sha256';
import '@/generators/python';
import '@/generators/python/hash/sha256';

import { javascriptGenerator } from 'blockly/javascript';
import { pythonGenerator } from 'blockly/python';

const pythonCommand = process.env.CIPHER_CAT_PYTHON ||
  (process.platform === 'win32' ? 'python' : 'python3');

const sha256InitialState = [
  0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
  0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
];
const paddedAbcBlock = [
  0x61, 0x62, 0x63, 0x80, ...Array(59).fill(0), 0x18,
];
const sha256AbcDigestWords = [
  'ba7816bf', '8f01cfea', '414140de', '5dae2223',
  'b00361a3', '96177a9c', 'b410ff61', 'f20015ad',
];
const sha224AbcDigest = '23097d223405d8228642a477bda255b32aadbce4bda0b3f7e36c9da7';

function generate(
  language: 'javascript' | 'python',
  blockLength: number,
  stateLength = 8,
  stateExpression?: string,
  blockExpression?: string,
): string {
  const workspace = new Blockly.Workspace();
  try {
    const compress = workspace.newBlock('hash_sha256_compress');
    const state = workspace.newBlock('data_value');
    const stateWords = Array.from({ length: stateLength }, (_, index) => sha256InitialState[index] ?? 0);
    state.setFieldValue(stateExpression ?? `[${stateWords.map((word) => `0x${word.toString(16)}`).join(', ')}]`, 'NUM');
    compress.getInput('V')!.connection!.connect(state.outputConnection!);

    const block = workspace.newBlock('data_value');
    const bytes = Array(blockLength).fill(0);
    if (blockLength === 64) Object.assign(bytes, paddedAbcBlock);
    block.setFieldValue(blockExpression ?? `[${bytes.join(', ')}]`, 'NUM');
    compress.getInput('W')!.connection!.connect(block.outputConnection!);

    const generator = language === 'javascript' ? javascriptGenerator : pythonGenerator;
    return generator.workspaceToCode(workspace);
  } finally {
    workspace.dispose();
  }
}

function evaluateJavaScript(program: string): number[] {
  const lines = program.trim().split('\n');
  const expression = lines.pop()!.replace(/;$/, '');
  return new Function([
    ...lines,
    `return ${expression};`,
  ].join('\n'))() as number[];
}

function evaluatePython(program: string): number[] {
  const lines = program.trim().split('\n');
  const expression = lines.pop()!;
  const output = execFileSync(pythonCommand, ['-c', [
    ...lines,
    `print(__import__("json").dumps(${expression}))`,
  ].join('\n')], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  return JSON.parse(output.trim()) as number[];
}

function generateSha224(language: 'javascript' | 'python'): string {
  const workspace = new Blockly.Workspace();
  try {
    const hash = workspace.newBlock('hash_sha224_hash');
    const message = workspace.newBlock('data_value');
    message.setFieldValue('[97, 98, 99]', 'NUM');
    hash.getInput('MSG')!.connection!.connect(message.outputConnection!);
    const generator = language === 'javascript' ? javascriptGenerator : pythonGenerator;
    return generator.workspaceToCode(workspace);
  } finally {
    workspace.dispose();
  }
}

function evaluateJavaScriptBytesHex(program: string): string {
  const lines = program.trim().split('\n');
  const expression = lines.pop()!.replace(/;$/, '');
  return new Function([
    ...lines,
    `return Array.from(${expression}, (byte) => byte.toString(16).padStart(2, '0')).join('');`,
  ].join('\n'))() as string;
}

function evaluatePythonBytesHex(program: string): string {
  const lines = program.trim().split('\n');
  const expression = lines.pop()!;
  return execFileSync(pythonCommand, ['-c', [
    ...lines,
    `print(bytes(${expression}).hex())`,
  ].join('\n')], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
}

describe('SHA-256 compression block contract', () => {
  it('matches the FIPS 180-4 SHA-256("abc") one-block result in both languages', () => {
    const expected = sha256AbcDigestWords.map((word) => Number.parseInt(word, 16));
    expect(evaluateJavaScript(generate('javascript', 64))).toEqual(expected);
    expect(evaluatePython(generate('python', 64))).toEqual(expected);
  });

  it.each([63, 65])('rejects a %i-byte input instead of padding or truncating it', (length) => {
    expect(() => evaluateJavaScript(generate('javascript', length))).toThrow();
    expect(() => evaluatePython(generate('python', length))).toThrow();
  });

  it.each([7, 9])('rejects a state with %i words instead of silently changing its shape', (length) => {
    expect(() => evaluateJavaScript(generate('javascript', 64, length))).toThrow();
    expect(() => evaluatePython(generate('python', 64, length))).toThrow();
  });

  it.each([
    { javascript: '1.5', python: '1.5' },
    { javascript: '-1', python: '-1' },
    { javascript: '4294967296', python: '4294967296' },
    { javascript: 'true', python: 'True' },
  ])('rejects invalid state words $javascript in both languages', (invalid) => {
    const jsState = `[${invalid.javascript}, ${sha256InitialState.slice(1).map((word) => `0x${word.toString(16)}`).join(', ')}]`;
    const pyState = `[${invalid.python}, ${sha256InitialState.slice(1).map((word) => `0x${word.toString(16)}`).join(', ')}]`;
    expect(() => evaluateJavaScript(generate('javascript', 64, 8, jsState))).toThrow();
    expect(() => evaluatePython(generate('python', 64, 8, pyState))).toThrow();
  });

  it.each([
    { javascript: '1.5', python: '1.5' },
    { javascript: '-1', python: '-1' },
    { javascript: '256', python: '256' },
    { javascript: 'true', python: 'True' },
  ])('rejects invalid message-block bytes $javascript in both languages', (invalid) => {
    expect(() => evaluateJavaScript(generate('javascript', 64, 8, undefined, `Array(63).fill(0).concat([${invalid.javascript}])`))).toThrow();
    expect(() => evaluatePython(generate('python', 64, 8, undefined, `[0] * 63 + [${invalid.python}]`))).toThrow();
  });

  it('rejects sparse input arrays in JavaScript and matching missing-value lists in Python', () => {
    const jsState = 'new Array(8)';
    const pyState = '[None] * 8';
    const jsBlock = 'new Array(64)';
    const pyBlock = '[None] * 64';
    expect(() => evaluateJavaScript(generate('javascript', 64, 8, jsState))).toThrow();
    expect(() => evaluatePython(generate('python', 64, 8, pyState))).toThrow();
    expect(() => evaluateJavaScript(generate('javascript', 64, 8, undefined, jsBlock))).toThrow();
    expect(() => evaluatePython(generate('python', 64, 8, undefined, pyBlock))).toThrow();
  });

  it('normalizes integer-valued numeric floats identically in JavaScript and Python', () => {
    const stateWithFloat = [...sha256InitialState.map((word) => `0x${word.toString(16)}`)];
    stateWithFloat[0] = `${sha256InitialState[0]}.0`;
    const blockWithFloat = [...paddedAbcBlock];
    blockWithFloat[0] = 97.0;
    const expected = sha256AbcDigestWords.map((word) => Number.parseInt(word, 16));

    expect(evaluateJavaScript(generate('javascript', 64, 8, `[${stateWithFloat.join(', ')}]`, `[${blockWithFloat.join(', ')}]`)))
      .toEqual(expected);
    expect(evaluatePython(generate('python', 64, 8, `[${stateWithFloat.join(', ')}]`, `[${blockWithFloat.join(', ')}]`)))
      .toEqual(expected);
  });
});

describe('SHA-224 hash block contract', () => {
  it('matches RFC 3874 Test Vector #1 for "abc" in both generated languages', () => {
    expect(evaluateJavaScriptBytesHex(generateSha224('javascript'))).toBe(sha224AbcDigest);
    expect(evaluatePythonBytesHex(generateSha224('python'))).toBe(sha224AbcDigest);
  });
});
