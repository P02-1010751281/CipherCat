// @vitest-environment jsdom
import * as Blockly from 'blockly/core';
import 'blockly/blocks';
import { execFileSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';

import '@/blocks/data/number';
import '@/blocks/numtheory/field';
import '@/blocks/numtheory/mod-inverse';
import '@/generators/javascript';
import '@/generators/javascript/numtheory/field';
import '@/generators/javascript/numtheory/mod-inverse';
import '@/generators/python';
import '@/generators/python/numtheory/field';
import '@/generators/python/numtheory/mod-inverse';
import { javascriptGenerator, Order } from 'blockly/javascript';
import { pythonGenerator } from 'blockly/python';

const pythonCommand = process.env.CIPHER_CAT_PYTHON ||
  (process.platform === 'win32' ? 'python' : 'python3');

Blockly.Blocks['test_number_result'] = {
  init() {
    this.appendValueInput('VALUE');
    this.setPreviousStatement(true);
  },
};
javascriptGenerator.forBlock['test_number_result'] = (block) =>
  `result = ${javascriptGenerator.valueToCode(block, 'VALUE', Order.ATOMIC)};\n`;
pythonGenerator.forBlock['test_number_result'] = (block) =>
  `result = ${pythonGenerator.valueToCode(block, 'VALUE', Order.ATOMIC)}\n`;

function connectNumber(workspace: Blockly.Workspace, parent: Blockly.Block, input: string, value: string) {
  const number = workspace.newBlock('data_value');
  number.setFieldValue(value, 'NUM');
  parent.getInput(input)!.connection!.connect(number.outputConnection!);
}

function generateFieldOperation(
  language: 'javascript' | 'python',
  operation: string,
  a = '-20',
  b = '5',
  p = '17',
): string {
  const workspace = new Blockly.Workspace();
  try {
    const field = workspace.newBlock('nt_field_add');
    field.setFieldValue(operation, 'OP');
    connectNumber(workspace, field, 'A', a);
    connectNumber(workspace, field, 'B', b);
    connectNumber(workspace, field, 'P', p);

    const result = workspace.newBlock('test_number_result');
    result.getInput('VALUE')!.connection!.connect(field.outputConnection!);
    return (language === 'javascript' ? javascriptGenerator : pythonGenerator).workspaceToCode(workspace);
  } finally {
    workspace.dispose();
  }
}

function generateModInverse(language: 'javascript' | 'python', exponent: string, modulus: string): string {
  const workspace = new Blockly.Workspace();
  try {
    const inverse = workspace.newBlock('nt_mod_inverse');
    connectNumber(workspace, inverse, 'D', 'result');
    connectNumber(workspace, inverse, 'E', exponent);
    connectNumber(workspace, inverse, 'PHI', modulus);
    return (language === 'javascript' ? javascriptGenerator : pythonGenerator).workspaceToCode(workspace);
  } finally {
    workspace.dispose();
  }
}

function runJavaScript(program: string): number | bigint {
  return new Function(`${program}\nreturn result;`)() as number | bigint;
}

function runPython(program: string): number {
  return Number(execFileSync(pythonCommand, ['-c', `${program}\nprint(result)`], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim());
}

function runPythonType(program: string): string {
  return execFileSync(pythonCommand, ['-c', `${program}\nprint(type(result).__name__)`], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
}

describe('number-theory Blockly block contracts', () => {
  it.each([
    ['ADD', 2],
    ['SUB', 9],
    ['MUL', 2],
  ])('normalizes negative residues for %s modulo a positive prime in both languages', (operation, expected) => {
    expect(runJavaScript(generateFieldOperation('javascript', operation))).toBe(expected);
    expect(runPython(generateFieldOperation('python', operation))).toBe(expected);
  });

  it('keeps modular multiplication exact near the safe-integer limit in both languages', () => {
    const args = ['9007199254740991', '9007199254740990', '9007199254740881'] as const;
    expect(runJavaScript(generateFieldOperation('javascript', 'MUL', ...args))).toBe(11990);
    expect(runPython(generateFieldOperation('python', 'MUL', ...args))).toBe(11990);
  });

  it.each(['0', '-17', '17.5'])('rejects invalid field modulus %s in both languages', (modulus) => {
    expect(() => runJavaScript(generateFieldOperation('javascript', 'ADD', '1', '2', modulus))).toThrow();
    expect(() => runPython(generateFieldOperation('python', 'ADD', '1', '2', modulus))).toThrow();
  });

  it.each(['1.5', '9007199254740992'])('rejects non-safe-integer field input %s in both languages', (value) => {
    expect(() => runJavaScript(generateFieldOperation('javascript', 'ADD', value))).toThrow();
    expect(() => runPython(generateFieldOperation('python', 'ADD', value))).toThrow();
  });

  it.each([
    ['3', '11', 4],
    ['3.0', '11.0', 4],
    ['-3', '11', 7],
  ])('computes the modular inverse of %s modulo %s in both languages', (exponent, modulus, expected) => {
    expect(runJavaScript(generateModInverse('javascript', exponent, modulus))).toBe(expected);
    expect(runPython(generateModInverse('python', exponent, modulus))).toBe(expected);
  });

  it('returns a Python integer so the inverse composes with number blocks', () => {
    expect(runPythonType(generateModInverse('python', '3', '11'))).toBe('int');
  });

  it('allows a modular inverse result to feed another Blockly number operation in both languages', () => {
    const javascript = generateModInverse('javascript', '3', '11') +
      generateFieldOperation('javascript', 'ADD', 'result', '1', '17');
    const python = generateModInverse('python', '3', '11') +
      generateFieldOperation('python', 'ADD', 'result', '1', '17');
    expect(runJavaScript(javascript)).toBe(5);
    expect(runPython(python)).toBe(5);
  });

  it('rejects inputs that do not have a modular inverse in both languages', () => {
    expect(() => runJavaScript(generateModInverse('javascript', '6', '9'))).toThrow(/inverse/);
    expect(() => runPython(generateModInverse('python', '6', '9'))).toThrow(/inverse/);
  });

  it.each(['0', '-11'])('rejects non-positive moduli (%s) in both languages', (modulus) => {
    expect(() => runJavaScript(generateModInverse('javascript', '3', modulus))).toThrow(/modulus must be positive/);
    expect(() => runPython(generateModInverse('python', '3', modulus))).toThrow(/modulus must be positive/);
  });

  it.each([
    { label: 'fractional exponent', javascript: '3.5', python: '3.5', modulus: '11' },
    { label: 'boolean exponent', javascript: 'true', python: 'True', modulus: '11' },
    { label: 'unsafe modulus', javascript: '3', python: '3', modulus: '9007199254740992' },
  ])('rejects a $label in both languages', ({ javascript, python, modulus }) => {
    expect(() => runJavaScript(generateModInverse('javascript', javascript, modulus))).toThrow();
    expect(() => runPython(generateModInverse('python', python, modulus))).toThrow();
  });
});
