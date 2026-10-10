// @vitest-environment jsdom
import * as Blockly from 'blockly/core';
import 'blockly/blocks';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';

import '@/blocks/data/number';
import '@/blocks/hash/shake';
import '@/generators/javascript';
import '@/generators/javascript/hash/shake';
import '@/generators/python';
import '@/generators/python/hash/shake';

import { javascriptGenerator } from 'blockly/javascript';
import { pythonGenerator } from 'blockly/python';

const pythonCommand = process.env.CIPHER_CAT_PYTHON ||
  (process.platform === 'win32' ? 'python' : 'python3');

const boundaryVectors = [
  {
    algorithm: 'SHAKE128',
    inputLength: 167,
    outputHex: '1e552791cc4e93a0d4a8dc47ae49228c2faa869e40e628f6ace477aec3f1ca7aefe1c1245cf82c265168ad2985121aedd72335ae1187a36742c746cf2b40cb30',
  },
  {
    algorithm: 'SHAKE256',
    inputLength: 135,
    outputHex: 'c45dae624ad8a2f5aa7bac9d7557737fd91c96eedb70a6be5574d57a844eade07f4056bf081a1098101cea8132188c422136feb4687d1e2209f3fd28bedfb8f4',
  },
] as const;

const prfBoundaryVectors = [
  {
    algorithm: 'SHAKE128',
    seedLength: 166,
    outputHex: '7536207148cc37294737df27e6407a9bc787985ab003481b174eea6bb43904afebddc2c315ec66c65563fdc6321bd4ce1bf2fc758a9f13bece6136d5a89971af',
  },
  {
    algorithm: 'SHAKE256',
    seedLength: 134,
    outputHex: '94039e41d633f213c07faeeb4744688aec4a2500e45250efecc58975b44c421c27378b67a41bbae09f842f8342ccecd7ce51979f04157477bf4e4b79f925777e',
  },
] as const;

const shakeBoundaryCases = [
  { inputRates: 0, inputTail: 0, outputRates: 0, outputTail: 17 },
  { inputRates: 0, inputTail: 3, outputRates: 0, outputTail: 32 },
  { inputRates: 1, inputTail: 0, outputRates: 1, outputTail: 1 },
  { inputRates: 1, inputTail: 1, outputRates: 2, outputTail: 5 },
] as const;

function generate(
  language: 'javascript' | 'python',
  algorithm: string,
  inputLength: number,
  outputLength = '64',
  seedExpression?: string,
): string {
  const workspace = new Blockly.Workspace();
  try {
    const xof = workspace.newBlock('pq_xof');
    xof.setFieldValue(algorithm, 'ALGO');

    const seed = workspace.newBlock('data_value');
    seed.setFieldValue(seedExpression ?? (
      language === 'javascript'
        ? `Array.from({ length: ${inputLength} }, (_, i) => i)`
        : `bytes(range(${inputLength}))`
    ), 'NUM');
    xof.getInput('SEED')!.connection!.connect(seed.outputConnection!);

    const outLen = workspace.newBlock('data_value');
    outLen.setFieldValue(outputLength, 'NUM');
    xof.getInput('OUTLEN')!.connection!.connect(outLen.outputConnection!);

    const generator = language === 'javascript' ? javascriptGenerator : pythonGenerator;
    return generator.workspaceToCode(workspace);
  } finally {
    workspace.dispose();
  }
}

