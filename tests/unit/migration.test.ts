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

  it('migrates legacy array partition output modes and remains idempotent', () => {
    const xml = '<xml><block type="crypto_partition_to_array"><value name="TARGET"><block type="data_value"><field name="NUM">B</field></block></value></block><block type="arr_partition_to_array"><value name="TARGET"><block type="data_value"><field name="NUM">W</field></block></value></block></xml>';
    const migratedXml = migrateXmlText(xml);
    expect(migratedXml).toContain('type="arr_partition_to_array"');
    expect(migratedXml).toContain('<field name="MODE">BYTES</field>');
    expect(migratedXml).toContain('<field name="MODE">WORDS32</field>');
    expect(migrateXmlText(migratedXml)).toBe(migratedXml);

    const migrated = migrateJsonState({
      variables: [
        { id: 'byte-target', name: 'B' },
        { id: 'word-target', name: 'W' },
      ],
      blocks: { blocks: [
        {
          type: 'crypto_partition_to_array',
          inputs: { TARGET: { block: { type: 'data_value', fields: { NUM: 'Block' } } } },
        },
        {
          type: 'arr_partition_to_array',
          inputs: { TARGET: { block: { type: 'data_value', fields: { NUM: 'W' } } } },
        },
        { type: 'arr_partition_to_array', fields: { MODE: 'BYTES' } },
        {
          type: 'controls_if',
          inputs: {
            DO0: {
              block: {
                type: 'crypto_partition_to_array',
                inputs: { TARGET: { shadow: { type: 'data_value', fields: { NUM: 'B' } } } },
              },
            },
          },
        },
        {
          type: 'arr_partition_to_array',
          inputs: { TARGET: { block: { type: 'variables_get', fields: { VAR: { id: 'byte-target' } } } } },
        },
        {
          type: 'controls_if',
          inputs: {
            DO0: {
              block: {
                type: 'arr_partition_to_array',
                inputs: { TARGET: { block: { type: 'variables_get', fields: { VAR: { id: 'word-target' } } } } },
              },
            },
          },
        },
      ] },
    });
    const blocks = (migrated.blocks as { blocks: Array<Record<string, unknown>> }).blocks;
    expect(blocks.slice(0, 3).map((block) => (block.fields as Record<string, unknown>).MODE))
      .toEqual(['BYTES', 'WORDS32', 'BYTES']);
    const nested = ((blocks[3].inputs as Record<string, { block: Record<string, unknown> }>).DO0.block);
    expect(nested.type).toBe('arr_partition_to_array');
    expect((nested.fields as Record<string, unknown>).MODE).toBe('BYTES');
    const nestedTarget = (nested.inputs as Record<string, { shadow: Record<string, unknown> }>).TARGET.shadow;
    expect(nestedTarget.type).toBe('data_value');
    expect((nestedTarget.fields as Record<string, unknown>).NUM).toBe('B');
    expect((blocks[4].fields as Record<string, unknown>).MODE).toBe('BYTES');
    const nestedVariablePartition = (blocks[5].inputs as Record<string, { block: Record<string, unknown> }>).DO0.block;
    expect((nestedVariablePartition.fields as Record<string, unknown>).MODE).toBe('WORDS32');
    expect(migrateJsonState(migrated)).toEqual(migrated);
  });

  it('migrates nested partition blocks without mistaking a child mode for its parent', () => {
    const xml = '<xml><block type="arr_partition_to_array"><value name="TARGET"><block type="data_value"><field name="NUM">W</field></block></value><next><block type="arr_partition_to_array"><field name="MODE">BYTES</field><value name="TARGET"><block type="data_value"><field name="NUM">B</field></block></value></block></next></block></xml>';
    const migrated = migrateXmlText(xml);
    expect(migrated.match(/<field name="MODE">/g)).toHaveLength(2);
    expect(migrated).toContain('<field name="MODE">WORDS32</field>');
    expect(migrated).toContain('<field name="MODE">BYTES</field>');
    expect(migrateXmlText(migrated)).toBe(migrated);
  });

  it('migrates partition XML when an attribute contains a greater-than sign', () => {
    const xml = '<xml><block id="x>y" type="crypto_partition_to_array"><value name="TARGET"><block type="data_value"><field name="NUM">W</field></block></value></block></xml>';
    const migrated = migrateXmlText(xml);
    expect(migrated).toContain('<field name="MODE">WORDS32</field>');
  });

  it('changes legacy type and field names without rewriting unrelated JSON or XML fields', () => {
    const state = migrateJsonState({
      blocks: { blocks: [
        { type: 'crypto_partition_to_array', fields: { MODE: 'BYTES' } },
        { type: 'text', fields: { TEXT: 'crypto_partition_to_array' } },
        { type: 'crypto_get_text', fields: { TEXT: 'legacy text' } },
      ] },
    });
    const blocks = (state.blocks as { blocks: Array<Record<string, unknown>> }).blocks;
    expect(blocks.map((block) => block.type)).toEqual(['arr_partition_to_array', 'text', 'data_value']);
    expect(blocks[1].fields).toEqual({ TEXT: 'crypto_partition_to_array' });
    expect(blocks[2].fields).toEqual({ NUM: 'legacy text' });

    const xml = migrateXmlText('<xml><block type="crypto_get_text"><field name="TEXT">legacy</field></block><block type="text"><field name="TEXT">keep</field></block></xml>');
    expect(xml).toContain('<block type="data_value"><field name="NUM">legacy</field></block>');
    expect(xml).toContain('<block type="text"><field name="TEXT">keep</field></block>');
  });

  it('preserves block type strings that match inherited map properties', () => {
    const types = ['toString', 'constructor', 'hasOwnProperty'];
    const state = migrateJsonState({ blocks: { blocks: types.map((type) => ({ type })) } });
    const blocks = (state.blocks as { blocks: Array<Record<string, unknown>> }).blocks;
    expect(blocks.map((block) => block.type)).toEqual(types);
    expect(JSON.parse(JSON.stringify(state)).blocks.blocks.map((block: { type: string }) => block.type)).toEqual(types);
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
