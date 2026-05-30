import * as Blockly from 'blockly/core';

export const FIELD_BLOCK_TYPES = [
  'nt_field_add'
] as const;

export type FieldBlockType = typeof FIELD_BLOCK_TYPES[number];

Blockly.Blocks['nt_field_add'] = {
  init: function() {
    const dropdown = new Blockly.FieldDropdown(() => [
        ['+', 'ADD'],
        ['-', 'SUB'],
        ['*', 'MUL']
    ]);
    this.appendValueInput('A')
      .setCheck(null);
    this.appendDummyInput()
      .appendField(dropdown, 'OP');
    this.appendValueInput('B')
      .setCheck(null);
    this.appendDummyInput()
      .appendField('mod');
    this.appendValueInput('P')
      .setCheck(null);
    this.setInputsInline(true);
    this.setOutput(true, null);
    this.setColour(210);
    this.setTooltip(Blockly.Msg.CRYPTO_FIELD_ADD_TOOLTIP || 'Finite field operation: add/sub/mul A and B then modulo P');
    this.setHelpUrl('');
  },
};
