// @vitest-environment jsdom
import * as Blockly from 'blockly/core';
import 'blockly/blocks';
import { execFileSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';

import '@/blocks/data/number';
import '@/blocks/hash/hashbased';
import '@/blocks/post-quantum/basic/operations';
import '@/generators/javascript';
import '@/generators/javascript/hash/hashbased';
import '@/generators/javascript/postquantum/basic/operations';
import '@/generators/python';
import '@/generators/python/hash/hashbased';
import '@/generators/python/postquantum/basic/operations';

import { javascriptGenerator } from 'blockly/javascript';
import { pythonGenerator } from 'blockly/python';
import { isNativeUint8Array } from './helpers/native-bytes';

const pythonCommand = process.env.CIPHER_CAT_PYTHON ||
  (process.platform === 'win32' ? 'python' : 'python3');

function generate(language: 'javascript' | 'python', type: string, inputs: Record<string, string>) {
  const workspace = new Blockly.Workspace();
  try {
    const block = workspace.newBlock(type);
    for (const [name, expression] of Object.entries(inputs)) {
      const value = workspace.newBlock('data_value');
      value.setFieldValue(expression, 'NUM');
      block.getInput(name)!.connection!.connect(value.outputConnection!);
    }
    return {
      outputType: block.outputConnection?.getCheck(),
      code: language === 'javascript'
        ? javascriptGenerator.workspaceToCode(workspace)
        : pythonGenerator.workspaceToCode(workspace),
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

function expectJavaScriptBytes(value: unknown): asserts value is Uint8Array {
  expect(isNativeUint8Array(value)).toBe(true);
}

function evaluatesToBytes(program: string): boolean {
  const lines = program.trim().split('\n');
  const expression = lines.pop()!;
  return execFileSync(pythonCommand, ['-c', [...lines, `result = ${expression}`, 'print(type(result) is bytes)'].join('\n')], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  }).trim() === 'True';
}

describe('Bytes output contracts for PQ helper blocks', () => {
  it.each([
    ['pq_byte_concat', { A: 'Uint8Array.from([1])', B: 'Uint8Array.from([2])' }, { A: 'bytes([1])', B: 'bytes([2])' }],
    ['pq_bytes_slice', { INPUT: 'Uint8Array.from([1, 2])', START: '0', END: '1' }, { INPUT: 'bytes([1, 2])', START: '0', END: '1' }],
    ['pq_seed_with_nonce', { SEED: 'Uint8Array.from([1])', NONCE: '2' }, { SEED: 'bytes([1])', NONCE: '2' }],
    ['hash_chain', { INPUT: 'Uint8Array.from([1])', ITERATIONS: '1' }, { INPUT: 'bytes([1])', ITERATIONS: '1' }],
    ['merkle_leaf', { MSG: 'Uint8Array.from([1])', ADRS: 'Uint8Array.from([2])' }, { MSG: 'bytes([1])', ADRS: 'bytes([2])' }],
    ['merkle_node', { LEFT: 'Uint8Array.from([1])', RIGHT: 'Uint8Array.from([2])', ADRS: 'Uint8Array.from([3])' }, { LEFT: 'bytes([1])', RIGHT: 'bytes([2])', ADRS: 'bytes([3])' }],
    ['merkle_root', { LEAVES: 'Uint8Array.from([1, 2])', LEAF_LEN: '1', ADRS: 'Uint8Array.from([])' }, { LEAVES: 'bytes([1, 2])', LEAF_LEN: '1', ADRS: 'bytes()' }],
    ['merkle_auth_path', { LEAVES: 'Uint8Array.from([1, 2])', LEAF_LEN: '1', ADRS: 'Uint8Array.from([])', INDEX: '0' }, { LEAVES: 'bytes([1, 2])', LEAF_LEN: '1', ADRS: 'bytes()', INDEX: '0' }],
    ['fors_root', { ROOTS: 'Uint8Array.from([1, 2])', ADRS: 'Uint8Array.from([3])' }, { ROOTS: 'bytes([1, 2])', ADRS: 'bytes([3])' }],
    ['slh_addr', { LAYER: '0', TREE: '0', LEAF: '0' }, { LAYER: '0', TREE: '0', LEAF: '0' }],
  ] as const)('%s declares and returns Uint8Array/bytes', (type, javascriptInputs, pythonInputs) => {
    const javascript = generate('javascript', type, javascriptInputs);
    const python = generate('python', type, pythonInputs);

    expect(javascript.outputType).toContain('Bytes');
    expect(python.outputType).toContain('Bytes');
    expectJavaScriptBytes(evaluateJavaScript(javascript.code));
    expect(evaluatesToBytes(python.code)).toBe(true);
  });
});
