// @vitest-environment jsdom
import * as Blockly from 'blockly/core';
import 'blockly/blocks';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import '@/blocks/data/number';
import '@/blocks/zuc/blocks';
import '@/generators/javascript';
import '@/generators/javascript/zuc/blocks';
import '@/generators/python';
import '@/generators/python/zuc/blocks';

import { javascriptGenerator } from 'blockly/javascript';
import { pythonGenerator } from 'blockly/python';
import { SBOX_PRESETS } from '@/constants/sbox-presets';

const pythonCommand = process.env.CIPHER_CAT_PYTHON ||
  (process.platform === 'win32' ? 'python' : 'python3');

function generate(type: string, inputs: Record<string, string>): { javascript: string; python: string } {
  const workspace = new Blockly.Workspace();
  try {
    const block = workspace.newBlock(type);
    for (const [name, expression] of Object.entries(inputs)) {
      const value = workspace.newBlock('data_value');
      value.setFieldValue(expression, 'NUM');
      block.getInput(name)!.connection!.connect(value.outputConnection!);
    }
    return {
      javascript: javascriptGenerator.workspaceToCode(workspace),
      python: pythonGenerator.workspaceToCode(workspace),
    };
  } finally {
    workspace.dispose();
  }
}

function evaluateJavaScript(program: string): unknown {
  const lines = program.trim().split('\n');
  const expression = lines.pop()!.replace(/;$/, '');
  return new Function([...lines, `return ${expression};`].join('\n'))();
}

