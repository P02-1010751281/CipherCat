import * as Blockly from 'blockly/core';

export const OPERATION_BLOCK_TYPES = [
  'bit_operation'
] as const;

export type OperationBlockType = typeof OPERATION_BLOCK_TYPES[number];

Blockly.Blocks['bit_operation'] = {
  init: function() {
    const dropdown = new Blockly.FieldDropdown(() => [
      [Blockly.Msg.CRYPTO_BITWISE_AND || '按位与(&)', 'AND'],
      [Blockly.Msg.CRYPTO_BITWISE_OR || '按位或(|)', 'OR'],
      [Blockly.Msg.CRYPTO_BITWISE_XOR || '按位异或(^)', 'XOR'],
      [Blockly.Msg.CRYPTO_BITWISE_RIGHT_SHIFT || '按位右移(>>)', 'RIGHT_SHIFT'],
      [Blockly.Msg.CRYPTO_BITWISE_LEFT_SHIFT || '按位左移(<<)', 'LEFT_SHIFT'],
      [Blockly.Msg.CRYPTO_BITWISE_RIGHT_ROTATE || '循环右移(>>>)', 'RIGHT_ROTATE'],
      [Blockly.Msg.CRYPTO_BITWISE_LEFT_ROTATE || '循环左移(<<<)', 'LEFT_ROTATE']
    ]);
    this.appendValueInput('A')
      .setCheck(null);
    this.appendDummyInput()
      .appendField(dropdown, 'OP');
    this.appendValueInput('B')
      .setCheck(null);
    this.setInputsInline(true);
    this.setOutput(true, null);
    this.setColour(345);
    this.setTooltip(Blockly.Msg.CRYPTO_BIT_OPERATION_TOOLTIP || '对输入执行按位运算（逻辑/移位/循环），可前后拼接');
    this.setHelpUrl('');
  }
};
