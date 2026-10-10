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
import '@/blocks/sm2sig';
import '@/generators/javascript';
import '@/generators/python';
import { javascriptGenerator } from 'blockly/javascript';
import { pythonGenerator } from 'blockly/python';

setLocale(enMessages as unknown as Record<string, string>);

const pythonCommand = process.env.CIPHER_CAT_PYTHON ||
  (process.platform === 'win32' ? 'python' : 'python3');
const groupOrder = '8542d69e4c044f18e8b92435bf6ff7dd297720630485628d5ae74ee7c32e79b7';
const groupOrderMinusOne = (BigInt(`0x${groupOrder}`) - 1n).toString(16).padStart(64, '0');
const standardVector = {
  pax: '0ae4c7798aa0f119471bee11825be46202bb79e2a5844495e97c04ff4df2548a',
  pay: '7c0240f88f1cd4e16352a73c17b7f16f07353e53a176d684a9fe0c6bb798e857',
  identity: 'ALICE123@YAHOO.COM',
  message: [0x6d, 0x65, 0x73, 0x73, 0x61, 0x67, 0x65, 0x20, 0x64, 0x69, 0x67, 0x65, 0x73, 0x74],
  r: '40f1ec59f793d9f49e09dcef49130d4194f79fb1eed2caa55bacdb49c4e755d1',
  s: '6fc6dac32c5d5cf10c77dfb20f7c2eb667a457872fb09ec56327a67ec7deebe7',
};

type VerifyInput = typeof standardVector;

