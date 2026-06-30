import * as Blockly from 'blockly/core';

export const COMPOUND_BLOCK_TYPES = ['lgc_compound'] as const;

export type CompoundBlockType = (typeof COMPOUND_BLOCK_TYPES)[number];

Blockly.Blocks['lgc_compound'] = {
  init: function () {
    const dropdown = new Blockly.FieldDropdown(() => [
      [Blockly.Msg.CRYPTO_LOGIC_XOR_XOR || 'XOR^XOR', 'XOR_XOR'],
      [Blockly.Msg.CRYPTO_LOGIC_OR_XOR || 'OR^XOR', 'OR_XOR'],
      [Blockly.Msg.CRYPTO_LOGIC_AND_XOR || 'AND^XOR', 'AND_XOR'],
      [Blockly.Msg.CRYPTO_LOGIC_XOR_OR || 'XOR^OR', 'XOR_OR'],
      [Blockly.Msg.CRYPTO_LOGIC_OR_OR || 'OR^OR', 'OR_OR'],
      [Blockly.Msg.CRYPTO_LOGIC_AND_OR || 'AND^OR', 'AND_OR'],
      [Blockly.Msg.CRYPTO_LOGIC_XOR_AND || 'XOR^AND', 'XOR_AND'],
      [Blockly.Msg.CRYPTO_LOGIC_OR_AND || 'OR^AND', 'OR_AND'],
      [Blockly.Msg.CRYPTO_LOGIC_AND_AND || 'AND^AND', 'AND_AND'],
    ]);
    this.appendDummyInput().appendField(dropdown, 'instr');
    this.appendValueInput('A');
    this.appendValueInput('B').setCheck(null).appendField(',');
    this.appendValueInput('C').setCheck(null).appendField(',');
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(15);
    this.setTooltip(
      Blockly.Msg.CRYPTO_LOGIC_COMPOUND_TOOLTIP || '执行复合逻辑运算',
    );
    this.setHelpUrl('');
  },
};
