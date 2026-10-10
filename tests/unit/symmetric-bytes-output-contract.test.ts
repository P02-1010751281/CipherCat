// @vitest-environment jsdom
import * as Blockly from 'blockly/core';
import 'blockly/blocks';
import { execFileSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';

import '@/blocks/cmac';
import '@/blocks/ccm/blocks';
import '@/blocks/data/number';
import '@/blocks/gcm/blocks';
import '@/blocks/symmetric/modes/blocks';
import '@/blocks/xts/blocks';
import '@/generators/javascript';
import '@/generators/javascript/cmac';
import '@/generators/javascript/ccm/blocks';
import '@/generators/javascript/gcm/blocks';
import '@/generators/javascript/symmetric/modes/blocks';
import '@/generators/javascript/xts/blocks';
import '@/generators/python';
import '@/generators/python/cmac';
import '@/generators/python/ccm/blocks';
import '@/generators/python/gcm/blocks';
import '@/generators/python/symmetric/modes/blocks';
import '@/generators/python/xts/blocks';

import { javascriptGenerator } from 'blockly/javascript';
import { pythonGenerator } from 'blockly/python';

const pythonCommand = process.env.CIPHER_CAT_PYTHON ||
  (process.platform === 'win32' ? 'python' : 'python3');

function generate(type: string, inputs: Record<string, string>, fields: Record<string, string> = {}) {
  const workspace = new Blockly.Workspace();
  try {
    const block = workspace.newBlock(type);
    for (const [field, value] of Object.entries(fields)) block.setFieldValue(value, field);
    for (const [name, expression] of Object.entries(inputs)) {
      const value = workspace.newBlock('data_value');
      value.setFieldValue(expression, 'NUM');
      block.getInput(name)!.connection!.connect(value.outputConnection!);
    }
    return {
      outputType: block.outputConnection?.getCheck(),
      javascript: javascriptGenerator.workspaceToCode(workspace),
      python: pythonGenerator.workspaceToCode(workspace),
    };
  } finally {
    workspace.dispose();
  }
}

function evaluatesToUint8Array(program: string): boolean {
  const lines = program.trim().split('\n');
  const expression = lines.pop()!.replace(/;$/, '');
  return execFileSync(process.execPath, ['-e', [...lines, `console.log((value => ArrayBuffer.isView(value) && Object.getOwnPropertyDescriptor(Object.getPrototypeOf(Uint8Array.prototype), Symbol.toStringTag).get.call(value) === 'Uint8Array' && Object.getPrototypeOf(value) === Uint8Array.prototype)(${expression}));`].join('\n')], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  }).trim() === 'true';
}

function evaluatesToBytes(program: string): boolean {
  const lines = program.trim().split('\n');
  const expression = lines.pop()!;
  return execFileSync(pythonCommand, ['-c', [...lines, `result = ${expression}`, 'print(type(result) is bytes)'].join('\n')], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  }).trim() === 'True';
}

const bytes = (length: number, start = 0) => Array.from({ length }, (_, index) => (start + index) & 0xff);
const jsBytes = (values: number[]) => `Uint8Array.from(${JSON.stringify(values)})`;
const pyBytes = (values: number[]) => `bytes(${JSON.stringify(values)})`;
const jsList = (values: number[]) => JSON.stringify(values);
const pyList = (values: number[]) => JSON.stringify(values);

describe('symmetric and AEAD Bytes output contracts', () => {
  const modeKey = bytes(16);
  const modeData = bytes(16, 1);
  const modeCounter = bytes(16, 2);
  const xtsKey = bytes(32, 1);

  it.each([
    ['mode_ecb_encrypt', { DATA: jsBytes(modeData), KEY: jsBytes(modeKey) }, { DATA: pyBytes(modeData), KEY: pyBytes(modeKey) }],
    ['mode_ecb_decrypt', { DATA: jsBytes(modeData), KEY: jsBytes(modeKey) }, { DATA: pyBytes(modeData), KEY: pyBytes(modeKey) }],
    ['mode_cbc_encrypt', { DATA: jsBytes(modeData), KEY: jsBytes(modeKey), IV: jsBytes(modeKey) }, { DATA: pyBytes(modeData), KEY: pyBytes(modeKey), IV: pyBytes(modeKey) }],
    ['mode_ctr_encrypt', { DATA: jsBytes(modeData), KEY: jsBytes(modeKey), NONCE: jsBytes(modeCounter) }, { DATA: pyBytes(modeData), KEY: pyBytes(modeKey), NONCE: pyBytes(modeCounter) }],
    ['gcm_encrypt', { KEY: jsBytes(modeKey), IV: jsList(bytes(12)), AAD: jsList([]), MSG: jsBytes([]) }, { KEY: pyBytes(modeKey), IV: pyList(bytes(12)), AAD: pyList([]), MSG: pyBytes([]) }],
    ['ccm_encrypt', { KEY: jsBytes(modeKey), NONCE: jsList(bytes(12)), AAD: jsList([]), MSG: jsBytes([]) }, { KEY: pyBytes(modeKey), NONCE: pyList(bytes(12)), AAD: pyList([]), MSG: pyBytes([]) }],
    ['xts_encrypt', { KEY: jsBytes(xtsKey), TWEAK: jsList(bytes(16)), MSG: jsBytes(modeData) }, { KEY: pyBytes(xtsKey), TWEAK: pyList(bytes(16)), MSG: pyBytes(modeData) }],
    ['cmac_mac', { KEY: jsBytes(modeKey), MSG: jsBytes([]) }, { KEY: pyBytes(modeKey), MSG: pyBytes([]) }],
  ] as const)('%s declares and returns Uint8Array/bytes', (type, jsInputs, pyInputs) => {
    const program = generate(type, jsInputs, type === 'cmac_mac' ? { CIPHER: 'aes' } : {});
    const pythonProgram = generate(type, pyInputs, type === 'cmac_mac' ? { CIPHER: 'aes' } : {});

    expect(program.outputType).toContain('Bytes');
    expect(pythonProgram.outputType).toContain('Bytes');
    expect(evaluatesToUint8Array(program.javascript)).toBe(true);
    expect(evaluatesToBytes(pythonProgram.python)).toBe(true);
  });

  it('returns Uint8Array/bytes from the SM4 CMAC option as well', () => {
    const javascript = generate('cmac_mac', { KEY: jsBytes(modeKey), MSG: jsBytes([]) }, { CIPHER: 'sm4' });
    const python = generate('cmac_mac', { KEY: pyBytes(modeKey), MSG: pyBytes([]) }, { CIPHER: 'sm4' });

    expect(evaluatesToUint8Array(javascript.javascript)).toBe(true);
    expect(evaluatesToBytes(python.python)).toBe(true);
  });
});
