// @vitest-environment jsdom
import * as Blockly from 'blockly/core';
import 'blockly/blocks';
import { execFileSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';

import '@/blocks/array/slice';
import '@/blocks/data/number';
import '@/generators/javascript';
import '@/generators/python';
import { TYPE_INT_LIST } from '@/constants/block-types';
import { javascriptGenerator } from 'blockly/javascript';
import { Order as JavaScriptOrder } from 'blockly/javascript';
import { pythonGenerator } from 'blockly/python';
import { Order as PythonOrder } from 'blockly/python';

Blockly.Blocks['test_array_slice_source'] = {
  init: function () {
    this.appendDummyInput().appendField(new Blockly.FieldTextInput('source'), 'EXPRESSION');
    this.setOutput(true, TYPE_INT_LIST);
  },
};
javascriptGenerator.forBlock['test_array_slice_source'] = (block) =>
  [block.getFieldValue('EXPRESSION') || 'source', JavaScriptOrder.ATOMIC];
pythonGenerator.forBlock['test_array_slice_source'] = (block) =>
  [block.getFieldValue('EXPRESSION') || 'source', PythonOrder.ATOMIC];
Blockly.Blocks['test_array_slice_sink'] = {
  init: function () {
    this.appendValueInput('VALUE');
    this.setPreviousStatement(true);
    this.setNextStatement(true);
  },
};
javascriptGenerator.forBlock['test_array_slice_sink'] = (block) =>
  `output = ${javascriptGenerator.valueToCode(block, 'VALUE', JavaScriptOrder.NONE) || 'undefined'};\n`;
pythonGenerator.forBlock['test_array_slice_sink'] = (block) =>
  `result = ${pythonGenerator.valueToCode(block, 'VALUE', PythonOrder.NONE) || 'None'}\n`;

const pythonCommand = process.env.CIPHER_CAT_PYTHON ||
  (process.platform === 'win32' ? 'python' : 'python3');

function generateCode(
  language: 'javascript' | 'python',
  start: string,
  length: string,
  sourceExpression = 'source',
): string {
  const workspace = new Blockly.Workspace();
  try {
    const list = workspace.newBlock('test_array_slice_source');
    list.setFieldValue(sourceExpression, 'EXPRESSION');
    const slice = workspace.newBlock('arr_slice');
    const sink = workspace.newBlock('test_array_slice_sink');
    const generator = language === 'javascript' ? javascriptGenerator : pythonGenerator;

    for (const [input, value] of [['START', start], ['LENGTH', length]]) {
      const number = workspace.newBlock('data_value');
      number.setFieldValue(value, 'NUM');
      slice.getInput(input)!.connection!.connect(number.outputConnection!);
    }
    slice.getInput('LIST')!.connection!.connect(list.outputConnection!);
    sink.getInput('VALUE')!.connection!.connect(slice.outputConnection!);
    return generator.workspaceToCode(workspace);
  } finally {
    workspace.dispose();
  }
}

function runJavaScript(code: string, source: number[], nextSource = () => source): unknown {
  return new Function('source', 'nextSource', `let output;\n${code}\nreturn output;`)(source, nextSource) as unknown;
}

function runPython(code: string, source: number[], setup = '', outputExpression = 'result'): unknown {
  const output = execFileSync(pythonCommand, ['-c', [
    'import json',
    `source = ${JSON.stringify(source)}`,
    setup,
    code,
    `print(json.dumps(${outputExpression}))`,
  ].filter(Boolean).join('\n')], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  return JSON.parse(output) as unknown;
}

describe('array slice block contract', () => {
  it('slices from the start index and truncates at the list end in both languages', () => {
    const js = generateCode('javascript', '2', '8');
    const py = generateCode('python', '2', '8');
    expect(runJavaScript(js, [0, 1, 2, 3, 4])).toEqual([2, 3, 4]);
    expect(runPython(py, [0, 1, 2, 3, 4])).toEqual([2, 3, 4]);
  });

  it('accepts integer-valued numeric indices consistently', () => {
    const js = generateCode('javascript', '1.0', '2.0');
    const py = generateCode('python', '1.0', '2.0');
    expect(runJavaScript(js, [0, 1, 2, 3])).toEqual([1, 2]);
    expect(runPython(py, [0, 1, 2, 3])).toEqual([1, 2]);
  });

  it('uses end-relative negative starts and preserves length as an element count', () => {
    const js = generateCode('javascript', '-3', '5');
    const py = generateCode('python', '-3', '5');
    expect(runJavaScript(js, [0, 1, 2, 3])).toEqual([1, 2, 3]);
    expect(runPython(py, [0, 1, 2, 3])).toEqual([1, 2, 3]);

    const jsBeforeStart = generateCode('javascript', '-100', '2');
    const pyBeforeStart = generateCode('python', '-100', '2');
    expect(runJavaScript(jsBeforeStart, [0, 1, 2, 3])).toEqual([0, 1]);
    expect(runPython(pyBeforeStart, [0, 1, 2, 3])).toEqual([0, 1]);
  });

  it('evaluates the list, start, and length expressions once in both languages', () => {
    const jsCalls = { source: 0, start: 0, length: 0 };
    const js = generateCode('javascript', 'nextStart()', 'nextLength()', 'nextSource()');
    const jsResult = new Function('nextSource', 'nextStart', 'nextLength', `let output;\n${js}\nreturn output;`)(
      () => { jsCalls.source += 1; return [0, 1, 2, 3]; },
      () => { jsCalls.start += 1; return 1; },
      () => { jsCalls.length += 1; return 2; },
    );
    expect(jsResult).toEqual([1, 2]);
    expect(jsCalls).toEqual({ source: 1, start: 1, length: 1 });

    const py = generateCode('python', 'next_start()', 'next_length()', 'next_source()');
    const setup = [
      "calls = {'source': 0, 'start': 0, 'length': 0}",
      'def next_source():',
      "    calls['source'] += 1",
      '    return source',
      'def next_start():',
      "    calls['start'] += 1",
      '    return 1',
      'def next_length():',
      "    calls['length'] += 1",
      '    return 2',
    ].join('\n');
    expect(runPython(py, [0, 1, 2, 3], setup, '[result, calls]'))
      .toEqual([[1, 2], { source: 1, start: 1, length: 1 }]);
  });

  it.each([
    ['fractional start', '1.5', '2', 'slice start must be a safe integer'],
    ['fractional length', '1', '2.5', 'slice length must be a non-negative safe integer'],
    ['negative length', '1', '-1', 'slice length must be a non-negative safe integer'],
    ['unsafe start', '9007199254740992', '1', 'slice start must be a safe integer'],
    ['unsafe length', '1', '9007199254740992', 'slice length must be a non-negative safe integer'],
  ])('rejects %s in both languages', (_case, start, length, message) => {
    const js = generateCode('javascript', start, length);
    const py = generateCode('python', start, length);
    expect(() => runJavaScript(js, [0, 1, 2, 3])).toThrow(message);
    expect(() => runPython(py, [0, 1, 2, 3])).toThrow(message);
  });
});
