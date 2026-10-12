// @vitest-environment jsdom
import * as Blockly from 'blockly/core';
import 'blockly/blocks';
import { execFileSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';

import '@/blocks/pbkdf2';
import '@/blocks/data/number';
import '@/generators/javascript';
import '@/generators/javascript/pbkdf2';
import '@/generators/python';
import '@/generators/python/pbkdf2';

import { javascriptGenerator } from 'blockly/javascript';
import { pythonGenerator } from 'blockly/python';

const pythonCommand = process.env.CIPHER_CAT_PYTHON ||
  (process.platform === 'win32' ? 'python' : 'python3');

/** RFC 7914 §11：PBKDF2-HMAC-SHA256, P="passwd", S="salt", c=1, dkLen=64 */
const PASSWORD = Array.from(Buffer.from('passwd'));
const SALT = Array.from(Buffer.from('salt'));
const T1 = '55ac046e56e3089fec1691c22544b605f94185216dde0465e68b9d57c20dacbc';

function generate(language: 'javascript' | 'python', iter: number, index: number): string {
  const workspace = new Blockly.Workspace();
  try {
    const block = workspace.newBlock('pbkdf2_f');
    block.setFieldValue('sha256', 'HASH');
    const connect = (input: string, field: string, value: string) => {
      const source = workspace.newBlock('data_value');
      source.setFieldValue(value, 'NUM');
      block.getInput(input)!.connection!.connect(source.outputConnection!);
    };
    connect('PASSWORD', 'NUM', `[${PASSWORD.join(', ')}]`);
    connect('SALT', 'NUM', `[${SALT.join(', ')}]`);
    connect('ITER', 'NUM', String(iter));
    connect('INDEX', 'NUM', String(index));
    const generator = language === 'javascript' ? javascriptGenerator : pythonGenerator;
    return generator.workspaceToCode(workspace);
  } finally {
    workspace.dispose();
  }
}

function evaluateJavaScript(program: string): string {
  const lines = program.trim().split('\n');
  const expression = lines.pop()!.replace(/;$/, '');
  return execFileSync(process.execPath, ['-e', [
    ...lines,
    `const result = ${expression};`,
    'console.log(Buffer.from(result).toString("hex"));',
  ].join('\n')], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
}

function evaluatePython(program: string): string {
  const lines = program.trim().split('\n');
  const expression = lines.pop()!;
  return execFileSync(pythonCommand, ['-c', [
    ...lines,
    `result = ${expression}`,
    'print(bytes(result).hex())',
  ].join('\n')], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
}

describe('PBKDF2 F block contract (RFC 8018 §5.2)', () => {
  it('F for c=1 is U_1 = PRF(P, S‖INT(1)) and matches the RFC 7914 vector prefix', () => {
    const js = evaluateJavaScript(generate('javascript', 1, 1));
    const py = evaluatePython(generate('python', 1, 1));
    expect(js).toBe(T1);
    expect(py).toBe(T1);
  });

  it('F for c=4096 and i=1 equals the first block derived by Python hashlib', () => {
    const expected = execFileSync(pythonCommand, ['-c', [
      'import hashlib',
      'print(hashlib.pbkdf2_hmac("sha256", b"passwd", b"salt", 4096, dklen=64)[:32].hex())',
    ].join('\n')], { encoding: 'utf8' }).trim();
    expect(evaluateJavaScript(generate('javascript', 4096, 1))).toBe(expected);
    expect(evaluatePython(generate('python', 4096, 1))).toBe(expected);
  });

  it('rejects a zero or negative iteration count and a zero block index', () => {
    expect(() => evaluateJavaScript(generate('javascript', 0, 1))).toThrow();
    expect(() => evaluatePython(generate('python', 0, 1))).toThrow();
    expect(() => evaluateJavaScript(generate('javascript', 1, 0))).toThrow();
    expect(() => evaluatePython(generate('python', 1, 0))).toThrow();
  });
});
