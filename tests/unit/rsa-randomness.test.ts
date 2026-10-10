// @vitest-environment jsdom
import { execFileSync } from 'node:child_process';
import * as Blockly from 'blockly/core';
import { afterEach, describe, expect, it, vi } from 'vitest';

import '@/blocks/rsa';
import '@/generators/javascript';
import '@/generators/python';
import { javascriptGenerator } from 'blockly/javascript';
import { pythonGenerator } from 'blockly/python';

const pythonCommand = process.env.CIPHER_CAT_PYTHON ||
  (process.platform === 'win32' ? 'python' : 'python3');

function generateRsaModule(language: 'javascript' | 'python'): string {
  const workspace = new Blockly.Workspace();
  try {
    workspace.newBlock('rsa_keygen');
    const code = language === 'javascript'
      ? javascriptGenerator.workspaceToCode(workspace)
      : pythonGenerator.workspaceToCode(workspace);
    const invocation = code.trimEnd().split('\n').at(-1)!;
    expect(invocation).toMatch(language === 'javascript'
      ? /^Uint8Array\.from\(rsaKeygen\(512\)\);?$/
      : /^bytes\(rsa_keygen\(512\)\)$/);
    const trimmed = code.trimEnd();
    return trimmed.slice(0, trimmed.lastIndexOf('\n'));
  } finally {
    workspace.dispose();
  }
}

afterEach(() => vi.unstubAllGlobals());

describe('RSA generated random sampling', () => {
  it('masks excess bits before rejection-sampling a JavaScript value', () => {
    const module = generateRsaModule('javascript');
    const draws = [Uint8Array.of(0xff, 0xff), Uint8Array.of(0x00, 0x80)];
    const getRandomValues = vi.fn((target: Uint8Array) => {
      target.set(draws[getRandomValues.mock.calls.length - 1]);
      return target;
    });
    vi.stubGlobal('crypto', { getRandomValues });

    const value = new Function(`${module}\nreturn rsaRandBelow(257n);`)() as bigint;

    expect(value).toBe(1n);
    expect(getRandomValues).toHaveBeenCalledTimes(2);
  });

  it('uses uniform Python Miller-Rabin bases in the inclusive range 2..n-2', () => {
    const module = generateRsaModule('python');
    const driver = [
      'import os, secrets',
      'os.urandom = lambda size: (_ for _ in ()).throw(RuntimeError("OS_URANDOM_USED"))',
      'calls = []',
      'def sample(limit):',
      '    calls.append(limit)',
      '    return 0',
      'secrets.randbelow = sample',
      'print(rsa_is_prime(257), len(calls), sorted(set(calls)))',
    ].join('\n');

    expect(execFileSync(pythonCommand, ['-c', `${module}\n${driver}`], { encoding: 'utf8' }).trim())
      .toBe('True 20 [254]');
  });
});
