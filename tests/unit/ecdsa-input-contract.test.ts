// @vitest-environment jsdom
import * as Blockly from 'blockly/core';
import 'blockly/blocks';
import { execFileSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';

import '@/blocks/data/number';
import '@/blocks/ecdsa';
import '@/generators/javascript';
import '@/generators/python';
import { TYPE_BYTES } from '@/constants/block-types';
import { javascriptGenerator } from 'blockly/javascript';
import { pythonGenerator } from 'blockly/python';

const pythonCommand = process.env.CIPHER_CAT_PYTHON ||
  (process.platform === 'win32' ? 'python' : 'python3');

function generateCode(
  language: 'javascript' | 'python',
  type: 'ecdsa_sign' | 'ecdsa_verify',
  inputs: Record<string, string>,
): string {
  const workspace = new Blockly.Workspace();
  try {
    const block = workspace.newBlock(type);
    for (const [name, expression] of Object.entries(inputs)) {
      const value = workspace.newBlock('data_value');
      value.setFieldValue(expression, 'NUM');
      value.outputConnection!.setCheck(TYPE_BYTES);
      block.getInput(name)!.connection!.connect(value.outputConnection!);
    }
    return (language === 'javascript' ? javascriptGenerator : pythonGenerator).workspaceToCode(workspace);
  } finally {
    workspace.dispose();
  }
}

function splitProgram(program: string): { helpers: string[]; expression: string } {
  const lines = program.trim().split('\n');
  return { helpers: lines.slice(0, -1), expression: lines.at(-1)!.replace(/;$/, '') };
}

function runJavaScript(program: string): unknown {
  const { helpers, expression } = splitProgram(program);
  return new Function([...helpers, `return ${expression};`].join('\n'))();
}

function capturePython(program: string): string {
  const { helpers, expression } = splitProgram(program);
  const wrapped = [
    ...helpers,
    'try:',
    `    result = ${expression}`,
    'except Exception as error:',
    '    print(type(error).__name__ + ":" + str(error))',
    'else:',
    '    print(str(result))',
  ].join('\n');
  return execFileSync(pythonCommand, ['-c', wrapped], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
}

describe('ECDSA input contracts', () => {
  it('rejects private scalars outside [1, n-1] in both generated languages', () => {
    const orderHex = 'ffffffff00000000ffffffffffffffffbce6faada7179e84f3b9cac2fc632551';
    const javascriptKeys = ['new Uint8Array(32)', `Uint8Array.from("${orderHex}".match(/../g).map(x => parseInt(x, 16)))`];
    const pythonKeys = ['bytes(32)', `bytes.fromhex("${orderHex}")`];
    const message = 'ECDSA private key scalar must be in [1, n-1]';

    for (let index = 0; index < javascriptKeys.length; index++) {
      const javascript = generateCode('javascript', 'ecdsa_sign', {
        PRIV: javascriptKeys[index],
        MSG: 'new Uint8Array(0)',
      });
      const python = generateCode('python', 'ecdsa_sign', {
        PRIV: pythonKeys[index],
        MSG: 'bytes()',
      });

      expect(() => runJavaScript(javascript)).toThrow(message);
      expect(capturePython(python)).toContain(message);
    }
  });

  it('rejects an off-curve public key in both generated languages', () => {
    const javascript = generateCode('javascript', 'ecdsa_verify', {
      MSG: 'new Uint8Array(0)',
      PUB: 'new Uint8Array(64)',
      SIG: 'Uint8Array.from([...Array(31).fill(0),1,...Array(31).fill(0),1])',
    });
    const python = generateCode('python', 'ecdsa_verify', {
      MSG: 'bytes()',
      PUB: 'bytes(64)',
      SIG: "bytes(31) + b'\\x01' + bytes(31) + b'\\x01'",
    });

    expect(runJavaScript(javascript)).toBe(false);
    expect(capturePython(python)).toBe('False');
  });

  it('rejects public coordinates outside the P-256 field in both generated languages', () => {
    const fieldPrimeHex = 'ffffffff00000001000000000000000000000000ffffffffffffffffffffffff';
    const javascript = generateCode('javascript', 'ecdsa_verify', {
      MSG: 'new Uint8Array(0)',
      PUB: `Uint8Array.from([..."${fieldPrimeHex}".match(/../g).map(x => parseInt(x, 16)), ...Array(32).fill(0)])`,
      SIG: 'Uint8Array.from([...Array(31).fill(0),1,...Array(31).fill(0),1])',
    });
    const python = generateCode('python', 'ecdsa_verify', {
      MSG: 'bytes()',
      PUB: `bytes.fromhex("${fieldPrimeHex}" + "00" * 32)`,
      SIG: "bytes(31) + b'\\x01' + bytes(31) + b'\\x01'",
    });

    expect(runJavaScript(javascript)).toBe(false);
    expect(capturePython(python)).toBe('False');
  });

  it('rejects malformed signature lengths and out-of-range scalars as Boolean false', () => {
    const publicKeyHex =
      '6b17d1f2e12c4247f8bce6e563a440f277037d812deb33a0f4a13945d898c296' +
      '4fe342e2fe1a7f9b8ee7eb4a7c0f9e162bce33576b315ececbb6406837bf51f5';
    const orderHex = 'ffffffff00000000ffffffffffffffffbce6faada7179e84f3b9cac2fc632551';
    const zero = '00'.repeat(32);
    const one = `${zero.slice(0, -2)}01`;
    const invalidSignatures = [
      '00'.repeat(63),
      '00'.repeat(65),
      zero + one,
      orderHex + one,
      one + zero,
      one + orderHex,
    ];

    for (const signatureHex of invalidSignatures) {
      const javascript = generateCode('javascript', 'ecdsa_verify', {
        MSG: 'new Uint8Array(0)',
        PUB: `Uint8Array.from("${publicKeyHex}".match(/../g).map(x => parseInt(x, 16)))`,
        SIG: `Uint8Array.from("${signatureHex}".match(/../g).map(x => parseInt(x, 16)))`,
      });
      const python = generateCode('python', 'ecdsa_verify', {
        MSG: 'bytes()',
        PUB: `bytes.fromhex("${publicKeyHex}")`,
        SIG: `bytes.fromhex("${signatureHex}")`,
      });

      expect(runJavaScript(javascript)).toBe(false);
      expect(capturePython(python)).toBe('False');
    }
  });
});