function generatePrf(
  language: 'javascript' | 'python',
  algorithm: string,
  seedLength: number,
  nonceValue = '7',
  outLenValue = '64',
  seedExpression?: string,
): string {
  const workspace = new Blockly.Workspace();
  try {
    const prf = workspace.newBlock('pq_prf');
    prf.setFieldValue(algorithm, 'ALGO');

    const seed = workspace.newBlock('data_value');
    seed.setFieldValue(seedExpression ?? (
      language === 'javascript'
        ? `Array.from({ length: ${seedLength} }, (_, i) => i)`
        : `bytes(range(${seedLength}))`
    ), 'NUM');
    prf.getInput('SEED')!.connection!.connect(seed.outputConnection!);

    const nonce = workspace.newBlock('data_value');
    nonce.setFieldValue(nonceValue, 'NUM');
    prf.getInput('NONCE')!.connection!.connect(nonce.outputConnection!);

    const outLen = workspace.newBlock('data_value');
    outLen.setFieldValue(outLenValue, 'NUM');
    prf.getInput('OUTLEN')!.connection!.connect(outLen.outputConnection!);

    const generator = language === 'javascript' ? javascriptGenerator : pythonGenerator;
    return generator.workspaceToCode(workspace);
  } finally {
    workspace.dispose();
  }
}

function evaluateJavaScript(program: string): string {
  const lines = program.trim().split('\n');
  const expression = lines.pop()!.replace(/;$/, '');
  return new Function([...lines, `return Array.from(${expression}, (byte) => byte.toString(16).padStart(2, '0')).join('');`].join('\n'))() as string;
}

