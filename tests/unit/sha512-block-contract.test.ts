// @vitest-environment jsdom
import * as Blockly from 'blockly/core';
import 'blockly/blocks';
import { execFileSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';

import '@/blocks/data/number';
import '@/blocks/sha512';
import '@/generators/javascript';
import '@/generators/javascript/sha512';
import '@/generators/python';
import '@/generators/python/sha512';

import { javascriptGenerator } from 'blockly/javascript';
import { pythonGenerator } from 'blockly/python';

const pythonCommand = process.env.CIPHER_CAT_PYTHON ||
  (process.platform === 'win32' ? 'python' : 'python3');

const sha512InitialState = [
  '6a09e667f3bcc908', 'bb67ae8584caa73b', '3c6ef372fe94f82b', 'a54ff53a5f1d36f1',
  '510e527fade682d1', '9b05688c2b3e6c1f', '1f83d9abfb41bd6b', '5be0cd19137e2179',
];

const sha512AbcDigest = [
  'ddaf35a193617aba', 'cc417349ae204131', '12e6fa4e89a97ea2', '0a9eeee64b55d39a',
  '2192992a274fc1a8', '36ba3c23a3feebbd', '454d4423643ce80e', '2a9ac94fa54ca49f',
];

const sha384AbcDigest = 'cb00753f45a35e8bb5a03d699ac65007272c32ab0eded1631a8b605a43ff5bed8086072ba1e7cc2358baeca134c825a7';

function generatePad(language: 'javascript' | 'python', message: string): string {
  const workspace = new Blockly.Workspace();
  try {
    const pad = workspace.newBlock('hash_sha512_pad');
    const input = workspace.newBlock('data_value');
    input.setFieldValue(message, 'NUM');
    pad.getInput('INPUT')!.connection!.connect(input.outputConnection!);
    const generator = language === 'javascript' ? javascriptGenerator : pythonGenerator;
    return generator.workspaceToCode(workspace);
  } finally {
    workspace.dispose();
  }
}

function generateCompress(language: 'javascript' | 'python'): string {
  const workspace = new Blockly.Workspace();
  try {
    const compress = workspace.newBlock('hash_sha512_compress');
    const state = workspace.newBlock('data_value');
    state.setFieldValue(
      `[${sha512InitialState.map((word) => language === 'javascript' ? `0x${word}n` : `0x${word}`).join(', ')}]`,
      'NUM',
    );
    compress.getInput('V')!.connection!.connect(state.outputConnection!);

    const pad = workspace.newBlock('hash_sha512_pad');
    const message = workspace.newBlock('data_value');
    message.setFieldValue('[97, 98, 99]', 'NUM');
    pad.getInput('INPUT')!.connection!.connect(message.outputConnection!);
    compress.getInput('W')!.connection!.connect(pad.outputConnection!);

    const generator = language === 'javascript' ? javascriptGenerator : pythonGenerator;
    return generator.workspaceToCode(workspace);
  } finally {
    workspace.dispose();
  }
}

function generateHash(language: 'javascript' | 'python', sizeBits: '384' | '512'): string {
  const workspace = new Blockly.Workspace();
  try {
    const hash = workspace.newBlock('hash_sha512_hash');
    hash.setFieldValue(sizeBits, 'SIZE');
    const message = workspace.newBlock('data_value');
    message.setFieldValue('[97, 98, 99]', 'NUM');
    hash.getInput('MSG')!.connection!.connect(message.outputConnection!);
    const generator = language === 'javascript' ? javascriptGenerator : pythonGenerator;
    return generator.workspaceToCode(workspace);
  } finally {
    workspace.dispose();
  }
}

function evaluateJavaScript(program: string, asWords = false): string {
  const lines = program.trim().split('\n');
  const expression = lines.pop()!.replace(/;$/, '');
  const formatter = asWords
    ? '(word) => word.toString(16).padStart(16, \'0\')'
    : '(byte) => byte.toString(16).padStart(2, \'0\')';
  return new Function([...lines, `return Array.from(${expression}, ${formatter}).join('');`].join('\n'))() as string;
}

function evaluatePython(program: string, asWords = false): string {
  const lines = program.trim().split('\n');
  const expression = lines.pop()!;
  const formatter = asWords
    ? `''.join(format(word, "016x") for word in ${expression})`
    : `${expression}.hex()`;
  return execFileSync(pythonCommand, ['-c', [
    ...lines,
    `print(${formatter})`,
  ].join('\n')], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
}

describe('SHA-512 padding and compression blocks', () => {
  it('matches the FIPS 180-4 SHA-512("abc") padding block in both languages', () => {
    const expected = `61626380${'00'.repeat(108)}${'00'.repeat(15)}18`;
    expect(evaluateJavaScript(generatePad('javascript', '[97, 98, 99]'))).toBe(expected);
    expect(evaluatePython(generatePad('python', '[97, 98, 99]'))).toBe(expected);
  });

  it.each([0, 111, 112, 127, 128, 239, 240])(
    'uses the correct 1024-bit block boundary and 128-bit length field for a %i-byte message',
    (length) => {
      const message = `[${Array(length).fill(0x61).join(', ')}]`;
      const javascript = evaluateJavaScript(generatePad('javascript', message));
      const python = evaluatePython(generatePad('python', message));
      const expectedPaddedLength = Math.ceil((length + 17) / 128) * 128;
      const expectedBitLength = (BigInt(length) * 8n).toString(16).padStart(32, '0');

      expect(javascript).toBe(python);
      expect(javascript.length / 2).toBe(expectedPaddedLength);
      expect(javascript.slice(length * 2, length * 2 + 2)).toBe('80');
      expect(javascript.slice(-32)).toBe(expectedBitLength);
    },
  );

  it('compresses the padded FIPS 180-4 SHA-512("abc") block to the known digest in both languages', () => {
    const expected = sha512AbcDigest.join('');
    expect(evaluateJavaScript(generateCompress('javascript'), true)).toBe(expected);
    expect(evaluatePython(generateCompress('python'), true)).toBe(expected);
  });

  it.each([
    { sizeBits: '384' as const, expected: sha384AbcDigest },
    { sizeBits: '512' as const, expected: sha512AbcDigest.join('') },
  ])('matches the FIPS 180-4 SHA-$sizeBits("abc") digest block in both languages', ({ sizeBits, expected }) => {
    expect(evaluateJavaScript(generateHash('javascript', sizeBits))).toBe(expected);
    expect(evaluatePython(generateHash('python', sizeBits))).toBe(expected);
  });
});
