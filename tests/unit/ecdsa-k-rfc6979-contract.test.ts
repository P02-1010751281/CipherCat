// @vitest-environment jsdom
import * as Blockly from 'blockly/core';
import 'blockly/blocks';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';

import '@/blocks/ecdsa';
import '@/blocks/data/number';
import '@/generators/javascript';
import '@/generators/javascript/ecdsa';
import '@/generators/python';
import '@/generators/python/ecdsa';

import { javascriptGenerator } from 'blockly/javascript';
import { pythonGenerator } from 'blockly/python';

const pythonCommand = process.env.CIPHER_CAT_PYTHON ||
  (process.platform === 'win32' ? 'python' : 'python3');

/** RFC 6979 A.2.5（P-256，SHA-256）：私钥 x 与 message = "sample" 的确定性 k（原文该行 k 为 A6E3C57D…） */
const PRIV = 'c9afa9d845ba75166b5c215767b1d6934e50c3db36e89b127b8a622b120f6721';
const EXPECTED_K = 'a6e3c57dd01abe90086538398355dd4c3b17aa873382b0f24d6129493d8aad60';

const privBytes = PRIV.match(/../g)!.map((pair) => parseInt(pair, 16));
/** 独立计算 h1 = SHA-256("sample")（Node 内置实现，与生成器无关） */
const hashBytes = Array.from(createHash('sha256').update('sample').digest());

function generate(language: 'javascript' | 'python'): string {
  const workspace = new Blockly.Workspace();
  try {
    const block = workspace.newBlock('ecdsa_k_rfc6979');
    for (const [input, values] of [['PRIV', privBytes], ['HASH', hashBytes]] as const) {
      const source = workspace.newBlock('data_value');
      source.setFieldValue(`[${values.join(', ')}]`, 'NUM');
      block.getInput(input)!.connection!.connect(source.outputConnection!);
    }
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

describe('RFC 6979 deterministic k block (P-256 + SHA-256)', () => {
  it('reproduces the published A.2.5 k for message "sample"', () => {
    expect(evaluateJavaScript(generate('javascript'))).toBe(EXPECTED_K);
    expect(evaluatePython(generate('python'))).toBe(EXPECTED_K);
  });

  it('rejects a hash that is not 32 bytes in both languages', () => {
    const shortHash = hashBytes.slice(0, 31);
    const build = (language: 'javascript' | 'python') => {
      const workspace = new Blockly.Workspace();
      try {
        const block = workspace.newBlock('ecdsa_k_rfc6979');
        for (const [input, values] of [['PRIV', privBytes], ['HASH', shortHash]] as const) {
          const source = workspace.newBlock('data_value');
          source.setFieldValue(`[${values.join(', ')}]`, 'NUM');
          block.getInput(input)!.connection!.connect(source.outputConnection!);
        }
        const generator = language === 'javascript' ? javascriptGenerator : pythonGenerator;
        return generator.workspaceToCode(workspace);
      } finally {
        workspace.dispose();
      }
    };
    expect(() => evaluateJavaScript(build('javascript'))).toThrow();
    expect(() => evaluatePython(build('python'))).toThrow();
  });
});
