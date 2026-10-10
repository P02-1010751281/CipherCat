// @vitest-environment jsdom
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import * as Blockly from 'blockly/core';
import { setLocale } from 'blockly/core';
import * as enMessages from 'blockly/msg/en';
import { describe, expect, it } from 'vitest';

import '@/blocks/data';
import '@/blocks/procedure/blocks';
import '@/blocks/sm9';
import '@/generators/javascript';
import '@/generators/python';
import { javascriptGenerator } from 'blockly/javascript';
import { pythonGenerator } from 'blockly/python';
import { isNativeUint8Array } from './helpers/native-bytes';

setLocale(enMessages as unknown as Record<string, string>);

const pythonCommand = process.env.CIPHER_CAT_PYTHON ||
  (process.platform === 'win32' ? 'python' : 'python3');
const SM9_N = BigInt('0xb640000002a3a6f1d603ab4ff58ec74449f2934b18ea8beee56ee19cd69ecf25');

function scalarBytes(value: bigint): number[] {
  return Array.from(Buffer.from(value.toString(16).padStart(64, '0'), 'hex'));
}

function generateKeyProgram(
  language: 'javascript' | 'python',
  kind: 'master' | 'user',
  scalar: bigint | number[],
  identity?: number[],
): string {
  const demo = JSON.parse(readFileSync(resolve(process.cwd(), 'demos/procedures/SM9-Sign.json'), 'utf8'));
  const procedure = demo.blocks.blocks[0];
  const signing = procedure.inputs.RETURN.block;
  const key = kind === 'master' ? signing.inputs.PPUB.block : signing.inputs.DS.block;
  key.inputs.KS.block.fields.NUM = JSON.stringify(typeof scalar === 'bigint' ? scalarBytes(scalar) : scalar);
  if (identity && kind === 'user') key.inputs.ID.block.fields.NUM = JSON.stringify(identity);
  procedure.inputs.RETURN.block = key;

  const workspace = new Blockly.Workspace();
  try {
    Blockly.serialization.workspaces.load(demo, workspace);
    return language === 'javascript'
      ? javascriptGenerator.workspaceToCode(workspace)
      : pythonGenerator.workspaceToCode(workspace);
  } finally {
    workspace.dispose();
  }
}

function callKeyProgram(language: 'javascript' | 'python', program: string): unknown {
  if (language === 'javascript') {
    return new Function(`${program}\nreturn SM9_Sign();`)();
  }
  return execFileSync(pythonCommand, ['-c', [
    program,
    'result = SM9_Sign()',
    'print(type(result) is bytes, len(result))',
  ].join('\n')], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
}

describe('SM9 master-key scalar contract', () => {
  it.each([
    ['zero', 0n],
    ['group order', SM9_N],
    ['group order plus one', SM9_N + 1n],
  ])('rejects %s in both generated languages and key blocks', (label, scalar) => {
    for (const kind of ['master', 'user'] as const) {
      for (const language of ['javascript', 'python'] as const) {
        const program = generateKeyProgram(language, kind, scalar);
        const run = () => callKeyProgram(language, program);
        if (language === 'javascript') {
          expect(run, `${kind} ${label} JavaScript`).toThrow('SM9 master key must satisfy 1 <= ks < n');
        } else {
          expect(run, `${kind} ${label} Python`).toThrow(/SM9 master key must satisfy 1 <= ks < n/);
        }
      }
    }
  });

  it.each([
    ['master', 128],
    ['user', 64],
  ] as const)('accepts n−1 for the %s-key block in JavaScript and Python', (kind, outputBytes) => {
    for (const language of ['javascript', 'python'] as const) {
      const result = callKeyProgram(language, generateKeyProgram(language, kind, SM9_N - 1n));
      if (language === 'javascript') {
        expect(isNativeUint8Array(result)).toBe(true);
        expect(result).toHaveLength(outputBytes);
      } else {
        expect(result).toBe(`True ${outputBytes}`);
      }
    }
  });

  it('rejects a scalar input containing a number outside the byte range in both languages', () => {
    const malformedBytes = [...Array(31).fill(0), 256];
    for (const kind of ['master', 'user'] as const) {
      for (const language of ['javascript', 'python'] as const) {
        const run = () => callKeyProgram(language, generateKeyProgram(language, kind, malformedBytes));
        if (language === 'javascript') {
          expect(run).toThrow('SM9 master key must contain only bytes');
        } else {
          expect(run).toThrow(/SM9 master key must contain only bytes/);
        }
      }
    }
  });

  it.each([
    ['above 255', [65, 256]],
    ['below 0', [65, -1]],
    ['fractional', [65, 1.5]],
  ])('rejects an identity containing a %s byte in both languages', (_label, identity) => {
    for (const language of ['javascript', 'python'] as const) {
      const run = () => callKeyProgram(language, generateKeyProgram(language, 'user', 1n, identity));
      if (language === 'javascript') expect(run).toThrow('SM9 ID must contain only bytes');
      else expect(run).toThrow(/SM9 ID must contain only bytes/);
    }
  });
});
