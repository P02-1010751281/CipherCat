import * as Blockly from 'blockly/core';

export const ITERATE_BLOCK_TYPES = [
  'ctrl_iterate'
] as const;

export type IterateBlockType = typeof ITERATE_BLOCK_TYPES[number];

Blockly.Blocks['ctrl_iterate'] = {
  init: function() {
    this.appendDummyInput()
      .appendField(Blockly.Msg.CRYPTO_ITERATE_VAR || 'Var')
      .appendField(new Blockly.FieldTextInput('i'), 'VAR')
      .appendField(Blockly.Msg.CRYPTO_ITERATE_LOOP || 'Loop')
      .appendField(new Blockly.FieldNumber(32, 1, 10240, 1), 'TIMES')
      .appendField(Blockly.Msg.CRYPTO_ITERATE_TIMES || 'times');
    this.appendStatementInput('DO')
      .setCheck(null)
      .appendField(Blockly.Msg.CRYPTO_ITERATE_DO || 'Do');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(120);
    this.setTooltip(Blockly.Msg.CRYPTO_ITERATE_TOOLTIP || 'Custom iteration loop');
    this.setHelpUrl('');
  }
};
