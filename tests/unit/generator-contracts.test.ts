// @vitest-environment jsdom
import * as Blockly from 'blockly/core';
import 'blockly/blocks';
import { setLocale } from 'blockly/core';
import * as enMessages from 'blockly/msg/en';
import { execFileSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';
import { isNativeUint8Array } from './helpers/native-bytes';

import '@/blocks/data';
import '@/blocks/bitwise';
import '@/blocks/hash/adrs';
import '@/blocks/hash/fors';
import '@/blocks/hash/hashbased';
import '@/blocks/argon2/blocks';
import '@/blocks/mldsa/primitives';
import '@/blocks/numtheory';
import '@/blocks/remaining';
import '@/generators/javascript';
import '@/generators/python';
import { setPythonPrintFilter } from '@/generators/python';

import { javascriptGenerator } from 'blockly/javascript';
import { pythonGenerator } from 'blockly/python';

setLocale(enMessages as unknown as Record<string, string>);

const pythonCommand = process.env.CIPHER_CAT_PYTHON ||
  (process.platform === 'win32' ? 'python' : 'python3');

function generateBlockCode(
  type: string,
  inputs: Record<string, string>,
  fields: Record<string, string> = {},
): { javascript: string; python: string } {
  const workspace = new Blockly.Workspace();
  try {
    const block = workspace.newBlock(type);
    for (const [name, value] of Object.entries(fields)) block.setFieldValue(value, name);
    for (const [name, expression] of Object.entries(inputs)) {
      const value = workspace.newBlock('data_value');
      value.setFieldValue(expression, 'NUM');
      block.getInput(name)!.connection!.connect(value.outputConnection!);
    }
    return {
      javascript: javascriptGenerator.workspaceToCode(workspace),
      python: pythonGenerator.workspaceToCode(workspace),
    };
  } finally {
    workspace.dispose();
  }
}

function generateCodeForLanguage(
  language: 'javascript' | 'python',
  type: string,
  inputs: Record<string, string>,
  fields: Record<string, string> = {},
): string {
  const workspace = new Blockly.Workspace();
  try {
    const block = workspace.newBlock(type);
    for (const [name, value] of Object.entries(fields)) block.setFieldValue(value, name);
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

function generatePrintedBlockCode(type: string, fields: Record<string, string> = {}): { javascript: string; python: string } {
  const workspace = new Blockly.Workspace();
  try {
    const print = workspace.newBlock('text_print');
    const value = workspace.newBlock(type);
    for (const [name, fieldValue] of Object.entries(fields)) value.setFieldValue(fieldValue, name);
    print.getInput('TEXT')!.connection!.connect(value.outputConnection!);
    setPythonPrintFilter(false);
    return {
      javascript: javascriptGenerator.workspaceToCode(workspace),
      python: pythonGenerator.workspaceToCode(workspace),
    };
  } finally {
    setPythonPrintFilter(true);
    workspace.dispose();
  }
}

function runPython(code: string): string {
  return execFileSync(pythonCommand, ['-c', code], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
}

function capturePythonException(code: string, setup: string): unknown {
  const wrappedCode = [
    'import json',
    setup,
    'try:',
    ...code.trimEnd().split('\n').map((line) => `    ${line}`),
    'except Exception as error:',
    '    print(json.dumps({"type": type(error).__name__, "message": str(error)}))',
    'else:',
    '    print(json.dumps(None))',
  ].filter(Boolean).join('\n');
  return JSON.parse(execFileSync(pythonCommand, ['-c', wrappedCode], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim()) as unknown;
}

function expressionFromProgram(code: string): string {
  return code.trim().replace(/;$/, '');
}

function evaluateJavaScript(program: string): unknown {
  const lines = program.trim().split('\n');
  const expression = lines.pop()!.replace(/;$/, '');
  return new Function([...lines, `return ${expression};`].join('\n'))();
}

function expectJavaScriptBytes(value: unknown): asserts value is Uint8Array {
  expect(isNativeUint8Array(value)).toBe(true);
}

function expectJavaScriptToThrowWithoutHanging(program: string, expectedMessage: string, timeoutMs = 2000): void {
  const lines = program.trim().split('\n');
  const expression = lines.pop()!.replace(/;$/, '');
  try {
    execFileSync(process.execPath, ['-e', [...lines, `console.log(JSON.stringify(${expression}));`].join('\n')], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      timeout: timeoutMs,
    });
  } catch (error) {
    expect((error as NodeJS.ErrnoException).code).not.toBe('ETIMEDOUT');
    expect(String((error as { stderr?: unknown }).stderr ?? '')).toContain(expectedMessage);
    return;
  }
  throw new Error('expected generated JavaScript to throw');
}

function evaluatePython(program: string, bindings = ''): string {
  const lines = program.trim().split('\n');
  const expression = lines.pop()!;
  return runPython([
    bindings,
    ...lines,
    `value = ${expression}`,
    'print(__import__("json").dumps(list(value) if isinstance(value, (bytes, bytearray)) else value))',
  ].filter(Boolean).join('\n'));
}

function expectPythonBytes(program: string, expected: number[]): void {
  const lines = program.trim().split('\n');
  const expression = lines.pop()!;
  expect(runPython([
    ...lines,
    `value = ${expression}`,
    'assert type(value) is bytes',
    `assert value == bytes(${JSON.stringify(expected)})`,
  ].join('\n'))).toBe('');
}

describe('generated block data contracts', () => {
  it('rejects Node Buffer because TYPE_BYTES is exactly Uint8Array', () => {
    expect(() => expectJavaScriptBytes(Buffer.from([1]))).toThrow();
  });

  it.each([
    ['numeric expression', '17', 17, '17'],
    ['array expression', '[0, 255]', [0, 255], '[0, 255]'],
    ['quoted text expression', '"A"', 'A', 'A'],
  ])('passes through a %s in both generated languages', (_label, expression, expected, pythonOutput) => {
    const program = generatePrintedBlockCode('data_value', { NUM: expression });
    let javascriptOutput: unknown;
    new Function('console', program.javascript)({ log: (value: unknown) => { javascriptOutput = value; } });
    expect(javascriptOutput).toEqual(expected);
    expect(runPython(program.python)).toBe(pythonOutput);
  });

  it.each([
    ['pq_power2round', 35],
    ['pq_decompose', 36],
    ['pq_make_hint', 39],
    ['pq_use_hint', 40],
    ['pq_sample_in_ball', 29],
  ])('cites the correct FIPS 204 algorithm for %s', (blockType, algorithm) => {
    const workspace = new Blockly.Workspace();
    try {
      expect(workspace.newBlock(blockType).getTooltip()).toContain(`FIPS 204 Algorithm ${algorithm}`);
    } finally {
      workspace.dispose();
    }
  });

  it('enforces ML-DSA-44 polynomial, hint, and seed input domains in both generators', () => {
    const zeroPolynomial = JSON.stringify(Array(256).fill(0));
    const outOfRangePolynomial = JSON.stringify([8380417, ...Array(255).fill(0)]);

    const invalidInputs = [
      ['pq_power2round', { INPUT: '[0]' }, {}],
      ['pq_decompose', { INPUT: outOfRangePolynomial }, {}],
      ['pq_make_hint', { Z: zeroPolynomial, R: '[0]' }, {}],
      ['pq_use_hint', { H: JSON.stringify(Array(256).fill(2)), R: zeroPolynomial }, {}],
      ['pq_sample_in_ball', { SEED: '[0]' }, {}],
      ['pq_sample_in_ball', { SEED: JSON.stringify([256, ...Array(31).fill(0)]) }, {}],
    ] as const;

    for (const [blockType, inputs, fields] of invalidInputs) {
      const program = generateBlockCode(blockType, inputs, fields);
      expect(() => evaluateJavaScript(program.javascript), blockType).toThrow();
      expect(() => evaluatePython(program.python), blockType).toThrow();
    }

    const validSample = generateBlockCode('pq_sample_in_ball', {
      SEED: JSON.stringify(Array.from({ length: 32 }, (_, i) => i)),
    });
    expect((evaluateJavaScript(validSample.javascript) as number[])).toHaveLength(256);
    expect(JSON.parse(evaluatePython(validSample.python))).toHaveLength(256);
  });

  it('converts bytes to an eight-bit-per-byte bit string in JavaScript', () => {
    const { javascript } = generateBlockCode('data_convert_bytes_to_bits', {
      BITS: 'bits',
      BYTES: 'data',
    });
    const result = new Function('data', `${javascript}\nreturn bits;`)(
      Uint8Array.from([0, 1, 127, 128, 255]),
    );
    expect(result).toBe('0000000000000001011111111000000011111111');
  });

  it('converts bytes to an eight-bit-per-byte bit string in Python', () => {
    const { python } = generateBlockCode('data_convert_bytes_to_bits', {
      BITS: 'bits',
      BYTES: 'data',
    });
    const result = runPython([
      'data = bytes([0, 1, 127, 128, 255])',
      'bits = ""',
      python,
      'print(bits)',
    ].join('\n'));
    expect(result).toBe('0000000000000001011111111000000011111111');
  });

  it('accepts every documented byte container and integral byte values', () => {
    const program = generateBlockCode('data_convert_bytes_to_bits', {
      BITS: 'bits',
      BYTES: 'data',
    });
    const expected = '000000000000000111111111';
    for (const data of [[0, 1, 255], [0.0, 1.0, 255.0], new Uint8Array([0, 1, 255]).buffer]) {
      expect(new Function('data', `${program.javascript}\nreturn bits;`)(data)).toBe(expected);
    }
    for (const data of ['bytes([0, 1, 255])', 'bytearray([0, 1, 255])', '[0, 1, 255]', '[0.0, 1.0, 255.0]']) {
      expect(runPython(`data = ${data}\nbits = ''\n${program.python}\nprint(bits)`)).toBe(expected);
    }
  });

  it.each([
    ['negative byte', [-1], '[-1]'],
    ['byte above 255', [256], '[256]'],
    ['fractional byte', [1.5], '[1.5]'],
    ['boolean byte', [true], '[True]'],
  ])('rejects %s instead of producing a malformed bit string', (_label, javascriptInput, pythonInput) => {
    const program = generateBlockCode('data_convert_bytes_to_bits', {
      BITS: 'bits',
      BYTES: 'data',
    });
    expect(() => new Function('data', `${program.javascript}\nreturn bits;`)(javascriptInput))
      .toThrow('byte must be an integer from 0 to 255');
    expect(capturePythonException(program.python, `data = ${pythonInput}\nbits = ''`))
      .toEqual({ type: 'ValueError', message: 'each byte must be an integer from 0 to 255' });
  });

  it('rejects unsupported byte containers with the declared error in both languages', () => {
    const program = generateBlockCode('data_convert_bytes_to_bits', {
      BITS: 'bits',
      BYTES: 'data',
    });
    expect(() => new Function('data', `${program.javascript}\nreturn bits;`)({ value: 1 }))
      .toThrow('value must be a byte sequence');
    expect(capturePythonException(program.python, "data = (0, 1)\nbits = ''"))
      .toEqual({ type: 'TypeError', message: 'value must be a byte sequence' });
  });

  it('evaluates the byte-source expression once in both languages', () => {
    const program = generateBlockCode('data_convert_bytes_to_bits', {
      BITS: 'bits',
      BYTES: 'next_bytes()',
    });
    let javascriptCalls = 0;
    const javascriptResult = new Function('next_bytes', `${program.javascript}\nreturn bits;`)(() => {
      javascriptCalls += 1;
      return Uint8Array.of(javascriptCalls);
    });
    expect(javascriptResult).toBe('00000001');
    expect(javascriptCalls).toBe(1);

    const pythonResult = runPython([
      'calls = 0',
      'def next_bytes():',
      '    global calls',
      '    calls += 1',
      '    return bytes([calls])',
      'bits = ""',
      program.python,
      'print(__import__("json").dumps([bits, calls]))',
    ].join('\n'));
    expect(JSON.parse(pythonResult)).toEqual(['00000001', 1]);
  });

  it('converts hexadecimal strings and rejects unsafe integers consistently', () => {
    const conversion = generateBlockCode('data_convert_to_int', { VAR: 'value' });
    const convertJavaScript = (value: unknown) =>
      new Function('value', `${conversion.javascript}\nreturn value;`)(value);
    const convertPython = (expression: string) =>
      Number(runPython(`value = ${expression}\n${conversion.python}\nprint(value)`));

    for (const [javascriptInput, pythonInput, expected] of [
      ['ff', "'ff'", 255],
      ['  -0x10 ', "'  -0x10 '", -16],
      [Uint8Array.from([1, 2]), 'bytes([1, 2])', 258],
      [12.9, '12.9', 12],
    ] as const) {
      expect(convertJavaScript(javascriptInput)).toBe(expected);
      expect(convertPython(pythonInput)).toBe(expected);
    }

    expect(() => convertJavaScript('1z')).toThrow();
    expect(() => runPython(`value = '1z'\n${conversion.python}\nprint(value)`)).toThrow();

    const jsUnsafe = generateBlockCode('data_convert_to_int', {
      VAR: 'value',
    });
    const pyUnsafe = generateBlockCode('data_convert_to_int', {
      VAR: 'value',
    });
    expect(() => new Function('value', jsUnsafe.javascript)(Uint8Array.from([32, 0, 0, 0, 0, 0, 0]))).toThrow();
    expect(() => runPython(`value = bytes([32, 0, 0, 0, 0, 0, 0])\n${pyUnsafe.python}`)).toThrow();
  });

  it('converts bit strings to bytes identically and rejects non-binary input', () => {
    const javascript = generateBlockCode('data_convert_bits_to_bytes', {
      BYTES: 'output', BITS: 'bits',
    }).javascript;
    const python = generateBlockCode('data_convert_bits_to_bytes', {
      BYTES: 'output', BITS: 'bits',
    }).python;
    const jsOutput = new Function('output', 'bits', `${javascript}\nreturn Array.from(output);`)(
      undefined, '101010101',
    );
    const pyOutput = runPython(`bits = '101010101'\noutput = b''\n${python}\nprint(__import__('json').dumps(list(output)))`);
    expect(jsOutput).toEqual([170, 1]);
    expect(JSON.parse(pyOutput)).toEqual([170, 1]);

    expect(() => new Function('output', 'bits', javascript)(undefined, '102')).toThrow();
    expect(() => runPython(`bits = '102'\noutput = b''\n${python}`)).toThrow();
  });

  it('rejects expressions and reserved words used as assignment targets', () => {
    const invalidTargets = [
      ['data_convert_to_int', { VAR: 'make_value()' }],
      ['data_convert_to_int', { VAR: 'for' }],
      ['data_convert_bits_to_bytes', { BYTES: 'make_bytes()', BITS: 'bits' }],
      ['data_convert_bytes_to_bits', { BITS: 'result()', BYTES: 'bytes' }],
    ] as const;

    for (const [type, inputs] of invalidTargets) {
      const workspace = new Blockly.Workspace();
      try {
        const block = workspace.newBlock(type);
        for (const [name, expression] of Object.entries(inputs)) {
          const value = workspace.newBlock('data_value');
          value.setFieldValue(expression, 'NUM');
          block.getInput(name)!.connection!.connect(value.outputConnection!);
        }
        expect(() => javascriptGenerator.workspaceToCode(workspace)).toThrow('must be a variable name');
        expect(() => pythonGenerator.workspaceToCode(workspace)).toThrow('must be a variable name');
      } finally {
        workspace.dispose();
      }
    }
  });

  it('accepts language-valid Unicode and JavaScript dollar variable names', () => {
    const program = generateBlockCode('data_convert_to_int', { VAR: '密钥' });
    const javascriptValue = new Function('密钥', `${program.javascript}\nreturn 密钥;`)('ff');
    const pythonValue = runPython(`密钥 = 'ff'\n${program.python}\nprint(密钥)`);
    expect(javascriptValue).toBe(255);
    expect(Number(pythonValue)).toBe(255);

    const javascriptDollar = generateCodeForLanguage('javascript', 'data_convert_to_int', { VAR: '$cache' });
    expect(new Function('$cache', `${javascriptDollar}\nreturn $cache;`)('ff')).toBe(255);

    const scriptSymbol = generateBlockCode('data_convert_to_int', { VAR: '℘value' });
    expect(new Function('℘value', `${scriptSymbol.javascript}\nreturn ℘value;`)('ff')).toBe(255);
    expect(Number(runPython(`℘value = 'ff'\n${scriptSymbol.python}\nprint(℘value)`))).toBe(255);

    const jsOnlyIdentifier = generateCodeForLanguage('javascript', 'data_convert_to_int', { VAR: '゛x' });
    expect(new Function('゛x', `${jsOnlyIdentifier}\nreturn ゛x;`)('ff')).toBe(255);
    expect(() => generateCodeForLanguage('python', 'data_convert_to_int', { VAR: '゛x' }))
      .toThrow('must be a variable name');
  });

  it('rejects immutable JavaScript globals but permits same-named Python variables', () => {
    for (const target of ['undefined', 'NaN', 'Infinity']) {
      const workspace = new Blockly.Workspace();
      try {
        const block = workspace.newBlock('data_convert_bytes_to_bits');
        for (const [name, expression] of [['BITS', target], ['BYTES', 'data']]) {
          const value = workspace.newBlock('data_value');
          value.setFieldValue(expression, 'NUM');
          block.getInput(name)!.connection!.connect(value.outputConnection!);
        }
        expect(() => javascriptGenerator.workspaceToCode(workspace)).toThrow('must be a variable name');

        const python = pythonGenerator.workspaceToCode(workspace);
        expect(runPython(`data = bytes([255])\n${target} = ''\n${python}\nprint(${target})`)).toBe('11111111');
      } finally {
        workspace.dispose();
      }
    }
  });

  it('embeds the seed-derived key block as an expression and returns unsigned words', () => {
    const program = generatePrintedBlockCode('cipher_key_from_seed');
    const bytes = Uint8Array.from({ length: 16 }, (_, i) => i + 0xF0);
    let javascriptOutput: unknown;
    new Function('data', 'console', program.javascript)(bytes, {
      log: (value: unknown) => { javascriptOutput = value; },
    });
    const pythonOutput = runPython(`data = bytes(range(240, 256))\n${program.python}`);
    const expected = [0xF0F1F2F3, 0xF4F5F6F7, 0xF8F9FAFB, 0xFCFDFEFF];
    expect(javascriptOutput).toEqual(expected);
    expect(JSON.parse(pythonOutput)).toEqual(expected);

    expect(() => new Function('data', 'console', program.javascript)(new Uint8Array(15), console)).toThrow();
    expect(() => runPython(`data = bytes(15)\n${program.python}`)).toThrow();
  });

  it('exposes the runtime seed as bytes and lowercase hexadecimal in both generators', () => {
    const bytesProgram = generatePrintedBlockCode('seed_bytes');
    const hexProgram = generatePrintedBlockCode('seed_hex');
    const seed = Uint8Array.from([0, 1, 127, 128, 255]);

    let javascriptBytes: unknown;
    new Function('data', 'console', bytesProgram.javascript)(seed, {
      log: (value: unknown) => { javascriptBytes = value; },
    });
    expectJavaScriptBytes(javascriptBytes);
    expect(Array.from(javascriptBytes as Uint8Array)).toEqual([0, 1, 127, 128, 255]);
    expect(runPython([
      'captured = []',
      'def print(value): captured.append(value)',
      'data = bytes([0, 1, 127, 128, 255])',
      bytesProgram.python,
      'value = captured[-1]',
      'assert type(value) is bytes',
      'assert value == bytes([0, 1, 127, 128, 255])',
    ].join('\n'))).toBe('');

    let javascriptHex: unknown;
    new Function('data', 'console', hexProgram.javascript)(seed, {
      log: (value: unknown) => { javascriptHex = value; },
    });
    expect(javascriptHex).toBe('00017f80ff');
    expect(runPython(`data = bytes([0, 1, 127, 128, 255])\n${hexProgram.python}`)).toBe('00017f80ff');
  });

  it.each([
    ['UTF-8 text', '"A猫"', '"A猫"', 32, 4],
    ['byte sequence', 'Uint8Array.from([0, 255])', 'bytes([0, 255])', 16, 2],
    ['32-bit number', '42', '42', 32, 4],
  ])('measures %s consistently in both languages', (_label, javascriptInput, pythonInput, bitLength, byteLength) => {
    for (const [blockType, expected] of [
      ['data_bit_length', bitLength],
      ['data_byte_length', byteLength],
    ] as const) {
      const program = generateBlockCode(blockType, { X: javascriptInput as string });
      const jsResult = new Function(`return ${expressionFromProgram(program.javascript)};`)();
      const pythonExpression = generateBlockCode(blockType, { X: pythonInput as string }).python;
      const pyResult = runPython(`print(${expressionFromProgram(pythonExpression)})`);
      expect(jsResult).toBe(expected);
      expect(Number(pyResult)).toBe(expected);
    }
  });

  it.each([
    [-7, 3, [-3, 2]],
    [7, -3, [-3, -2]],
    [-7, -3, [2, -1]],
  ])('uses floor divmod semantics for %i and %i in both languages', (left, right, expected) => {
    const program = generateBlockCode('nt_div_rem', { A: String(left), B: String(right) });
    expect(evaluateJavaScript(program.javascript)).toEqual(expected);
    expect(JSON.parse(evaluatePython(program.python))).toEqual(expected);
  });

  it('declares DivRem output as an integer pair', () => {
    const workspace = new Blockly.Workspace();
    try {
      const block = workspace.newBlock('nt_div_rem');
      expect(block.outputConnection!.getCheck()).toContain('IntList');
    } finally {
      workspace.dispose();
    }
  });

  it('returns a native integer list from DivRem in both languages', () => {
    const program = generateBlockCode('nt_div_rem', { A: '7', B: '3' });
    expect(Array.isArray(evaluateJavaScript(program.javascript))).toBe(true);

    const lines = program.python.trim().split('\n');
    const expression = lines.pop()!;
    expect(runPython([...lines, `value = ${expression}`, 'print(type(value).__name__)'].join('\n')))
      .toBe('list');
  });

  it('rejects division by zero in both languages', () => {
    const program = generateBlockCode('nt_div_rem', { A: '1', B: '0' });
    expect(() => evaluateJavaScript(program.javascript)).toThrow();
    expect(() => evaluatePython(program.python)).toThrow();
  });

  it.each([
    ['9007199254740991', '2', [4503599627370495, 1]],
    ['-9007199254740991', '3', [-3002399751580331, 2]],
  ])('computes exact safe-integer divmod for %s and %s in both languages', (left, right, expected) => {
    const program = generateBlockCode('nt_div_rem', { A: left, B: right });
    expect(evaluateJavaScript(program.javascript)).toEqual(expected);
    expect(JSON.parse(evaluatePython(program.python))).toEqual(expected);
  });

  it.each([
    ['100000000000000000000', '3'],
    ['9007199254740992', '3'],
    ['1.5', '2'],
  ])('rejects values outside the integer contract for %s and %s', (left, right) => {
    const program = generateBlockCode('nt_div_rem', { A: left, B: right });
    expect(() => evaluateJavaScript(program.javascript)).toThrow('safe integers');
    expect(() => evaluatePython(program.python)).toThrow('safe integers');
  });

  it.each([
    ['LEFT_SHIFT', '1', '32', 1],
    ['RIGHT_SHIFT', '2147483648', '33', 1073741824],
    ['LEFT_ROTATE', '2147483649', '33', 3],
    ['RIGHT_ROTATE', '2147483649', '-1', 3],
    ['LEFT_SHIFT', '1.5', '1.5', 2],
    ['AND', '-1', '305419896', 305419896],
    ['OR', '5', '2', 7],
    ['AND', '7.5', '3', 3],
    ['XOR', '-1', '0', 4294967295],
    ['AND', '9007199254740993', '4294967295', 0],
  ])('matches JavaScript 32-bit semantics for %s at boundary operands', (op, a, b, expected) => {
    const program = generateBlockCode('bit_operation', { A: a, B: b }, { OP: op });
    expect(evaluateJavaScript(program.javascript)).toBe(expected);
    expect(Number(evaluatePython(program.python))).toBe(expected);
  });

  it('computes 32-bit NOT identically for negative inputs', () => {
    for (const [input, expected] of [['-1', 0], ['1.5', 4294967294]] as const) {
      const program = generateBlockCode('bit_not32', { A: input });
      expect(evaluateJavaScript(program.javascript)).toBe(expected);
      expect(Number(evaluatePython(program.python))).toBe(expected);
    }
  });

  it('marks infix equality as Boolean and bitwise operations as Number', () => {
    const workspace = new Blockly.Workspace();
    try {
      const block = workspace.newBlock('bit_expr_infix');
      expect(block.outputConnection!.getCheck()).toContain('Number');
      block.setFieldValue('EQ', 'OP');
      expect(block.outputConnection!.getCheck()).toContain('Boolean');
      block.setFieldValue('XOR', 'OP');
      expect(block.outputConnection!.getCheck()).toContain('Number');
    } finally {
      workspace.dispose();
    }
  });

  it('returns a Boolean for infix equality in both generated languages', () => {
    const program = generateBlockCode('bit_expr_infix', { A: '7', B: '7' }, { OP: 'EQ' });
    expect(evaluateJavaScript(program.javascript)).toBe(true);
    expect(JSON.parse(evaluatePython(program.python))).toBe(true);
  });

  it.each([
    ['AND', 3],
    ['OR', 7],
    ['EQ', false],
  ])('executes infix %s consistently in both languages', (op, expected) => {
    const program = generateBlockCode('bit_expr_infix', { A: '7', B: '3' }, { OP: op });
    expect(evaluateJavaScript(program.javascript)).toBe(expected);
    expect(JSON.parse(evaluatePython(program.python))).toBe(expected);
  });

  it('truncates fractional bitwise operands consistently', () => {
    const program = generateBlockCode('bit_expr_infix', { A: '1.5', B: '3' }, { OP: 'XOR' });
    expect(evaluateJavaScript(program.javascript)).toBe(2);
    expect(Number(evaluatePython(program.python))).toBe(2);
  });

  it.each([
    ['bit_operation', { A: 'a', B: 'b' }, { OP: 'AND' }, 'a = float("nan")\nb = 3', [Number.NaN, 3], 0],
    ['bit_operation', { A: 'a', B: 'b' }, { OP: 'LEFT_SHIFT' }, 'a = 1\nb = float("inf")', [1, Number.POSITIVE_INFINITY], 1],
    ['bit_not32', { A: 'a' }, {}, 'a = float("inf")', [Number.POSITIVE_INFINITY], 0xFFFFFFFF],
    ['bit_expr_infix', { A: 'a', B: 'b' }, { OP: 'XOR' }, 'a = float("nan")\nb = 1', [Number.NaN, 1], 1],
  ])('maps non-finite operands to zero in both languages for %s', (type, inputs, fields, setup, javascriptValues, expected) => {
    const program = generateBlockCode(type, inputs, fields);
    const expression = expressionFromProgram(program.javascript);
    const javascriptValue = new Function('a', 'b', `return ${expression};`)(...javascriptValues);
    expect(javascriptValue).toBe(expected);
    expect(Number(evaluatePython(program.python, setup))).toBe(expected);
  });

  it.each([
    ['0x10', 16],
    ['0b10', 2],
    ['0o10', 8],
    ['-0x10', 0],
    ['1_0', 0],
    ['\u008510\u0085', 0],
    ['\u00a010\u00a0', 10],
    ['1.25e2', 125],
    ['', 0],
    ['Infinity', 0],
  ])('matches JavaScript 32-bit conversion for numeric string %s', (input, expected) => {
    const program = generateBlockCode('bit_operation', { A: 'a', B: '255' }, { OP: 'AND' });
    const javascriptValue = new Function('a', `return ${expressionFromProgram(program.javascript)};`)(input);
    expect(javascriptValue).toBe(expected);
    expect(Number(evaluatePython(program.python, `a = ${JSON.stringify(input)}`))).toBe(expected);
  });

  it('maps non-finite rotate inputs to zero in both languages', () => {
    const program = generateBlockCode('bit_rotate_left', { Input: 'a', Output: 'result' }, { bit: '8' });
    const javascriptValue = new Function('a', `${program.javascript}\nreturn result;`)(Number.POSITIVE_INFINITY);
    const pythonValue = runPython(`a = float("inf")\n${program.python}\nprint(result)`);
    expect(javascriptValue).toBe(0);
    expect(Number(pythonValue)).toBe(0);
  });

  it.each([
    ['bit_rotate_left', 0x34567812, {}],
    ['bit_rotate_right', 0x78123456, {}],
    ['bit_rotate_left_op', 0x26622e6a, { option: 'ROL32_XOR' }],
    ['bit_rotate_right_op', 0x8a468ace, { option: 'ROR32_ADD' }],
  ])('generates matching 32-bit rotate results for %s', (type, expected, fields) => {
    const program = generateBlockCode(type, { Input: '305419896.9', Output: 'result' }, {
      bit: '8',
      ...fields,
    });
    const javascriptValue = new Function(`${program.javascript}\nreturn result;`)();
    const pythonValue = runPython(`${program.python}\nprint(result)`);
    expect(javascriptValue).toBe(expected);
    expect(Number(pythonValue)).toBe(expected);
  });

  it.each([
    ['bit_rotate_left_op', 'ROL32_XOR', 0x26622e6a],
    ['bit_rotate_left_op', 'ROL32_AND', 0x10145010],
    ['bit_rotate_left_op', 'ROL32_OR', 0x36767e7a],
    ['bit_rotate_left_op', 'ROL32_ADD', 0x468ace8a],
    ['bit_rotate_right_op', 'ROR32_XOR', 0x6a26622e],
    ['bit_rotate_right_op', 'ROR32_AND', 0x10101450],
    ['bit_rotate_right_op', 'ROR32_OR', 0x7a36767e],
    ['bit_rotate_right_op', 'ROR32_ADD', 0x8a468ace],
  ])('executes rotate-combine option %s/%s in both languages', (type, option, expected) => {
    const program = generateBlockCode(type, {
      Input: '305419896', Output: 'result',
    }, { bit: '8', option });
    expect(new Function(`${program.javascript}\nreturn result;`)()).toBe(expected);
    expect(Number(runPython(`${program.python}\nprint(result)`))).toBe(expected);
  });

  it.each([
    ['bit_rotate_left', '0', 0x12345678, {}],
    ['bit_rotate_left', '31', 0x091a2b3c, {}],
    ['bit_rotate_right', '0', 0x12345678, {}],
    ['bit_rotate_right', '31', 0x2468acf0, {}],
    ['bit_rotate_left_op', '0', 0, { option: 'ROL32_XOR' }],
    ['bit_rotate_left_op', '31', 0x1b2e7d44, { option: 'ROL32_XOR' }],
    ['bit_rotate_right_op', '0', 0x2468acf0, { option: 'ROR32_ADD' }],
    ['bit_rotate_right_op', '31', 0x369d0368, { option: 'ROR32_ADD' }],
  ])('matches JavaScript at rotate field boundary %s bit %s', (type, bits, expected, fields) => {
    const program = generateBlockCode(type, { Input: '305419896', Output: 'result' }, {
      bit: bits,
      ...fields,
    });
    expect(new Function(`${program.javascript}\nreturn result;`)()).toBe(expected);
    expect(Number(runPython(`${program.python}\nprint(result)`))).toBe(expected);
  });

  it('rejects expressions and reserved words as rotate output targets in both languages', () => {
    for (const type of ['bit_rotate_left', 'bit_rotate_right', 'bit_rotate_left_op', 'bit_rotate_right_op']) {
      for (const target of ['make_value()', 'for']) {
        for (const language of ['javascript', 'python'] as const) {
          const workspace = new Blockly.Workspace();
          try {
            const block = workspace.newBlock(type);
            for (const [name, expression] of [['Input', '1'], ['Output', target]]) {
              const value = workspace.newBlock('data_value');
              value.setFieldValue(expression, 'NUM');
              block.getInput(name)!.connection!.connect(value.outputConnection!);
            }
            const generator = language === 'javascript' ? javascriptGenerator : pythonGenerator;
            expect(() => generator.workspaceToCode(workspace)).toThrow('must be a variable name');
          } finally {
            workspace.dispose();
          }
        }
      }
    }
  });

  it('computes a non-negative residue for a negative dividend', () => {
    const program = generateBlockCode('nt_mod', { A: '-7', B: '3' });
    expect(evaluateJavaScript(program.javascript)).toBe(2);
    expect(Number(evaluatePython(program.python))).toBe(2);
  });

  it('keeps modular arithmetic exact through the safe-integer boundary', () => {
    const program = generateBlockCode('nt_mod', { A: '9007199254740991', B: '7' });
    expect(evaluateJavaScript(program.javascript)).toBe(3);
    expect(Number(evaluatePython(program.python))).toBe(3);
  });

  it.each([
    ['9007199254740992', '7'],
    ['1.5', '7'],
    ['7', '1.5'],
  ])('rejects non-safe-integer modular operands %s mod %s in both languages', (a, n) => {
    const program = generateBlockCode('nt_mod', { A: a, B: n });
    expect(() => evaluateJavaScript(program.javascript)).toThrow('safe integers');
    expect(() => evaluatePython(program.python)).toThrow('safe integers');
  });

  it.each(['0', '-3'])('rejects non-positive modulus %s in both languages', (modulus) => {
    const program = generateBlockCode('nt_mod', { A: '7', B: modulus });
    expect(() => evaluateJavaScript(program.javascript)).toThrow();
    expect(() => evaluatePython(program.python)).toThrow();
  });

  it('computes modular powers for negative bases and exponents beyond 32 bits', () => {
    const program = generateBlockCode('nt_mod_pow', { A: '-2', B: '4294967296' });
    const expected = Number(runPython('print(pow(-2, 4294967296, 3329))'));
    expect(evaluateJavaScript(program.javascript)).toBe(expected);
    expect(Number(evaluatePython(program.python))).toBe(expected);
  });

  it('accepts integral numeric values and rejects fractional or negative exponents consistently', () => {
    const integral = generateBlockCode('nt_mod_pow', { A: '-2.0', B: '3.0' });
    expect(evaluateJavaScript(integral.javascript)).toBe(3321);
    expect(Number(evaluatePython(integral.python))).toBe(3321);

    for (const exponent of ['3.5', '-1']) {
      const invalid = generateBlockCode('nt_mod_pow', { A: '2', B: exponent });
      expect(() => evaluateJavaScript(invalid.javascript)).toThrow();
      expect(() => evaluatePython(invalid.python)).toThrow();
    }
  });

  it.each([
    ['0', [0, 0, 0, 7], [0, 0, 0, 2], [0, 0, 0, 9]],
    ['1', [0, 0, 0, 7], [0, 0, 0, 0], [0, 0, 0, 0]],
    ['2', [0, 0, 0, 0], [0, 0, 0, 2], [0, 0, 0, 9]],
    ['3', [0, 0, 0, 7], [0, 0, 0, 2], [0, 0, 0, 9]],
    ['4', [0, 0, 0, 7], [0, 0, 0, 0], [0, 0, 0, 0]],
    ['5', [0, 0, 0, 7], [0, 0, 0, 2], [0, 0, 0, 0]],
    ['6', [0, 0, 0, 7], [0, 0, 0, 0], [0, 0, 0, 9]],
  ])('encodes FIPS 205 ADRS type %s word fields in both languages', (type, keypair, word5, word6) => {
    const program = generateBlockCode('slh_adrs_full', {
      LAYER: '1', TREE: '5', KEYPAIR: '7', HEIGHT: '2', INDEX: '9',
    }, { TYPE: type });
    const javascriptAddress = Array.from(evaluateJavaScript(program.javascript) as Uint8Array);
    const pythonAddress = JSON.parse(evaluatePython(program.python)) as number[];
    for (const address of [javascriptAddress, pythonAddress]) {
      expect(address.slice(0, 4)).toEqual([0, 0, 0, 1]);
      expect(address.slice(4, 16)).toEqual([...Array(11).fill(0), 5]);
      expect(address.slice(16, 20)).toEqual([0, 0, 0, Number(type)]);
      expect(address.slice(20, 24)).toEqual(keypair);
      expect(address.slice(24, 28)).toEqual(word5);
      expect(address.slice(28, 32)).toEqual(word6);
    }
  });

  it('writes the simplified SLH address prefix at the FIPS 205 word offsets', () => {
    const program = generateBlockCode('slh_addr', {
      LAYER: '1', TREE: '5', LEAF: '9',
    }, { TYPE: '1' });
    const addresses = [
      Array.from(evaluateJavaScript(program.javascript) as Uint8Array),
      JSON.parse(evaluatePython(program.python)) as number[],
    ];
    for (const address of addresses) {
      expect(address.slice(0, 4)).toEqual([0, 0, 0, 1]);
      expect(address.slice(4, 16)).toEqual([...Array(11).fill(0), 5]);
      expect(address.slice(16, 20)).toEqual([0, 0, 0, 1]);
      expect(address.slice(20, 24)).toEqual([0, 0, 0, 9]);
      expect(address.slice(24)).toEqual(Array(8).fill(0));
    }
  });

  it('encodes multi-byte ADRS fields in big-endian order in both languages', () => {
    const program = generateBlockCode('slh_adrs_full', {
      LAYER: '16909060', TREE: '1108152157446', KEYPAIR: '16909060',
      HEIGHT: '16909060', INDEX: '84281096',
    }, { TYPE: '3' });
    const expected = [
      1, 2, 3, 4,
      0, 0, 0, 0, 0, 0, 1, 2, 3, 4, 5, 6,
      0, 0, 0, 3,
      1, 2, 3, 4,
      1, 2, 3, 4,
      5, 6, 7, 8,
    ];
    expect(Array.from(evaluateJavaScript(program.javascript) as Uint8Array)).toEqual(expected);
    expect(JSON.parse(evaluatePython(program.python))).toEqual(expected);
  });

  it('rejects malformed FORS teaching-variant verification inputs in both languages', () => {
    const zeroPublicKey = `[${Array(32).fill(0).join(', ')}]`;
    const invalidMessage = generateBlockCode('fors_verify', {
      PUBLIC_KEY: zeroPublicKey, MESSAGE: '[]', SIGNATURE: '[]',
    });
    expect(() => evaluateJavaScript(invalidMessage.javascript)).toThrow(/M must be 2 bytes/);
    expect(() => evaluatePython(invalidMessage.python)).toThrow();

    const invalidSignature = generateBlockCode('fors_verify', {
      PUBLIC_KEY: zeroPublicKey, MESSAGE: '[0, 0]', SIGNATURE: '[]',
    });
    expect(() => evaluateJavaScript(invalidSignature.javascript)).toThrow(/signature must be 640 bytes/);
    expect(() => evaluatePython(invalidSignature.python)).toThrow();

    const invalidPublicKey = generateBlockCode('fors_verify', {
      PUBLIC_KEY: '[0]', MESSAGE: '[0, 0]', SIGNATURE: '[]',
    });
    expect(() => evaluateJavaScript(invalidPublicKey.javascript)).toThrow(/public key must be 32 bytes/);
    expect(() => evaluatePython(invalidPublicKey.python)).toThrow();
  });

  it('enforces the FORS teaching seed and byte-array contracts in both languages', () => {
    for (const blockType of ['fors_sign', 'fors_pk_from_sk']) {
      const input: Record<string, string> = blockType === 'fors_sign'
        ? { SK_SEED: '[1]', MESSAGE: '[0, 0]' }
        : { SK_SEED: '[1]' };
      const program = generateBlockCode(blockType, input);
      expect(() => evaluateJavaScript(program.javascript)).toThrow(/seed must be 32 bytes/);
      expect(() => evaluatePython(program.python)).toThrow();
    }

    for (const byteArray of ['[256]', '[-1]', '[1.5]']) {
      const invalidByte = generateBlockCode('fors_sign', {
        SK_SEED: byteArray, MESSAGE: '[0, 0]',
      });
      expect(() => evaluateJavaScript(invalidByte.javascript)).toThrow(/integers from 0 to 255/);
      expect(() => evaluatePython(invalidByte.python)).toThrow();
    }

    const invalidJavaScriptBoolean = generateBlockCode('fors_sign', {
      SK_SEED: '[true]', MESSAGE: '[0, 0]',
    });
    expect(() => evaluateJavaScript(invalidJavaScriptBoolean.javascript)).toThrow(/integers from 0 to 255/);
    const sparseJavaScriptArray = generateBlockCode('fors_sign', {
      SK_SEED: 'Array(32)', MESSAGE: '[0, 0]',
    });
    expect(() => evaluateJavaScript(sparseJavaScriptArray.javascript)).toThrow(/integers from 0 to 255/);
    const invalidPythonBoolean = generateBlockCode('fors_sign', {
      SK_SEED: '[True]', MESSAGE: '[0, 0]',
    });
    expect(() => evaluatePython(invalidPythonBoolean.python)).toThrow();
    const unsupportedPythonView = generateBlockCode('fors_sign', {
      SK_SEED: 'memoryview(bytes(32))', MESSAGE: 'bytes([0, 0])',
    });
    expect(() => evaluatePython(unsupportedPythonView.python)).toThrow();

    const validPublicKey = `[${Array(32).fill(0).join(', ')}]`;
    const integralFloatByte = generateBlockCode('fors_verify', {
      PUBLIC_KEY: validPublicKey, MESSAGE: '[0, 0]', SIGNATURE: '[1.0]',
    });
    expect(() => evaluateJavaScript(integralFloatByte.javascript)).toThrow(/signature must be 640 bytes/);
    const pythonLines = integralFloatByte.python.trim().split('\n');
    const pythonExpression = pythonLines.pop()!;
    const pythonError = runPython([
      ...pythonLines,
      'try:',
      `    ${pythonExpression}`,
      'except Exception as exc:',
      '    print(str(exc))',
    ].join('\n'));
    expect(pythonError).toBe('FORS teaching signature must be 640 bytes');
  });

  it.each([
    ['LAYER', '-1'],
    ['TREE', '9007199254740992'],
    ['KEYPAIR', '4294967296'],
    ['HEIGHT', '1.5'],
  ])('rejects out-of-range ADRS input %s=%s in both languages', (name, value) => {
    const invalidProgram = generateBlockCode('slh_adrs_full', {
      LAYER: '0', TREE: '0', KEYPAIR: '0', HEIGHT: '0', INDEX: '0', [name]: value,
    }, { TYPE: '3' });
    expect(() => evaluateJavaScript(invalidProgram.javascript)).toThrow();
    expect(() => evaluatePython(invalidProgram.python)).toThrow();
  });

  it('accepts the same integral floating-point ADRS inputs in both languages', () => {
    const program = generateBlockCode('slh_adrs_full', {
      LAYER: '2.0', TREE: '5', KEYPAIR: '7', HEIGHT: '2.0', INDEX: '9',
    }, { TYPE: '3' });
    expect(Array.from(evaluateJavaScript(program.javascript) as Uint8Array)).toEqual(
      JSON.parse(evaluatePython(program.python)),
    );
  });

  it.each([
    ['bn_add', '[0xffffffff, 1]', '[2]', [1, 2]],
    ['bn_sub', '[0xffffffff, 1]', '[2]', [0xfffffffd, 1]],
    ['bn_mul', '[0xffffffff, 1]', '[2]', [0xfffffffe, 3]],
    ['bn_div', '[0xffffffff, 1]', '[2]', [0xffffffff]],
  ])('implements %s over unsigned little-endian 32-bit limbs in both languages', (type, left, right, expected) => {
    const program = generateBlockCode(type, { A: left, B: right });
    expect(evaluateJavaScript(program.javascript)).toEqual(expected);
    expect(JSON.parse(evaluatePython(program.python))).toEqual(expected);
  });

  it('multiplies multi-limb operands with cross-limb carries in both languages', () => {
    const program = generateBlockCode('bn_mul', {
      A: '[0xffffffff, 0xffffffff]',
      B: '[0xffffffff, 0xffffffff]',
    });
    expect(evaluateJavaScript(program.javascript)).toEqual([1, 0, 0xfffffffe, 0xffffffff]);
    expect(JSON.parse(evaluatePython(program.python))).toEqual([1, 0, 0xfffffffe, 0xffffffff]);
  });

  it.each([
    ['[0xffffffff, 2]', '[1, 1]', [2]],
    ['[0xffffffff]', '[0, 1]', [0]],
  ])('divides multi-limb values and handles a remainder for %s / %s in both languages', (left, right, expected) => {
    const program = generateBlockCode('bn_div', { A: left, B: right });
    expect(evaluateJavaScript(program.javascript)).toEqual(expected);
    expect(JSON.parse(evaluatePython(program.python))).toEqual(expected);
  });

  it('rejects unsigned big-number subtraction underflow in both languages', () => {
    const program = generateBlockCode('bn_sub', { A: '[1]', B: '[2]' });
    expect(() => evaluateJavaScript(program.javascript)).toThrow();
    expect(() => evaluatePython(program.python)).toThrow();
  });

  it.each(['[1.5]', '[-1]', '[4294967296]'])(
    'rejects invalid unsigned 32-bit big-number limb input %s in both languages',
    (limbs) => {
      for (const type of ['bn_add', 'bn_sub', 'bn_mul', 'bn_div']) {
        const program = generateBlockCode(type, { A: limbs, B: '[1]' });
        expect(() => evaluateJavaScript(program.javascript)).toThrow();
        expect(() => evaluatePython(program.python)).toThrow();
      }
    },
  );

  it.each(['bn_add', 'bn_sub', 'bn_mul', 'bn_div'])('%s rejects non-list operands and division by zero', (type) => {
    const invalid = generateBlockCode(type, { A: '42', B: '[1]' });
    expect(() => evaluateJavaScript(invalid.javascript)).toThrow();
    expect(() => evaluatePython(invalid.python)).toThrow();

    if (type === 'bn_div') {
      const zero = generateBlockCode(type, { A: '[1]', B: '[]' });
      expect(() => evaluateJavaScript(zero.javascript)).toThrow();
      expect(() => evaluatePython(zero.python)).toThrow();

      const normalizedZero = generateBlockCode(type, { A: '[1]', B: '[0]' });
      expect(() => evaluateJavaScript(normalizedZero.javascript)).toThrow();
      expect(() => evaluatePython(normalizedZero.python)).toThrow();
    }
  });

  it('rejects tuple input for Python big-number limbs', () => {
    const program = generateBlockCode('bn_add', { A: 'limbs', B: '[1]' });
    expect(() => evaluatePython(program.python, 'limbs = (1,)'))
      .toThrow('big-number limbs must be a list');
  });

  it.each(['Y#Q==', 'Y Q==', 'YQ', 'Y=Q='])('rejects invalid alphabet or padding in Base64 input %s in both languages', (input) => {
    const program = generateBlockCode('base64_decode', { INPUT: JSON.stringify(input) });
    expect(() => evaluateJavaScript(program.javascript)).toThrow();
    expect(() => evaluatePython(program.python)).toThrow();
  });

  it('decodes valid RFC 4648 Base64 consistently in both languages', () => {
    const program = generateBlockCode('base64_decode', { INPUT: '"YWJj"' });
    const javascriptBytes = evaluateJavaScript(program.javascript);
    expectJavaScriptBytes(javascriptBytes);
    expect(Array.from(javascriptBytes as Uint8Array)).toEqual([97, 98, 99]);
    expectPythonBytes(program.python, [97, 98, 99]);
  });

  it('accepts non-zero unused Base64 pad bits in both languages', () => {
    const program = generateBlockCode('base64_decode', { INPUT: '"Zh=="' });
    const javascriptBytes = evaluateJavaScript(program.javascript);
    expectJavaScriptBytes(javascriptBytes);
    expect(Array.from(javascriptBytes as Uint8Array)).toEqual([0x66]);
    expectPythonBytes(program.python, [0x66]);
  });

  it('decodes strict even-length hexadecimal strings consistently in both languages', () => {
    const program = generateBlockCode('hex_to_bytes', { INPUT: '"00a1FF"' });
    const javascriptBytes = evaluateJavaScript(program.javascript);
    expectJavaScriptBytes(javascriptBytes);
    expect(Array.from(javascriptBytes as Uint8Array)).toEqual([0, 0xa1, 0xff]);
    expectPythonBytes(program.python, [0, 0xa1, 0xff]);

    const empty = generateBlockCode('hex_to_bytes', { INPUT: '""' });
    const emptyJavascriptBytes = evaluateJavaScript(empty.javascript);
    expectJavaScriptBytes(emptyJavascriptBytes);
    expect(Array.from(emptyJavascriptBytes as Uint8Array)).toEqual([]);
    expectPythonBytes(empty.python, []);
  });

  it.each(['1', '0g', 'g0', '0x12', '12 34', 'a\n', 'a\r', 'a\u2028', 'a\u2029', 123])(
    'rejects malformed hexadecimal input %s in both languages',
    (input) => {
      const program = generateBlockCode('hex_to_bytes', { INPUT: JSON.stringify(input) });
      expect(() => evaluateJavaScript(program.javascript)).toThrow();
      expect(() => evaluatePython(program.python)).toThrow();
    },
  );

  it.each([
    { bytes: [], base64: '' },
    { bytes: [0x66], base64: 'Zg==' },
    { bytes: [0x66, 0x6f], base64: 'Zm8=' },
    { bytes: [0x66, 0x6f, 0x6f], base64: 'Zm9v' },
    { bytes: [0x66, 0x6f, 0x6f, 0x62], base64: 'Zm9vYg==' },
    { bytes: [0x66, 0x6f, 0x6f, 0x62, 0x61], base64: 'Zm9vYmE=' },
    { bytes: [0x66, 0x6f, 0x6f, 0x62, 0x61, 0x72], base64: 'Zm9vYmFy' },
  ])('round-trips RFC 4648 Base64 vector $base64 in both languages', ({ bytes, base64 }) => {
    const javascript = generateCodeForLanguage('javascript', 'base64_encode', {
      INPUT: `Uint8Array.from(${JSON.stringify(bytes)})`,
    });
    const python = generateCodeForLanguage('python', 'base64_encode', {
      INPUT: `bytes(${JSON.stringify(bytes)})`,
    });
    expect(evaluateJavaScript(javascript)).toBe(base64);
    expect(JSON.parse(evaluatePython(python))).toBe(base64);

    const decoded = generateBlockCode('base64_decode', { INPUT: JSON.stringify(base64) });
    expect(Array.from(evaluateJavaScript(decoded.javascript) as Uint8Array)).toEqual(bytes);
    expect(JSON.parse(evaluatePython(decoded.python))).toEqual(bytes);
  });

  it('evaluates a JavaScript Base64 input expression only once', () => {
    const javascript = generateCodeForLanguage('javascript', 'base64_encode', { INPUT: 'getBytes()' });
    let calls = 0;
    const encoded = new Function('getBytes', `return ${expressionFromProgram(javascript)};`)(() => {
      calls += 1;
      return Uint8Array.from([0x66]);
    });

    expect(encoded).toBe('Zg==');
    expect(calls).toBe(1);
  });

  it.each([
    { bytes: [], hex: '' },
    { bytes: [0, 10, 255], hex: '000aff' },
  ])('encodes $bytes as lowercase hexadecimal in both languages', ({ bytes, hex }) => {
    const javascriptHex = generateCodeForLanguage('javascript', 'bytes_to_hex', {
      INPUT: `Uint8Array.from(${JSON.stringify(bytes)})`,
    });
    const pythonHex = generateCodeForLanguage('python', 'bytes_to_hex', {
      INPUT: `bytes(${JSON.stringify(bytes)})`,
    });
    expect(evaluateJavaScript(javascriptHex)).toBe(hex);
    expect(JSON.parse(evaluatePython(pythonHex))).toBe(hex);
  });

  it('encodes large byte sequences as Base64 in both languages', () => {
    const javascript = generateCodeForLanguage('javascript', 'base64_encode', {
      INPUT: 'Uint8Array.from({length: 200000}, (_, index) => index & 255)',
    });
    const python = generateCodeForLanguage('python', 'base64_encode', {
      INPUT: 'bytes(range(256)) * 781 + bytes(range(64))',
    });
    const expected = Buffer.from(Uint8Array.from({ length: 200_000 }, (_, index) => index & 255)).toString('base64');

    expect(evaluateJavaScript(javascript)).toBe(expected);
    expect(JSON.parse(evaluatePython(python))).toBe(expected);
  });

  it('reverses endian-swap input order in both languages', () => {
    const javascript = generateCodeForLanguage('javascript', 'endian_swap', { INPUT: 'items' });
    const original = [1, 2, 3, 4];
    const reversed = new Function('items', `return ${expressionFromProgram(javascript)};`)(original);
    expect(reversed).toEqual([4, 3, 2, 1]);
    expect(original).toEqual([1, 2, 3, 4]);

    const python = generateCodeForLanguage('python', 'endian_swap', { INPUT: 'items' });
    const result = runPython([
      'items = [1, 2, 3, 4]',
      `reversed_items = ${expressionFromProgram(python)}`,
      'print(__import__("json").dumps([reversed_items, items]))',
    ].join('\n'));
    expect(JSON.parse(result)).toEqual([[4, 3, 2, 1], [1, 2, 3, 4]]);
  });

  it('rejects zero and empty polynomial divisors in GF(2), GF(2^8), and Goppa paths', () => {
    for (const divisor of ['[0]', '[]']) {
      for (const blockType of ['gf2_poly_div', 'gf2_poly_mod', 'gf2m_poly_mod']) {
        const program = generateBlockCode(blockType, { A: '[1]', B: divisor });
        if (divisor === '[]') {
          expectJavaScriptToThrowWithoutHanging(program.javascript, 'polynomial divisor must be nonzero');
        } else {
          expect(() => evaluateJavaScript(program.javascript)).toThrow();
        }
        expect(() => evaluatePython(program.python)).toThrow();
      }

      const goppa = generateBlockCode('goppa_decode', { Y: '[]', G: divisor, L: '[]' });
      if (divisor === '[]') {
        expectJavaScriptToThrowWithoutHanging(goppa.javascript, 'polynomial divisor must be nonzero');
      } else {
        expect(() => evaluateJavaScript(goppa.javascript)).toThrow();
      }
      expect(() => evaluatePython(goppa.python)).toThrow();
    }
  });

  it('requires equal vector lengths for Hamming distance in both languages', () => {
    const valid = generateBlockCode('ham_dist', { X: '[0, 1]', Y: '[1, 1]' });
    expect(evaluateJavaScript(valid.javascript)).toBe(1);
    expect(JSON.parse(evaluatePython(valid.python))).toBe(1);

    const invalid = generateBlockCode('ham_dist', { X: '[0, 1]', Y: '[0]' });
    expect(() => evaluateJavaScript(invalid.javascript)).toThrow();
    expect(() => evaluatePython(invalid.python)).toThrow();
  });

  it.each(['pq_ntt', 'pq_intt'])('%s rejects unsupported ML-DSA NTT sizes consistently', (blockType) => {
    for (const [degree, length] of [['128', 128], ['256', 255]] as const) {
      const program = generateBlockCode(blockType, {
        INPUT: JSON.stringify(Array(length).fill(0)),
      }, { MODULUS: '8380417', DEGREE: degree });
      expect(() => evaluateJavaScript(program.javascript)).toThrow();
      expect(() => evaluatePython(program.python)).toThrow();
    }
  });

  it.each(['pq_ntt', 'pq_intt'])('%s rejects ML-KEM degrees and lengths other than 256', (blockType) => {
    for (const [degree, length] of [['128', 128], ['256', 128], ['256', 255], ['256', 257]] as const) {
      const program = generateBlockCode(blockType, {
        INPUT: JSON.stringify(Array(length).fill(1)),
      }, { MODULUS: '3329', DEGREE: degree });
      expect(() => evaluateJavaScript(program.javascript)).toThrow();
      expect(() => evaluatePython(program.python)).toThrow();
    }
  });

  it('rejects non-256 ML-KEM half-NTT multiplication inputs', () => {
    for (const [aLength, bLength] of [[255, 256], [256, 255], [257, 256], [256, 257]]) {
      const program = generateBlockCode('pq_ntt_mul', {
        A: JSON.stringify(Array(aLength).fill(1)),
        B: JSON.stringify(Array(bLength).fill(2)),
      }, { MODULUS: '3329' });
      expect(() => evaluateJavaScript(program.javascript)).toThrow();
      expect(() => evaluatePython(program.python)).toThrow();
    }
  });

  it('executes scalar modular matrix-vector multiplication from the Blockly block in both languages', () => {
    for (const modulus of ['3329', '8380417']) {
      const ordinary = generateBlockCode('pq_mat_vec_mul', {
        MATRIX: '[1, 2, 3, 4]',
        VEC: '[1, 2]',
      }, { MODULUS: modulus });
      expect(evaluateJavaScript(ordinary.javascript)).toEqual([5, 11]);
      expect(JSON.parse(evaluatePython(ordinary.python))).toEqual([5, 11]);
    }

    const negative = generateBlockCode('pq_mat_vec_mul', {
      MATRIX: '[-1, 0, 0, 0]',
      VEC: '[1, 0]',
    }, { MODULUS: '3329' });
    expect(evaluateJavaScript(negative.javascript)).toEqual([3328, 0]);
    expect(JSON.parse(evaluatePython(negative.python))).toEqual([3328, 0]);

    const integralFloats = generateBlockCode('pq_mat_vec_mul', {
      MATRIX: '[1.0, 2, 3, 4]',
      VEC: '[1, 2.0]',
    }, { MODULUS: '3329' });
    expect(evaluateJavaScript(integralFloats.javascript)).toEqual([5, 11]);
    expect(JSON.parse(evaluatePython(integralFloats.python))).toEqual([5, 11]);
  });

  it('rejects malformed scalar matrix-vector shapes and non-integer entries in both languages', () => {
    for (const [matrix, vector] of [
      ['[1, 2, 3]', '[1, 2]'],
      ['[1, 2, 3, 4, 5]', '[1, 2]'],
      ['[1.5, 0, 0, 1]', '[1, 2]'],
      ['[1, 2, 3, 4]', '[1.5, 2]'],
      ['[9007199254740992, 0, 0, 1]', '[1, 2]'],
    ]) {
      const program = generateBlockCode('pq_mat_vec_mul', {
        MATRIX: matrix,
        VEC: vector,
      }, { MODULUS: '3329' });
      expect(() => evaluateJavaScript(program.javascript)).toThrow();
      expect(() => evaluatePython(program.python)).toThrow();
    }
  });

  it('rejects boolean scalar matrix-vector coefficients in both generated languages', () => {
    const cases = [
      { matrixJs: '[true, 0, 0, 1]', matrixPy: '[True, 0, 0, 1]', vectorJs: '[1, 2]', vectorPy: '[1, 2]', message: 'matrix entries must be safe integers' },
      { matrixJs: '[1, 2, 3, 4]', matrixPy: '[1, 2, 3, 4]', vectorJs: '[1, false]', vectorPy: '[1, False]', message: 'vector entries must be safe integers' },
    ];
    for (const { matrixJs, matrixPy, vectorJs, vectorPy, message } of cases) {
      const javascript = generateCodeForLanguage('javascript', 'pq_mat_vec_mul', {
        MATRIX: matrixJs, VEC: vectorJs,
      }, { MODULUS: '3329' });
      const python = generateCodeForLanguage('python', 'pq_mat_vec_mul', {
        MATRIX: matrixPy, VEC: vectorPy,
      }, { MODULUS: '3329' });
      expect(() => evaluateJavaScript(javascript)).toThrow(message);
      expect(() => evaluatePython(python)).toThrow(message);
    }
  });

  it.each(['pq_poly_add', 'pq_poly_sub'])('%s requires full 256-coefficient Rq polynomials', (blockType) => {
    for (const modulus of ['3329', '8380417']) {
      const valid = generateBlockCode(blockType, {
        A: JSON.stringify(Array(256).fill(1)),
        B: JSON.stringify(Array(256).fill(2)),
      }, { MODULUS: modulus });
      const expected = blockType === 'pq_poly_add' ? 3 : Number(modulus) - 1;
      expect((evaluateJavaScript(valid.javascript) as number[])).toEqual(Array(256).fill(expected));
      expect(JSON.parse(evaluatePython(valid.python))).toEqual(Array(256).fill(expected));

      for (const [aLength, bLength] of [[255, 256], [256, 255], [257, 256], [256, 257]]) {
        const invalid = generateBlockCode(blockType, {
          A: JSON.stringify(Array(aLength).fill(1)),
          B: JSON.stringify(Array(bLength).fill(2)),
        }, { MODULUS: modulus });
        expect(() => evaluateJavaScript(invalid.javascript)).toThrow();
        expect(() => evaluatePython(invalid.python)).toThrow();
      }
    }
  });

  it.each(['3329', '8380417'])('normalizes negative coefficients in pq_poly_add for q=%s', (modulus) => {
    const input = generateBlockCode('pq_poly_add', {
      A: JSON.stringify([-1, ...Array(255).fill(0)]),
      B: JSON.stringify(Array(256).fill(0)),
    }, { MODULUS: modulus });
    const expected = [Number(modulus) - 1, ...Array(255).fill(0)];
    expect(evaluateJavaScript(input.javascript)).toEqual(expected);
    expect(JSON.parse(evaluatePython(input.python))).toEqual(expected);
  });

  it.each(['pq_poly_add', 'pq_poly_sub'])('keeps safe-integer residues exact in %s', (blockType) => {
    for (const modulus of ['3329', '8380417']) {
      const a = [Number.MAX_SAFE_INTEGER, ...Array(255).fill(0)];
      const b = [2, ...Array(255).fill(0)];
      const input = generateBlockCode(blockType, {
        A: JSON.stringify(a),
        B: JSON.stringify(blockType === 'pq_poly_add' ? b : b.map((value) => -value)),
      }, { MODULUS: modulus });
      const expected = [Number((BigInt(Number.MAX_SAFE_INTEGER) + 2n) % BigInt(modulus)), ...Array(255).fill(0)];

      expect(evaluateJavaScript(input.javascript)).toEqual(expected);
      expect(JSON.parse(evaluatePython(input.python))).toEqual(expected);
    }
  });

  it.each(['pq_poly_add', 'pq_poly_sub'])('normalizes integral floats and rejects invalid coefficients in %s', (blockType) => {
    const tail = Array(255).fill(0).join(',');
    const integral = generateBlockCode(blockType, {
      A: `[1.0,${tail}]`,
      B: `[2.0,${tail}]`,
    }, { MODULUS: '3329' });
    const integralExpected = [blockType === 'pq_poly_add' ? 3 : 3328, ...Array(255).fill(0)];
    expect(evaluateJavaScript(integral.javascript)).toEqual(integralExpected);
    expect(JSON.parse(evaluatePython(integral.python))).toEqual(integralExpected);

    const zeroes = JSON.stringify(Array(256).fill(0));
    for (const first of [Number.MAX_SAFE_INTEGER + 1, 1.5]) {
      const invalid = generateBlockCode(blockType, {
        A: JSON.stringify([first, ...Array(255).fill(0)]),
        B: zeroes,
      }, { MODULUS: '3329' });
      expect(() => evaluateJavaScript(invalid.javascript)).toThrow('coefficients must be safe integers');
      expect(() => evaluatePython(invalid.python)).toThrow('coefficients must be safe integers');
    }

    const javascript = generateCodeForLanguage('javascript', blockType, {
      A: `[true,${Array(255).fill(0).join(',')}]`, B: zeroes,
    }, { MODULUS: '3329' });
    const python = generateCodeForLanguage('python', blockType, {
      A: `[True,${Array(255).fill(0).join(',')}]`, B: zeroes,
    }, { MODULUS: '3329' });
    expect(() => evaluateJavaScript(javascript)).toThrow('polynomial coefficients must be safe integers');
    expect(() => evaluatePython(python)).toThrow('polynomial coefficients must be safe integers');
  });

  it('executes pq_poly_mul as coefficient convolution with matching modular residues', () => {
    const product = generateBlockCode('pq_poly_mul', {
      A: '[1, 2, 3]',
      B: '[4, 5]',
    });
    expect(evaluateJavaScript(product.javascript)).toEqual([4, 13, 22, 15]);
    expect(JSON.parse(evaluatePython(product.python))).toEqual([4, 13, 22, 15]);

    const integralFloat = generateBlockCode('pq_poly_mul', {
      A: '[1.0]',
      B: '[2.0]',
    });
    expect(evaluateJavaScript(integralFloat.javascript)).toEqual([2]);
    expect(JSON.parse(evaluatePython(integralFloat.python))).toEqual([2]);

    const negative = generateBlockCode('pq_poly_mul', {
      A: '[-1, 2]',
      B: '[1, -1]',
    }, { MODULUS: '3329' });
    expect(evaluateJavaScript(negative.javascript)).toEqual([3328, 3, 3327]);
    expect(JSON.parse(evaluatePython(negative.python))).toEqual([3328, 3, 3327]);

    const reduced = generateBlockCode('pq_poly_mul', {
      A: '[2000, 2000]',
      B: '[2, 2]',
    }, { MODULUS: '3329' });
    expect(evaluateJavaScript(reduced.javascript)).toEqual([671, 1342, 671]);
    expect(JSON.parse(evaluatePython(reduced.python))).toEqual([671, 1342, 671]);

    const maxSafe = generateBlockCode('pq_poly_mul', {
      A: '[9007199254740991]',
      B: '[1]',
    });
    expect(evaluateJavaScript(maxSafe.javascript)).toEqual([Number.MAX_SAFE_INTEGER]);
    expect(JSON.parse(evaluatePython(maxSafe.python))).toEqual([Number.MAX_SAFE_INTEGER]);

    const largeModular = generateBlockCode('pq_poly_mul', {
      A: '[9007199254740991]',
      B: '[9007199254740991]',
    }, { MODULUS: '3329' });
    const residue = BigInt(Number.MAX_SAFE_INTEGER) % 3329n;
    const expectedModular = Number((residue * residue) % 3329n);
    expect(evaluateJavaScript(largeModular.javascript)).toEqual([expectedModular]);
    expect(JSON.parse(evaluatePython(largeModular.python))).toEqual([expectedModular]);

    for (const [a, b] of [
      ['[9007199254740992]', '[1]'],
      ['[9007199254740991]', '[3]'],
      ['[1.5]', '[2]'],
      ['[9007199254740991, 1]', '[1, 1]'],
    ]) {
      const invalid = generateBlockCode('pq_poly_mul', { A: a, B: b });
      expect(() => evaluateJavaScript(invalid.javascript)).toThrow();
      expect(() => evaluatePython(invalid.python)).toThrow();
    }

    const javascriptBoolean = generateCodeForLanguage('javascript', 'pq_poly_mul', { A: '[true]', B: '[2]' });
    const pythonBoolean = generateCodeForLanguage('python', 'pq_poly_mul', { A: '[True]', B: '[2]' });
    expect(() => evaluateJavaScript(javascriptBoolean)).toThrow('coefficients must be safe integers');
    expect(() => evaluatePython(pythonBoolean)).toThrow('coefficients must be safe integers');

    const noQuotient = generateBlockCode('pq_poly_mul', {
      A: JSON.stringify([...Array(255).fill(0), 1]),
      B: '[0, 1]',
    });
    const jsProduct = evaluateJavaScript(noQuotient.javascript) as number[];
    const pythonProduct = JSON.parse(evaluatePython(noQuotient.python)) as number[];
    expect(jsProduct).toHaveLength(257);
    expect(pythonProduct).toHaveLength(257);
    expect(jsProduct[256]).toBe(1);
    expect(pythonProduct[256]).toBe(1);

    const zero = generateBlockCode('pq_poly_mul', { A: '[]', B: '[]' });
    expect(evaluateJavaScript(zero.javascript)).toEqual([]);
    expect(JSON.parse(evaluatePython(zero.python))).toEqual([]);
  });

  it('requires equal dimensions for vector dot products in both generators', () => {
    const valid = generateBlockCode('vec_dot', { A: '[1, 2]', B: '[3, 4]' });
    expect(evaluateJavaScript(valid.javascript)).toBe(11);
    expect(JSON.parse(evaluatePython(valid.python))).toBe(11);

    for (const [a, b] of [['[1, 2]', '[3]'], ['[1]', '[2, 3]']]) {
      const invalid = generateBlockCode('vec_dot', { A: a, B: b });
      expect(() => evaluateJavaScript(invalid.javascript)).toThrow();
      expect(() => evaluatePython(invalid.python)).toThrow();
    }
  });

  it('computes combinations exactly through the safe-number range in both generators', () => {
    for (const [n, k, expected] of [
      ['10', '3', 120],
      ['56', '28', 7648690600760440],
    ] as const) {
      const program = generateBlockCode('comb', { N: n, K: k });
      expect(evaluateJavaScript(program.javascript)).toBe(expected);
      expect(JSON.parse(evaluatePython(program.python))).toBe(expected);
    }

    for (const [n, k] of [['60', '30'], ['1.5', '1'], ['9007199254740992', '1']]) {
      const invalid = generateBlockCode('comb', { N: n, K: k });
      expect(() => evaluateJavaScript(invalid.javascript)).toThrow();
      expect(() => evaluatePython(invalid.python)).toThrow();
    }
  });

  it('maps the ML-KEM constant polynomial to its half-NTT representation in both languages', () => {
    const impulse = JSON.stringify([1, ...Array(255).fill(0)]);
    const program = generateBlockCode('pq_ntt', { INPUT: impulse }, {
      MODULUS: '3329',
      DEGREE: '256',
    });
    const expected = Array.from({ length: 256 }, (_, index) => index % 2 === 0 ? 1 : 0);
    expect(evaluateJavaScript(program.javascript)).toEqual(expected);
    expect(JSON.parse(evaluatePython(program.python))).toEqual(expected);
  });

  it.each([
    ['ct', [148, 3207]],
    ['gs', [20, 35]],
  ])('executes the %s NTT butterfly formula in both languages', (type, expected) => {
    const program = generateBlockCode('pq_ntt_butterfly', {
      A: '13', B: '27', ZETA: '5',
    }, { MODULUS: '3329', TYPE: type });
    expect(evaluateJavaScript(program.javascript)).toEqual(expected);
    expect(JSON.parse(evaluatePython(program.python))).toEqual(expected);
  });

  it('declares the butterfly pair as an integer-list output', () => {
    const workspace = new Blockly.Workspace();
    try {
      expect(workspace.newBlock('pq_ntt_butterfly').outputConnection!.getCheck())
        .toContain('IntList');
    } finally {
      workspace.dispose();
    }
  });

  it.each([
    ['ct', '8380417', [148, 8380295]],
    ['gs', '8380417', [20, 35]],
    ['ct', '12289', [148, 12167]],
    ['gs', '12289', [20, 35]],
  ])('supports the %s butterfly over modulus %s', (type, modulus, expected) => {
    const program = generateBlockCode('pq_ntt_butterfly', {
      A: '13', B: '27', ZETA: '5',
    }, { MODULUS: modulus, TYPE: type });
    expect(evaluateJavaScript(program.javascript)).toEqual(expected);
    expect(JSON.parse(evaluatePython(program.python))).toEqual(expected);
  });

  it.each([
    ['bn_add', '[]', '[]'],
    ['bn_sub', '[]', '[]'],
    ['bn_mul', '[]', '[5]'],
    ['bn_div', '[]', '[5]'],
  ])('%s treats an empty limb list as zero and normalizes a zero result', (type, left, right) => {
    const program = generateBlockCode(type, { A: left, B: right });
    expect(evaluateJavaScript(program.javascript)).toEqual([0]);
    expect(JSON.parse(evaluatePython(program.python))).toEqual([0]);
  });

  it.each([
    ['-1', '27', '5'],
    ['3329', '27', '5'],
    ['13', '27', '1.5'],
  ])('rejects non-canonical butterfly operands (%s, %s, %s) in both languages', (a, b, zeta) => {
    for (const type of ['ct', 'gs']) {
      const program = generateBlockCode('pq_ntt_butterfly', { A: a, B: b, ZETA: zeta }, {
        MODULUS: '3329', TYPE: type,
      });
      expect(() => evaluateJavaScript(program.javascript)).toThrow();
      expect(() => evaluatePython(program.python)).toThrow();
    }
  });

  it.each(['pq_ntt', 'pq_intt'])('%s normalizes safe integer representatives consistently', (blockType) => {
    for (const modulus of ['3329', '8380417', '12289']) {
      const coefficients = Array(256).fill(0);
      coefficients[128] = Number.MAX_SAFE_INTEGER;
      const canonical = coefficients.slice();
      canonical[128] = Number(BigInt(Number.MAX_SAFE_INTEGER) % BigInt(modulus));
      const options = { MODULUS: modulus, DEGREE: '256' };
      const actual = generateBlockCode(blockType, { INPUT: JSON.stringify(coefficients) }, options);
      const expected = generateBlockCode(blockType, { INPUT: JSON.stringify(canonical) }, options);

      expect(evaluateJavaScript(actual.javascript)).toEqual(evaluateJavaScript(expected.javascript));
      expect(JSON.parse(evaluatePython(actual.python))).toEqual(JSON.parse(evaluatePython(expected.python)));
      expect(evaluateJavaScript(actual.javascript)).toEqual(JSON.parse(evaluatePython(actual.python)));
    }

    const tail = Array(255).fill(0).join(',');
    const options = { MODULUS: '3329', DEGREE: '256' };
    const integralFloat = generateBlockCode(blockType, { INPUT: `[1.0,${tail}]` }, options);
    const integralInteger = generateBlockCode(blockType, { INPUT: `[1,${tail}]` }, options);
    expect(evaluateJavaScript(integralFloat.javascript)).toEqual(evaluateJavaScript(integralInteger.javascript));
    expect(JSON.parse(evaluatePython(integralFloat.python))).toEqual(JSON.parse(evaluatePython(integralInteger.python)));
  });

  it.each(['pq_ntt', 'pq_intt'])('%s rejects unsafe or non-integer coefficients in both languages', (blockType) => {
    const tail = Array(255).fill(0).join(',');
    const options = { MODULUS: '3329', DEGREE: '256' };
    for (const first of ['9007199254740992', '1.5']) {
      const program = generateBlockCode(blockType, { INPUT: `[${first},${tail}]` }, options);
      expect(() => evaluateJavaScript(program.javascript)).toThrow('NTT input coefficients must be safe integers');
      expect(() => evaluatePython(program.python)).toThrow('NTT input coefficients must be safe integers');
    }

    const javascript = generateCodeForLanguage('javascript', blockType, { INPUT: `[true,${tail}]` }, options);
    const python = generateCodeForLanguage('python', blockType, { INPUT: `[True,${tail}]` }, options);
    expect(() => evaluateJavaScript(javascript)).toThrow('NTT input coefficients must be safe integers');
    expect(() => evaluatePython(python)).toThrow('NTT input coefficients must be safe integers');
  });

  it.each(['3329', '8380417', '12289'])('round-trips 256 coefficients through NTT and INTT for q=%s', (modulus) => {
    const input = Array.from({ length: 256 }, (_, index) => (index * 97 + 11) % Number(modulus));
    const forward = generateBlockCode('pq_ntt', { INPUT: JSON.stringify(input) }, {
      MODULUS: modulus,
      DEGREE: '256',
    });
    const inverse = (transformed: number[]) => generateBlockCode('pq_intt', {
      INPUT: JSON.stringify(transformed),
    }, { MODULUS: modulus, DEGREE: '256' });

    const javascriptInverse = inverse(evaluateJavaScript(forward.javascript) as number[]);
    const pythonInverse = inverse(JSON.parse(evaluatePython(forward.python)) as number[]);
    expect(evaluateJavaScript(javascriptInverse.javascript)).toEqual(input);
    expect(JSON.parse(evaluatePython(pythonInverse.python))).toEqual(input);
  });

  it.each([
    ['pq_ntt', '3329', '203'],
    ['pq_intt', '3329', '203'],
    ['pq_ntt', '8380417', '204'],
    ['pq_intt', '8380417', '204'],
    ['pq_ntt', '12289', ''],
    ['pq_intt', '12289', ''],
    ['pq_ntt_mul', '3329', '203'],
    ['pq_ntt_mul', '8380417', '204'],
    ['pq_ntt_butterfly', '3329', '203'],
    ['pq_ntt_butterfly', '12289', ''],
  ])('%s links modulus %s to the matching standard or no standard', (blockType, modulus, fips) => {
    const workspace = new Blockly.Workspace();
    try {
      const block = workspace.newBlock(blockType);
      block.setFieldValue(modulus, 'MODULUS');
      const helpUrl = block.helpUrl;
      const url = typeof helpUrl === 'function' ? (helpUrl as () => string)() : helpUrl;
      if (fips) expect(url).toContain(`NIST.FIPS.${fips}.pdf`);
      else expect(url).toBe('');
    } finally {
      workspace.dispose();
    }
  });

  it('uses unsigned GCM limbs and rejects zero inverse while preserving the AES S-box zero convention', () => {
    const highLimb = '[0, 0, 0, 2147483648]';
    const zero = '[0, 0, 0, 0]';
    const add = generateBlockCode('gf2m_add', { A: highLimb, B: zero }, { FIELD: 'gcm' });
    const multiply = generateBlockCode('gf2m_mul', {
      A: highLimb, B: highLimb,
    }, { FIELD: 'gcm' });
    for (const program of [add, multiply]) {
      expect(evaluateJavaScript(program.javascript)).toEqual([0, 0, 0, 2147483648]);
      expect(JSON.parse(evaluatePython(program.python))).toEqual([0, 0, 0, 2147483648]);
    }

    const gcmZeroInverse = generateBlockCode('gf2m_inv', { A: zero }, { FIELD: 'gcm' });
    expect(() => evaluateJavaScript(gcmZeroInverse.javascript)).toThrow();
    expect(() => evaluatePython(gcmZeroInverse.python)).toThrow();

    const aesZeroInverse = generateBlockCode('gf2m_inv', { A: '[0]' }, { FIELD: 'aes' });
    expect(evaluateJavaScript(aesZeroInverse.javascript)).toEqual([0]);
    expect(JSON.parse(evaluatePython(aesZeroInverse.python))).toEqual([0]);
  });

  it('matches the NIST SP 800-38D GHASH multiplication vector in both generators', () => {
    const product = generateBlockCode('gf2m_mul', {
      A: '[0xCA342B2E, 0x884CFA59, 0xEF8A2C3B, 0x66E94BD4]',
      B: '[0x71B2FE78, 0xF328C2B9, 0x60B6A392, 0x0388DACE]',
    }, { FIELD: 'gcm' });
    const expected = [0x5353DEB7, 0x2C85B068, 0x91706288, 0x5E2EC746];
    expect(evaluateJavaScript(product.javascript)).toEqual(expected);
    expect(JSON.parse(evaluatePython(product.python))).toEqual(expected);

    const inverse = generateBlockCode('gf2m_inv', {
      A: '[0xCA342B2E, 0x884CFA59, 0xEF8A2C3B, 0x66E94BD4]',
    }, { FIELD: 'gcm' });
    const jsInverse = evaluateJavaScript(inverse.javascript) as number[];
    const identityCheck = generateBlockCode('gf2m_mul', {
      A: JSON.stringify(jsInverse),
      B: '[0xCA342B2E, 0x884CFA59, 0xEF8A2C3B, 0x66E94BD4]',
    }, { FIELD: 'gcm' });
    expect(evaluateJavaScript(identityCheck.javascript)).toEqual([0, 0, 0, 0x80000000]);

    const pythonInverse = JSON.parse(evaluatePython(inverse.python)) as number[];
    const pythonInverseCheck = generateBlockCode('gf2m_mul', {
      A: JSON.stringify(pythonInverse),
      B: '[0xCA342B2E, 0x884CFA59, 0xEF8A2C3B, 0x66E94BD4]',
    }, { FIELD: 'gcm' });
    expect(JSON.parse(evaluatePython(pythonInverseCheck.python))).toEqual([0, 0, 0, 0x80000000]);
  });

  it.each([
    ['both empty', '[]', '[]'],
    ['empty left', '[]', '[1,2]'],
    ['empty right', '[1,2]', '[]'],
  ])('%s GF(2) polynomial multiplication returns the zero polynomial in both languages', (_label, a, b) => {
    for (const blockType of ['gf2_poly_mul', 'gf2m_poly_mul']) {
      const product = generateBlockCode(blockType, { A: a, B: b });
      expect(evaluateJavaScript(product.javascript)).toEqual([]);
      expect(JSON.parse(evaluatePython(product.python))).toEqual([]);
    }
  });

  it.each([
    ['gf2_poly_mul', '[1,1]', '[1,1,1]', [1, 0, 0, 1]],
    ['gf2m_poly_mul', '[1,2]', '[3,4]', [3, 2, 8]],
    ['gf2m_poly_mul', '[87]', '[131]', [193]],
  ])('%s matches the coefficient convolution example in both languages', (blockType, a, b, expected) => {
    const product = generateBlockCode(blockType, { A: a, B: b });

    expect(evaluateJavaScript(product.javascript)).toEqual(expected);
    expect(JSON.parse(evaluatePython(product.python))).toEqual(expected);
  });

  it.each([
    ['fractional memory cost', { M_COST: '32.5' }],
    ['memory below the Argon2 minimum', { M_COST: '7' }],
    ['memory above the project execution limit', { M_COST: '65537' }],
    ['zero time cost', { T_COST: '0' }],
    ['time above the project execution limit', { T_COST: '11' }],
    ['zero lanes', { LANES: '0' }],
    ['lanes above the project execution limit', { LANES: '17' }],
    ['tag shorter than RFC 9106 minimum', { TAGLEN: '3' }],
    ['tag above the project execution limit', { TAGLEN: '1025' }],
    ['memory/time product above the project execution limit', { M_COST: '65536', T_COST: '2' }],
  ])('Argon2 rejects %s in both generated languages', (_label, overrides) => {
    const inputs = {
      PASSWORD: '[1,2,3]',
      SALT: '[1,2,3,4,5,6,7,8]',
      SECRET: '[]',
      AD: '[]',
      M_COST: '8',
      T_COST: '1',
      LANES: '1',
      TAGLEN: '32',
      ...overrides,
    };
    const program = generateBlockCode('argon2_hash', inputs);
    expectJavaScriptToThrowWithoutHanging(program.javascript, 'Argon2', 15000);
    expect(capturePythonException(program.python, '')).toMatchObject({ type: 'ValueError' });
  });

  it('allows an empty Argon2 salt and keeps generated languages aligned', () => {
    const program = generateBlockCode('argon2_hash', {
      PASSWORD: '[]', SALT: '[]', SECRET: '[]', AD: '[]',
      M_COST: '8', T_COST: '1', LANES: '1', TAGLEN: '4',
    });
    const javascriptTag = Array.from(evaluateJavaScript(program.javascript) as Uint8Array);
    const pythonTag = JSON.parse(evaluatePython(program.python)) as number[];
    expect(javascriptTag).toHaveLength(4);
    expect(javascriptTag).toEqual(pythonTag);
  });

  it.each([
    ['password', 'PASSWORD'],
    ['salt', 'SALT'],
    ['secret', 'SECRET'],
    ['associated data', 'AD'],
  ])('rejects an oversized Argon2 %s before materializing it in both languages', (_name, inputName) => {
    const javascriptInput = 'new Array(1048577)';
    const pythonInput = '[0] * 1048577';
    const javascript = generateBlockCode('argon2_hash', { [inputName]: javascriptInput });
    const python = generateBlockCode('argon2_hash', { [inputName]: pythonInput });

    expectJavaScriptToThrowWithoutHanging(javascript.javascript, '1 MiB project input limit', 15000);
    expect(capturePythonException(python.python, '')).toMatchObject({ type: 'ValueError' });
  });

  it('rejects iterable inputs instead of consuming unbounded sources', () => {
    const javascript = generateBlockCode('argon2_hash', {
      PASSWORD: '(function* () { throw new Error("generator was consumed"); })()',
    });
    const python = generateBlockCode('argon2_hash', { PASSWORD: '(item for item in [1])' });

    expectJavaScriptToThrowWithoutHanging(javascript.javascript, 'must be bytes, text, or a byte array', 15000);
    expect(capturePythonException(python.python, '')).toMatchObject({ type: 'TypeError' });
  });

  it('reads byte containers by index instead of invoking overridden iterators', () => {
    const javascript = generateBlockCode('argon2_hash', {
      PASSWORD: 'Object.assign([1], { [Symbol.iterator]: function* () { throw new Error("iterator consumed"); } })',
      SALT: '[]', SECRET: '[]', AD: '[]', M_COST: '8', T_COST: '1', LANES: '1', TAGLEN: '4',
    });
    const python = generateBlockCode('argon2_hash', {
      PASSWORD: 'type("EvilList", (list,), {"__iter__": lambda self: (_ for _ in ()).throw(RuntimeError("iterator consumed"))})([1])',
      SALT: '[]', SECRET: '[]', AD: '[]', M_COST: '8', T_COST: '1', LANES: '1', TAGLEN: '4',
    });

    expect(Array.from(evaluateJavaScript(javascript.javascript) as Uint8Array)).toEqual(
      JSON.parse(evaluatePython(python.python)) as number[],
    );
  });

  it('snapshots JavaScript input length before reading proxy-backed arrays', () => {
    const javascript = generateBlockCode('argon2_hash', {
      PASSWORD: '(() => { let reads = 0; return new Proxy([1], { get(target, key, receiver) { if (key === "length") return reads++ === 0 ? 1 : Infinity; return Reflect.get(target, key, receiver); } }); })()',
      SALT: '[]', SECRET: '[]', AD: '[]', M_COST: '8', T_COST: '1', LANES: '1', TAGLEN: '4',
    });
    const ordinary = generateBlockCode('argon2_hash', {
      PASSWORD: '[1]', SALT: '[]', SECRET: '[]', AD: '[]', M_COST: '8', T_COST: '1', LANES: '1', TAGLEN: '4',
    });

    expect(Array.from(evaluateJavaScript(javascript.javascript) as Uint8Array)).toEqual(
      Array.from(evaluateJavaScript(ordinary.javascript) as Uint8Array),
    );
  });

  it.each(['[-1]', '[256]', '[1.5]'])('rejects invalid Argon2 byte values %s in both languages', (bytes) => {
    const program = generateBlockCode('argon2_hash', { PASSWORD: bytes });

    expectJavaScriptToThrowWithoutHanging(program.javascript, 'must contain byte values', 15000);
    expect(capturePythonException(program.python, '')).toMatchObject({ type: 'ValueError' });
  });

  it('rejects Boolean values where Argon2 requires bytes', () => {
    const javascript = generateBlockCode('argon2_hash', { PASSWORD: '[true]' });
    const python = generateBlockCode('argon2_hash', { PASSWORD: '[True]' });

    expectJavaScriptToThrowWithoutHanging(javascript.javascript, 'must contain byte values', 15000);
    expect(capturePythonException(python.python, '')).toMatchObject({ type: 'ValueError' });
  });

  it('encodes Argon2 text inputs as UTF-8 consistently', () => {
    const program = generateBlockCode('argon2_hash', {
      PASSWORD: '"雪"', SALT: '"盐"', SECRET: '[]', AD: '[]',
      M_COST: '8', T_COST: '1', LANES: '1', TAGLEN: '4',
    });
    const javascriptTag = Array.from(evaluateJavaScript(program.javascript) as Uint8Array);
    const pythonTag = JSON.parse(evaluatePython(program.python)) as number[];
    expect(javascriptTag).toEqual(pythonTag);
  });

  it('rejects malformed Unicode consistently in both Argon2 generators', () => {
    const javascript = generateBlockCode('argon2_hash', {
      PASSWORD: 'String.fromCharCode(0xD800)', SALT: '[]', SECRET: '[]', AD: '[]',
    });
    const python = generateBlockCode('argon2_hash', {
      PASSWORD: 'chr(0xD800)', SALT: '[]', SECRET: '[]', AD: '[]',
    });

    expectJavaScriptToThrowWithoutHanging(javascript.javascript, 'well-formed Unicode', 15000);
    expect(capturePythonException(python.python, '')).toMatchObject({ type: 'UnicodeEncodeError' });
  });

  it('rejects UTF-8 text whose encoded byte length exceeds the Argon2 input limit', () => {
    const javascript = generateBlockCode('argon2_hash', {
      PASSWORD: '"\\u0800".repeat(349526)', SALT: '[]', SECRET: '[]', AD: '[]',
    });
    const python = generateBlockCode('argon2_hash', {
      PASSWORD: '"\\u0800" * 349526', SALT: '[]', SECRET: '[]', AD: '[]',
    });

    expectJavaScriptToThrowWithoutHanging(javascript.javascript, '1 MiB project input limit', 15000);
    expect(capturePythonException(python.python, '')).toMatchObject({ type: 'ValueError' });
  });

  it('returns AES GF(2^8) add and multiply results as one-element IntLists', () => {
    const add = generateBlockCode('gf2m_add', { A: '[0x57]', B: '[0x83]' }, { FIELD: 'aes' });
    const multiply = generateBlockCode('gf2m_mul', { A: '[2]', B: '[2]' }, { FIELD: 'aes' });
    for (const [program, expected] of [[add, [0xd4]], [multiply, [4]]] as const) {
      expect(evaluateJavaScript(program.javascript)).toEqual(expected);
      expect(JSON.parse(evaluatePython(program.python))).toEqual(expected);
    }
  });

  it('requires 256 coefficients for ML-DSA NTT-domain multiplication', () => {
    const valid = generateBlockCode('pq_ntt_mul', {
      A: JSON.stringify(Array(256).fill(1)),
      B: JSON.stringify(Array(256).fill(2)),
    }, { MODULUS: '8380417' });
    expect(evaluateJavaScript(valid.javascript)).toEqual(Array(256).fill(2));
    expect(JSON.parse(evaluatePython(valid.python))).toEqual(Array(256).fill(2));

    for (const [aLength, bLength] of [[255, 256], [257, 256], [256, 255], [256, 257]]) {
      const invalid = generateBlockCode('pq_ntt_mul', {
        A: JSON.stringify(Array(aLength).fill(1)),
        B: JSON.stringify(Array(bLength).fill(2)),
      }, { MODULUS: '8380417' });
      expect(() => evaluateJavaScript(invalid.javascript)).toThrow();
      expect(() => evaluatePython(invalid.python)).toThrow();
    }
  });

  it.each(['3329', '8380417'])('normalizes and validates NTT multiplication coefficients for q=%s', (modulus) => {
    const tail = Array(255).fill(0).join(',');
    const rawA = `[9007199254740991,${tail}]`;
    const residue = Number(BigInt(Number.MAX_SAFE_INTEGER) % BigInt(modulus));
    const canonicalA = `[${residue},${tail}]`;
    const b = `[3,${tail}]`;
    const options = { MODULUS: modulus };
    const raw = generateBlockCode('pq_ntt_mul', { A: rawA, B: b }, options);
    const canonical = generateBlockCode('pq_ntt_mul', { A: canonicalA, B: b }, options);
    expect(evaluateJavaScript(raw.javascript)).toEqual(evaluateJavaScript(canonical.javascript));
    expect(JSON.parse(evaluatePython(raw.python))).toEqual(JSON.parse(evaluatePython(canonical.python)));
    expect(evaluateJavaScript(raw.javascript)).toEqual(JSON.parse(evaluatePython(raw.python)));

    const integralFloat = generateBlockCode('pq_ntt_mul', {
      A: `[1.0,${tail}]`, B: `[2.0,${tail}]`,
    }, options);
    const integralInteger = generateBlockCode('pq_ntt_mul', {
      A: `[1,${tail}]`, B: `[2,${tail}]`,
    }, options);
    expect(evaluateJavaScript(integralFloat.javascript)).toEqual(evaluateJavaScript(integralInteger.javascript));
    expect(JSON.parse(evaluatePython(integralFloat.python))).toEqual(JSON.parse(evaluatePython(integralInteger.python)));

    for (const value of ['9007199254740992', '1.5']) {
      const invalid = generateBlockCode('pq_ntt_mul', { A: `[${value},${tail}]`, B: b }, options);
      expect(() => evaluateJavaScript(invalid.javascript)).toThrow('NTT multiplication coefficients must be safe integers');
      expect(() => evaluatePython(invalid.python)).toThrow('NTT multiplication coefficients must be safe integers');
    }

    const javascriptBoolean = generateCodeForLanguage('javascript', 'pq_ntt_mul', {
      A: `[true,${tail}]`, B: b,
    }, options);
    const pythonBoolean = generateCodeForLanguage('python', 'pq_ntt_mul', {
      A: `[True,${tail}]`, B: b,
    }, options);
    expect(() => evaluateJavaScript(javascriptBoolean)).toThrow('NTT multiplication coefficients must be safe integers');
    expect(() => evaluatePython(pythonBoolean)).toThrow('NTT multiplication coefficients must be safe integers');
  });
});