function generateVerifier(language: 'javascript' | 'python', input: VerifyInput): string {
  const demo = JSON.parse(readFileSync(resolve(process.cwd(), 'demos/procedures/SM2-Sign.json'), 'utf8'));
  const procedure = demo.blocks.blocks[0];
  procedure.fields.NAME = 'SM2_Verify';
  const verifier = procedure.inputs.RETURN.block;
  verifier.type = 'sm2_verify';
  verifier.id = 'sm2_verify_under_test';
  verifier.inputs = Object.fromEntries(
    Object.entries({
      PAX: input.pax,
      PAY: input.pay,
      IDA: input.identity,
      MSG: input.message,
      R: input.r,
      S: input.s,
    }).map(([name, value]) => [name, {
      block: {
        type: 'data_value',
        id: `sm2_verify_${name.toLowerCase()}`,
        fields: { NUM: Array.isArray(value) ? `[${value.join(',')}]` : JSON.stringify(value) },
      },
    }]),
  );

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

function verifyJavaScript(input: VerifyInput): boolean {
  const program = generateVerifier('javascript', input);
  return new Function(`${program}\nreturn SM2_Verify();`)() as boolean;
}

function verifyPython(input: VerifyInput): boolean {
  const program = generateVerifier('python', input);
  const output = execFileSync(pythonCommand, ['-c', `${program}\nprint(SM2_Verify())`], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
  return output === 'True';
}

function validatePublicKeyJavaScript(pax: string, pay: string): boolean {
  const program = generateVerifier('javascript', standardVector);
  return new Function(`${program}\nreturn sm2PublicKeyIsValid({ x: sm2ToBig(${JSON.stringify(pax)}), y: sm2ToBig(${JSON.stringify(pay)}) });`)() as boolean;
}

function validatePublicKeyPython(pax: string, pay: string, forceWrongOrder = false): boolean {
  const program = generateVerifier('python', standardVector);
  const subgroupTest = forceWrongOrder
    ? [
      '_original_sm2_params = sm2_params',
      'def sm2_params():',
      '    params = _original_sm2_params()',
      '    params["n"] = 1',
      '    return params',
    ].join('\n')
    : '';
  const output = execFileSync(pythonCommand, ['-c', `${program}\n${subgroupTest}\nprint(sm2_public_key_is_valid((sm2_to_big(${JSON.stringify(pax)}), sm2_to_big(${JSON.stringify(pay)}))))`], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
  return output === 'True';
}

function verifyNoncanonicalPublicKeyJavaScript(): { guarded: boolean; withoutValidation: boolean } {
  const program = generateVerifier('javascript', standardVector);
  const signatureInput = new Function([
    program,
    'const C = sm2Params();',
    'const invalidX = C.gx + C.p;',
    'const id = "SM2 validation test";',
    'const msg = [1, 2, 3];',
    'const originalZa = sm2Za;',
    'sm2Za = (ida) => originalZa(ida, invalidX, C.gy);',
    'const signature = sm2Sign(1n, id, msg, 3n);',
    'return {',
    '  pax: invalidX.toString(16).padStart(64, "0"),',
    '  pay: C.gy.toString(16).padStart(64, "0"),',
    '  r: sm2ToBig(signature.slice(0, 32)).toString(16).padStart(64, "0"),',
    '  s: sm2ToBig(signature.slice(32)).toString(16).padStart(64, "0"),',
    '  identity: id,',
    '  message: msg,',
    '};',
  ].join('\n'))() as Pick<VerifyInput, 'pax' | 'pay' | 'r' | 's' | 'identity' | 'message'>;
  const verifyProgram = generateVerifier('javascript', { ...standardVector, ...signatureInput });
  return new Function([
    verifyProgram,
    'const guarded = SM2_Verify();',
    'sm2PublicKeyIsValid = () => true;',
    'return { guarded, withoutValidation: SM2_Verify() };',
  ].join('\n'))() as { guarded: boolean; withoutValidation: boolean };
}

function verifyNoncanonicalPublicKeyPython(): { guarded: boolean; withoutValidation: boolean } {
  const program = generateVerifier('python', standardVector);
  const harness = [
    'C = sm2_params()',
    'invalid_x = C["gx"] + C["p"]',
    'identity = "SM2 validation test"',
    'message = [1, 2, 3]',
    '_original_sm2_za = sm2_za',
    'def sm2_za(ida, pax, pay):',
    '    return _original_sm2_za(ida, invalid_x, C["gy"])',
    'signature = sm2_sign(1, identity, message, 3)',
    'import json',
    'print(json.dumps({',
    '    "pax": format(invalid_x, "064x"),',
    '    "pay": format(C["gy"], "064x"),',
    '    "r": format(int.from_bytes(signature[:32], "big"), "064x"),',
    '    "s": format(int.from_bytes(signature[32:], "big"), "064x"),',
    '    "identity": identity,',
    '    "message": message,',
    '}))',
  ].join('\n');
  const output = execFileSync(pythonCommand, ['-c', `${program}\n${harness}`], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
  const verifyProgram = generateVerifier('python', { ...standardVector, ...JSON.parse(output) });
  const result = execFileSync(pythonCommand, ['-c', [
    verifyProgram,
    'import json',
    'guarded = SM2_Verify()',
    'sm2_public_key_is_valid = lambda P: True',
    'print(json.dumps({"guarded": guarded, "withoutValidation": SM2_Verify()}))',
  ].join('\n')], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
  return JSON.parse(result) as { guarded: boolean; withoutValidation: boolean };
}

function addGroupOrder(scalar: string): string {
  return (BigInt(`0x${scalar}`) + BigInt(`0x${groupOrder}`)).toString(16).padStart(64, '0');
}

describe('SM2 verification block standard input contract', () => {
  it('accepts the GB/T 32918.2-2016 Annex A signature vector in both languages', () => {
    expect(verifyJavaScript(standardVector)).toBe(true);
    expect(verifyPython(standardVector)).toBe(true);
  });

  it.each(['r', 's'] as const)('rejects a %s scalar outside [1,n-1] in both languages', (name) => {
    const invalidVector = { ...standardVector, [name]: addGroupOrder(standardVector[name]) };

    expect(invalidVector[name]).toHaveLength(64);
    expect({
      javascript: verifyJavaScript(invalidVector),
      python: verifyPython(invalidVector),
    }).toEqual({ javascript: false, python: false });
  });

  it.each([
    ['zero r', { r: '00'.repeat(32) }],
    ['r equal to n', { r: groupOrder }],
    ['zero s', { s: '00'.repeat(32) }],
    ['s equal to n', { s: groupOrder }],
    ['r+s equal to n', { r: '00'.repeat(31) + '01', s: groupOrderMinusOne }],
    ['wrong identity', { identity: 'ALICE123@YAHOO.COM-wrong' }],
    ['wrong message', { message: [0x6d, 0x65, 0x73, 0x73, 0x61, 0x67, 0x65] }],
  ] as Array<[string, Partial<VerifyInput>]>)('rejects %s in both languages', (_label, overrides) => {
    const invalidVector = { ...standardVector, ...overrides };
    const result = {
      javascript: verifyJavaScript(invalidVector),
      python: verifyPython(invalidVector),
    };

    expect(result).toEqual({ javascript: false, python: false });
  });

  it('accepts the Annex A public key and rejects out-of-field and off-curve coordinates', () => {
    const p = '8542d69e4c044f18e8b92435bf6ff7de457283915c45517d722edb8b08f1dfc3';
    const result = {
      javascript: [
        validatePublicKeyJavaScript(standardVector.pax, standardVector.pay),
        validatePublicKeyJavaScript(p, standardVector.pay),
        validatePublicKeyJavaScript('00'.repeat(32), '00'.repeat(32)),
      ],
      python: [
        validatePublicKeyPython(standardVector.pax, standardVector.pay),
        validatePublicKeyPython(p, standardVector.pay),
        validatePublicKeyPython('00'.repeat(32), '00'.repeat(32)),
      ],
    };

    expect(result).toEqual({ javascript: [true, false, false], python: [true, false, false] });
  });

  it('rejects an equivalent but out-of-field public-key coordinate before signature acceptance', () => {
    expect({
      javascript: verifyNoncanonicalPublicKeyJavaScript(),
      python: verifyNoncanonicalPublicKeyPython(),
    }).toEqual({
      javascript: { guarded: false, withoutValidation: true },
      python: { guarded: false, withoutValidation: true },
    });
  });

  it('rejects a curve point outside the subgroup of the configured order in both languages', () => {
    const gx = '421debd61b62eab6746434ebc3cc315e32220b3badd50bdc4c4e6c147fedd43d';
    const gy = '0680512bcbb42c07d47349d2153b70c4e5d7fdfcbfa36ea1a85841b9e46e09a2';
    const program = generateVerifier('javascript', standardVector);
    const javascript = new Function([
      program,
      'const originalParams = sm2Params;',
      'sm2Params = () => ({ ...originalParams(), n: 1n });',
      `return sm2PublicKeyIsValid({ x: sm2ToBig(${JSON.stringify(gx)}), y: sm2ToBig(${JSON.stringify(gy)}) });`,
    ].join('\n'))() as boolean;

    expect(javascript).toBe(false);
    expect(validatePublicKeyPython(gx, gy, true)).toBe(false);
  });
});
