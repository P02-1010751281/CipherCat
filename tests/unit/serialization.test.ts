// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import * as Blockly from 'blockly/core';
import 'blockly/blocks';

const { saveDialog, writeTextFile } = vi.hoisted(() => ({
  saveDialog: vi.fn(),
  writeTextFile: vi.fn(),
}));
vi.mock('@tauri-apps/plugin-dialog', () => ({ save: saveDialog }));
vi.mock('@tauri-apps/plugin-fs', () => ({ writeTextFile }));

import {
  downloadContent,
  exportJson,
  exportXml,
  loadJson,
  loadXml,
} from '@/utils/workspace/serialization';

function createWorkspace(): Blockly.WorkspaceSvg {
  return new Blockly.Workspace() as unknown as Blockly.WorkspaceSvg;
}

describe('workspace serialization rollback', () => {
  let workspace: Blockly.WorkspaceSvg | undefined;

  afterEach(() => {
    workspace?.dispose();
    workspace = undefined;
    delete Blockly.Blocks.test_statement_chain;
    Reflect.deleteProperty(window, 'showSaveFilePicker');
    vi.restoreAllMocks();
  });

  it('does not change event state when XML snapshot creation fails', () => {
    workspace = createWorkspace();
    vi.spyOn(Blockly.Xml, 'workspaceToDom').mockImplementationOnce(() => {
      throw new Error('snapshot failed');
    });

    expect(Blockly.Events.isEnabled()).toBe(true);
    expect(loadXml(workspace, '<xml/>')).toBe(false);
    expect(Blockly.Events.isEnabled()).toBe(true);
  });

  it('does not change event state when JSON snapshot creation fails', () => {
    workspace = createWorkspace();
    vi.spyOn(Blockly.serialization.workspaces, 'save').mockImplementationOnce(() => {
      throw new Error('snapshot failed');
    });

    expect(Blockly.Events.isEnabled()).toBe(true);
    expect(loadJson(workspace, JSON.stringify({ blocks: { blocks: [] } }))).toBe(false);
    expect(Blockly.Events.isEnabled()).toBe(true);
  });

  it('restores XML workspace data when the incoming XML fails', () => {
    workspace = createWorkspace();
    expect(
      loadXml(
        workspace,
        '<xml><block type="logic_boolean" id="seed"><field name="BOOL">TRUE</field></block></xml>',
      ),
    ).toBe(true);

    expect(
      loadXml(workspace, '<xml><block type="missing_block" id="bad"></block></xml>'),
    ).toBe(false);
    expect(exportXml(workspace)).toContain('>TRUE</field>');
  });

  it('restores JSON workspace data when the incoming JSON fails', () => {
    workspace = createWorkspace();
    expect(
      loadJson(
        workspace,
        JSON.stringify({
          blocks: {
            blocks: [{ type: 'logic_boolean', id: 'seed', fields: { BOOL: 'TRUE' } }],
          },
        }),
      ),
    ).toBe(true);

    expect(
      loadJson(
        workspace,
        JSON.stringify({
          blocks: { blocks: [{ type: 'missing_block', id: 'bad' }] },
        }),
      ),
    ).toBe(false);
    expect(exportJson(workspace)).toContain('logic_boolean');
  });

  it('rejects deeply nested JSON without replacing the current workspace', () => {
    workspace = createWorkspace();
    expect(
      loadJson(
        workspace,
        JSON.stringify({
          blocks: { blocks: [{ type: 'logic_boolean', id: 'seed' }] },
        }),
      ),
    ).toBe(true);

    let nested: Record<string, unknown> = { type: 'logic_boolean', id: 'deep' };
    for (let index = 0; index < 300; index += 1) {
      nested = {
        type: 'logic_boolean',
        id: `nested-${index}`,
        next: { block: nested },
      };
    }
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    expect(loadJson(workspace, JSON.stringify({ blocks: { blocks: [nested] } }))).toBe(false);
    expect(exportJson(workspace)).toContain('"id":"seed"');
    expect(error.mock.calls.flat().join(' ')).toContain('超过 256 层');
  });

  it('rejects deeply nested XML before replacing the current workspace', () => {
    workspace = createWorkspace();
    expect(
      loadXml(
        workspace,
        '<xml><block type="logic_boolean" id="seed"><field name="BOOL">TRUE</field></block></xml>',
      ),
    ).toBe(true);

    let nested = '<block type="logic_boolean"/>';
    for (let index = 0; index < 300; index += 1) {
      nested = `<block type="logic_boolean"><next>${nested}</next></block>`;
    }
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    expect(loadXml(workspace, `<xml>${nested}</xml>`)).toBe(false);
    expect(exportXml(workspace)).toContain('>TRUE</field>');
    expect(error.mock.calls.flat().join(' ')).toContain('超过 256 层');
  });

  it('rejects deeply nested workspaces before native serialization', () => {
    Blockly.Blocks.test_statement_chain = {
      init() {
        this.appendDummyInput().appendField('statement');
        this.setPreviousStatement(true);
        this.setNextStatement(true);
      },
    };
    workspace = createWorkspace();
    let previous = workspace.newBlock('test_statement_chain');
    for (let index = 0; index < 300; index += 1) {
      const next = workspace.newBlock('test_statement_chain');
      previous.nextConnection!.connect(next.previousConnection!);
      previous = next;
    }
    const save = vi.spyOn(Blockly.serialization.workspaces, 'save');
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    expect(exportJson(workspace)).toBe('');
    expect(save).not.toHaveBeenCalled();
    expect(error.mock.calls.flat().join(' ')).toContain('超过 256 层');
  });

  it('explains why a deeply nested current workspace must be cleared before import', () => {
    Blockly.Blocks.test_statement_chain = {
      init() {
        this.appendDummyInput();
        this.setPreviousStatement(true);
        this.setNextStatement(true);
      },
    };
    workspace = createWorkspace();
    let previous = workspace.newBlock('test_statement_chain');
    for (let index = 0; index < 300; index += 1) {
      const next = workspace.newBlock('test_statement_chain');
      previous.nextConnection!.connect(next.previousConnection!);
      previous = next;
    }

    const xmlSnapshot = vi.spyOn(Blockly.Xml, 'workspaceToDom');
    const jsonSnapshot = vi.spyOn(Blockly.serialization.workspaces, 'save');
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    expect(loadXml(workspace, '<xml><block type="logic_boolean" id="replacement"/></xml>')).toBe(false);
    expect(loadJson(workspace, JSON.stringify({ blocks: { blocks: [{ type: 'logic_boolean' }] } }))).toBe(false);
    expect(xmlSnapshot).not.toHaveBeenCalled();
    expect(jsonSnapshot).not.toHaveBeenCalled();
    expect(workspace.getAllBlocks(false)).toHaveLength(301);
    expect(error.mock.calls.flat().join(' ')).toContain('清空当前工作区');
  });

  it('accepts exactly 256 nested blocks in JSON and XML', () => {
    Blockly.Blocks.test_statement_chain = {
      init() {
        this.appendDummyInput();
        this.setPreviousStatement(true);
        this.setNextStatement(true);
      },
    };
    workspace = createWorkspace();

    let state: Record<string, unknown> = { type: 'test_statement_chain', id: 'json-255' };
    for (let index = 254; index >= 0; index -= 1) {
      state = {
        type: 'test_statement_chain',
        id: `json-${index}`,
        next: { block: state },
      };
    }
    expect(loadJson(workspace, JSON.stringify({ blocks: { blocks: [state] } }))).toBe(true);
    expect(exportJson(workspace)).not.toBe('');

    let xml = '<block type="test_statement_chain" id="xml-255"/>';
    for (let index = 254; index >= 0; index -= 1) {
      xml = `<block type="test_statement_chain" id="xml-${index}"><next>${xml}</next></block>`;
    }
    expect(loadXml(workspace, `<xml>${xml}</xml>`)).toBe(true);
    expect(exportXml(workspace)).not.toBe('');
  });

  it('preserves a statement next-chain through JSON export and import', () => {
    Blockly.Blocks.test_statement_chain = {
      init() {
        this.appendDummyInput().appendField('statement');
        this.setPreviousStatement(true);
        this.setNextStatement(true);
      },
    };
    workspace = createWorkspace();
    const first = workspace.newBlock('test_statement_chain');
    const second = workspace.newBlock('test_statement_chain');
    first.nextConnection!.connect(second.previousConnection!);

    const jsonText = exportJson(workspace);
    workspace.clear();

    expect(loadJson(workspace, jsonText)).toBe(true);
    const topBlocks = workspace.getTopBlocks(false);
    expect(topBlocks).toHaveLength(1);
    expect(topBlocks[0].getNextBlock()?.id).toBe(second.id);
  });

  it('reports a cancelled native save without starting a browser download', async () => {
    saveDialog.mockResolvedValueOnce(null);

    await expect(downloadContent('{"blocks":{}}', 'workspace.json')).resolves.toBeNull();
    expect(writeTextFile).not.toHaveBeenCalled();
    expect(document.querySelector('a[download]')).toBeNull();
  });

  it('propagates native file write failures instead of reporting success', async () => {
    saveDialog.mockResolvedValueOnce('/tmp/workspace.json');
    writeTextFile.mockRejectedValueOnce(new Error('disk full'));

    await expect(downloadContent('{"blocks":{}}', 'workspace.json')).rejects.toThrow('disk full');
    expect(document.querySelector('a[download]')).toBeNull();
  });

  it('treats browser save-picker cancellation as cancellation, not a download', async () => {
    saveDialog.mockRejectedValueOnce(new Error('not running in Tauri'));
    const picker = vi.fn().mockRejectedValueOnce(new DOMException('cancelled', 'AbortError'));
    Object.defineProperty(window, 'showSaveFilePicker', { configurable: true, value: picker });

    await expect(downloadContent('{"blocks":{}}', 'workspace.json')).resolves.toBeNull();
    expect(document.querySelector('a[download]')).toBeNull();
  });
});
