// @vitest-environment jsdom
import * as Blockly from 'blockly/core';
import 'blockly/blocks';
import { execFileSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';
import { isNativeUint8Array } from './helpers/native-bytes';

import '@/blocks/data/number';
import '@/blocks/post-quantum/basic/encoding';
import '@/generators/javascript';
import '@/generators/javascript/postquantum/basic/encoding';
import '@/generators/python';
import '@/generators/python/postquantum/basic/encoding';

import { javascriptGenerator } from 'blockly/javascript';
import { pythonGenerator } from 'blockly/python';

const pythonCommand = process.env.CIPHER_CAT_PYTHON ||
  (process.platform === 'win32' ? 'python' : 'python3');

function generate(type: string, jsInput: string, pyInput: string, bits = '12'): { javascript: string; python: string } {
  const workspace = new Blockly.Workspace();
  try {
    const block = workspace.newBlock(type);
    if (block.getField('BITS')) block.setFieldValue(bits, 'BITS');
    for (const [field, expression] of [['INPUT', jsInput]] as const) {
      const value = workspace.newBlock('data_value');
      value.setFieldValue(expression, 'NUM');
      block.getInput(field)!.connection!.connect(value.outputConnection!);
    }
    const pythonWorkspace = new Blockly.Workspace();
    try {
      const pythonBlock = pythonWorkspace.newBlock(type);
      if (pythonBlock.getField('BITS')) pythonBlock.setFieldValue(bits, 'BITS');
      const pythonValue = pythonWorkspace.newBlock('data_value');
      pythonValue.setFieldValue(pyInput, 'NUM');
      pythonBlock.getInput('INPUT')!.connection!.connect(pythonValue.outputConnection!);
      return {
        javascript: javascriptGenerator.workspaceToCode(workspace),
        python: pythonGenerator.workspaceToCode(pythonWorkspace),
      };
    } finally {
      pythonWorkspace.dispose();
    }
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

function evaluatePython(program: string): unknown {
  const lines = program.trim().split('\n');
  const expression = lines.pop()!;
  const source = [
    ...lines,
    `value = ${expression}`,
    'print(__import__("json").dumps(list(value) if isinstance(value, (bytes, bytearray)) else value))',
  ].join('\n');
  return JSON.parse(execFileSync(pythonCommand, ['-c', source], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  }).trim());
}

function evaluatePythonType(program: string): string {
  const lines = program.trim().split('\n');
  const expression = lines.pop()!;
  return execFileSync(pythonCommand, ['-c', [...lines, `value = ${expression}`, 'print(type(value).__name__)'].join('\n')], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  }).trim();
}

function evaluatesToBytes(program: string): boolean {
  const lines = program.trim().split('\n');
  const expression = lines.pop()!;
  return execFileSync(pythonCommand, ['-c', [...lines, `value = ${expression}`, 'print(type(value) is bytes)'].join('\n')], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  }).trim() === 'True';
}

function pythonExpression(expression: string): string {
  return expression
    .replaceAll('NaN', 'float("nan")')
    .replaceAll('Infinity', 'float("inf")');
}

