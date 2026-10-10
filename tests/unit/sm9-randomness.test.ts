// @vitest-environment jsdom
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import * as Blockly from 'blockly/core';
import 'blockly/blocks';
import { setLocale } from 'blockly/core';
import * as enMessages from 'blockly/msg/en';
import { afterEach, describe, expect, it, vi } from 'vitest';

import '@/blocks/data';
import '@/blocks/sm9';
import '@/generators/javascript';
import '@/generators/python';
import { javascriptGenerator } from 'blockly/javascript';
import { pythonGenerator } from 'blockly/python';

setLocale(enMessages as unknown as Record<string, string>);

const pythonCommand = process.env.CIPHER_CAT_PYTHON ||
  (process.platform === 'win32' ? 'python' : 'python3');
const SM9N_BYTES = Uint8Array.from(Buffer.from(
  'b640000002a3a6f1d603ab4ff58ec74449f2934b18ea8beee56ee19cd69ecf25',
  'hex',
));
const SM9_R_HEX = '00033c8616b06704813203dfd00965022ed15975c662337aed648835dc4b1cbe';
const SM9_KS = JSON.stringify([...Array(31).fill(0), 1]);
const SM9_ID = JSON.stringify([0x41, 0x6c, 0x69, 0x63, 0x65]);
const SM9_Q_BYTES = [...Buffer.from('b640000002a3a6f1d603ab4ff58ec74521f2934b1a7aeedbe56f9b27e351457d', 'hex')];
const SM9_NON_SUBGROUP_PPUB = [
  ...Array(32).fill(0),
  ...Array(31).fill(0), 1,
  ...Buffer.from('0453e9be88d22ccfe209a420669cac8b9ec1fccf14061eb8bd714e6a1f6a3ee1', 'hex'),
  ...Buffer.from('79a8eb911912ef24a4a0796b7a21a0935854b7cb00ee547f244a76f4c3718630', 'hex'),
];

