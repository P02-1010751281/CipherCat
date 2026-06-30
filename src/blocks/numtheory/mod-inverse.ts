import * as Blockly from 'blockly/core';

export const MOD_INVERSE_BLOCK_TYPES = [
  'nt_mod_inverse'
] as const;

export type ModInverseBlockType = typeof MOD_INVERSE_BLOCK_TYPES[number];

Blockly.Blocks['nt_mod_inverse'] = {
  init: function() {
    this.appendValueInput('D').setCheck(null).appendField(Blockly.Msg.CRYPTO_MOD_INVERSE_ASSIGN || 'Mod Inverse d');
    this.appendDummyInput().appendField('= inv(');
    this.appendValueInput('E').setCheck(null);
    this.appendDummyInput().appendField(',');
    this.appendValueInput('PHI').setCheck(null);
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(230);
    this.setTooltip(Blockly.Msg.CRYPTO_MOD_INVERSE_TOOLTIP || 'Compute d = modular inverse of e mod φ(n)');
    this.setHelpUrl('');
  }
};