describe('FIPS 203 bit/byte conversion blocks', () => {
  it('converts bytes to little-endian bits per byte in both languages', () => {
    const program = generate('pq_bytes_to_bits', 'Uint8Array.from([1, 128, 165])', 'bytes([1, 128, 165])');
    const expected = [
      1, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 1,
      1, 0, 1, 0, 0, 1, 0, 1,
    ];
    expect(evaluateJavaScript(program.javascript)).toEqual(expected);
    expect(evaluatePythonType(program.python)).toBe('list');
    expect(evaluatePython(program.python)).toEqual(expected);
  });

  it('converts complete little-endian byte groups back to Uint8Array/bytes', () => {
    const bits = '[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,1,0,0,1,0,1]';
    const program = generate('pq_bits_to_bytes', bits, bits);
    const javascriptValue = evaluateJavaScript(program.javascript);
    expectJavaScriptBytes(javascriptValue);
    expect(evaluatesToBytes(program.python)).toBe(true);
    expect(Array.from(javascriptValue as Uint8Array)).toEqual([1, 128, 165]);
    expect(evaluatePython(program.python)).toEqual([1, 128, 165]);
  });

  it('matches the FIPS 203 BitsToBytes example 11010001 → 139 in both languages', () => {
    const bits = '[1,1,0,1,0,0,0,1]';
    const program = generate('pq_bits_to_bytes', bits, bits);
    const javascriptValue = evaluateJavaScript(program.javascript);
    expectJavaScriptBytes(javascriptValue);
    expect(Array.from(javascriptValue as Uint8Array)).toEqual([139]);
    expect(evaluatesToBytes(program.python)).toBe(true);
    expect(evaluatePython(program.python)).toEqual([139]);
  });

  it.each([1, 4, 5, 10, 11, 12])('encodes and decodes 256 coefficients with d=%i in both languages', (bits) => {
    const modulus = bits === 12 ? 3329 : 2 ** bits;
    const coefficients = bits === 4
      ? Array.from({ length: 256 }, (_, index) => index % 16)
      : bits === 12
        ? Array.from({ length: 256 }, (_, index) => index % 2 === 0 ? 0xabc : 0x123)
        : Array.from({ length: 256 }, (_, index) => (index * 3 + 1) % modulus);
    coefficients[255] = modulus - 1;
    const input = JSON.stringify(coefficients);
    const encoded = generate('pq_byte_encode', input, input, String(bits));
    const javascriptBytes = evaluateJavaScript(encoded.javascript) as Uint8Array;
    const pythonBytes = evaluatePython(encoded.python);
    const expectedBytes = Array(32 * bits).fill(0);
    for (let index = 0; index < coefficients.length; index += 1) {
      for (let bit = 0; bit < bits; bit += 1) {
        const position = index * bits + bit;
        expectedBytes[position >> 3] |= ((coefficients[index] >> bit) & 1) << (position & 7);
      }
    }

    expectJavaScriptBytes(javascriptBytes);
    expect(evaluatesToBytes(encoded.python)).toBe(true);
    expect(javascriptBytes.length).toBe((256 * bits) / 8);
    expect(Array.from(javascriptBytes)).toEqual(expectedBytes);
    expect(Array.from(javascriptBytes)).toEqual(pythonBytes);
    if (bits === 4) {
      expect(Array.from(javascriptBytes).slice(0, 8)).toEqual([0x10, 0x32, 0x54, 0x76, 0x98, 0xba, 0xdc, 0xfe]);
    }
    if (bits === 12) {
      expect(Array.from(javascriptBytes).slice(0, 9)).toEqual([0xbc, 0x3a, 0x12, 0xbc, 0x3a, 0x12, 0xbc, 0x3a, 0x12]);
    }

    const encodedValues = JSON.stringify(Array.from(javascriptBytes));
    const decoded = generate(
      'pq_byte_decode',
      `Uint8Array.from(${encodedValues})`,
      `bytes(${encodedValues})`,
      String(bits),
    );
    const javascriptCoefficients = evaluateJavaScript(decoded.javascript);
    expect(javascriptCoefficients).toEqual(coefficients);
    expect(Array.isArray(javascriptCoefficients)).toBe(true);
    expect(evaluatePythonType(decoded.python)).toBe('list');
    expect(evaluatePython(decoded.python)).toEqual(coefficients);
  });

  it('accepts integral float coefficients consistently in both generated languages', () => {
    const coefficients = Array(256).fill(0);
    coefficients[0] = 1;
    const pythonValues = `[${coefficients.map((value, index) => index === 0 ? '1.0' : String(value)).join(',')}]`;
    const program = generate('pq_byte_encode', JSON.stringify(coefficients), pythonValues, '4');
    const javascriptBytes = evaluateJavaScript(program.javascript) as Uint8Array;
    expect(Array.from(javascriptBytes)).toEqual(evaluatePython(program.python));
    expect(Array.from(javascriptBytes).slice(0, 2)).toEqual([1, 0]);
  });

  it('reduces ByteDecode_12 coefficients modulo q=3329', () => {
    const encoded = generate(
      'pq_byte_decode',
      'new Uint8Array(384).fill(255)',
      'bytes([255]) * 384',
      '12',
    );
    expect(evaluateJavaScript(encoded.javascript)).toEqual(Array(256).fill(766));
    expect(evaluatePython(encoded.python)).toEqual(Array(256).fill(766));
  });

  it('rejects ByteEncode inputs outside the declared coefficient domain', () => {
    const short = generate('pq_byte_encode', '[]', '[]', '4');
    expect(() => evaluateJavaScript(short.javascript)).toThrow();
    expect(() => evaluatePython(short.python)).toThrow();

    const long = generate('pq_byte_encode', 'Array(257).fill(0)', '[0] * 257', '4');
    expect(() => evaluateJavaScript(long.javascript)).toThrow();
    expect(() => evaluatePython(long.python)).toThrow();

    const invalid = Array(256).fill(0);
    invalid[0] = 16;
    const outOfRange = generate('pq_byte_encode', JSON.stringify(invalid), JSON.stringify(invalid), '4');
    expect(() => evaluateJavaScript(outOfRange.javascript)).toThrow();
    expect(() => evaluatePython(outOfRange.python)).toThrow();

    const q = Array(256).fill(0);
    q[0] = 3329;
    const outOfRangeQ = generate('pq_byte_encode', JSON.stringify(q), JSON.stringify(q), '12');
    expect(() => evaluateJavaScript(outOfRangeQ.javascript)).toThrow();
    expect(() => evaluatePython(outOfRangeQ.python)).toThrow();
  });

  it('rejects non-list coefficient containers for ByteEncode', () => {
    const javascriptTypedArray = generate('pq_byte_encode', 'new Int32Array(256)', '[0] * 256', '4');
    expect(() => evaluateJavaScript(javascriptTypedArray.javascript)).toThrow();

    const pythonTuple = generate('pq_byte_encode', 'new Array(256).fill(0)', '(0,) * 256', '4');
    expect(() => evaluatePython(pythonTuple.python)).toThrow();
  });

  it('rejects ByteDecode inputs whose byte length does not match d', () => {
    const short = generate('pq_byte_decode', 'Uint8Array.from([0])', 'bytes([0])', '4');
    expect(() => evaluateJavaScript(short.javascript)).toThrow();
    expect(() => evaluatePython(short.python)).toThrow();

    const long = generate('pq_byte_decode', 'new Uint8Array(129)', 'bytes(129)', '4');
    expect(() => evaluateJavaScript(long.javascript)).toThrow();
    expect(() => evaluatePython(long.python)).toThrow();

    const javascriptList = generate('pq_byte_decode', 'Array(128).fill(0)', 'bytes(128)', '4');
    expect(() => evaluateJavaScript(javascriptList.javascript)).toThrow();

    const pythonList = generate('pq_byte_decode', 'new Uint8Array(128)', '[0] * 128', '4');
    expect(() => evaluatePython(pythonList.python)).toThrow();
  });

  it('accepts empty byte and bit arrays', () => {
    const bytesToBits = generate('pq_bytes_to_bits', '[]', 'bytes()');
    const bitsToBytes = generate('pq_bits_to_bytes', '[]', '[]');
    expect(evaluateJavaScript(bytesToBits.javascript)).toEqual([]);
    expect(evaluatePython(bytesToBits.python)).toEqual([]);
    const javascriptValue = evaluateJavaScript(bitsToBytes.javascript);
    expectJavaScriptBytes(javascriptValue);
    expect(Array.from(javascriptValue as Uint8Array)).toEqual([]);
    expect(evaluatesToBytes(bitsToBytes.python)).toBe(true);
    expect(evaluatePython(bitsToBytes.python)).toEqual([]);
  });

  it('accepts integer-valued numbers consistently in both languages', () => {
    const bytes = generate('pq_bytes_to_bits', '[1.0]', '[1.0]');
    const bits = generate('pq_bits_to_bytes', '[1.0,0,0,0,0,0,0,0]', '[1.0,0,0,0,0,0,0,0]');
    expect(evaluateJavaScript(bytes.javascript)).toEqual(evaluatePython(bytes.python));
    expect(Array.from(evaluateJavaScript(bits.javascript) as Uint8Array)).toEqual(evaluatePython(bits.python));
  });

  it.each(['[-1]', '[256]', '[1.5]', '[NaN]', '[Infinity]', '[true]'])(
    'rejects non-byte input %s in both languages',
    (input) => {
      const program = generate('pq_bytes_to_bits', input, pythonExpression(input));
      expect(() => evaluateJavaScript(program.javascript)).toThrow();
      expect(() => evaluatePython(program.python)).toThrow();
    },
  );

  it.each(['pq_bytes_to_bits', 'pq_bits_to_bytes'])(
    'rejects non-iterable input for %s in both languages',
    (type) => {
      const program = generate(type, '42', '42');
      expect(() => evaluateJavaScript(program.javascript)).toThrow();
      expect(() => evaluatePython(program.python)).toThrow();
    },
  );

  it.each([
    '[1]',
    '[2,0,0,0,0,0,0,0]',
    '[-1,0,0,0,0,0,0,0]',
    '[1.5,0,0,0,0,0,0,0]',
    '[NaN,0,0,0,0,0,0,0]',
    '[true,0,0,0,0,0,0,0]',
  ])('rejects invalid bit input %s in both languages', (input) => {
    const program = generate('pq_bits_to_bytes', input, pythonExpression(input));
    expect(() => evaluateJavaScript(program.javascript)).toThrow();
    expect(() => evaluatePython(program.python)).toThrow();
  });
});