function evaluatePython(program: string): unknown {
  const lines = program.trim().split('\n');
  const expression = lines.pop()!;
  const output = execFileSync(pythonCommand, ['-c', [
    ...lines,
    `print(__import__("json").dumps(${expression}))`,
  ].join('\n')], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  return JSON.parse(output.trim());
}

function standardSbox(heading: string, endMarker: string): number[] {
  const source = readFileSync(resolve(process.cwd(), 'docs/standards/gbt33133-ZUC/00-Standard-Source.md'), 'utf8');
  const lines = source.split(/\r?\n/);
  const normalize = (line: string) => line.replace(/\s+/g, '');
  const start = lines.findIndex((line) => normalize(line) === normalize(heading));
  if (start < 0) throw new Error(`ZUC standard table not found: ${heading}`);
  const end = lines.findIndex((line, index) => index > start && normalize(line) === normalize(endMarker));
  if (end < 0) throw new Error(`ZUC standard table boundary not found: ${endMarker}`);

  const rows: number[][] = [];
  for (const line of lines.slice(start + 1, end)) {
    const values = line.trim().split(/\s+/);
    if (values.length !== 17 || !/^[0-9A-F]$/i.test(values[0]) || !values.slice(1).every((value) => /^[0-9A-F]{2}$/i.test(value))) continue;
    if (values[0].toUpperCase() !== rows.length.toString(16).toUpperCase()) {
      throw new Error(`Unexpected ZUC table row ${values[0]} in ${heading}`);
    }
    rows.push(values.slice(1).map((value) => Number.parseInt(value, 16)));
  }
  if (rows.length !== 16) throw new Error(`Incomplete ZUC standard table: ${heading} (${rows.length}/16 rows)`);
  return rows.flat();
}

function evaluateJavaScriptRange(program: string): number[] {
  const lines = program.trim().split('\n');
  const expression = lines.pop()!.replace(/;$/, '');
  return new Function([...lines, `return Array.from({ length: 256 }, (_, x) => ${expression});`].join('\n'))() as number[];
}

function evaluatePythonRange(program: string): number[] {
  const lines = program.trim().split('\n');
  const expression = lines.pop()!;
  const output = execFileSync(pythonCommand, ['-c', [
    ...lines,
    `print(__import__("json").dumps([${expression} for x in range(256)]))`,
  ].join('\n')], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  return JSON.parse(output.trim()) as number[];
}

describe('ZUC block contracts', () => {
  it.each([
    ['zuc_s0', '1 S0 盒', '2 S1 盒'],
    ['zuc_s1', '2 S1 盒', '注:S0 盒和 S1 盒数据均为十六进制表示。'],
  ])('%s matches all 256 entries in GB/T 33133.1-2016 Appendix A', (type, heading, endMarker) => {
    const expected = standardSbox(heading, endMarker);
    expect(SBOX_PRESETS[type].map((entry) => Number.parseInt(entry, 16))).toEqual(expected);
    const program = generate(type, { INPUT: 'x' });
    expect(evaluateJavaScriptRange(program.javascript)).toEqual(expected);
    expect(evaluatePythonRange(program.python)).toEqual(expected);
  });

  it.each([
    ['zuc_s0', '0', 0x3e],
    ['zuc_s0', '1.0', 0x72],
    ['zuc_s0', '0xff', 0x60],
    ['zuc_s0', '0xa4', 0x8a],
    ['zuc_s1', '0', 0x55],
    ['zuc_s1', '0xff', 0xf2],
    ['zuc_s1', '0xc0', 0xa3],
  ])('%s maps byte %s to its GB/T 33133 Appendix A value', (type, input, expected) => {
    const program = generate(type, { INPUT: input });
    expect(evaluateJavaScript(program.javascript)).toBe(expected);
    expect(evaluatePython(program.python)).toBe(expected);
  });

  it.each([
    ['zuc_l1', '1', 0x01040405],
    ['zuc_l1', '1.0', 0x01040405],
    ['zuc_l1', '0x80000001', 0x81860607],
    ['zuc_l2', '1', 0x40404101],
    ['zuc_l2', '0x80000001', 0xe0606181],
  ])('%s matches the GB/T 33133 32-bit rotation formula for %s', (type, input, expected) => {
    const program = generate(type, { INPUT: input });
    expect(evaluateJavaScript(program.javascript)).toBe(expected);
    expect(evaluatePython(program.python)).toBe(expected);
  });

  it.each(['-1', '256', '1.5', 'NaN', 'Infinity'])(
    'rejects non-byte S-box input %s consistently in both languages',
    (input) => {
      const pythonInput = input === 'NaN' ? 'float("nan")' : input === 'Infinity' ? 'float("inf")' : input;
      for (const type of ['zuc_s0', 'zuc_s1']) {
        const javascript = generate(type, { INPUT: input });
        const python = generate(type, { INPUT: pythonInput });
        expect(() => evaluateJavaScript(javascript.javascript)).toThrow();
        expect(() => evaluatePython(python.python)).toThrow();
      }
    },
  );

  it.each(['-1', '4294967296', '1.5', 'NaN', 'Infinity'])(
    'rejects non-32-bit input %s consistently in both linear transforms',
    (input) => {
      const pythonInput = input === 'NaN' ? 'float("nan")' : input === 'Infinity' ? 'float("inf")' : input;
      for (const type of ['zuc_l1', 'zuc_l2']) {
        const javascript = generate(type, { INPUT: input });
        const python = generate(type, { INPUT: pythonInput });
        expect(() => evaluateJavaScript(javascript.javascript)).toThrow();
        expect(() => evaluatePython(python.python)).toThrow();
      }
    },
  );

  it('computes the F output word modulo 2^32 in both languages', () => {
    const program = generate('zuc_f', {
      X0: '0x12345678',
      X1: '0x9abcdef0',
      X2: '0x0f1e2d3c',
      R1: '0x9abcdef0',
      R2: '0xfedcba98',
    });
    expect(evaluateJavaScript(program.javascript)).toBe(0x87654320);
    expect(evaluatePython(program.python)).toBe(0x87654320);
  });

  it.each([
    ['C1 all-zero', 'new Uint8Array(16)', 'new Uint8Array(16)', 'bytes(16)', 'bytes(16)', [0x27bede74, 0x018082da]],
    ['C2 all-ones', 'new Uint8Array(16).fill(255)', 'new Uint8Array(16).fill(255)', 'bytes([255] * 16)', 'bytes([255] * 16)', [0x0657cfa0, 0x7096398b]],
    ['C3 random', 'Uint8Array.from([0x3d,0x4c,0x4b,0xe9,0x6a,0x82,0xfd,0xae,0xb5,0x8f,0x64,0x1d,0xb1,0x7b,0x45,0x5b])', 'Uint8Array.from([0x84,0x31,0x9a,0xa8,0xde,0x69,0x15,0xca,0x1f,0x6b,0xda,0x6b,0xfb,0xd8,0xc7,0x66])', 'bytes.fromhex("3d4c4be96a82fdaeb58f641db17b455b")', 'bytes.fromhex("84319aa8de6915ca1f6bda6bfbd8c766")', [0x14f1c272, 0x3279c419]],
  ])('matches GB/T 33133.1 Appendix C %s in both languages', (_name, jsKey, jsIv, pyKey, pyIv, expected) => {
    const javascript = generate('zuc_keystream', { KEY: jsKey as string, IV: jsIv as string, LEN: '2' });
    const python = generate('zuc_keystream', { KEY: pyKey as string, IV: pyIv as string, LEN: '2' });
    expect(evaluateJavaScript(javascript.javascript)).toEqual(expected);
    expect(evaluatePython(python.python)).toEqual(expected);
  });

  it.each([
    ['short key', 'new Uint8Array(15)', 'new Uint8Array(16)', 'bytes(15)', 'bytes(16)'],
    ['long IV', 'new Uint8Array(16)', 'new Uint8Array(17)', 'bytes(16)', 'bytes(17)'],
    ['non-array key', '16', 'new Uint8Array(16)', '16', 'bytes(16)'],
    ['non-array IV', 'new Uint8Array(16)', '16', 'bytes(16)', '16'],
    ['out-of-range key byte', 'new Array(16).fill(256)', 'new Uint8Array(16)', '[256] + [0] * 15', 'bytes(16)'],
    ['boolean key byte', '[true, ...new Array(15).fill(0)]', 'new Uint8Array(16)', '[True] + [0] * 15', 'bytes(16)'],
    ['fractional IV byte', 'new Uint8Array(16)', '[0.5, ...new Array(15).fill(0)]', 'bytes(16)', '[0.5] + [0] * 15'],
  ])('rejects invalid %s in both languages', (_case, jsKey, jsIv, pyKey, pyIv) => {
    const javascript = generate('zuc_keystream', { KEY: jsKey as string, IV: jsIv as string, LEN: '2' });
    const python = generate('zuc_keystream', { KEY: pyKey as string, IV: pyIv as string, LEN: '2' });
    expect(() => evaluateJavaScript(javascript.javascript)).toThrow();
    expect(() => evaluatePython(python.python)).toThrow();
  });

  it.each(['KEY', 'IV'])('rejects sparse JavaScript %s arrays', (name) => {
    const inputs: Record<string, string> = {
      KEY: 'new Uint8Array(16)',
      IV: 'new Uint8Array(16)',
      LEN: '2',
    };
    inputs[name] = 'Array(16)';
    const program = generate('zuc_keystream', inputs);
    expect(() => evaluateJavaScript(program.javascript)).toThrow();
  });

  it('returns an empty array when zero output words are requested', () => {
    const javascript = generate('zuc_keystream', {
      KEY: 'new Uint8Array(16)', IV: 'new Uint8Array(16)', LEN: '0',
    });
    const python = generate('zuc_keystream', {
      KEY: 'bytes(16)', IV: 'bytes(16)', LEN: '0',
    });
    expect(evaluateJavaScript(javascript.javascript)).toEqual([]);
    expect(evaluatePython(python.python)).toEqual([]);
  });

  it.each([
    ['X0', '1.5'],
    ['X1', '-1'],
    ['X2', '4294967296'],
    ['R1', 'NaN'],
    ['R2', 'Infinity'],
  ])('rejects invalid F input in %s', (name, invalid) => {
    const inputs: Record<string, string> = {
      X0: '0x12345678',
      X1: '0x9abcdef0',
      X2: '0x0f1e2d3c',
      R1: '0x9abcdef0',
      R2: '0xfedcba98',
    };
    inputs[name] = invalid;
    const javascript = generate('zuc_f', inputs);
    const pythonInput = invalid === 'NaN' ? 'float("nan")' : invalid === 'Infinity' ? 'float("inf")' : invalid;
    inputs[name] = pythonInput;
    const python = generate('zuc_f', inputs);
    expect(() => evaluateJavaScript(javascript.javascript)).toThrow();
    expect(() => evaluatePython(python.python)).toThrow();
  });

  it.each([
    ['javascript', 'zuc_l1', 'nextValue()', 0x01040405],
    ['javascript', 'zuc_l2', 'nextValue()', 0x40404101],
    ['python', 'zuc_l1', 'next_value()', 0x01040405],
    ['python', 'zuc_l2', 'next_value()', 0x40404101],
  ])('%s evaluates %s input only once', (language, type, input, expected) => {
    const program = generate(type, { INPUT: input });
    if (language === 'javascript') {
      let calls = 0;
      const source = program.javascript.trim().split('\n');
      const expression = source.pop()!.replace(/;$/, '');
      const result = new Function('nextValue', [...source, `return ${expression};`].join('\n'))(() => {
        calls += 1;
        return 1;
      });
      expect(result).toBe(expected);
      expect(calls).toBe(1);
      return;
    }

    const source = program.python.trim().split('\n');
    const expression = source.pop()!;
    const output = execFileSync(pythonCommand, ['-c', [
      ...source,
      'calls = 0',
      'def next_value():',
      '    global calls',
      '    calls += 1',
      '    return 1',
      `result = ${expression}`,
      'print(__import__("json").dumps([result, calls]))',
    ].join('\n')], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
    expect(JSON.parse(output.trim())).toEqual([expected, 1]);
  });
});
