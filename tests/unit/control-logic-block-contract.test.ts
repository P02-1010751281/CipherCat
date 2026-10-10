// @vitest-environment jsdom
import * as Blockly from 'blockly/core';
import 'blockly/blocks';
import { execFileSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';

import '@/blocks/ctrl/iterate';
import '@/blocks/data/number';
import '@/blocks/logic/compound';
import '@/blocks/logic/not';
import '@/blocks/logic/operation';
import '@/generators/javascript';
import '@/generators/javascript/ctrl/iterate';
import '@/generators/javascript/logic/operation';
import '@/generators/python';
import '@/generators/python/ctrl/iterate';
import '@/generators/python/logic/operation';
import { javascriptGenerator } from 'blockly/javascript';
import { pythonGenerator } from 'blockly/python';

const pythonCommand = process.env.CIPHER_CAT_PYTHON ||
  (process.platform === 'win32' ? 'python' : 'python3');

Blockly.Blocks['test_loop_collect'] = {
  init() {
    this.appendDummyInput().appendField('collect loop index');
    this.setPreviousStatement(true);
  },
};
javascriptGenerator.forBlock['test_loop_collect'] = () => 'observed.push(i);\n';
pythonGenerator.forBlock['test_loop_collect'] = () => 'observed.append(i)\n';

function generateLoop(language: 'javascript' | 'python', times: number): string {
  const workspace = new Blockly.Workspace();
  try {
    const loop = workspace.newBlock('ctrl_iterate');
    loop.setFieldValue('i', 'VAR');
    loop.setFieldValue(String(times), 'TIMES');

    const collect = workspace.newBlock('test_loop_collect');
    loop.getInput('DO')!.connection!.connect(collect.previousConnection!);

    const generator = language === 'javascript' ? javascriptGenerator : pythonGenerator;
    return generator.workspaceToCode(workspace);
  } finally {
    workspace.dispose();
  }
}

function generateOperation(
  language: 'javascript' | 'python',
  type: 'lgc_operation' | 'lgc_compound' | 'lgc_not',
  operation: string,
  a: string,
  b = '0',
): string {
  const workspace = new Blockly.Workspace();
  try {
    const block = workspace.newBlock(type);
    if (type !== 'lgc_not') block.setFieldValue(operation, 'instr');
    for (const [name, expression] of Object.entries({ A: a, B: b, C: 'result', VALUE1: a, VALUE2: 'result' })) {
      if (!block.getInput(name)) continue;
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

function runJavaScript(program: string, resultName = 'result'): number {
  return new Function(`${program}\nreturn ${resultName};`)() as number;
}

function runPython(program: string): number {
  return Number(execFileSync(pythonCommand, ['-c', `${program}\nprint(result)`], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim());
}

function runJavaScriptLoop(program: string): number[] {
  const observed: number[] = [];
  new Function('observed', program)(observed);
  return observed;
}

function runPythonLoop(program: string): number[] {
  const output = execFileSync(pythonCommand, ['-c', [
    'import json',
    'observed = []',
    program,
    'print(json.dumps(observed))',
  ].join('\n')], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
  return JSON.parse(output) as number[];
}

describe('control-flow and 32-bit logic Blockly contracts', () => {
  it.each([1, 5])('executes exactly %i iterations in both languages', (times) => {
    const expected = Array.from({ length: times }, (_, index) => index);
    expect(runJavaScriptLoop(generateLoop('javascript', times))).toEqual(expected);
    expect(runPythonLoop(generateLoop('python', times))).toEqual(expected);
  });

  it.each([
    ['XOR', '0xa5a55a5a', '0x0f0ff0f0', 0xaaaa_aaaa],
    ['OR', '0xa5a55a5a', '0x0f0ff0f0', 0xafaf_fafa],
    ['AND', '0xa5a55a5a', '0x0f0ff0f0', 0x0505_5050],
  ])('matches unsigned 32-bit %s in both languages', (operation, a, b, expected) => {
    expect(runJavaScript(generateOperation('javascript', 'lgc_operation', operation, a, b))).toBe(expected);
    expect(runPython(generateOperation('python', 'lgc_operation', operation, a, b))).toBe(expected);
  });

  it.each([
    ['XOR_XOR', 0xa5a5_5a5a],
    ['OR_XOR', 0xa0a0_0a0a],
    ['AND_XOR', 0x0a0a_a0a0],
    ['XOR_OR', 0xafaf_fafa],
    ['OR_OR', 0xafaf_fafa],
    ['AND_OR', 0x0f0f_f0f0],
    ['XOR_AND', 0x0a0a_a0a0],
    ['OR_AND', 0x0f0f_f0f0],
    ['AND_AND', 0x0505_5050],
  ])('matches compound logic %s in both languages', (operation, expected) => {
    const a = '0xa5a55a5a';
    const b = '0x0f0ff0f0';
    expect(runJavaScript(generateOperation('javascript', 'lgc_compound', operation, a, b))).toBe(expected);
    expect(runPython(generateOperation('python', 'lgc_compound', operation, a, b))).toBe(expected);
  });

  it('complements values within the unsigned 32-bit domain in both languages', () => {
    for (const [input, expected] of [['0x80000000', 0x7fff_ffff], ['0', 0xffff_ffff]] as const) {
      expect(runJavaScript(generateOperation('javascript', 'lgc_not', '', input))).toBe(expected);
      expect(runPython(generateOperation('python', 'lgc_not', '', input))).toBe(expected);
    }
  });
});
