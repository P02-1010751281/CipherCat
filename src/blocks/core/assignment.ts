import * as Blockly from 'blockly/core';

export const ASSIGNMENT_BLOCK_TYPES = [
  'ctrl_assign'
] as const;

export type AssignmentBlockType = typeof ASSIGNMENT_BLOCK_TYPES[number];

Blockly.Blocks['ctrl_assign'] = {
  init: function() {
    this.appendValueInput('LEFT')
      .setCheck(null);
    this.appendDummyInput()
      .appendField('=');
    this.appendValueInput('RIGHT')
      .setCheck(null);
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(200);
    this.setTooltip(Blockly.Msg.CRYPTO_ASSIGN_TOOLTIP || '赋值模块：左值等于右值');
    this.setHelpUrl('');
  }
};
