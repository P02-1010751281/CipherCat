// @vitest-environment jsdom
import * as Blockly from 'blockly/core';
import 'blockly/blocks';
import * as englishBlockly from 'blockly/msg/en';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import '@/blocks/bitwise/byte-substitute';
import '@/blocks/data/number';
import '@/blocks/sbox/sbox';
import '@/blocks/sbox/sbox_variables';
import '@/blocks/symmetric/sm4/blocks';
import '@/generators/javascript';
import '@/generators/javascript/bit/byte-substitute';
import '@/generators/javascript/sbox/sbox';
import '@/generators/javascript/symmetric/sm4/blocks';
import '@/generators/python';
import '@/generators/python/bit/byte-substitute';
import '@/generators/python/sbox/sbox';
import '@/generators/python/symmetric/sm4/blocks';
import { SBOX_PRESETS } from '@/constants/sbox-presets';
import { javascriptGenerator } from 'blockly/javascript';
import { pythonGenerator } from 'blockly/python';

const pythonCommand = process.env.CIPHER_CAT_PYTHON ||
  (process.platform === 'win32' ? 'python' : 'python3');
const aesSbox = SBOX_PRESETS.aes.map((entry) => Number.parseInt(entry, 16));
Object.assign(Blockly.Msg, englishBlockly);

const standardSboxTables = [
  {
    name: 'AES',
    preset: 'aes',
    source: 'docs/standards/fips197-AES/00-Standard-Source.md',
    heading: 'Table 4. SB OX(): substitution values for the byte xy (in hexadecimal format)',
    endMarker: 'the substitution value would be determined',
  },
  {
    name: 'SM4',
    preset: 'sm4',
    source: 'docs/standards/gbt32907-SM4/00-Standard-Source.md',
    heading: '表 1 Sbox 数据',
    endMarker: '例如:输入',
  },
] as const;

function readStandardSboxTable(table: (typeof standardSboxTables)[number]): number[] {
  const lines = readFileSync(resolve(process.cwd(), table.source), 'utf8').split(/\r?\n/);
  const start = lines.findIndex((line) => line.trim() === table.heading);
  if (start < 0) throw new Error(`Standard S-box table not found: ${table.heading}`);
  const end = lines.findIndex((line, index) => index > start && line.includes(table.endMarker));
  if (end < 0) throw new Error(`Standard S-box table boundary not found: ${table.endMarker}`);

  const rows: number[][] = [];
  for (const line of lines.slice(start + 1, end)) {
    const values = line.trim().split(/\s+/);
    if (values[0] === 'x') values.shift();
    if (values.length === 1) continue;
    const isColumnHeader = values.length === 16 && values.every((value, index) =>
      /^[0-9a-f]$/i.test(value) && Number.parseInt(value, 16) === index);
    if (isColumnHeader) continue;
    if (!/^[0-9a-f]$/i.test(values[0] ?? '')) continue;
    if (Number.parseInt(values[0], 16) !== rows.length || values.length !== 17 ||
      !values.slice(1).every((value) => /^[0-9a-f]{2}$/i.test(value))) {
      throw new Error(`Malformed standard S-box row in ${table.heading}: ${line}`);
    }
    rows.push(values.slice(1).map((value) => Number.parseInt(value, 16)));
  }
  if (rows.length !== 16) throw new Error(`Incomplete standard S-box table: ${table.heading} (${rows.length}/16 rows)`);
  return rows.flat();
}

function generateByteSubstitute(language: 'javascript' | 'python', input: string): string {
  const workspace = new Blockly.Workspace();
  try {
    const block = workspace.newBlock('bit_byte_substitute');
    for (const [name, expression] of [['INPUT', input], ['OUTPUT', 'result']] as const) {
      const value = workspace.newBlock('data_value');
      value.setFieldValue(expression, 'NUM');
      block.getInput(name)!.connection!.connect(value.outputConnection!);
    }
    const generator = language === 'javascript' ? javascriptGenerator : pythonGenerator;
    return generator.workspaceToCode(workspace);
  } finally {
    workspace.dispose();
  }
}

