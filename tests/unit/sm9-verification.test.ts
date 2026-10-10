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

setLocale(enMessages as unknown as Record<string, string>);

const pythonCommand = process.env.CIPHER_CAT_PYTHON ||
  (process.platform === 'win32' ? 'python' : 'python3');

interface VerifyInput {
  message: number[];
  id: number[];
  h: number[];
  s: number[];
  ppub: number[];
  hid: number;
}

function readStandardVector(): VerifyInput {
  const registry = JSON.parse(readFileSync(resolve(process.cwd(), 'demos/tests.json'), 'utf8'));
  const driver = registry['procedures/SM9-Sign.json'].py.driver as string;
  const match = driver.match(/sm9_verify\((\[[^\]]*\]),\s*(\[[^\]]*\]),\s*(\[[^\]]*\]),\s*(\[[^\]]*\]),\s*(\[[^\]]*\]),\s*(\d+)\)/);
  if (!match) throw new Error('SM9 standard verification vector missing from Demo driver');

  const parseBytes = (literal: string): number[] =>
    Array.from(literal.matchAll(/0x[0-9a-f]+|\d+/gi), ([value]) => Number(value));
  const [message, id, h, s, ppub] = match.slice(1, 6).map(parseBytes);
  return { message, id, h, s, ppub, hid: Number(match[6]) };
}

const standardVector = readStandardVector();
const groupOrder = Array.from(Buffer.from(
  'b640000002a3a6f1d603ab4ff58ec74449f2934b18ea8beee56ee19cd69ecf25',
  'hex',
));
const fieldModulus = BigInt('0xb640000002a3a6f1d603ab4ff58ec74521f2934b1a7aeedbe56f9b27e351457d');

function nonCanonicalCoordinate(bytes: number[]): number[] {
  const value = BigInt(`0x${Buffer.from(bytes).toString('hex')}`) + fieldModulus;
  if (value >= 1n << 256n) throw new Error('fixture coordinate alias does not fit in 32 bytes');
  return Array.from(Buffer.from(value.toString(16).padStart(64, '0'), 'hex'));
}

const validSignaturePoint = Array.from(Buffer.from(
  '2a6b8780b0bfe9d4e26a2cab6977904ec77fff42a41ce573431b0fc99741b470'
    + '162b908e9ccbbbbcfa4b95194fc5be4cfbe1202e6d4b0cee0f1b6b108a5f7d1e',
  'hex',
));
const nonSubgroupSystemPublicKey = Array.from(Buffer.from(
  '0000000000000000000000000000000000000000000000000000000000000000'
    + '0000000000000000000000000000000000000000000000000000000000000001'
    + '0453e9be88d22ccfe209a420669cac8b9ec1fccf14061eb8bd714e6a1f6a3ee1'
    + '79a8eb911912ef24a4a0796b7a21a0935854b7cb00ee547f244a76f4c3718630',
  'hex',
));

