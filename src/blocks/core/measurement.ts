import * as Blockly from 'blockly/core';

export const MEASUREMENT_BLOCK_TYPES = [
  'data_bit_length',
  'data_byte_length'
] as const;

export type MeasurementBlockType = typeof MEASUREMENT_BLOCK_TYPES[number];

Blockly.Blocks['data_bit_length'] = {
  init: function() {
    this.appendDummyInput()
      .appendField(Blockly.Msg.CRYPTO_MEASURE_BIT_LENGTH || 'Bit Length(');
    this.appendValueInput('X')
      .setCheck(null);
    this.appendDummyInput()
      .appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, null);
    this.setColour(200);
    this.setTooltip(Blockly.Msg.CRYPTO_MEASURE_BIT_LENGTH_TOOLTIP || 'Return the bit length of the input');
    this.setHelpUrl('');
  }
};

Blockly.Blocks['data_byte_length'] = {
  init: function() {
    this.appendDummyInput()
      .appendField(Blockly.Msg.CRYPTO_MEASURE_BYTE_LENGTH || 'Byte Length(');
    this.appendValueInput('X')
      .setCheck(null);
    this.appendDummyInput()
      .appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, null);
    this.setColour(200);
    this.setTooltip(Blockly.Msg.CRYPTO_MEASURE_BYTE_LENGTH_TOOLTIP || 'Return the byte length of the input');
    this.setHelpUrl('');
  }
};