function generateSm4Sbox(language: 'javascript' | 'python', input: string): string {
  const workspace = new Blockly.Workspace();
  try {
    const result = workspace.getVariableMap().createVariable('result');
    const assign = workspace.newBlock('variables_set');
    assign.setFieldValue(result.getId(), 'VAR');
    const sbox = workspace.newBlock('sm4_sbox');
    const value = workspace.newBlock('data_value');
    value.setFieldValue(input, 'NUM');
    sbox.getInput('INPUT')!.connection!.connect(value.outputConnection!);
    assign.getInput('VALUE')!.connection!.connect(sbox.outputConnection!);
    const generator = language === 'javascript' ? javascriptGenerator : pythonGenerator;
    return generator.workspaceToCode(workspace);
  } finally {
    workspace.dispose();
  }
}

function generateSboxSub(
  language: 'javascript' | 'python',
  inputExpression = '0x00112233',
  definePreset = true,
  outputFormat: '1d' | '2d' = '1d',
  presetTable: string[] = SBOX_PRESETS.aes,
): string {
  const workspace = new Blockly.Workspace();
  try {
    const variable = workspace.getVariableMap().createVariable(definePreset ? 'table' : 'sbox', 'SBox');
    let assignTable: Blockly.Block | undefined;
    if (definePreset) {
      const table = workspace.newBlock('sbox') as Blockly.Block & { gridData: string[] };
      table.setFieldValue('16', 'ROW');
      table.setFieldValue('16', 'COL');
      table.setFieldValue(outputFormat, 'OUTPUT_FORMAT');
      table.gridData = presetTable.slice();

      assignTable = workspace.newBlock('sbox_variables_set');
      assignTable.setFieldValue(variable.getId(), 'VAR');
      assignTable.getInput('VALUE')!.connection!.connect(table.outputConnection!);
    }

    const substitute = workspace.newBlock('sbox_sub');
    assignTable?.nextConnection!.connect(substitute.previousConnection!);
    for (const [name, expression] of [['INPUT_VAR', inputExpression], ['OUTPUT_VAR', 'result']] as const) {
      const value = workspace.newBlock('data_value');
      value.setFieldValue(expression, 'NUM');
      substitute.getInput(name)!.connection!.connect(value.outputConnection!);
    }
    const getter = workspace.newBlock('sbox_variables_get');
    getter.setFieldValue(variable.getId(), 'VAR');
    substitute.getInput('SBOX_VAR')!.connection!.connect(getter.outputConnection!);

    const generator = language === 'javascript' ? javascriptGenerator : pythonGenerator;
    return generator.workspaceToCode(workspace);
  } finally {
    workspace.dispose();
  }
}

function runJavaScriptRange(program: string): number[] {
  const evaluate = new Function('input', `${program}\nreturn result;`) as (input: number) => number;
  return Array.from({ length: 256 }, (_, input) => evaluate(input));
}

