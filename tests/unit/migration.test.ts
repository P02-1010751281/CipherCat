// @vitest-environment jsdom
import * as Blockly from 'blockly/core';
import 'blockly/blocks';
import { describe, expect, it } from 'vitest';

import { migrateJsonState, migrateXmlText } from '@/utils/migration';
import '@/blocks/sbox/sbox';

describe('workspace migration', () => {
  it('migrates legacy XML block names', () => {
    const xml = migrateXmlText(
      '<xml><block type="crypto_rotate_left"><field name="OP">ROR32</field></block></xml>',
    );

    expect(xml).toContain('type="bit_rotate_left"');
    expect(xml).toContain('<field name="OP">ROR32</field>');
  });

  it('imports and round-trips legacy S-box XML with either quote style', () => {
    const cases = [
      ["<xml><block type='crypto_sbox_16x16' id='sbox-single'><field name='S0A'>ff</field></block></xml>", 'sbox-single', 10, 'ff'],
      ['<xml><block type="crypto_sbox_16x16" id="sbox-double"><field name="S1F">0f</field></block></xml>', 'sbox-double', 31, '0f'],
      ['<xml><block id="sbox-reversed" type="crypto_sbox_16x16"><field name="SFF">a5</field></block></xml>', 'sbox-reversed', 255, 'a5'],
    ] as const;

    for (const [legacyXml, blockId, cellIndex, expected] of cases) {
      const workspace = new Blockly.Workspace();
      try {
        const migrated = migrateXmlText(legacyXml);
        Blockly.Xml.domToWorkspace(Blockly.utils.xml.textToDom(migrated), workspace);

        const block = workspace.getBlockById(blockId);
        if (!block) throw new Error(`migrated S-box ${blockId} did not load`);
        expect(block.type).toBe('sbox');
        const gridData = (block as unknown as { gridData: string[] }).gridData;
        expect(gridData).toHaveLength(256);
        expect(gridData[cellIndex]).toBe(expected);

        const exported = Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(workspace));
        workspace.clear();
        Blockly.Xml.domToWorkspace(Blockly.utils.xml.textToDom(exported), workspace);
        const reloaded = workspace.getBlockById(blockId) as unknown as { gridData: string[] } | null;
        expect(reloaded?.gridData[cellIndex]).toBe(expected);
      } finally {
        workspace.dispose();
      }
    }
  });

  it('migrates a legacy JSON S-box into extraState', () => {
    const state = migrateJsonState({
      blocks: {
        blocks: [
          {
            type: 'crypto_sbox_8x8',
            id: 'sbox-1',
            fields: { S00: '0f', ROW: 8, COL: 8 },
          },
        ],
      },
    });
    const block = (state.blocks as { blocks: Array<Record<string, unknown>> })
      .blocks[0];

    expect(block.type).toBe('sbox');
    expect(block.fields).toEqual({ ROW: 8, COL: 8 });
    expect(block.extraState).toMatchObject({
      data: '0f',
      row: '8',
      col: '8',
    });
  });

  it('keeps indexed assignment blocks as ctrl_assign', () => {
    const state = migrateJsonState({
      blocks: {
        blocks: [
          {
            type: 'ctrl_assign',
            inputs: {
              LEFT: {
                block: { type: 'data_value', fields: { NUM: 1 } },
              },
              RIGHT: { block: { type: 'math_number', fields: { NUM: 2 } } },
            },
          },
        ],
      },
    });
    const block = (state.blocks as { blocks: Array<Record<string, unknown>> })
      .blocks[0];

    expect(block.type).toBe('ctrl_assign');
    expect(block.inputs).toHaveProperty('RIGHT');
  });
});