function generateVerifier(language: 'javascript' | 'python', input: VerifyInput): string {
  const demo = JSON.parse(readFileSync(resolve(process.cwd(), 'demos/procedures/SM9-Sign.json'), 'utf8'));
  const procedure = demo.blocks.blocks[0];
  procedure.fields.NAME = 'SM9_Verify';
  const verifier = procedure.inputs.RETURN.block;
  verifier.type = 'sm9_verify';
  verifier.id = 'sm9_verify_under_test';
  verifier.fields = { HID: String(input.hid) };
  verifier.inputs = Object.fromEntries(
    Object.entries({
      MSG: input.message,
      ID: input.id,
      H: input.h,
      S: input.s,
      PPUB: input.ppub,
    }).map(([name, value]) => [name, {
      block: {
        type: 'data_value',
        id: `sm9_verify_${name.toLowerCase()}`,
        fields: { NUM: `[${(value as number[]).join(',')}]` },
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

function verifyJavaScript(input: VerifyInput, deterministicHash = false): boolean {
  const program = generateVerifier('javascript', input);
  const hashOverride = deterministicHash ? '\nsm9H = () => 1n;' : '';
  return new Function(`${program}${hashOverride}\nreturn SM9_Verify();`)() as boolean;
}

function verifyPython(input: VerifyInput, deterministicHash = false): boolean {
  const program = generateVerifier('python', input);
  const hashOverride = deterministicHash ? '\nsm9_H1 = lambda data: 1\nsm9_H2 = lambda data: 1' : '';
  const output = execFileSync(pythonCommand, ['-c', `${program}${hashOverride}\nprint(SM9_Verify())`], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
  return output === 'True';
}

describe('SM9 verification block standard input contract', () => {
  it('accepts the GB/T 38635.2-2020 Annex A vector in both generated languages', () => {
    expect(verifyJavaScript(standardVector)).toBe(true);
    expect(verifyPython(standardVector)).toBe(true);
  });

  it('uses the canonical field encoding when decoding curve-point inputs', () => {
    const input = {
      ...standardVector,
      h: new Array(31).fill(0).concat(1),
      s: [4, ...validSignaturePoint],
    };
    expect([verifyJavaScript(input, true), verifyPython(input, true)]).toEqual([true, true]);

    const nonCanonicalSignature = {
      ...input,
      s: [4, ...nonCanonicalCoordinate(validSignaturePoint.slice(0, 32)), ...validSignaturePoint.slice(32)],
    };
    const nonCanonicalMasterPublicKey = {
      ...input,
      ppub: [
        ...standardVector.ppub.slice(0, 32),
        ...nonCanonicalCoordinate(standardVector.ppub.slice(32, 64)),
        ...standardVector.ppub.slice(64),
      ],
    };
    expect([verifyJavaScript(nonCanonicalSignature, true), verifyPython(nonCanonicalSignature, true)])
      .toEqual([false, false]);
    expect([verifyJavaScript(nonCanonicalMasterPublicKey, true), verifyPython(nonCanonicalMasterPublicKey, true)])
      .toEqual([false, false]);
  });

  it.each([
    ['message', { message: standardVector.message.map((byte, index) => index === 0 ? byte ^ 1 : byte) }],
    ['identity', { id: standardVector.id.map((byte, index) => index === 0 ? byte ^ 1 : byte) }],
    ['signature hash', { h: standardVector.h.map((byte, index) => index === 31 ? byte ^ 1 : byte) }],
    ['out-of-range message byte', { message: [256] }],
    ['negative signature-hash byte', { h: [-1] }],
  ] as Array<[string, Partial<VerifyInput>]>)('rejects a modified %s in both languages', (_label, override) => {
    const invalid = { ...standardVector, ...override };
    expect({ javascript: verifyJavaScript(invalid), python: verifyPython(invalid) }).toEqual({
      javascript: false,
      python: false,
    });
  });

  it.each([
    ['zero h', { h: new Array(32).fill(0) }],
    ['h equal to the group order', { h: groupOrder }],
    ['wrong signature point prefix', { s: standardVector.s.map((byte, index) => index === 0 ? 5 : byte) }],
    ['off-curve signature point', {
      s: standardVector.s.map((byte, index) => index === 64 ? byte ^ 1 : byte),
    }],
    ['off-curve system public key', { ppub: new Array(128).fill(0) }],
  ] as Array<[string, Partial<VerifyInput>]>)('rejects %s in both languages', (_label, override) => {
    const invalid = { ...standardVector, ...override };
    expect({ javascript: verifyJavaScript(invalid), python: verifyPython(invalid) }).toEqual({
      javascript: false,
      python: false,
    });
  });

  it('rejects an on-curve system public key outside the SM9 subgroup before pairing', () => {
    const invalid = { ...standardVector, ppub: nonSubgroupSystemPublicKey };
    const javascript = generateVerifier('javascript', invalid);
    expect(new Function(`${javascript}\nsm9Pair = () => { throw new Error('PAIRING_SHOULD_NOT_RUN'); };\nreturn SM9_Verify();`)())
      .toBe(false);

    const python = generateVerifier('python', invalid);
    const output = execFileSync(pythonCommand, ['-c', [
      python,
      'sm9_pairing = lambda *args: (_ for _ in ()).throw(RuntimeError("PAIRING_SHOULD_NOT_RUN"))',
      'print(SM9_Verify())',
    ].join('\n')], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
    expect(output).toBe('False');
  });

  it.each([
    ['short h', { h: standardVector.h.slice(1) }],
    ['short signature', { s: standardVector.s.slice(1) }],
    ['short master public key', { ppub: standardVector.ppub.slice(1) }],
  ] as Array<[string, Partial<VerifyInput>]>)('returns false for %s in both languages', (_label, override) => {
    const invalid = { ...standardVector, ...override };
    expect({ javascript: verifyJavaScript(invalid), python: verifyPython(invalid) }).toEqual({
      javascript: false,
      python: false,
    });
  });
});