function runPythonRange(program: string): number[] {
  const wrapped = [
    'import json',
    'outputs = []',
    'for input in range(256):',
    ...program.trimEnd().split('\n').map((line) => `    ${line}`),
    '    outputs.append(result)',
    'print(json.dumps(outputs))',
  ].join('\n');
  return JSON.parse(execFileSync(pythonCommand, ['-c', wrapped], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim()) as number[];
}

function runJavaScript(
  program: string,
  table: unknown[] = aesSbox,
  resultName = 'result',
): number | undefined {
  return new Function('sbox', `${program}\nreturn ${resultName};`)(table) as number | undefined;
}

function pythonLiteral(value: unknown): string {
  if (typeof value === 'boolean') return value ? 'True' : 'False';
  if (Array.isArray(value)) return `[${value.map(pythonLiteral).join(', ')}]`;
  if (typeof value === 'number' && Number.isInteger(value)) return `${value}.0`;
  return JSON.stringify(value) ?? 'None';
}

function pythonPrelude(input?: { sbox?: unknown[] }): string {
  return input?.sbox ? `sbox = ${pythonLiteral(input.sbox)}\n` : '';
}

function pythonProgram(program: string, input?: { sbox?: unknown[] }): string {
  const prelude = pythonPrelude(input);
  if (!prelude) return program;
  return /^sbox = None\r?$/m.test(program)
    ? program.replace(/^sbox = None\r?$/m, prelude.trimEnd())
    : `${prelude}${program}`;
}

function runPython(program: string, input?: { sbox?: unknown[] }): number | undefined {
  const output = execFileSync(pythonCommand, ['-c', `${pythonProgram(program, input)}\nprint(result)`], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
  return output === 'None' ? undefined : Number(output);
}

function runPythonType(program: string, input?: { sbox?: unknown[] }): string {
  return execFileSync(pythonCommand, ['-c', `${pythonProgram(program, input)}\nprint(type(result).__name__)`], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
}

function runPythonError(program: string, input?: { sbox?: unknown[] }): unknown {
  const executable = pythonProgram(program, input);
  const wrapped = [
    'import json',
    'try:',
    ...executable.trimEnd().split('\n').map((line) => `    ${line}`),
    'except Exception as error:',
    '    print(json.dumps({"type": type(error).__name__, "message": str(error)}))',
    'else:',
    '    print(json.dumps(None))',
  ].filter(Boolean).join('\n');
  return JSON.parse(execFileSync(pythonCommand, ['-c', wrapped], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim()) as unknown;
}

describe('S-box Blockly block contracts', () => {
  it.each(standardSboxTables)('matches all $name preset entries and byte substitutions against its standard table', (table) => {
    const expected = readStandardSboxTable(table);
    const preset = SBOX_PRESETS[table.preset];
    expect(preset).toHaveLength(256);
    expect(preset.map((entry) => Number.parseInt(entry, 16))).toEqual(expected);

    const input = 'input * 0x01010101';
    const javascript = generateSboxSub('javascript', input, true, '1d', preset);
    const python = generateSboxSub('python', input, true, '1d', preset);
    const expectedWords = expected.map((value) => value * 0x01010101);
    expect(runJavaScriptRange(javascript)).toEqual(expectedWords);
    expect(runPythonRange(python)).toEqual(expectedWords);

    if (table.preset === 'sm4') {
      expect(runJavaScriptRange(generateSm4Sbox('javascript', 'input'))).toEqual(expected);
      expect(runPythonRange(generateSm4Sbox('python', 'input'))).toEqual(expected);
    }
  });

  it.each([
    { label: 'negative index', javascript: '-1', python: '-1' },
    { label: 'index above byte range', javascript: '256', python: '256' },
    { label: 'fractional index', javascript: '1.5', python: '1.5' },
    { label: 'boolean index', javascript: 'true', python: 'True' },
  ])('rejects an SM4 S-box $label instead of wrapping or coercing it', ({ javascript, python }) => {
    expect(() => new Function(generateSm4Sbox('javascript', javascript))()).toThrow();
    expect(runPythonError(generateSm4Sbox('python', python))).not.toBeNull();
  });

  it('substitutes the first and last byte through a 256-entry table in both languages', () => {
    for (const [input, expected] of [['0', 0x63], ['255', 0x16]] as const) {
      expect(runJavaScript(generateByteSubstitute('javascript', input))).toBe(expected);
      expect(runPython(generateByteSubstitute('python', input), { sbox: aesSbox })).toBe(expected);
    }
  });

  it('treats integer-valued floats consistently as byte values in both languages', () => {
    expect(runJavaScript(generateByteSubstitute('javascript', '1.0'))).toBe(0x7c);
    expect(runPython(generateByteSubstitute('python', '1.0'), { sbox: aesSbox })).toBe(0x7c);

    const table = Array(256).fill(0);
    table[0] = 1.0;
    expect(runJavaScript(generateByteSubstitute('javascript', '0'), table)).toBe(1);
    expect(runPython(generateByteSubstitute('python', '0'), { sbox: table })).toBe(1);
    expect(runPythonType(generateByteSubstitute('python', '0'), { sbox: table })).toBe('int');
  });

  it.each([
    { label: 'boolean input', javascript: 'true', python: 'True' },
    { label: 'fractional input', javascript: '1.5', python: '1.5' },
  ])('rejects a $label in both languages', ({ javascript, python }) => {
    expect(() => runJavaScript(generateByteSubstitute('javascript', javascript))).toThrow();
    expect(() => runPython(generateByteSubstitute('python', python), { sbox: aesSbox })).toThrow();
  });

  it('rejects boolean and fractional table outputs in both languages', () => {
    for (const value of [true, 1.5]) {
      const table = Array(256).fill(0);
      table[0] = value;
      expect(() => runJavaScript(generateByteSubstitute('javascript', '0'), table)).toThrow();
      expect(() => runPython(generateByteSubstitute('python', '0'), { sbox: table })).toThrow();
    }
  });

  it.each(['-1', '256'])('rejects byte index %s instead of using language-specific indexing', (input) => {
    expect(() => runJavaScript(generateByteSubstitute('javascript', input))).toThrow();
    expect(() => runPython(generateByteSubstitute('python', input), { sbox: aesSbox })).toThrow();
  });

  it.each([
    { label: 'short table', table: Array(255).fill(0) },
    { label: 'non-byte output', table: Array(256).fill(256) },
  ])('rejects a $label in both languages', ({ table }) => {
    expect(() => runJavaScript(generateByteSubstitute('javascript', '0'), table)).toThrow();
    expect(() => runPython(generateByteSubstitute('python', '0'), { sbox: table })).toThrow();
  });

  it.each(['1d', '2d'] as const)('executes a %s preset AES S-box through setter, getter, and 32-bit substitution', (outputFormat) => {
    const expected = 0x6382_93c3;
    expect(runJavaScript(generateSboxSub('javascript', '0x00112233', true, outputFormat))).toBe(expected);
    expect(runPython(generateSboxSub('python', '0x00112233', true, outputFormat))).toBe(expected);
  });

  it.each([
    { label: 'negative', javascript: '-1', python: '-1' },
    { label: 'fractional', javascript: '1.5', python: '1.5' },
    { label: 'boolean', javascript: 'true', python: 'True' },
    { label: 'above 32 bits', javascript: '0x100000000', python: '0x100000000' },
  ])('rejects a $label word in the 32-bit substitution block', ({ javascript, python }) => {
    const message = 'S-box input must be an unsigned 32-bit word';
    expect(() => runJavaScript(generateSboxSub('javascript', javascript, false))).toThrow(message);
    expect(runPythonError(generateSboxSub('python', python, false), { sbox: aesSbox })).toEqual({
      type: 'ValueError', message,
    });
  });

  it.each([
    { label: 'short table', table: Array(255).fill(0), message: 'S-box must contain at least 256 entries' },
    { label: 'boolean table entry', table: [true, ...Array(255).fill(0)], message: 'S-box entries must be bytes' },
    { label: 'fractional table entry', table: [1.5, ...Array(255).fill(0)], message: 'S-box entries must be bytes' },
    { label: 'out-of-range table entry', table: [256, ...Array(255).fill(0)], message: 'S-box entries must be bytes' },
  ])('rejects a $label in the 32-bit substitution block', ({ table, message }) => {
    expect(() => runJavaScript(generateSboxSub('javascript', '0', false), table)).toThrow(message);
    expect(runPythonError(generateSboxSub('python', '0', false), { sbox: table })).toEqual({
      type: 'ValueError', message,
    });
  });

  it('accepts integer-valued float entries in the 32-bit substitution block in both languages', () => {
    const table = Array(256).fill(0);
    table[0] = 1.0;
    expect(runJavaScript(generateSboxSub('javascript', '0', false), table)).toBe(0x0101_0101);
    expect(runPython(generateSboxSub('python', '0', false), { sbox: table })).toBe(0x0101_0101);
  });
});
