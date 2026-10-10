// @vitest-environment jsdom
import * as Blockly from 'blockly/core';
import 'blockly/blocks';
import { execFileSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';

import '@/blocks/data/number';
import '@/blocks/drbg/blocks';
import '@/generators/javascript';
import '@/generators/python';
import { javascriptGenerator, Order as JavaScriptOrder } from 'blockly/javascript';
import { pythonGenerator, Order as PythonOrder } from 'blockly/python';
import { isNativeUint8Array } from './helpers/native-bytes';

Blockly.Blocks['test_drbg_sink'] = {
  init: function () {
    this.appendValueInput('VALUE');
    this.setPreviousStatement(true);
    this.setNextStatement(true);
  },
};
javascriptGenerator.forBlock['test_drbg_sink'] = (block) =>
  `output = ${javascriptGenerator.valueToCode(block, 'VALUE', JavaScriptOrder.NONE) || 'undefined'};\n`;
pythonGenerator.forBlock['test_drbg_sink'] = (block) =>
  `result = ${pythonGenerator.valueToCode(block, 'VALUE', PythonOrder.NONE) || 'None'}\n`;

const pythonCommand = process.env.CIPHER_CAT_PYTHON ||
  (process.platform === 'win32' ? 'python' : 'python3');

function generateCode(
  language: 'javascript' | 'python',
  requestedBits: string,
  inputs: Partial<Record<'ENTROPY' | 'NONCE' | 'PERSO', string>> = {},
): string {
  const workspace = new Blockly.Workspace();
  try {
    const drbg = workspace.newBlock('drbg_generate');
    const bits = workspace.newBlock('data_value');
    const sink = workspace.newBlock('test_drbg_sink');
    bits.setFieldValue(requestedBits, 'NUM');
    drbg.getInput('BITS')!.connection!.connect(bits.outputConnection!);
    for (const input of ['ENTROPY', 'NONCE', 'PERSO'] as const) {
      if (inputs[input] === undefined) continue;
      const value = workspace.newBlock('data_value');
      value.setFieldValue(inputs[input]!, 'NUM');
      drbg.getInput(input)!.connection!.connect(value.outputConnection!);
    }
    sink.getInput('VALUE')!.connection!.connect(drbg.outputConnection!);
    const generator = language === 'javascript' ? javascriptGenerator : pythonGenerator;
    return generator.workspaceToCode(workspace);
  } finally {
    workspace.dispose();
  }
}

function runJavaScript(code: string): number[] {
  const output = new Function(`let output;\n${code}\nreturn output;`)() as Uint8Array;
  expect(isNativeUint8Array(output)).toBe(true);
  return Array.from(output);
}

function runPython(code: string): number[] {
  const output = execFileSync(pythonCommand, ['-c', [
    'import json',
    code,
    'assert type(result) is bytes',
    'print(json.dumps(list(result)))',
  ].join('\n')], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  return JSON.parse(output) as number[];
}

function capturePythonError(code: string): unknown {
  const wrapped = [
    'import json',
    'try:',
    ...code.trimEnd().split('\n').map((line) => `    ${line}`),
    'except Exception as error:',
    '    print(json.dumps({"type": type(error).__name__, "message": str(error)}))',
    'else:',
    '    print(json.dumps(None))',
  ].join('\n');
  const output = execFileSync(pythonCommand, ['-c', wrapped], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
  return JSON.parse(output) as unknown;
}

describe('HMAC-DRBG block request contract', () => {
  it('matches the NIST CAVS 14.3 HMAC_DRBG SHA-256 no-reseed response after two Generate calls', () => {
    // NIST CAVS 14.3 drbgvectors_no_reseed.zip / HMAC_DRBG.rsp:
    // SHA-256, PR=False, entropy=256, nonce=128, personalization/additional=0,
    // returnedBits=1024, COUNT=0. ReturnedBits follows the second Generate call.
    const inputs = {
      ENTROPY: '[0xca,0x85,0x19,0x11,0x34,0x93,0x84,0xbf,0xfe,0x89,0xde,0x1c,0xbd,0xc4,0x6e,0x68,0x31,0xe4,0x4d,0x34,0xa4,0xfb,0x93,0x5e,0xe2,0x85,0xdd,0x14,0xb7,0x1a,0x74,0x88]',
      NONCE: '[0x65,0x9b,0xa9,0x6c,0x60,0x1d,0xc6,0x9f,0xc9,0x02,0x94,0x08,0x05,0xec,0x0c,0xa8]',
      PERSO: '[]',
    };
    const expected = 'e528e9abf2dece54d47c7e75e5fe302149f817ea9fb4bee6f4199697d04d5b89d54fbb978a15b5c443c9ec21036d2460b6f73ebad0dc2aba6e624abf07745bc107694bb7547bb0995f70de25d6b29e2d3011bb19d27676c07162c8b5ccde0668961df86803482cb37ed6d5c0bb8d50cf1f50d476aa0458bdaba806f48be9dcb8';
    const toHex = (bytes: number[]) => bytes.map((byte) => byte.toString(16).padStart(2, '0')).join('');

    const javascript = [
      generateCode('javascript', '1024', inputs),
      `const state = drbgInstantiate(${inputs.ENTROPY}, ${inputs.NONCE}, []);`,
      'drbgGenerate(state, 1024, null);',
      'output = Uint8Array.from(drbgGenerate(state, 1024, null));',
    ].join('\n');
    const python = [
      generateCode('python', '1024', inputs),
      `state = drbg_instantiate(${inputs.ENTROPY}, ${inputs.NONCE}, [])`,
      'drbg_generate(state, 1024, None)',
      'result = bytes(drbg_generate(state, 1024, None))',
    ].join('\n');

    expect(toHex(runJavaScript(javascript))).toBe(expected);
    expect(toHex(runPython(python))).toBe(expected);
  });

  it('serializes a zero-bit request as an empty byte array in both languages', () => {
    expect(runJavaScript(generateCode('javascript', '0'))).toEqual([]);
    expect(runPython(generateCode('python', '0'))).toEqual([]);
  });

  it('accepts the SP 800-90A maximum request size', () => {
    for (const language of ['javascript', 'python'] as const) {
      const output = language === 'javascript'
        ? runJavaScript(generateCode(language, '524288'))
        : runPython(generateCode(language, '524288'));
      expect(output).toHaveLength(65536);
      expect(output.every((byte) => Number.isInteger(byte) && byte >= 0 && byte <= 255)).toBe(true);
    }
  });

  it.each([
    ['negative', '-1'],
    ['fractional', '1.5'],
    ['above SP 800-90A limit', '524289'],
  ])('rejects a %s request in both generated languages', (_label, requestedBits) => {
    const javascript = generateCode('javascript', requestedBits);
    const python = generateCode('python', requestedBits);
    const message = 'requested_bits must be a safe integer from 0 to 524288';
    expect(() => runJavaScript(javascript)).toThrow(message);
    expect(capturePythonError(python)).toEqual({ type: 'ValueError', message });
  });

  it('returns only the requested leftmost bits, right-padded in the final byte', () => {
    for (const language of ['javascript', 'python'] as const) {
      const oneBit = language === 'javascript'
        ? runJavaScript(generateCode(language, '1'))
        : runPython(generateCode(language, '1'));
      const eightBits = language === 'javascript'
        ? runJavaScript(generateCode(language, '8'))
        : runPython(generateCode(language, '8'));
      const nineBits = language === 'javascript'
        ? runJavaScript(generateCode(language, '9'))
        : runPython(generateCode(language, '9'));
      const sixteenBits = language === 'javascript'
        ? runJavaScript(generateCode(language, '16'))
        : runPython(generateCode(language, '16'));

      expect(oneBit).toHaveLength(1);
      expect(oneBit[0]).toBe(eightBits[0] & 0x80);
      expect(nineBits).toHaveLength(2);
      expect(nineBits[0]).toBe(sixteenBits[0]);
      expect(nineBits[1]).toBe(sixteenBits[1] & 0x80);
    }
  });
});
