// @vitest-environment jsdom
import * as Blockly from 'blockly/core';
import 'blockly/blocks';
import { execFileSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';

import '@/blocks/data/number';
import '@/blocks/hash/sha256';
import '@/blocks/hash/sha3';
import '@/blocks/hash/shake';
import '@/blocks/hash/sm3';
import '@/blocks/sha512/blocks';
import '@/generators/javascript';
import '@/generators/javascript/hash/sha256';
import '@/generators/javascript/hash/sha3';
import '@/generators/javascript/hash/shake';
import '@/generators/javascript/hash/sm3';
import '@/generators/javascript/sha512/blocks';
import '@/generators/python';
import '@/generators/python/hash/sha256';
import '@/generators/python/hash/sha3';
import '@/generators/python/hash/shake';
import '@/generators/python/hash/sm3';
import '@/generators/python/sha512/blocks';

import { javascriptGenerator } from 'blockly/javascript';
import { pythonGenerator } from 'blockly/python';

const pythonCommand = process.env.CIPHER_CAT_PYTHON ||
  (process.platform === 'win32' ? 'python' : 'python3');

type OutputCase = {
  block: string;
  inputs: Record<string, string>;
  javascriptInputs?: Record<string, string>;
};

const outputCases: OutputCase[] = [
  { block: 'hash_sha256_pad', inputs: { INPUT: '[]' } },
  { block: 'hash_sha256_pad_text', inputs: { INPUT: JSON.stringify('abc') } },
  { block: 'hash_sha256_pad_hex', inputs: { INPUT: "'616263'" } },
  { block: 'hash_sha224_hash', inputs: { MSG: '[97, 98, 99]' } },
  { block: 'hash_sm3_pad', inputs: { INPUT: '[]' } },
  { block: 'hash_sm3_pad_text', inputs: { INPUT: JSON.stringify('abc') } },
  { block: 'hash_sm3_pad_hex', inputs: { INPUT: "'616263'" } },
  { block: 'hash_sha512_pad', inputs: { INPUT: '[97, 98, 99]' } },
  { block: 'hash_sha512_hash', inputs: { MSG: '[97, 98, 99]' } },
  { block: 'hash_sha3_pad_text', inputs: { INPUT: JSON.stringify('abc') } },
  { block: 'hash_sha3_pad_hex', inputs: { INPUT: "'616263'" } },
  { block: 'sponge_pad', inputs: { INPUT: '[97, 98, 99]' } },
  {
    block: 'sponge_squeeze',
    inputs: { STATE: '[0] * 25', OUTLEN: '1' },
    javascriptInputs: { STATE: 'new Array(25).fill(0n)', OUTLEN: '1' },
  },
  { block: 'sha3_hash', inputs: { MSG: '[97, 98, 99]' } },
  { block: 'pq_xof', inputs: { SEED: '[97, 98, 99]', OUTLEN: '1' } },
  { block: 'pq_prf', inputs: { SEED: '[97, 98, 99]', NONCE: '0', OUTLEN: '1' } },
];

function generate(language: 'javascript' | 'python', blockType: string, inputs: Record<string, string>): string {
  const workspace = new Blockly.Workspace();
  try {
    const block = workspace.newBlock(blockType);
    for (const [name, expression] of Object.entries(inputs)) {
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

function evaluatesToUint8Array(program: string): boolean {
  const lines = program.trim().split('\n');
  const expression = lines.pop()!.replace(/;$/, '');
  return execFileSync(process.execPath, ['-e', [...lines, `console.log((value => ArrayBuffer.isView(value) && Object.getOwnPropertyDescriptor(Object.getPrototypeOf(Uint8Array.prototype), Symbol.toStringTag).get.call(value) === 'Uint8Array' && Object.getPrototypeOf(value) === Uint8Array.prototype)(${expression}));`].join('\n')], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim() === 'true';
}

function evaluatesToBytes(program: string): boolean {
  const lines = program.trim().split('\n');
  const expression = lines.pop()!;
  return execFileSync(pythonCommand, ['-c', [...lines, `print(type(${expression}) is bytes)`].join('\n')], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim() === 'True';
}

describe('hash-family TYPE_BYTES outputs', () => {
  it.each(outputCases)('$block returns the declared byte container in JavaScript and Python', ({ block, inputs, javascriptInputs }) => {
    expect(evaluatesToUint8Array(generate('javascript', block, javascriptInputs ?? inputs))).toBe(true);
    expect(evaluatesToBytes(generate('python', block, inputs))).toBe(true);
  });
});
