// @vitest-environment jsdom
import * as Blockly from 'blockly/core';
import 'blockly/blocks';
import { execFileSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';

import '@/blocks/data/number';
import '@/blocks/hash/sha256';
import '@/blocks/hash/sm3';
import '@/blocks/hash/sha3';
import '@/blocks/remaining';
import '@/generators/javascript';
import '@/generators/javascript/hash/sha256';
import '@/generators/javascript/hash/sm3';
import '@/generators/javascript/hash/sha3';
import '@/generators/javascript/remaining';
import '@/generators/python';
import '@/generators/python/hash/sha256';
import '@/generators/python/hash/sm3';
import '@/generators/python/hash/sha3';
import '@/generators/python/remaining';

import { javascriptGenerator } from 'blockly/javascript';
import { pythonGenerator } from 'blockly/python';

const pythonCommand = process.env.CIPHER_CAT_PYTHON ||
  (process.platform === 'win32' ? 'python' : 'python3');

type Language = 'javascript' | 'python';

function generate(
  language: Language,
  blockType: string,
  inputExpression: string,
  options: { rateBits?: number; suffix?: string } = {},
): string {
  const workspace = new Blockly.Workspace();
  try {
    const pad = workspace.newBlock(blockType);
    if (blockType === 'sponge_pad') {
      pad.setFieldValue(String(options.rateBits ?? 1088), 'RATE');
      pad.setFieldValue(options.suffix ?? '0x06', 'SUFFIX');
    }
    const value = workspace.newBlock('data_value');
    value.setFieldValue(inputExpression, 'NUM');
    pad.getInput('INPUT')!.connection!.connect(value.outputConnection!);
    return (language === 'javascript' ? javascriptGenerator : pythonGenerator).workspaceToCode(workspace);
  } finally {
    workspace.dispose();
  }
}

function evaluateJavaScript(program: string): string {
  const lines = program.trim().split('\n');
  const expression = lines.pop()!.replace(/;$/, '');
  return execFileSync(process.execPath, ['-e', [
    ...lines,
    `console.log(Buffer.from(${expression}).toString('hex'));`,
  ].join('\n')], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
}

function evaluatePython(program: string): string {
  const lines = program.trim().split('\n');
  const expression = lines.pop()!;
  return execFileSync(pythonCommand, ['-c', [
    ...lines,
    `print(bytes(${expression}).hex())`,
  ].join('\n')], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
}

function evaluateSm3LengthField(program: string, messageBytes: number): string {
  const lines = program.trim().split('\n');
  lines.pop();
  const lengthName = program.match(/function ([\w$]+)\(byteLength\)/)?.[1];
  if (!lengthName) throw new Error('generated SM3 length-field helper not found');
  const script = [
    ...lines,
    `console.log(Buffer.from(${lengthName}(${messageBytes})).toString('hex'));`,
  ].join('\n');
  return execFileSync(process.execPath, ['-e', script], { encoding: 'utf8' }).trim();
}

function generateHmacSm3(language: Language): string {
  const workspace = new Blockly.Workspace();
  try {
    const hmac = workspace.newBlock('hash_hmac');
    hmac.setFieldValue('SM3', 'HASH');
    const key = workspace.newBlock('data_value');
    key.setFieldValue('[]', 'NUM');
    hmac.getInput('KEY')!.connection!.connect(key.outputConnection!);
    const message = workspace.newBlock('data_value');
    message.setFieldValue('[]', 'NUM');
    hmac.getInput('MSG')!.connection!.connect(message.outputConnection!);
    return (language === 'javascript' ? javascriptGenerator : pythonGenerator).workspaceToCode(workspace);
  } finally {
    workspace.dispose();
  }
}

function evaluateHmacSm3LengthField(language: Language, messageBytes: number): string {
  const program = generateHmacSm3(language);
  const lines = program.trim().split('\n');
  lines.pop();
  if (language === 'javascript') {
    const lengthName = program.match(/function ([\w$]+)\(byteLength\)/)?.[1];
    if (!lengthName) throw new Error('generated HMAC-SM3 length-field helper not found');
    lines.push(`console.log(Buffer.from(${lengthName}(${messageBytes})).toString('hex'));`);
  } else {
    const lengthName = program.match(/def (\w+)\(byte_length\):/)?.[1];
    if (!lengthName) throw new Error('generated HMAC-SM3 length-field helper not found');
    lines.push(`print(${lengthName}(${messageBytes}).hex())`);
  }
  const command = language === 'javascript' ? process.execPath : pythonCommand;
  const args = language === 'javascript' ? ['-e', lines.join('\n')] : ['-c', lines.join('\n')];
  return execFileSync(command, args, { encoding: 'utf8' }).trim();
}

function sha256PadReference(message: Buffer): Buffer {
  const zeros = (56 - ((message.length + 1) % 64) + 64) % 64;
  const bitLength = Buffer.alloc(8);
  bitLength.writeBigUInt64BE(BigInt(message.length) * 8n);
  return Buffer.concat([message, Buffer.from([0x80]), Buffer.alloc(zeros), bitLength]);
}

function sha3PadReference(message: Buffer, rateBytes = 136, suffix = 0x06): Buffer {
  const padded = Buffer.alloc(message.length + rateBytes - (message.length % rateBytes));
  message.copy(padded);
  padded[message.length] ^= suffix;
  padded[padded.length - 1] ^= 0x80;
  return padded;
}

const byteList = (bytes: Uint8Array): string => `[${Array.from(bytes).join(', ')}]`;

describe('hash padding Blockly contract', () => {
  it.each([0, 1, 55, 56, 63, 64, 119, 120])('pads a %i-byte message identically in both languages', (length) => {
    const message = Buffer.alloc(length, 0x61);
    const expression = byteList(message);
    const expected = sha256PadReference(message).toString('hex');

    expect(evaluateJavaScript(generate('javascript', 'hash_sha256_pad', expression))).toBe(expected);
    expect(evaluatePython(generate('python', 'hash_sha256_pad', expression))).toBe(expected);
  });

  it('matches the fixed SHA-256 padded block for "abc"', () => {
    const expected = `61626380${'00'.repeat(59)}18`;
    for (const language of ['javascript', 'python'] as const) {
      const actual = language === 'javascript'
        ? evaluateJavaScript(generate(language, 'hash_sha256_pad', '[97, 98, 99]'))
        : evaluatePython(generate(language, 'hash_sha256_pad', '[97, 98, 99]'));
      expect(actual).toBe(expected);
    }
  });

  it('encodes UTF-8 text before padding and rejects unpaired surrogates', () => {
    const text = 'café 🧪';
    const expected = sha256PadReference(Buffer.from(text, 'utf8')).toString('hex');
    const validExpression = JSON.stringify(text);

    expect(evaluateJavaScript(generate('javascript', 'hash_sha256_pad_text', validExpression))).toBe(expected);
    expect(evaluatePython(generate('python', 'hash_sha256_pad_text', validExpression))).toBe(expected);

    for (const codeUnit of [0xd800, 0xdc00]) {
      const invalidExpression = JSON.stringify(String.fromCharCode(codeUnit));
    expect(() => evaluateJavaScript(generate('javascript', 'hash_sha256_pad_text', invalidExpression))).toThrow();
    expect(() => evaluatePython(generate('python', 'hash_sha256_pad_text', invalidExpression))).toThrow();
  }
  expect(() => evaluateJavaScript(generate('javascript', 'hash_sha256_pad_text', '12'))).toThrow();
  expect(() => evaluatePython(generate('python', 'hash_sha256_pad_text', '12'))).toThrow();
});

  it('encodes SM3 text as strict UTF-8 in both languages', () => {
    const text = 'café 🧪';
    const expected = sha256PadReference(Buffer.from(text, 'utf8')).toString('hex');
    const validExpression = JSON.stringify(text);
    expect(evaluateJavaScript(generate('javascript', 'hash_sm3_pad_text', validExpression))).toBe(expected);
    expect(evaluatePython(generate('python', 'hash_sm3_pad_text', validExpression))).toBe(expected);

    for (const codeUnit of [0xd800, 0xdc00]) {
      const invalidExpression = JSON.stringify(String.fromCharCode(codeUnit));
      expect(() => evaluateJavaScript(generate('javascript', 'hash_sm3_pad_text', invalidExpression))).toThrow();
      expect(() => evaluatePython(generate('python', 'hash_sm3_pad_text', invalidExpression))).toThrow();
    }
    expect(() => evaluateJavaScript(generate('javascript', 'hash_sm3_pad_text', '12'))).toThrow();
    expect(() => evaluatePython(generate('python', 'hash_sm3_pad_text', '12'))).toThrow();
  });

  it('encodes SHA-3 text as strict UTF-8 in both languages', () => {
    const text = 'café 🧪';
    const expected = sha3PadReference(Buffer.from(text, 'utf8')).toString('hex');
    const validExpression = JSON.stringify(text);
    expect(evaluateJavaScript(generate('javascript', 'hash_sha3_pad_text', validExpression))).toBe(expected);
    expect(evaluatePython(generate('python', 'hash_sha3_pad_text', validExpression))).toBe(expected);

    for (const codeUnit of [0xd800, 0xdc00]) {
      const invalidExpression = JSON.stringify(String.fromCharCode(codeUnit));
      expect(() => evaluateJavaScript(generate('javascript', 'hash_sha3_pad_text', invalidExpression))).toThrow();
      expect(() => evaluatePython(generate('python', 'hash_sha3_pad_text', invalidExpression))).toThrow();
    }
    expect(() => evaluateJavaScript(generate('javascript', 'hash_sha3_pad_text', '12'))).toThrow();
    expect(() => evaluatePython(generate('python', 'hash_sha3_pad_text', '12'))).toThrow();
  });

  it.each(['hash_sha256_pad_hex', 'hash_sm3_pad_hex', 'hash_sha3_pad_hex'])(
    'decodes strict hexadecimal text in both languages for %s', (blockType) => {
      const hexExpression = JSON.stringify('616263');
      for (const language of ['javascript', 'python'] as const) {
        const actual = language === 'javascript'
          ? evaluateJavaScript(generate(language, blockType, hexExpression))
          : evaluatePython(generate(language, blockType, hexExpression));
        if (blockType === 'hash_sha3_pad_hex') {
          expect(actual).toHaveLength(272);
          expect(actual.slice(0, 8)).toBe('61626306');
          expect(actual.slice(-2)).toBe('80');
        } else {
          expect(actual).toBe(sha256PadReference(Buffer.from('abc')).toString('hex'));
        }
      }
    },
  );

  it('registers the SM3 padding helper for each fresh JavaScript workspace', () => {
    const expected = sha256PadReference(Buffer.from('abc')).toString('hex');
    for (let index = 0; index < 2; index++) {
      expect(evaluateJavaScript(generate('javascript', 'hash_sm3_pad', '[97, 98, 99]'))).toBe(expected);
    }
  });

  it('writes the full 64-bit SM3 length at the 2^32-bit boundary without a large allocation', () => {
    const program = generate('javascript', 'hash_sm3_pad', '[]');
    expect(evaluateSm3LengthField(program, 2 ** 29)).toBe('0000000100000000');
  });

  it('writes the full 64-bit SM3 length in HMAC inner hashes without a large allocation', () => {
    for (const language of ['javascript', 'python'] as const) {
      expect(evaluateHmacSm3LengthField(language, 2 ** 29)).toBe('0000000100000000');
    }
  });

  it.each([1088, 576, 1152, 832, 1344])(
    'handles SHA-3/SHAKE padding at rate boundaries for rate %i',
    (rateBits) => {
      const rateBytes = rateBits / 8;
      for (const suffix of ['0x06', '0x1F'] as const) {
        const suffixByte = Number(suffix);
        for (const length of [rateBytes - 1, rateBytes, rateBytes + 1]) {
          const message = Buffer.alloc(length, 0x61);
          const expected = sha3PadReference(message, rateBytes, suffixByte).toString('hex');
          const expression = byteList(message);
          for (const language of ['javascript', 'python'] as const) {
            const actual = language === 'javascript'
              ? evaluateJavaScript(generate(language, 'sponge_pad', expression, { rateBits, suffix }))
              : evaluatePython(generate(language, 'sponge_pad', expression, { rateBits, suffix }));
            expect(actual).toBe(expected);
          }
        }
      }
    },
  );

  it.each(['hash_sha256_pad_hex', 'hash_sm3_pad_hex', 'hash_sha3_pad_hex'])(
    'rejects malformed or non-text hexadecimal input for %s', (blockType) => {
      for (const invalidExpression of [JSON.stringify('6z'), JSON.stringify('6 1'), '12']) {
        expect(() => evaluateJavaScript(generate('javascript', blockType, invalidExpression))).toThrow();
        expect(() => evaluatePython(generate('python', blockType, invalidExpression))).toThrow();
      }
    },
  );

  it.each(['hash_sha256_pad', 'hash_sm3_pad', 'sponge_pad'])(
    'rejects malformed raw bytes for %s', (blockType) => {
      for (const invalid of [
    { javascript: '[-1]', python: '[-1]' },
    { javascript: '[256]', python: '[256]' },
    { javascript: '[1.5]', python: '[1.5]' },
    { javascript: '[true]', python: '[True]' },
    { javascript: 'new Array(1)', python: '[None]' },
      ]) {
        expect(() => evaluateJavaScript(generate('javascript', blockType, invalid.javascript))).toThrow();
        expect(() => evaluatePython(generate('python', blockType, invalid.python))).toThrow();
      }
    },
  );
});
