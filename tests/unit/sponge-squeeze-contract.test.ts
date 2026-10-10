// @vitest-environment jsdom
import * as Blockly from 'blockly/core';
import 'blockly/blocks';
import { execFileSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';

import '@/blocks/data/number';
import '@/blocks/hash/sha3';
import '@/generators/javascript';
import '@/generators/javascript/hash/sha3';
import '@/generators/python';
import '@/generators/python/hash/sha3';

import { javascriptGenerator } from 'blockly/javascript';
import { pythonGenerator } from 'blockly/python';

const pythonCommand = process.env.CIPHER_CAT_PYTHON ||
  (process.platform === 'win32' ? 'python' : 'python3');

function generate(
  language: 'javascript' | 'python',
  outLen: string,
  stateValue?: string,
): string {
  const workspace = new Blockly.Workspace();
  try {
    const squeeze = workspace.newBlock('sponge_squeeze');
    const state = workspace.newBlock('data_value');
    state.setFieldValue(stateValue ?? (language === 'javascript' ? 'new Array(25).fill(0n)' : '[0] * 25'), 'NUM');
    squeeze.getInput('STATE')!.connection!.connect(state.outputConnection!);

    const length = workspace.newBlock('data_value');
    length.setFieldValue(outLen, 'NUM');
    squeeze.getInput('OUTLEN')!.connection!.connect(length.outputConnection!);

    const generator = language === 'javascript' ? javascriptGenerator : pythonGenerator;
    return generator.workspaceToCode(workspace);
  } finally {
    workspace.dispose();
  }
}

function evaluateJavaScript(program: string): unknown {
  const lines = program.trim().split('\n');
  const expression = lines.pop()!.replace(/;$/, '');
  return new Function([...lines, `return ${expression};`].join('\n'))();
}

function evaluatePython(program: string): string {
  const lines = program.trim().split('\n');
  const expression = lines.pop()!;
  return execFileSync(pythonCommand, ['-c', [
    ...lines,
    `print(len(${expression}))`,
  ].join('\n')], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
}

function evaluatePythonBytes(program: string): number[] {
  const lines = program.trim().split('\n');
  const expression = lines.pop()!;
  const output = execFileSync(pythonCommand, ['-c', [
    ...lines,
    `print(__import__("json").dumps(list(${expression})))`,
  ].join('\n')], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  return JSON.parse(output.trim()) as number[];
}

describe('sponge_squeeze block contract', () => {
  it('reads output bytes least-significant byte first from each lane in both languages', () => {
    expect(Array.from(evaluateJavaScript(generate('javascript', '8', '[0x0102030405060708n, ...new Array(24).fill(0n)]')) as Uint8Array))
      .toEqual([8, 7, 6, 5, 4, 3, 2, 1]);
    expect(evaluatePythonBytes(generate('python', '8', '[0x0102030405060708] + [0] * 24')))
      .toEqual([8, 7, 6, 5, 4, 3, 2, 1]);
  });

  it('accepts an integer-valued floating-point length consistently in both languages', () => {
    expect(Array.from(evaluateJavaScript(generate('javascript', '1.0', '[0x0102030405060708n, ...new Array(24).fill(0n)]')) as Uint8Array))
      .toEqual([8]);
    expect(evaluatePythonBytes(generate('python', '1.0', '[0x0102030405060708] + [0] * 24')))
      .toEqual([8]);
  });

  it.each(['-1', '1.5'])('rejects invalid output length %s in both languages', (outLen) => {
    expect(() => evaluateJavaScript(generate('javascript', outLen))).toThrow();
    expect(() => evaluatePython(generate('python', outLen))).toThrow();
  });
});
