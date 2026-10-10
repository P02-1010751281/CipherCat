// @vitest-environment jsdom
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import * as Blockly from 'blockly/core';
import { setLocale } from 'blockly/core';
import * as enMessages from 'blockly/msg/en';
import { describe, expect, it } from 'vitest';

import '@/blocks/procedure/blocks';
import '@/blocks/sm2enc/blocks';
import '@/generators/javascript/procedure/blocks';
import '@/generators/python/procedure/blocks';
import '@/generators/javascript/sm2enc/blocks';
import '@/generators/python/sm2enc/blocks';
import { javascriptGenerator } from 'blockly/javascript';
import { pythonGenerator } from 'blockly/python';

setLocale(enMessages as unknown as Record<string, string>);

const pythonCommand = process.env.CIPHER_CAT_PYTHON ||
  (process.platform === 'win32' ? 'python' : 'python3');
const expectedKey = '55b0ac62a6b927ba23703832c853ded4';
const sm3KdfLengthLimit = (2 ** 32 - 1) * 256;
const groupOrder = '8542d69e4c044f18e8b92435bf6ff7dd297720630485628d5ae74ee7c32e79b7';
const vector: readonly (string | number | boolean)[] = [
  '5e35d7d3f3c54dbac72e61819e730b019a84208ca3a35e4c2e353dfccb2a3b53',
  '33fe21940342161c55619c4a0c060293d543c80af19748ce176d83477de71c80',
  '3099093bf3c137d8fcbbcdf4a2ae50f3b0f216c3122d79425fe03a45dbfe1655',
  '3df79e8dac1cf0ecbaa2f2b49d51a4b387f2efaf482339086a27a8e05baed98b',
  '046cb5633816f4dd560b1dec458310cbcc6856c09505324a6d23150c408f162bf00d6fcf62f1036c0a1b6daccf57399223a65f7d7bf2d9637e5bbbeb857961bf1a',
  '041799b2a2c778295300d9a2325c686129b8f2b5337b3dcf4514e8bbc19d900ee554c9288c82733efdf7808ae7f27d0e732f7c73a7d9ac98b7d8740a91d0db3cf4',
  'e4d1d0c3ca4c7f11bc8ff8cb3f4c02a78f108fa098e51a668487240f75e20f31',
  '6b4b6d0e276691bd4a11bf72f4fb501ae309fdacb72fa6cc336e6656119abd67',
  128,
] as const;

function generateKeyExchange(): { javascript: string; python: string } {
  const demo = JSON.parse(readFileSync(resolve(process.cwd(), 'demos/procedures/SM2-KeyExchange.json'), 'utf8'));
  const workspace = new Blockly.Workspace();
  try {
    Blockly.serialization.workspaces.load(demo, workspace);
    return {
      javascript: javascriptGenerator.workspaceToCode(workspace),
      python: pythonGenerator.workspaceToCode(workspace),
    };
  } finally {
    workspace.dispose();
  }
}

function runJavaScript(program: string, args: readonly (string | number | boolean)[]): string {
  return new Function('args', `${program}\nreturn SM2KEX(...args);`)(args) as string;
}

