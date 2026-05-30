import * as Blockly from 'blockly/core';

export const ROTATE_BLOCK_TYPES = [
  'bit_rotate_left',
  'bit_rotate_left_op',
  'bit_rotate_right',
  'bit_rotate_right_op'
] as const;

export type RotateBlockType = typeof ROTATE_BLOCK_TYPES[number];

Blockly.Blocks['bit_rotate_left'] = {
  init: function() {
    this.appendValueInput('Input')
      .setCheck(null)
      .appendField(Blockly.Msg.CRYPTO_ROTATE_LEFT || '32位循环左移 输入');
    this.appendDummyInput()
      .appendField(Blockly.Msg.CRYPTO_ROTATE_LEFT_BIT || '位数')
      .appendField(new Blockly.FieldNumber(0, 0, 31), 'bit');
    this.appendValueInput('Output')
      .setCheck(null)
      .appendField(Blockly.Msg.CRYPTO_LOGIC_OUTPUT_VAR || '输出变量');
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(160);
    this.setTooltip(Blockly.Msg.CRYPTO_ROTATE_LEFT_TOOLTIP || '对输入进行指定位数的循环左移');
    this.setHelpUrl('');
  }
};

Blockly.Blocks['bit_rotate_right'] = {
  init: function() {
    this.appendValueInput('Input')
      .setCheck(null)
      .appendField(Blockly.Msg.CRYPTO_ROTATE_RIGHT || '32位循环右移 输入');
    this.appendDummyInput()
      .appendField(Blockly.Msg.CRYPTO_ROTATE_LEFT_BIT || '位数')
      .appendField(new Blockly.FieldNumber(0, 0, 31), 'bit');
    this.appendValueInput('Output')
      .setCheck(null)
      .appendField(Blockly.Msg.CRYPTO_LOGIC_OUTPUT_VAR || '输出变量');
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(160);
    this.setTooltip(Blockly.Msg.CRYPTO_ROTATE_RIGHT_TOOLTIP || '对输入进行指定位数的循环右移');
    this.setHelpUrl('');
  }
};

Blockly.Blocks['bit_rotate_left_op'] = {
  init: function() {
    const dropdown = new Blockly.FieldDropdown(() => [
      ['ROL32_XOR', 'ROL32_XOR'],
      ['ROL32_AND', 'ROL32_AND'],
      ['ROL32_OR', 'ROL32_OR'],
      ['ROL32_ADD', 'ROL32_ADD']
    ]);
    this.appendValueInput('Input')
      .setCheck(null)
      .appendField(Blockly.Msg.CRYPTO_ROTATE_LEFT_OP || '32位循环左移与操作 输入');
    this.appendDummyInput()
      .appendField(dropdown, 'option');
    this.appendDummyInput()
      .appendField(Blockly.Msg.CRYPTO_ROTATE_LEFT_BIT || '位数')
      .appendField(new Blockly.FieldNumber(0, 0, 31), 'bit');
    this.appendValueInput('Output')
      .setCheck(null)
      .appendField(Blockly.Msg.CRYPTO_LOGIC_OUTPUT_VAR || '输出变量');
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(90);
    this.setTooltip(Blockly.Msg.CRYPTO_ROTATE_LEFT_OP_TOOLTIP || '循环左移后执行特定操作(异或、与、或、加)');
    this.setHelpUrl('');
  }
};

Blockly.Blocks['bit_rotate_right_op'] = {
  init: function() {
    const dropdown = new Blockly.FieldDropdown(() => [
      ['ROR32_XOR', 'ROR32_XOR'],
      ['ROR32_AND', 'ROR32_AND'],
      ['ROR32_OR', 'ROR32_OR'],
      ['ROR32_ADD', 'ROR32_ADD']
    ]);
    this.appendValueInput('Input')
      .setCheck(null)
      .appendField(Blockly.Msg.CRYPTO_ROTATE_RIGHT_OP || '32位循环右移与操作 输入');
    this.appendDummyInput()
      .appendField(dropdown, 'option');
    this.appendDummyInput()
      .appendField(Blockly.Msg.CRYPTO_ROTATE_LEFT_BIT || '位数')
      .appendField(new Blockly.FieldNumber(0, 0, 31), 'bit');
    this.appendValueInput('Output')
      .setCheck(null)
      .appendField(Blockly.Msg.CRYPTO_LOGIC_OUTPUT_VAR || '输出变量');
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(90);
    this.setTooltip(Blockly.Msg.CRYPTO_ROTATE_RIGHT_OP_TOOLTIP || '循环右移后执行特定操作(异或、与、或、加)');
    this.setHelpUrl('');
  }
};
