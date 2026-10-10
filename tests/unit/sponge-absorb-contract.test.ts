// @vitest-environment jsdom
import * as Blockly from 'blockly/core';
import 'blockly/blocks';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
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

function generate(language: 'javascript' | 'python', inputLength: number): string {
  const workspace = new Blockly.Workspace();
  try {
    const absorb = workspace.newBlock('sponge_absorb');
    const state = workspace.newBlock('data_value');
    const zero = language === 'javascript' ? '0n' : '0';
    state.setFieldValue(`[${Array(25).fill(zero).join(', ')}]`, 'NUM');
    absorb.getInput('STATE')!.connection!.connect(state.outputConnection!);

    const block = workspace.newBlock('data_value');
    block.setFieldValue(`[${Array(inputLength).fill('0').join(', ')}]`, 'NUM');
    absorb.getInput('BLOCK')!.connection!.connect(block.outputConnection!);

    const generator = language === 'javascript' ? javascriptGenerator : pythonGenerator;
    return generator.workspaceToCode(workspace);
  } finally {
    workspace.dispose();
  }
}

function evaluateJavaScript(program: string): number[] {
  const lines = program.trim().split('\n');
  const expression = lines.pop()!.replace(/;$/, '');
  return Array.from(new Function([...lines, `return ${expression};`].join('\n'))() as Uint8Array);
}

function evaluatePython(program: string): number[] {
  const lines = program.trim().split('\n');
  const expression = lines.pop()!;
  const output = execFileSync(pythonCommand, ['-c', [
    ...lines,
    `print(__import__("json").dumps(list(${expression})))`,
  ].join('\n')], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  return JSON.parse(output.trim()) as number[];
}

function generatePaddedDigest(language: 'javascript' | 'python', messageLength: number): string {
  const workspace = new Blockly.Workspace();
  try {
    const pad = workspace.newBlock('sponge_pad');
    pad.setFieldValue('1088', 'RATE');
    pad.setFieldValue('0x06', 'SUFFIX');
    const message = workspace.newBlock('data_value');
    message.setFieldValue(`[${Array(messageLength).fill('0').join(', ')}]`, 'NUM');
    pad.getInput('INPUT')!.connection!.connect(message.outputConnection!);

    const absorb = workspace.newBlock('sponge_absorb');
    absorb.setFieldValue('1088', 'RATE');
    const state = workspace.newBlock('data_value');
    const zero = language === 'javascript' ? '0n' : '0';
    state.setFieldValue(`[${Array(25).fill(zero).join(', ')}]`, 'NUM');
    absorb.getInput('STATE')!.connection!.connect(state.outputConnection!);
    absorb.getInput('BLOCK')!.connection!.connect(pad.outputConnection!);

    const squeeze = workspace.newBlock('sponge_squeeze');
    squeeze.setFieldValue('1088', 'RATE');
    squeeze.getInput('STATE')!.connection!.connect(absorb.outputConnection!);
    const outLen = workspace.newBlock('data_value');
    outLen.setFieldValue('32', 'NUM');
    squeeze.getInput('OUTLEN')!.connection!.connect(outLen.outputConnection!);

    const generator = language === 'javascript' ? javascriptGenerator : pythonGenerator;
    return generator.workspaceToCode(workspace);
  } finally {
    workspace.dispose();
  }
}

describe('sponge_absorb block contract', () => {
  it('rejects a partial rate block in both generated languages', () => {
    expect(() => evaluateJavaScript(generate('javascript', 135))).toThrow();
    expect(() => evaluatePython(generate('python', 135))).toThrow();
  });

  it.each([135, 136, 271])('absorbs padded %i-byte messages to the native SHA3-256 digest in both languages', (length) => {
    const expected = createHash('sha3-256').update(Buffer.alloc(length)).digest('hex');
    const toHex = (bytes: number[]) => bytes.map((byte) => byte.toString(16).padStart(2, '0')).join('');
    expect(toHex(evaluateJavaScript(generatePaddedDigest('javascript', length)))).toBe(expected);
    expect(toHex(evaluatePython(generatePaddedDigest('python', length)))).toBe(expected);
  });
});