function runPython(program: string, args: readonly (string | number | boolean)[]): string {
  const encodedArgs = JSON.stringify(args);
  const driver = `import json\nprint(SM2KEX(*json.loads(${JSON.stringify(encodedArgs)})))`;
  return execFileSync(pythonCommand, ['-c', `${program}\n${driver}`], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
}

function expectPythonFailure(
  program: string,
  args: readonly (string | number | boolean)[],
  message: string,
): void {
  let error: unknown;
  try {
    runPython(program, args);
  } catch (caught) {
    error = caught;
  }
  expect(error).toBeDefined();
  if (!error || typeof error !== 'object' || !('stderr' in error)) {
    throw error ?? new Error(`expected Python to reject input: ${message}`);
  }
  expect(String(error.stderr)).toContain(message);
}

describe('SM2 key exchange B-side input contract', () => {
  it('rejects a responder ephemeral point that does not match its scalar in both languages', () => {
    const program = generateKeyExchange();

    expect(runJavaScript(program.javascript, vector)).toBe(expectedKey);
    expect(runPython(program.python, vector)).toBe(expectedKey);

    const mismatchedVector = [...vector];
    mismatchedVector[5] = vector[4];
    expect(() => runJavaScript(program.javascript, mismatchedVector)).toThrow(
      'SM2-KEX: responder public point does not match scalar',
    );
    expectPythonFailure(program.python, mismatchedVector, 'SM2-KEX: responder public point does not match scalar');
  });

  it('rejects an initiator ephemeral point that is not on the curve in both languages', () => {
    const program = generateKeyExchange();
    const invalidPointVector = [...vector];
    invalidPointVector[4] = `04${'00'.repeat(64)}`;

    expect(() => runJavaScript(program.javascript, invalidPointVector)).toThrow(
      'SM2-KEX: invalid initiator ephemeral point',
    );
    expectPythonFailure(program.python, invalidPointVector, 'SM2-KEX: invalid initiator ephemeral point');
  });

  it('rejects a responder static private scalar outside the standard range in both languages', () => {
    const program = generateKeyExchange();
    const invalidPrivateKeyVector = [...vector];
    invalidPrivateKeyVector[0] = '00'.repeat(32);

    expect(() => runJavaScript(program.javascript, invalidPrivateKeyVector)).toThrow(
      'SM2-KEX: invalid responder static private key',
    );
    expectPythonFailure(program.python, invalidPrivateKeyVector, 'SM2-KEX: invalid responder static private key');
  });

  it.each([
    ['responder static private key at n', 0, groupOrder, 'SM2-KEX: invalid responder static private key'],
    ['responder ephemeral scalar at zero', 1, '00'.repeat(32), 'SM2-KEX: invalid responder ephemeral scalar'],
    ['responder ephemeral scalar at n', 1, groupOrder, 'SM2-KEX: invalid responder ephemeral scalar'],
  ])('rejects %s in both languages', (_name, index, value, message) => {
    const program = generateKeyExchange();
    const invalidScalarVector = [...vector];
    invalidScalarVector[index] = value;

    expect(() => runJavaScript(program.javascript, invalidScalarVector)).toThrow(message);
    expectPythonFailure(program.python, invalidScalarVector, message);
  });

  it.each([
    ['static private key', 0, '01', 'SM2-KEX: invalid responder static private key'],
    ['ephemeral scalar', 1, '01', 'SM2-KEX: invalid responder ephemeral scalar'],
  ])('rejects a %s that is not encoded as a 32-byte hex scalar in both languages', (_name, index, value, message) => {
    const program = generateKeyExchange();
    const invalidScalarVector = [...vector];
    invalidScalarVector[index] = value;

    expect(() => runJavaScript(program.javascript, invalidScalarVector)).toThrow(message);
    expectPythonFailure(program.python, invalidScalarVector, message);
  });

  it('rejects an identity hash with a length other than SM3 output in both languages', () => {
    const program = generateKeyExchange();
    const invalidIdentityVector = [...vector];
    invalidIdentityVector[7] = '00'.repeat(31);

    expect(() => runJavaScript(program.javascript, invalidIdentityVector)).toThrow(
      'SM2-KEX: invalid identity hash',
    );
    expectPythonFailure(program.python, invalidIdentityVector, 'SM2-KEX: invalid identity hash');
  });

  it('rejects an initiator static public key that is not on the curve in both languages', () => {
    const program = generateKeyExchange();
    const invalidStaticPointVector = [...vector];
    invalidStaticPointVector[2] = '00'.repeat(32);
    invalidStaticPointVector[3] = '00'.repeat(32);

    expect(() => runJavaScript(program.javascript, invalidStaticPointVector)).toThrow(
      'SM2-KEX: invalid initiator static point',
    );
    expectPythonFailure(program.python, invalidStaticPointVector, 'SM2-KEX: invalid initiator static point');
  });

  it('rejects a zero-bit shared key length in both languages', () => {
    const program = generateKeyExchange();
    const invalidLengthVector = [...vector];
    invalidLengthVector[8] = 0;

    expect(() => runJavaScript(program.javascript, invalidLengthVector)).toThrow(
      'SM2-KEX: invalid key length',
    );
    expectPythonFailure(program.python, invalidLengthVector, 'SM2-KEX: invalid key length');
  });

  it.each([sm3KdfLengthLimit, sm3KdfLengthLimit + 1])(
    'rejects shared key lengths at or above the SM3 KDF limit (%s bits) in both languages',
    (klen) => {
      const program = generateKeyExchange();
      const invalidLengthVector = [...vector];
      invalidLengthVector[8] = klen;

      expect(() => runJavaScript(program.javascript, invalidLengthVector)).toThrow(
        'SM2-KEX: invalid key length',
      );
      expectPythonFailure(program.python, invalidLengthVector, 'SM2-KEX: invalid key length');
    },
  );

  it.each([127.5, true])('rejects a non-integer shared key length (%s) in both languages', (klen) => {
    const program = generateKeyExchange();
    const invalidLengthVector = [...vector];
    invalidLengthVector[8] = klen;

    expect(() => runJavaScript(program.javascript, invalidLengthVector)).toThrow(
      'SM2-KEX: invalid key length',
    );
    expectPythonFailure(program.python, invalidLengthVector, 'SM2-KEX: invalid key length');
  });

  it('aborts when the responder shared point is the point at infinity in both languages', () => {
    const program = generateKeyExchange();
    const infinityVector = [...vector];
    infinityVector[0] = '3307c608038f0bbe899acf1ea267a5d729d77666ee6cc378a2fde1fa65e12eb4';

    expect(() => runJavaScript(program.javascript, infinityVector)).toThrow('SM2-KEX: V at infinity');
    expectPythonFailure(program.python, infinityVector, 'SM2-KEX: V at infinity');
  });
});
