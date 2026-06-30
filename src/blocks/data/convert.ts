import * as Blockly from 'blockly/core';

export const CONVERT_BLOCK_TYPES = [
  'data_convert_to_int',
  'data_convert_bits_to_bytes',
  'data_convert_bytes_to_bits'
] as const;

export type ConvertBlockType = typeof CONVERT_BLOCK_TYPES[number];

Blockly.Blocks['data_convert_to_int'] = {
  init: function() {
    this.appendDummyInput()
      .appendField(Blockly.Msg.CRYPTO_CONVERT_TO_INT || 'Convert to Int');
    this.appendValueInput('VAR')
      .setCheck(null)
      .appendField(Blockly.Msg.CRYPTO_CONVERT_VAR || 'Var');
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(160);
    this.setTooltip(Blockly.Msg.CRYPTO_CONVERT_TO_INT_TOOLTIP || 'Convert variable to integer type, assign result to itself');
    this.setHelpUrl('');
  }
};

Blockly.Blocks['data_convert_bits_to_bytes'] = {
  init: function() {
    this.appendValueInput('BYTES')
      .setCheck(null)
      .appendField(Blockly.Msg.CRYPTO_CONVERT_BYTES || 'Bytes');
    this.appendDummyInput()
      .appendField('=');
    this.appendValueInput('BITS')
      .setCheck(null)
      .appendField(Blockly.Msg.CRYPTO_CONVERT_BITS || 'Bit String');
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(160);
    this.setTooltip(Blockly.Msg.CRYPTO_CONVERT_BITS_TO_BYTES_TOOLTIP || 'Convert bit string to bytes');
    this.setHelpUrl('');
  }
};

Blockly.Blocks['data_convert_bytes_to_bits'] = {
  init: function() {
    this.appendValueInput('BITS')
      .setCheck(null)
      .appendField(Blockly.Msg.CRYPTO_CONVERT_BITS || 'Bit String');
    this.appendDummyInput()
      .appendField('=');
    this.appendValueInput('BYTES')
      .setCheck(null)
      .appendField(Blockly.Msg.CRYPTO_CONVERT_BYTES || 'Bytes');
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(160);
    this.setTooltip(Blockly.Msg.CRYPTO_CONVERT_BYTES_TO_BITS_TOOLTIP || 'Convert bytes to bit string');
    this.setHelpUrl('');
  }
};
