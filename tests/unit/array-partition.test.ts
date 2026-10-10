// @vitest-environment jsdom
import * as Blockly from 'blockly/core';
import 'blockly/blocks';
import { execFileSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';

import '@/blocks/array/partition';
import '@/blocks/data/number';
import '@/generators/javascript';
import '@/generators/python';
import { migrateJsonState, migrateXmlText } from '@/utils/migration';
import { javascriptGenerator } from 'blockly/javascript';
import { pythonGenerator } from 'blockly/python';

const pythonCommand = process.env.CIPHER_CAT_PYTHON ||
  (process.platform === 'win32' ? 'python' : 'python3');

function generateCode(
  language: 'javascript' | 'python',
  mode: 'BYTES' | 'WORDS32',
  source = 'source',
  count = 'parts',
  target = 'result',
): string {
  const workspace = new Blockly.Workspace();
  try {
    const block = workspace.newBlock('arr_partition_to_array');
    block.setFieldValue(mode, 'MODE');
    for (const [name, expression] of Object.entries({ SRC: source, COUNT: count, TARGET: target })) {
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

function runJavaScript(code: string, source: unknown, parts: unknown): unknown[] {
  const result = new Function('source', 'parts', `${code}\nreturn result;`)(source, parts) as unknown[];
  return result.map((part) => part instanceof Uint8Array ? Array.from(part) : part);
}

function runPython(code: string, setup: string, result = '[list(value) if isinstance(value, (bytes, bytearray)) else value for value in result]'): unknown[] {
  const output = execFileSync(pythonCommand, ['-c', [
    'import json',
    setup,
    code,
    `print(json.dumps(${result}))`,
  ].join('\n')], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  return JSON.parse(output) as unknown[];
}

describe('array partition block contract', () => {
  it('defaults to byte slices and exposes an explicit mode selector', () => {
    const workspace = new Blockly.Workspace();
    try {
      const block = workspace.newBlock('arr_partition_to_array');
      const mode = block.getField('MODE');
      expect(block.getFieldValue('MODE')).toBe('BYTES');
      expect(mode).toBeInstanceOf(Blockly.FieldDropdown);
      expect((mode as Blockly.FieldDropdown).getOptions(false).map(([, value]) => value))
        .toEqual(['BYTES', 'WORDS32']);
    } finally {
      workspace.dispose();
    }
  });

  it.each(['BYTES', 'WORDS32'] as const)('preserves selected mode %s across Blockly save/load', (mode) => {
    const source = new Blockly.Workspace();
    const jsonTarget = new Blockly.Workspace();
    const xmlTarget = new Blockly.Workspace();
    try {
      source.newBlock('arr_partition_to_array').setFieldValue(mode, 'MODE');

      const state = migrateJsonState(Blockly.serialization.workspaces.save(source));
      Blockly.serialization.workspaces.load(state, jsonTarget);
      expect(jsonTarget.getBlocksByType('arr_partition_to_array')[0].getFieldValue('MODE')).toBe(mode);

      const xml = migrateXmlText(Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(source)));
      Blockly.Xml.domToWorkspace(Blockly.utils.xml.textToDom(xml), xmlTarget);
      expect(xmlTarget.getBlocksByType('arr_partition_to_array')[0].getFieldValue('MODE')).toBe(mode);
    } finally {
      source.dispose();
      jsonTarget.dispose();
      xmlTarget.dispose();
    }
  });

  it('splits byte sequences into equal non-empty slices in both languages', () => {
    const javascript = generateCode('javascript', 'BYTES');
    const python = generateCode('python', 'BYTES');
    expect(runJavaScript(javascript, Uint8Array.from([1, 2, 3, 4]), 2)).toEqual([[1, 2], [3, 4]]);
    expect(runPython(python, 'source = bytes([1, 2, 3, 4])\nparts = 2')).toEqual([[1, 2], [3, 4]]);
  });

  it('splits byte lists and minimally encoded integer bytes consistently', () => {
    const javascript = generateCode('javascript', 'BYTES');
    const python = generateCode('python', 'BYTES');
    expect(runJavaScript(javascript, [1, 2, 3, 4], 2)).toEqual([[1, 2], [3, 4]]);
    expect(runPython(python, 'source = [1, 2, 3, 4]\nparts = 2')).toEqual([[1, 2], [3, 4]]);
    expect(runJavaScript(javascript, 258, 2)).toEqual([[1], [2]]);
    expect(runPython(python, 'source = 258\nparts = 2')).toEqual([[1], [2]]);
  });

  it('accepts integral numeric byte-list entries consistently', () => {
    const javascript = generateCode('javascript', 'BYTES');
    const python = generateCode('python', 'BYTES');
    expect(runJavaScript(javascript, [1.0, 2.0, 3.0, 4.0], 2)).toEqual([[1, 2], [3, 4]]);
    expect(runPython(python, 'source = [1.0, 2.0, 3.0, 4.0]\nparts = 2')).toEqual([[1, 2], [3, 4]]);
  });

  it('splits exactly four big-endian bytes per unsigned 32-bit word', () => {
    const javascript = generateCode('javascript', 'WORDS32');
    const python = generateCode('python', 'WORDS32');
    const bytes = [1, 2, 3, 4, 0xfe, 0xdc, 0xba, 0x98];
    const expected = [0x01020304, 0xfedcba98];
    expect(runJavaScript(javascript, Uint8Array.from(bytes), 2)).toEqual(expected);
    expect(runPython(python, `source = bytes(${JSON.stringify(bytes)})\nparts = 2`)).toEqual(expected);
    expect(runJavaScript(javascript, 0x01020304, 1)).toEqual([0x01020304]);
    expect(runPython(python, 'source = 0x01020304\nparts = 1')).toEqual([0x01020304]);
    expect(runJavaScript(javascript, 0, 1)).toEqual([0]);
    expect(runPython(python, 'source = 0\nparts = 1')).toEqual([0]);
  });

  it.each([
    ['BYTES', [1, 2, 3], 2],
    ['BYTES', [1, 256], 1],
    ['BYTES', [1, 2], 3],
    ['BYTES', -1, 1],
    ['WORDS32', [1, 2, 3, 4], 2],
    ['WORDS32', [1, 2, 3, 4, 5], 1],
    ['WORDS32', 0x1_0000_0000, 1],
  ] as const)('rejects invalid %s partition input consistently', (mode, source, parts) => {
    const javascript = generateCode('javascript', mode);
    const python = generateCode('python', mode);
    expect(() => runJavaScript(javascript, source, parts)).toThrow();
    expect(() => runPython(python, `source = ${JSON.stringify(source)}\nparts = ${parts}`)).toThrow();
  });

  it('rejects sparse JavaScript byte arrays instead of silently filling holes with zero', () => {
    const javascript = generateCode('javascript', 'BYTES');
    expect(() => runJavaScript(javascript, new Array(2), 1)).toThrow('source array must contain bytes');
  });

  it.each(['[2]', '"2"'])('rejects non-numeric count values consistently: %s', (count) => {
    const javascript = generateCode('javascript', 'BYTES', '[1, 2]', count);
    const python = generateCode('python', 'BYTES', '[1, 2]', count);
    expect(() => runJavaScript(javascript, [1, 2], 1)).toThrow('partition count must be a numeric value');
    expect(() => runPython(python, 'source = [1, 2]\nparts = 1')).toThrow();
  });

  it('rejects expressions and reserved words as output targets', () => {
    for (const target of ['make_value()', 'for']) {
      expect(() => generateCode('javascript', 'BYTES', 'source', 'parts', target))
        .toThrow('must be a variable name');
      expect(() => generateCode('python', 'BYTES', 'source', 'parts', target))
        .toThrow('must be a variable name');
    }
  });

  it('evaluates source and count expressions once in both languages', () => {
    const javascript = generateCode('javascript', 'BYTES', 'next_source()', 'next_parts()');
    let jsSourceCalls = 0;
    let jsCountCalls = 0;
    const jsResult = new Function('next_source', 'next_parts', `${javascript}\nreturn result;`)(
      () => { jsSourceCalls += 1; return Uint8Array.of(jsSourceCalls, 2); },
      () => { jsCountCalls += 1; return 2; },
    ) as Uint8Array[];
    expect(jsResult.map((part) => Array.from(part))).toEqual([[1], [2]]);
    expect(jsSourceCalls).toBe(1);
    expect(jsCountCalls).toBe(1);

    const python = generateCode('python', 'BYTES', 'next_source()', 'next_parts()');
    expect(runPython(python, [
      'source_calls = 0',
      'count_calls = 0',
      'def next_source():',
      '    global source_calls',
      '    source_calls += 1',
      '    return bytes([source_calls, 2])',
      'def next_parts():',
      '    global count_calls',
      '    count_calls += 1',
      '    return 2',
    ].join('\n'), '[source_calls, count_calls, [list(value) for value in result]]')).toEqual([1, 1, [[1], [2]]]);
  });
});
