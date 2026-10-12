// @vitest-environment jsdom
import * as Blockly from 'blockly/core';
import 'blockly/blocks';
import { execFileSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';

import '@/blocks/hkdf/blocks';
import '@/blocks/data/number';
import '@/generators/javascript';
import '@/generators/javascript/hkdf';
import '@/generators/python';
import '@/generators/python/hkdf';

import { javascriptGenerator } from 'blockly/javascript';
import { pythonGenerator } from 'blockly/python';

const pythonCommand = process.env.CIPHER_CAT_PYTHON ||
  (process.platform === 'win32' ? 'python' : 'python3');

/** RFC 5869 §A.1 (TestCase 1)，HMAC-SHA256 */
const SALT = [...Array(13).keys()];
const IKM = new Array(22).fill(0x0b);
const INFO = Array.from({ length: 10 }, (_, i) => 0xf0 + i);
const PRK = '077709362c2e32df0ddc3f0dc47bba6390b6c73bb50f9c3122ec844ad7c2b3e5';
const OKM = '3cb25f25faacd57a90434f64d0362f2a2d2d0a90cf1a5a4c5db02d56ecc4c5bf34007208d5b887185865';

function generateIn(
  language: 'javascript' | 'python',
  blockType: string,
  numberInputs: Record<string, number>,
  listInputs: Record<string, number[]>,
): string {
  const workspace = new Blockly.Workspace();
  try {
    const block = workspace.newBlock(blockType);
    for (const [input, value] of Object.entries(numberInputs)) {
      const source = workspace.newBlock('data_value');
      source.setFieldValue(String(value), 'NUM');
      block.getInput(input)!.connection!.connect(source.outputConnection!);
    }
    for (const [input, values] of Object.entries(listInputs)) {
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

describe('HKDF primitive block contract (RFC 5869 A.1)', () => {
  it('HKDF-Extract returns the published PRK in both languages', () => {
    const inputs = { SALT: SALT, IKM: IKM };
    expect(evaluateJavaScript(generateIn('javascript', 'hkdf_extract', {}, inputs))).toBe(PRK);
    expect(evaluatePython(generateIn('python', 'hkdf_extract', {}, inputs))).toBe(PRK);
  });

  it('HKDF-Expand returns the published OKM in both languages', () => {
    const inputs = { PRK: PRK.match(/../g)!.map((pair) => parseInt(pair, 16)), INFO: INFO };
    expect(evaluateJavaScript(generateIn('javascript', 'hkdf_expand', { LEN: 42 }, inputs))).toBe(OKM);
    expect(evaluatePython(generateIn('python', 'hkdf_expand', { LEN: 42 }, inputs))).toBe(OKM);
  });

  it('composing Expand(Extract(salt, ikm), info, L) equals the full HKDF result', () => {
    const program = generateIn('javascript', 'hkdf_extract', {}, { SALT: SALT, IKM: IKM });
    const prk = evaluateJavaScript(program);
    const expand = generateIn(
      'javascript',
      'hkdf_expand',
      { LEN: 42 },
      { PRK: prk.match(/../g)!.map((pair) => parseInt(pair, 16)), INFO: INFO },
    );
    expect(evaluateJavaScript(expand)).toBe(OKM);
  });

  it('rejects an output length above 255 hash blocks in both languages', () => {
    const inputs = { PRK: new Array(32).fill(0), INFO: [] };
    expect(() => evaluateJavaScript(generateIn('javascript', 'hkdf_expand', { LEN: 8161 }, inputs))).toThrow();
    expect(() => evaluatePython(generateIn('python', 'hkdf_expand', { LEN: 8161 }, inputs))).toThrow();
  });
});