function evaluatePython(program: string): string {
  const lines = program.trim().split('\n');
  const expression = lines.pop()!;
  return execFileSync(pythonCommand, ['-c', [
    ...lines,
    `print(${expression}.hex())`,
  ].join('\n')], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
}

describe('SHAKE Blockly XOF boundary contract', () => {
  it.each(boundaryVectors)(
    'matches the independent SHAKE reference at the $algorithm rate-minus-one boundary',
    ({ algorithm, inputLength, outputHex }) => {
      expect(evaluateJavaScript(generate('javascript', algorithm, inputLength))).toBe(outputHex);
      expect(evaluatePython(generate('python', algorithm, inputLength))).toBe(outputHex);
    },
  );

  it.each(['SHAKE128', 'SHAKE256'] as const)(
    'matches the independent native implementation for empty, short, and multi-rate $algorithm inputs and outputs',
    (algorithm) => {
      const rate = algorithm === 'SHAKE128' ? 168 : 136;
      for (const { inputRates, inputTail, outputRates, outputTail } of shakeBoundaryCases) {
        const inputLength = rate * inputRates + inputTail;
        const outputLength = rate * outputRates + outputTail;
        const input = Buffer.from(Array.from({ length: inputLength }, (_, index) => index & 0xff));
        const expected = createHash(algorithm.toLowerCase(), { outputLength })
          .update(input)
          .digest('hex');
        const javascriptSeed = `Array.from({ length: ${inputLength} }, (_, i) => i & 255)`;
        const pythonSeed = `bytes(i & 255 for i in range(${inputLength}))`;

        expect(evaluateJavaScript(generate('javascript', algorithm, inputLength, String(outputLength), javascriptSeed)))
          .toBe(expected);
        expect(evaluatePython(generate('python', algorithm, inputLength, String(outputLength), pythonSeed)))
          .toBe(expected);
      }
    },
  );

  it.each(prfBoundaryVectors)(
    'matches the independent PRF reference at the $algorithm rate-minus-one boundary',
    ({ algorithm, seedLength, outputHex }) => {
      expect(evaluateJavaScript(generatePrf('javascript', algorithm, seedLength))).toBe(outputHex);
      expect(evaluatePython(generatePrf('python', algorithm, seedLength))).toBe(outputHex);
    },
  );

  it('accepts integer-valued float output lengths and rejects negative or fractional lengths in both languages', () => {
    for (const language of ['javascript', 'python'] as const) {
      expect(language === 'javascript'
        ? evaluateJavaScript(generate(language, 'SHAKE128', 0, '1.0')).length / 2
        : evaluatePython(generate(language, 'SHAKE128', 0, '1.0')).length / 2).toBe(1);
      for (const outLen of ['-1', '1.5']) {
        expect(() => language === 'javascript'
          ? evaluateJavaScript(generate(language, 'SHAKE128', 0, outLen))
          : evaluatePython(generate(language, 'SHAKE128', 0, outLen))).toThrow();
      }
      expect(language === 'javascript'
        ? evaluateJavaScript(generatePrf(language, 'SHAKE256', 0, '7', '1.0')).length / 2
        : evaluatePython(generatePrf(language, 'SHAKE256', 0, '7', '1.0')).length / 2).toBe(1);
    }
  });

  it('accepts only byte-valued integer PRF nonces in both languages', () => {
    for (const language of ['javascript', 'python'] as const) {
      for (const nonce of ['0', '255']) {
        expect(language === 'javascript'
          ? evaluateJavaScript(generatePrf(language, 'SHAKE256', 0, nonce, '1')).length / 2
          : evaluatePython(generatePrf(language, 'SHAKE256', 0, nonce, '1')).length / 2).toBe(1);
      }
      for (const nonce of ['-1', '256', '1.5', 'true']) {
        expect(() => language === 'javascript'
          ? evaluateJavaScript(generatePrf(language, 'SHAKE256', 0, nonce, '1'))
          : evaluatePython(generatePrf(language, 'SHAKE256', 0, nonce, '1'))).toThrow();
      }
    }
  });

  it('rejects malformed byte arrays consistently for XOF and PRF', () => {
    const invalidSeeds = [
      { javascript: '[-1]', python: '[-1]' },
      { javascript: '[256]', python: '[256]' },
      { javascript: '[1.5]', python: '[1.5]' },
      { javascript: 'new Array(1)', python: '[None]' },
      { javascript: '["1"]', python: '["1"]' },
      { javascript: '[true]', python: '[True]' },
    ];

    for (const seed of invalidSeeds) {
      expect(() => evaluateJavaScript(generate('javascript', 'SHAKE128', 0, '1', seed.javascript))).toThrow();
      expect(() => evaluatePython(generate('python', 'SHAKE128', 0, '1', seed.python))).toThrow();
      expect(() => evaluateJavaScript(generatePrf('javascript', 'SHAKE256', 0, '7', '1', seed.javascript))).toThrow();
      expect(() => evaluatePython(generatePrf('python', 'SHAKE256', 0, '7', '1', seed.python))).toThrow();
    }
  });

  it('treats integer-valued numeric bytes identically in JavaScript and Python', () => {
    for (const language of ['javascript', 'python'] as const) {
      const floatXof = language === 'javascript'
        ? evaluateJavaScript(generate(language, 'SHAKE128', 0, '8', '[1.0, 2.0]'))
        : evaluatePython(generate(language, 'SHAKE128', 0, '8', '[1.0, 2.0]'));
      const integerXof = language === 'javascript'
        ? evaluateJavaScript(generate(language, 'SHAKE128', 0, '8', '[1, 2]'))
        : evaluatePython(generate(language, 'SHAKE128', 0, '8', '[1, 2]'));
      expect(floatXof).toBe(integerXof);
    }
  });

  it('encodes string seed conveniences as UTF-8 consistently with native SHAKE', () => {
    const seed = Buffer.from('猫', 'utf8');
    const expectedXof = createHash('shake128', { outputLength: 16 }).update(seed).digest('hex');
    const expectedPrf = createHash('shake256', { outputLength: 16 })
      .update(Buffer.concat([seed, Buffer.from([7])]))
      .digest('hex');

    expect(evaluateJavaScript(generate('javascript', 'SHAKE128', 0, '16', "'猫'"))).toBe(expectedXof);
    expect(evaluatePython(generate('python', 'SHAKE128', 0, '16', "'猫'"))).toBe(expectedXof);
    expect(evaluateJavaScript(generatePrf('javascript', 'SHAKE256', 0, '7', '16', "'猫'"))).toBe(expectedPrf);
    expect(evaluatePython(generatePrf('python', 'SHAKE256', 0, '7', '16', "'猫'"))).toBe(expectedPrf);
  });
});
