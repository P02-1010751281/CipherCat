// @vitest-environment jsdom
import * as Blockly from 'blockly/core';
import 'blockly/blocks';
import { javascriptGenerator } from 'blockly/javascript';
import { pythonGenerator } from 'blockly/python';
import { execFileSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';

import '@/blocks/data';
import '@/blocks/ascon/blocks';
import '@/blocks/zuc/blocks';
import '@/generators/javascript';
import '@/generators/python';

const pythonCommand = process.env.CIPHER_CAT_PYTHON ||
  (process.platform === 'win32' ? 'python' : 'python3');

function generateCall(
  type: string,
  inputs: Record<string, string>,
): { javascript: string; python: string } {
  const workspace = new Blockly.Workspace();
  try {
    const block = workspace.newBlock(type);
    for (const [inputName, value] of Object.entries(inputs)) {
      const valueBlock = workspace.newBlock('data_value');
      valueBlock.setFieldValue(value, 'NUM');
      block.getInput(inputName)!.connection!.connect(valueBlock.outputConnection!);
    }
    return {
      javascript: javascriptGenerator.workspaceToCode(workspace),
      python: pythonGenerator.workspaceToCode(workspace),
    };
  } finally {
    workspace.dispose();
  }
}

function expectPythonToReject(code: string, message: string): void {
  let stderr = '';
  try {
    execFileSync(pythonCommand, ['-c', code], { stdio: ['ignore', 'ignore', 'pipe'] });
  } catch (error) {
    stderr = String((error as { stderr?: Buffer }).stderr ?? '');
  }
  expect(stderr).toContain(message);
}

describe('generated playground resource limits', () => {
  it.each(['1.5', '1048577'])(
    'rejects Ascon XOF output length %s in JavaScript and Python',
    (length) => {
      const code = generateCall('ascon_xof128', { MSG: '[]', LEN: length });
      expect(() => new Function(code.javascript)()).toThrow(/output length/);
      expectPythonToReject(code.python, 'output length');
    },
  );

  it.each(['1.5', '262145'])(
    'rejects ZUC keystream word count %s in JavaScript and Python',
    (length) => {
      const code = generateCall('zuc_keystream', {
        KEY: '[0] * 16',
        IV: '[0] * 16',
        LEN: length,
      });
      expect(() => new Function(code.javascript)()).toThrow(/output length/);
      expectPythonToReject(code.python, 'output length');
    },
  );
});