function generateSm9Demo(generator: 'javascript' | 'python', scalar?: string): string {
  const demo = JSON.parse(readFileSync(resolve(process.cwd(), 'demos/procedures/SM9-Sign.json'), 'utf8'));
  const sign = demo.blocks.blocks[0].inputs.RETURN.block;
  if (scalar === undefined) {
    delete sign.inputs.R;
  } else {
    sign.inputs.R.block.fields.NUM = scalar;
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

function generateSm9DemoWithoutR(generator: 'javascript' | 'python'): string {
  return generateSm9Demo(generator);
}

function generateSm9Sign(
  generator: 'javascript' | 'python',
  r?: string,
  invalidByteInput?: 'MSG' | 'DS' | 'PPUB',
  dsOverride?: string,
  ppubOverride?: string,
): string {
  const workspace = new Blockly.Workspace();
  try {
    const sign = workspace.newBlock('sm9_sign');
    const inputs: Record<string, string> = generator === 'javascript' ? {
      MSG: '[1, 2, 3]',
      DS: `sm9UserKey(${SM9_KS}, ${SM9_ID}, 1)`,
      PPUB: `sm9MasterKey(${SM9_KS})`,
    } : {
      MSG: '[1, 2, 3]',
      DS: `sm9_user_key(${SM9_KS}, ${SM9_ID}, 1)`,
      PPUB: `sm9_master_key(${SM9_KS})`,
    };
    if (invalidByteInput) {
      const invalidInputs = {
        MSG: '[1, 256, 3]',
        DS: `[${[...Array(63).fill(0), 256].join(',')}]`,
        PPUB: `[${[...Array(127).fill(0), 256].join(',')}]`,
      };
      inputs[invalidByteInput] = invalidInputs[invalidByteInput];
    }
    if (dsOverride !== undefined) inputs.DS = dsOverride;
    if (ppubOverride !== undefined) inputs.PPUB = ppubOverride;
    if (r !== undefined) inputs.R = r;
    for (const [name, expression] of Object.entries(inputs)) {
      const value = workspace.newBlock('data_value');
      value.setFieldValue(expression, 'NUM');
      sign.getInput(name)!.connection!.connect(value.outputConnection!);
    }
    return generator === 'javascript'
      ? javascriptGenerator.workspaceToCode(workspace)
      : pythonGenerator.workspaceToCode(workspace);
  } finally {
    workspace.dispose();
  }
}

function evaluate(program: string): unknown {
  const lines = program.trim().split('\n');
  const expression = lines.pop()!.replace(/;$/, '');
  return new Function([...lines, `return ${expression};`].join('\n'))();
}

function readSm9VerificationVector(): {
  msg: number[];
  uid: number[];
  h: number[];
  s: number[];
  ppub: number[];
  hid: number;
  signingKey: string;
  expected: string[];
} {
  const fixture = JSON.parse(readFileSync(resolve(process.cwd(), 'demos/tests.json'), 'utf8'))[
    'procedures/SM9-Sign.json'
  ] as { py: { driver: string; expect: string } };
  const match = fixture.py.driver.match(
    /sm9_verify\((\[[^\]]*\]),\s*(\[[^\]]*\]),\s*(\[[^\]]*\]),\s*(\[[^\]]*\]),\s*(\[[^\]]*\]),\s*(\d+)\)/,
  );
  const signingKey = fixture.py.driver.match(/sm9_master_key\((\[[^\]]*\])\)/)?.[1];
  if (!match || !signingKey) throw new Error('SM9 Annex A fixture is incomplete');
  const parseBytes = (literal: string): number[] =>
    Array.from(literal.matchAll(/0x[0-9a-f]+|\d+/gi), ([value]) => Number(value));
  const [msg, uid, h, s, ppub] = match.slice(1, 6).map(parseBytes);
  return {
    msg,
    uid,
    h,
    s,
    ppub,
    hid: Number(match[6]),
    signingKey,
    expected: fixture.py.expect.split('\n'),
  };
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('SM9 JavaScript generated signer', () => {
  it('rejects non-canonical and off-curve signing private-key points', () => {
    const nonCanonical = JSON.stringify([...SM9_Q_BYTES, ...Array(32).fill(0)]);
    const offCurve = JSON.stringify(Array(64).fill(0));

    expect(() => evaluate(generateSm9Sign('javascript', undefined, undefined, nonCanonical)))
      .toThrow('SM9 DS coordinates must be less than q');
    expect(() => evaluate(generateSm9Sign('javascript', undefined, undefined, offCurve)))
      .toThrow('SM9 DS must be a valid nonzero G1 point');
  });

  it('rejects non-canonical and off-curve system public keys', () => {
    const nonCanonical = JSON.stringify([...SM9_Q_BYTES, ...Array(96).fill(0)]);
    const offCurve = JSON.stringify(Array(128).fill(0));

    expect(() => evaluate(generateSm9Sign('javascript', undefined, undefined, undefined, nonCanonical)))
      .toThrow('SM9 Ppub coordinates must be less than q');
    expect(() => evaluate(generateSm9Sign('javascript', undefined, undefined, undefined, offCurve)))
      .toThrow('SM9 Ppub must be a valid nonzero G2 point');
  });

  it('rejects an on-curve system public key outside the SM9 subgroup', () => {
    const ppub = JSON.stringify(SM9_NON_SUBGROUP_PPUB);
    const program = generateSm9Sign('javascript', undefined, undefined, undefined, ppub);
    const helperCode = program.slice(0, program.lastIndexOf('\nUint8Array.from(sm9Sign('));
    const isOnCurveOutsideSubgroup = new Function(`${helperCode}\nconst point = g2ParseRaw(${ppub}); return g2OnCurve(point) && !g2IsInf(g2MulRaw(point, SM9N));`)();
    expect(isOnCurveOutsideSubgroup).toBe(true);
    expect(() => evaluate(program)).toThrow('SM9 Ppub must be a valid nonzero G2 point');
  });

  it.each(['MSG', 'DS', 'PPUB'] as const)('rejects a non-byte in %s', (inputName) => {
    const program = generateSm9Sign('javascript', undefined, inputName);
    const displayName = inputName === 'PPUB' ? 'Ppub' : inputName;
    expect(() => evaluate(program)).toThrow(`SM9 ${displayName} must contain only bytes`);
  });

  it.each([
    ['zero', new Uint8Array(32)],
    ['group order', Uint8Array.from(Buffer.from('b640000002a3a6f1d603ab4ff58ec74449f2934b18ea8beee56ee19cd69ecf25', 'hex'))],
  ])('rejects a random %s and retries using Web Crypto', (_label, invalidScalar) => {
    const program = generateSm9Sign('javascript');
    const getRandomValues = vi.fn((target: Uint8Array) => {
      if (getRandomValues.mock.calls.length === 1) {
        target.set(invalidScalar);
        return target;
      }
      throw new Error('RNG_RETRY');
    });
    vi.stubGlobal('crypto', { getRandomValues });
    const mathRandom = vi.spyOn(Math, 'random').mockImplementation(() => {
      throw new Error('Math.random must not be used');
    });

    expect(() => evaluate(program)).toThrow('RNG_RETRY');
    expect(getRandomValues).toHaveBeenCalledTimes(2);
    expect(mathRandom).not.toHaveBeenCalled();
  });

  it('uses an accepted random scalar to produce the registered standard signature', () => {
    const program = generateSm9DemoWithoutR('javascript');
    const getRandomValues = vi.fn((target: Uint8Array) => {
      target.set(Buffer.from(SM9_R_HEX, 'hex'));
      return target;
    });
    vi.stubGlobal('crypto', { getRandomValues });
    vi.spyOn(Math, 'random').mockImplementation(() => {
      throw new Error('Math.random must not be used');
    });

    const signature = new Function(`${program}\nreturn SM9_Sign();`)() as number[];
    const registry = JSON.parse(readFileSync(resolve(process.cwd(), 'demos/tests.json'), 'utf8'));
    expect(Buffer.from(signature).toString('hex')).toBe(registry['procedures/SM9-Sign.json'].py.expect.split('\n')[0]);
    expect(getRandomValues).toHaveBeenCalledOnce();
  });

  it('retries a random scalar when injected H2 forces l = 0', () => {
    const program = generateSm9DemoWithoutR('javascript');
    const draws = [1, 2];
    const getRandomValues = vi.fn((target: Uint8Array) => {
      target.fill(0);
      target[31] = draws[getRandomValues.mock.calls.length - 1];
      return target;
    });
    vi.stubGlobal('crypto', { getRandomValues });

    const signature = new Function(`${program}\nsm9H = () => 1n;\nreturn SM9_Sign();`)() as number[];
    expect(signature).toHaveLength(97);
    expect(getRandomValues).toHaveBeenCalledTimes(2);
  });

  it.each([
    ['zero', JSON.stringify(Array.from(new Uint8Array(32)))],
    ['group order', JSON.stringify(Array.from(SM9N_BYTES))],
  ])('rejects a caller-supplied %s scalar', (_label, scalar) => {
    expect(() => evaluate(generateSm9Sign('javascript', scalar))).toThrow('SM9 r must satisfy 1 <= r < n');
  });

  it('rejects a scalar encoded with a value outside the byte range', () => {
    const malformed = JSON.stringify([...Array(31).fill(0), 256]);
    expect(() => evaluate(generateSm9Sign('javascript', malformed))).toThrow('SM9 r must contain only bytes');
  });

  it('rejects an explicitly supplied empty byte array instead of sampling a nonce', () => {
    const getRandomValues = vi.fn(() => {
      throw new Error('RANDOM_SHOULD_NOT_RUN');
    });
    vi.stubGlobal('crypto', { getRandomValues });

    expect(() => evaluate(generateSm9Sign('javascript', '[]'))).toThrow('SM9 r must be 32 bytes');
    expect(getRandomValues).not.toHaveBeenCalled();
  });

  it.each(['null', '""'])('rejects explicitly connected %s instead of sampling a nonce', (r) => {
    expect(() => evaluate(generateSm9Sign('javascript', r))).toThrow('SM9 r must be a byte array');
  });

  it('rejects an empty-equivalent Python object instead of treating it as the sentinel', () => {
    const program = generateSm9Sign('python', '_EmptyEqualsString()');
    const callStart = program.lastIndexOf('\nsm9_sign(');
    const harness = [
      'class _EmptyEqualsString:',
      '    def __eq__(self, other): return True',
      'import secrets',
      'secrets.randbelow = lambda limit: (_ for _ in ()).throw(RuntimeError("RANDOM_USED"))',
      `sm9_sign([1, 2, 3], sm9_user_key(${SM9_KS}, ${SM9_ID}, 1), sm9_master_key(${SM9_KS}), _EmptyEqualsString(), False)`,
    ].join('\n');
    let emptyEquivalentError: unknown;
    try {
      execFileSync(pythonCommand, ['-c', `${program.slice(0, callStart)}\n${harness}`], {
        stdio: ['ignore', 'ignore', 'pipe'],
      });
    } catch (error) {
      emptyEquivalentError = error;
    }
    expect(emptyEquivalentError).toBeDefined();
    expect(String((emptyEquivalentError as { stderr?: Buffer }).stderr)).not.toContain('RANDOM_USED');
  });
});

