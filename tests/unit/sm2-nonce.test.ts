// @vitest-environment jsdom
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import * as Blockly from 'blockly/core';
import { setLocale } from 'blockly/core';
import * as enMessages from 'blockly/msg/en';
import { afterEach, describe, expect, it, vi } from 'vitest';

import '@/blocks/data';
import '@/blocks/sm2sig';
import '@/generators/javascript';
import '@/generators/python';
import { javascriptGenerator } from 'blockly/javascript';
import { pythonGenerator } from 'blockly/python';

setLocale(enMessages as unknown as Record<string, string>);

const pythonCommand = process.env.CIPHER_CAT_PYTHON ||
  (process.platform === 'win32' ? 'python' : 'python3');
const SM2_N = '8542d69e4c044f18e8b92435bf6ff7dd297720630485628d5ae74ee7c32e79b7';
const SM2_N_MINUS_ONE = (BigInt(`0x${SM2_N}`) - 1n).toString(16);
const SM2_K = '6cb28d99385c175c94f94e934817663fc176d925dd72b727260dbaae1fb2f96f';

function generateSm2Demo(
  generator: 'javascript' | 'python',
  nonce?: string,
  privateKey?: string,
  nonceIsExpression = false,
): string {
  const demo = JSON.parse(readFileSync(resolve(process.cwd(), 'demos/procedures/SM2-Sign.json'), 'utf8'));
  const sign = demo.blocks.blocks[0].inputs.RETURN.block;
  if (privateKey !== undefined) {
    sign.inputs.DA.block.fields.NUM = JSON.stringify(privateKey);
  }
  if (nonce === undefined) {
    delete sign.inputs.K;
  } else {
    sign.inputs.K.block.fields.NUM = nonceIsExpression ? nonce : JSON.stringify(nonce);
  }

  const workspace = new Blockly.Workspace();
  try {
    Blockly.serialization.workspaces.load(demo, workspace);
    return generator === 'javascript'
      ? javascriptGenerator.workspaceToCode(workspace)
      : pythonGenerator.workspaceToCode(workspace);
  } finally {
    workspace.dispose();
  }
}

function evaluateJavaScript(program: string): number[] {
  return new Function(`${program}\nreturn SM2_Sign();`)() as number[];
}

function runPython(program: string, driver: string): string {
  return execFileSync(pythonCommand, ['-c', `${program}\n${driver}`], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
}

function registeredSignature(): string {
  const registry = JSON.parse(readFileSync(resolve(process.cwd(), 'demos/tests.json'), 'utf8'));
  return registry['procedures/SM2-Sign.json'].py.expect.split('\n')[0];
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('SM2 generated signer nonce contract', () => {
  it('retries random zero and group-order draws, then matches the standard vector in JavaScript', () => {
    const program = generateSm2Demo('javascript');
    const draws = [
      new Uint8Array(32),
      Uint8Array.from(Buffer.from(SM2_N, 'hex')),
      Uint8Array.from(Buffer.from(SM2_K, 'hex')),
    ];
    const getRandomValues = vi.fn((target: Uint8Array) => {
      target.set(draws[getRandomValues.mock.calls.length - 1]);
      return target;
    });
    vi.stubGlobal('crypto', { getRandomValues });

    expect(Buffer.from(evaluateJavaScript(program)).toString('hex')).toBe(registeredSignature());
    expect(getRandomValues).toHaveBeenCalledTimes(3);
  });

  it('uses an accepted uniformly sampled nonce to match the standard vector in Python', () => {
    const program = generateSm2Demo('python');
    const driver = `import secrets\nsecrets.randbelow = lambda limit: int("${SM2_K}", 16) - 1\nprint(bytes(SM2_Sign()).hex())`;

    expect(runPython(program, driver)).toBe(registeredSignature());
  });

  it.each([
    ['zero', '00'.repeat(32)],
    ['group order', SM2_N],
  ])('rejects a caller-supplied %s nonce in both languages', (_label, nonce) => {
    const javascript = generateSm2Demo('javascript', nonce);
    const python = generateSm2Demo('python', nonce);

    expect(() => evaluateJavaScript(javascript)).toThrow('SM2: invalid nonce');
    expect(() => runPython(python, 'SM2_Sign()')).toThrow('SM2: invalid nonce');
  });

  it('rejects boolean nonces in both languages', () => {
    const javascript = generateSm2Demo('javascript', 'true', undefined, true);
    const python = generateSm2Demo('python', 'True', undefined, true);

    expect(() => evaluateJavaScript(javascript)).toThrow('SM2: invalid nonce');
    expect(() => runPython(python, 'SM2_Sign()')).toThrow('SM2: invalid nonce');
  });

  it('rejects the out-of-range private key n - 1 before requesting randomness', () => {
    const javascript = generateSm2Demo('javascript', undefined, SM2_N_MINUS_ONE);
    const python = generateSm2Demo('python', undefined, SM2_N_MINUS_ONE);
    vi.stubGlobal('crypto', {
      getRandomValues: () => { throw new Error('RNG_USED'); },
    });
    const randomPython = [
      'import secrets',
      'secrets.randbelow = lambda limit: (_ for _ in ()).throw(RuntimeError("RNG_USED"))',
      'SM2_Sign()',
    ].join('\n');

    expect(() => evaluateJavaScript(javascript)).toThrow('SM2: invalid private key');
    expect(() => runPython(python, randomPython)).toThrow('SM2: invalid private key');
  });

  it('does not treat an object equal to an empty string as an omitted nonce in Python', () => {
    const program = generateSm2Demo('python', '_EmptyEqualsString()');
    const callStart = program.lastIndexOf('\nSM2_Sign(');
    const harness = [
      'class _EmptyEqualsString:',
      '    def __eq__(self, other): return True',
      'import secrets',
      'secrets.randbelow = lambda limit: (_ for _ in ()).throw(RuntimeError("RANDOM_USED"))',
      'SM2_Sign()',
    ].join('\n');
    let error: unknown;
    try {
      execFileSync(pythonCommand, ['-c', `${program.slice(0, callStart)}\n${harness}`], {
        stdio: ['ignore', 'ignore', 'pipe'],
      });
    } catch (caught) {
      error = caught;
    }

    expect(error).toBeDefined();
    expect(String((error as { stderr?: Buffer }).stderr)).not.toContain('RANDOM_USED');
  });
});
