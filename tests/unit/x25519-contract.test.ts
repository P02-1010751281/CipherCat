// @vitest-environment jsdom
import * as Blockly from 'blockly/core';
import 'blockly/blocks';
import { execFileSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';

import '@/blocks/data/number';
import '@/blocks/x25519';
import '@/generators/javascript';
import '@/generators/javascript/x25519';
import '@/generators/python';
import '@/generators/python/x25519';
import { javascriptGenerator } from 'blockly/javascript';
import { pythonGenerator } from 'blockly/python';
import { isNativeUint8Array } from './helpers/native-bytes';

const pythonCommand = process.env.CIPHER_CAT_PYTHON ||
  (process.platform === 'win32' ? 'python' : 'python3');

function generate(language: 'javascript' | 'python', scalar: string, u: string): string {
  const workspace = new Blockly.Workspace();
  try {
    const block = workspace.newBlock('x25519');
    for (const [input, expression] of [['SCALAR', scalar], ['U', u]]) {
      const value = workspace.newBlock('data_value');
      value.setFieldValue(expression, 'NUM');
      block.getInput(input)!.connection!.connect(value.outputConnection!);
    }
    const generator = language === 'javascript' ? javascriptGenerator : pythonGenerator;
    return generator.workspaceToCode(workspace);
  } finally {
    workspace.dispose();
  }
}

function runJavaScript(program: string): Uint8Array {
  const lines = program.trim().split('\n');
  const expression = lines.pop()!.replace(/;$/, '');
  return new Function([...lines, `return ${expression};`].join('\n'))() as Uint8Array;
}

function runPython(program: string): number[] {
  const lines = program.trim().split('\n');
  const expression = lines.pop()!;
  const output = execFileSync(pythonCommand, ['-c', [
    'import json',
    ...lines,
    `result = ${expression}`,
    'assert type(result) is bytes',
    'print(json.dumps(list(result)))',
  ].join('\n')], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  return JSON.parse(output) as number[];
}

const zeroScalar = `[${Array(32).fill('0').join(',')}]`;
const zeroU = `[${Array(32).fill('0').join(',')}]`;

describe('X25519 Blockly contract', () => {
  it('matches the RFC 7748 vector and returns zero for a low-order u-coordinate', () => {
    const scalar = '[0xa5,0x46,0xe3,0x6b,0xf0,0x52,0x7c,0x9d,0x3b,0x16,0x15,0x4b,0x82,0x46,0x5e,0xdd,0x62,0x14,0x4c,0x0a,0xc1,0xfc,0x5a,0x18,0x50,0x6a,0x22,0x44,0xba,0x44,0x9a,0xc4]';
    const u = '[0xe6,0xdb,0x68,0x67,0x58,0x30,0x30,0xdb,0x35,0x94,0xc1,0xa4,0x24,0xb1,0x5f,0x7c,0x72,0x66,0x24,0xec,0x26,0xb3,0x35,0x3b,0x10,0xa9,0x03,0xa6,0xd0,0xab,0x1c,0x4c]';
    const expected = 'c3da55379de9c6908e94ea4df28d084f32eccf03491c71f754b4075577a28552';
    const jsVector = runJavaScript(generate('javascript', scalar, u));
    expect(isNativeUint8Array(jsVector)).toBe(true);
    expect(Buffer.from(jsVector).toString('hex')).toBe(expected);
    expect(Buffer.from(runPython(generate('python', scalar, u))).toString('hex')).toBe(expected);

    for (const lowOrderU of [zeroU, `[1,${Array(31).fill('0').join(',')}]`]) {
      const jsLowOrder = runJavaScript(generate('javascript', zeroScalar, lowOrderU));
      const pyLowOrder = runPython(generate('python', zeroScalar, lowOrderU));
      expect([...jsLowOrder]).toEqual(Array(32).fill(0));
      expect(pyLowOrder).toEqual(Array(32).fill(0));
    }
  });

  it('rejects incorrect lengths and values outside the byte range in both languages', () => {
    const zero31 = `[${Array(31).fill('0').join(',')}]`;
    const outOfRange = `[256,${Array(31).fill('0').join(',')}]`;
    const fractional = `[1.5,${Array(31).fill('0').join(',')}]`;
    const boolean = `[true,${Array(31).fill('0').join(',')}]`;
    for (const [scalar, u] of [
      [zero31, zeroU],
      [zeroScalar, zero31],
      [outOfRange, zeroU],
      [zeroScalar, outOfRange],
      [fractional, zeroU],
      [zeroScalar, boolean],
    ]) {
      expect(() => runJavaScript(generate('javascript', scalar, u))).toThrow();
      expect(() => runPython(generate('python', scalar, u))).toThrow();
    }
  });
});
