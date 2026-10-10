// @vitest-environment jsdom
import * as Blockly from 'blockly/core';
import 'blockly/blocks';
import { createHash } from 'node:crypto';
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

const vectors = [
  { size: 224, rateBytes: 144, input: 'abc', hex: 'e642824c3f8cf24ad09234ee7d3c766fc9a3a5168d0c94ad73b46fdf' },
  { size: 224, rateBytes: 144, input: 'rate-minus-one', hex: '64d0e8a1be3cf30ef6727b30a6e428f7f068d44634c943d277ad8e7f' },
  { size: 256, rateBytes: 136, input: 'abc', hex: '3a985da74fe225b2045c172d6bd390bd855f086e3e9d525b46bfe24511431532' },
  { size: 256, rateBytes: 136, input: 'rate-minus-one', hex: 'fded8fd9d6551c601eeb3b7c6bc5e5cfd8aad1d015b7e9aaa9c9b9475231d5e2' },
  { size: 384, rateBytes: 104, input: 'abc', hex: 'ec01498288516fc926459f58e2c6ad8df9b473cb0fc08c2596da7cf0e49be4b298d88cea927ac7f539f1edf228376d25' },
  { size: 384, rateBytes: 104, input: 'rate-minus-one', hex: '1f91ee551ad18f268876d1fc262f137fe196580216c5193819a95ec5222537d2a658dd129c3d8080e65ec7460f1f4704' },
  { size: 512, rateBytes: 72, input: 'abc', hex: 'b751850b1a57168a5693cd924b6b096e08f621827444f70d884f5d0240d2712e10e116e9192af3c91a7ec57647e3934057340b4cf408d5a56592f8274eec53f0' },
  { size: 512, rateBytes: 72, input: 'rate-minus-one', hex: '3ccc850d53a1287af7b4560b2ef0d43eb5d9a80d62a0e9cf1dbc040135921104d4395168e90bfc871773ebb34bca1bd67056e1cc7dc7a48ff7c3167d389f117c' },
] as const;

function messageExpression(language: 'javascript' | 'python', vector: typeof vectors[number]): string {
  if (vector.input === 'abc') return language === 'javascript' ? '[97, 98, 99]' : "b'abc'";
  return language === 'javascript'
    ? `Array.from({ length: ${vector.rateBytes - 1} }, (_, i) => i)`
    : `bytes(range(${vector.rateBytes - 1}))`;
}

function generate(language: 'javascript' | 'python', vector: typeof vectors[number]): string {
  const workspace = new Blockly.Workspace();
  try {
    const hash = workspace.newBlock('sha3_hash');
    hash.setFieldValue(String(vector.size), 'SIZE');
    const message = workspace.newBlock('data_value');
    message.setFieldValue(messageExpression(language, vector), 'NUM');
    hash.getInput('MSG')!.connection!.connect(message.outputConnection!);
    const generator = language === 'javascript' ? javascriptGenerator : pythonGenerator;
    return generator.workspaceToCode(workspace);
  } finally {
    workspace.dispose();
  }
}

function evaluateJavaScript(program: string): string {
  const lines = program.trim().split('\n');
  const expression = lines.pop()!.replace(/;$/, '');
  return new Function([...lines, `return Array.from(${expression}, (byte) => byte.toString(16).padStart(2, '0')).join('');`].join('\n'))() as string;
}

function evaluatePython(program: string): string {
  const lines = program.trim().split('\n');
  const expression = lines.pop()!;
  return execFileSync(pythonCommand, ['-c', [
    ...lines,
    `print(bytes(${expression}).hex())`,
  ].join('\n')], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
}

describe('SHA-3 hash Blockly block', () => {
  it.each(vectors)('matches the SHA3-$size $input reference output in both generated languages', (vector) => {
    const input = vector.input === 'abc'
      ? Buffer.from('abc')
      : Buffer.from(Array.from({ length: vector.rateBytes - 1 }, (_, i) => i));
    expect(createHash(`sha3-${vector.size}`).update(input).digest('hex')).toBe(vector.hex);
    expect(evaluateJavaScript(generate('javascript', vector))).toBe(vector.hex);
    expect(evaluatePython(generate('python', vector))).toBe(vector.hex);
  });
});
