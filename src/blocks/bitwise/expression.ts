import * as Blockly from 'blockly/core';

export const EXPRESSION_BLOCK_TYPES = [
  'bit_expr_infix'
] as const;

export type ExpressionBlockType = typeof EXPRESSION_BLOCK_TYPES[number];

Blockly.Blocks['bit_expr_infix'] = {
  init: function() {
    const dropdown = new Blockly.FieldDropdown(() => [
      [Blockly.Msg.CRYPTO_LOGIC_XOR || 'XOR', 'XOR'],
      [Blockly.Msg.CRYPTO_LOGIC_AND || 'AND', 'AND'],
      [Blockly.Msg.CRYPTO_LOGIC_OR || 'OR', 'OR'],
      ['=', 'EQ']
    ]);
    this.appendValueInput('A')
      .setCheck(null);
    this.appendDummyInput()
      .appendField(dropdown, 'OP');
    this.appendValueInput('B')
      .setCheck(null);
    this.setInputsInline(true);
    this.setOutput(true, null);
    this.setColour(200);
    this.setTooltip(Blockly.Msg.CRYPTO_EXPR_INFIX_TOOLTIP || '可插入表达式块：支持XOR、AND、OR、=');
    this.setHelpUrl('');
  }
};