describe('SM9 Python generated signer', () => {
  it('verifies a signature composed from the public Bytes outputs', () => {
    const program = generateSm9Demo('python', JSON.stringify([...Buffer.from(SM9_R_HEX, 'hex')]));
    const vector = readSm9VerificationVector();
    const harness = [
      `ks = ${vector.signingKey}`,
      `uid = ${JSON.stringify(vector.uid)}`,
      `msg = ${JSON.stringify(vector.msg)}`,
      'signature = SM9_Sign()',
      `assert signature.hex() == '${vector.expected[0]}'`,
      'ppub = bytes(sm9_master_key(ks))',
      `assert ppub.hex() == '${vector.expected[1]}'`,
      `assert bytes(sm9_user_key(ks, uid, 1)).hex() == '${vector.expected[2]}'`,
      'print(sm9_verify(msg, uid, signature[:32], signature[32:], ppub, 1))',
    ].join('\n');

    const verified = execFileSync(pythonCommand, ['-c', `${program}\n${harness}`], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    }).trim();
    expect(verified).toBe('True');
  });

  it('preserves accepted byte containers and returns false for invalid ones', () => {
    const program = generateSm9Demo('python');
    const vector = readSm9VerificationVector();
    const args = [vector.msg, vector.uid, vector.h, vector.s, vector.ppub]
      .map((value) => JSON.stringify(value));
    const harness = [
      'for container in (bytes, bytearray, tuple, list):',
      `    values = [container(${args[0]}), container(${args[1]}), container(${args[2]}), container(${args[3]}), container(${args[4]})]`,
      `    print(sm9_verify(*values, ${vector.hid}))`,
      `invalid_inputs = [(None, ${args[1]}, ${args[2]}, ${args[3]}, ${args[4]}), (${args[0]}, None, ${args[2]}, ${args[3]}, ${args[4]}), (${args[0]}, ${args[1]}, [256], ${args[3]}, ${args[4]})]`,
      `print(all(not sm9_verify(*values, ${vector.hid}) for values in invalid_inputs))`,
    ].join('\n');
    const results = execFileSync(pythonCommand, ['-c', `${program}\n${harness}`], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    }).trim().split('\n');

    expect(results).toEqual(['True', 'True', 'True', 'True', 'True']);
  });

  it('rejects non-canonical and off-curve signing private-key points', () => {
    const nonCanonical = JSON.stringify([...SM9_Q_BYTES, ...Array(32).fill(0)]);
    const offCurve = JSON.stringify(Array(64).fill(0));

    expect(() => execFileSync(pythonCommand, ['-c', generateSm9Sign('python', undefined, undefined, nonCanonical)], {
      stdio: ['ignore', 'ignore', 'pipe'],
    })).toThrow(/SM9 DS coordinates must be less than q/);
    expect(() => execFileSync(pythonCommand, ['-c', generateSm9Sign('python', undefined, undefined, offCurve)], {
      stdio: ['ignore', 'ignore', 'pipe'],
    })).toThrow(/SM9 DS must be a valid nonzero G1 point/);
  });

  it('rejects non-canonical and off-curve system public keys', () => {
    const nonCanonical = JSON.stringify([...SM9_Q_BYTES, ...Array(96).fill(0)]);
    const offCurve = JSON.stringify(Array(128).fill(0));

    expect(() => execFileSync(pythonCommand, ['-c', generateSm9Sign('python', undefined, undefined, undefined, nonCanonical)], {
      stdio: ['ignore', 'ignore', 'pipe'],
    })).toThrow(/SM9 Ppub coordinates must be less than q/);
    expect(() => execFileSync(pythonCommand, ['-c', generateSm9Sign('python', undefined, undefined, undefined, offCurve)], {
      stdio: ['ignore', 'ignore', 'pipe'],
    })).toThrow(/SM9 Ppub must be a valid nonzero G2 point/);
  });

  it('rejects an on-curve system public key outside the SM9 subgroup', () => {
    const ppub = JSON.stringify(SM9_NON_SUBGROUP_PPUB);
    const program = generateSm9Sign('python', undefined, undefined, undefined, ppub);
    const helperCode = program.slice(0, program.lastIndexOf('\nbytes(sm9_sign('));
    const membership = execFileSync(pythonCommand, ['-c', [
      helperCode,
      `point = sm9_g2_parse_raw(${ppub})`,
      'print(point.is_on_curve() and not sm9_g2_mul_raw(point, SM9N).is_inf())',
    ].join('\n')], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
    expect(membership).toBe('True');
    expect(() => execFileSync(pythonCommand, ['-c', program], {
      stdio: ['ignore', 'ignore', 'pipe'],
    })).toThrow(/SM9 Ppub must be a valid nonzero G2 point/);
  });

  it.each(['MSG', 'DS', 'PPUB'] as const)('rejects a non-byte in %s', (inputName) => {
    const displayName = inputName === 'PPUB' ? 'Ppub' : inputName;
    expect(() => execFileSync(pythonCommand, [
      '-c',
      generateSm9Sign('python', undefined, inputName),
    ], { stdio: ['ignore', 'pipe', 'pipe'] })).toThrow(`SM9 ${displayName} must contain only bytes`);
  });

  it('samples a nonzero scalar below the group order and validates supplied scalars', () => {
    const program = generateSm9Sign('python');

    expect(program).toContain('r_int = secrets.randbelow(SM9N - 1) + 1');
    expect(program).toContain('if not 0 < r_int < SM9N:');
  });

  it.each(['None', '""'])('rejects explicitly connected %s instead of sampling a nonce', (r) => {
    expect(() => execFileSync(pythonCommand, ['-c', generateSm9Sign('python', r)], {
      stdio: ['ignore', 'ignore', 'pipe'],
    })).toThrow(/SM9 r must be a byte array/);
  });

  it('samples a nonzero scalar at runtime and rejects malformed supplied bytes', () => {
    const program = generateSm9Sign('python');
    const callStart = program.lastIndexOf('\nbytes(sm9_sign(');
    expect(callStart).toBeGreaterThan(0);
    const module = program.slice(0, callStart);
    const upperScalar = (BigInt(`0x${Buffer.from(SM9N_BYTES).toString('hex')}`) - 1n).toString();
    for (const [sample, expected] of [['0', '1'], ['limit - 1', upperScalar]]) {
      const harness = [
        'import secrets',
        `secrets.randbelow = lambda limit: ${sample}`,
        'class _Point:',
        '    def marshal(self): return b""',
        'def _capture(msg, ds, ppub, r):',
        '    print(r)',
        '    return r, _Point()',
        'sm9_sign_impl = _capture',
      `sm9_sign([1, 2, 3], sm9_user_key(${SM9_KS}, ${SM9_ID}, 1), sm9_master_key(${SM9_KS}), None, True)`,
      ].join('\n');
      expect(execFileSync(pythonCommand, ['-c', `${module}\n${harness}`], { encoding: 'utf8' }).trim()).toBe(expected);
    }

    for (const scalar of [
      JSON.stringify(Array.from(new Uint8Array(32))),
      JSON.stringify(Array.from(SM9N_BYTES)),
    ]) {
      expect(() => execFileSync(pythonCommand, ['-c', generateSm9Sign('python', scalar)], {
        stdio: ['ignore', 'ignore', 'pipe'],
      })).toThrow('SM9 r must satisfy 1 <= r < n');
    }

    const malformed = JSON.stringify([...Array(31).fill(0), 256]);
    expect(() => execFileSync(pythonCommand, ['-c', generateSm9Sign('python', malformed)], {
      stdio: ['ignore', 'ignore', 'pipe'],
    })).toThrow('SM9 r must contain only bytes');

    const falseScalar = generateSm9Sign('python', 'False');
    const falseCallStart = falseScalar.lastIndexOf('\nsm9_sign(');
    const falseHarness = [
      'import secrets',
      'secrets.randbelow = lambda limit: (_ for _ in ()).throw(RuntimeError("RANDOM_USED"))',
      `sm9_sign([1, 2, 3], sm9_user_key(${SM9_KS}, ${SM9_ID}, 1), sm9_master_key(${SM9_KS}), False, False)`,
    ].join('\n');
    let falseInputError: unknown;
    try {
      execFileSync(pythonCommand, ['-c', `${falseScalar.slice(0, falseCallStart)}\n${falseHarness}`], {
        stdio: ['ignore', 'ignore', 'pipe'],
      });
    } catch (error) {
      falseInputError = error;
    }
    expect(falseInputError).toBeDefined();
    expect(String((falseInputError as { stderr?: Buffer }).stderr)).not.toContain('RANDOM_USED');

    expect(() => execFileSync(pythonCommand, ['-c', generateSm9Sign('python', '[]')], {
      stdio: ['ignore', 'ignore', 'pipe'],
    })).toThrow('SM9 r must be 32 bytes');
  });

  it('uses an accepted random scalar to produce the registered standard signature', () => {
    const program = generateSm9DemoWithoutR('python');
    const registry = JSON.parse(readFileSync(resolve(process.cwd(), 'demos/tests.json'), 'utf8'));
    const expected = registry['procedures/SM9-Sign.json'].py.expect.split('\n')[0];
    const script = [
      program,
      'import secrets',
      `secrets.randbelow = lambda limit: int("${SM9_R_HEX}", 16) - 1`,
      'print(bytes(SM9_Sign()).hex())',
    ].join('\n');
    expect(execFileSync(pythonCommand, ['-c', script], { encoding: 'utf8' }).trim()).toBe(expected);
  });

  it('retries a random scalar when injected H2 forces l = 0', () => {
    const program = generateSm9DemoWithoutR('python');
    const driver = [
      'import secrets',
      'draws = iter([0, 1])',
      'draw_count = [0]',
      'def sample(limit):',
      '    draw_count[0] += 1',
      '    return next(draws)',
      'secrets.randbelow = sample',
      'sm9_H2 = lambda data: 1',
      'signature = SM9_Sign()',
      'print(len(signature), signature[32], draw_count[0])',
    ].join('\n');

    expect(execFileSync(pythonCommand, ['-c', `${program}\n${driver}`], { encoding: 'utf8' }).trim()).toBe('97 4 2');
  });

  it('rejects a fixed scalar when injected H2 forces the standard l = 0 branch', () => {
    const scalar = `[${[...Array(31).fill(0), 1].join(',')}]`;
    const pythonProgram = generateSm9Demo('python', scalar);
    const javascriptProgram = generateSm9Demo('javascript', scalar);
    const driver = `${pythonProgram}\nsm9_H2 = lambda data: 1\nSM9_Sign()`;

    expect(() => execFileSync(pythonCommand, ['-c', driver], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    })).toThrow('SM9 r produced l = 0; provide another scalar');
    expect(() => new Function(`${javascriptProgram}\nsm9H = () => 1n;\nreturn SM9_Sign();`)())
      .toThrow('SM9 r produced l = 0; provide another scalar');
  });
});
