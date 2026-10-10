// @vitest-environment jsdom
import * as Blockly from 'blockly/core';
import 'blockly/blocks';
import { execFileSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';

import '@/blocks/data/number';
import '@/blocks/symmetric/sm4/blocks';
import '@/generators/javascript';
import '@/generators/javascript/symmetric/sm4/blocks';
import '@/generators/python';
import '@/generators/python/symmetric/sm4/blocks';

import { javascriptGenerator } from 'blockly/javascript';
import { pythonGenerator } from 'blockly/python';

const pythonCommand = process.env.CIPHER_CAT_PYTHON ||
  (process.platform === 'win32' ? 'python' : 'python3');

describe('SM4 linear-transform block', () => {
  it('matches GB/T 32907-2016 equation (3) in JavaScript and Python', () => {
    const workspace = new Blockly.Workspace();
    try {
      const transform = workspace.newBlock('sm4_linear_transform');
      const input = workspace.newBlock('data_value');
      input.setFieldValue('[0x00,0x00,0x00,0x01]', 'NUM');
      transform.getInput('B')!.connection!.connect(input.outputConnection!);

      const javascript = javascriptGenerator.workspaceToCode(workspace).trim().split('\n');
      const jsExpression = javascript.pop()!.replace(/;$/, '');
      const jsResult = new Function([...javascript, `return ${jsExpression};`].join('\n'))();

      const python = pythonGenerator.workspaceToCode(workspace).trim().split('\n');
      const pyExpression = python.pop()!;
      const pyResult = execFileSync(pythonCommand, ['-c', [
        ...python,
        `print(__import__("json").dumps(${pyExpression}))`,
      ].join('\n')], { encoding: 'utf8' }).trim();

      // L(0x00000001) = 0x01040405 per the standard's rotate-XOR equation.
      expect(jsResult).toEqual([0x01, 0x04, 0x04, 0x05]);
      expect(JSON.parse(pyResult)).toEqual([0x01, 0x04, 0x04, 0x05]);
    } finally {
      workspace.dispose();
    }
  });
});
