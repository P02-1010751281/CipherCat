// @vitest-environment jsdom
import * as Blockly from 'blockly/core';
import { setLocale } from 'blockly/core';
import * as enMessages from 'blockly/msg/en';
import { execFileSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';

import '@/blocks/sm9';
import '@/generators/javascript';
import '@/generators/python';
import { javascriptGenerator } from 'blockly/javascript';
import { pythonGenerator } from 'blockly/python';

setLocale(enMessages as unknown as Record<string, string>);

const signingMasterKey = [...Array(31).fill(0), 1];
const signingId = [0x41, 0x6c, 0x69, 0x63, 0x65];
const pythonCommand = process.env.CIPHER_CAT_PYTHON ||
  (process.platform === 'win32' ? 'python' : 'python3');

describe('SM9 signing-key HID block contract', () => {
  it.each(['sm9_user_key', 'sm9_verify'])('%s exposes only signature HID 0x01', (type) => {
    const workspace = new Blockly.Workspace();
    try {
      const block = workspace.newBlock(type);
      const field = block.getField('HID') as Blockly.FieldDropdown;
      expect(field.getOptions().map(([, value]) => value)).toEqual(['1']);
      expect(block.getFieldValue('HID')).toBe('1');
    } finally {
      workspace.dispose();
    }
  });

  it('generates only signature HID 0x01 for these signature blocks', () => {
    const workspace = new Blockly.Workspace();
    try {
      workspace.newBlock('sm9_user_key');
      workspace.newBlock('sm9_verify');
      const javascript = javascriptGenerator.workspaceToCode(workspace);
      const python = pythonGenerator.workspaceToCode(workspace);
      expect(javascript).not.toMatch(/sm9UserKey\([^\n]*, 3\)/);
      expect(javascript).not.toMatch(/sm9Verify\([^\n]*, 3\)/);
      expect(python).not.toMatch(/sm9_user_key\([^\n]*, 3\)/);
      expect(python).not.toMatch(/sm9_verify\([^\n]*, 3\)/);
      expect(javascript).toContain('sm9UserKey([], [], 1)');
      expect(javascript).toContain('sm9Verify([], [], [], [], [], 1)');
      expect(python).toContain('sm9_user_key([], [], 1)');
      expect(python).toContain('sm9_verify([], [], [], [], [], 1)');
    } finally {
      workspace.dispose();
    }
  });

  it('rejects boolean True as a Python HID instead of treating it as integer 1', () => {
    const workspace = new Blockly.Workspace();
    try {
      workspace.newBlock('sm9_user_key');
      const javascript = javascriptGenerator.workspaceToCode(workspace);
      const python = pythonGenerator.workspaceToCode(workspace);
      const javascriptHelpers = javascript.slice(0, javascript.lastIndexOf('\nUint8Array.from(sm9UserKey('));
      const helperCode = python.slice(0, python.lastIndexOf('\nbytes(sm9_user_key('));
      expect(() => new Function(`${javascriptHelpers}\nreturn sm9UserKey(${JSON.stringify(signingMasterKey)}, ${JSON.stringify(signingId)}, true);`)())
        .toThrow('SM9 signing key requires HID 0x01');
      expect(() => execFileSync(pythonCommand, ['-c',
        `${helperCode}\nsm9_user_key(${JSON.stringify(signingMasterKey)}, ${JSON.stringify(signingId)}, True)`,
      ], { stdio: ['ignore', 'ignore', 'pipe'] })).toThrow('SM9 signing key requires HID 0x01');
    } finally {
      workspace.dispose();
    }
  });
});
