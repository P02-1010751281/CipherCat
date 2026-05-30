import * as Blockly from 'blockly/core';

export const PARTITION_BLOCK_TYPES = [
  'arr_partition_to_array'
] as const;

export type PartitionBlockType = typeof PARTITION_BLOCK_TYPES[number];

Blockly.Blocks['arr_partition_to_array'] = {
  init: function() {
    this.appendDummyInput()
      .appendField(Blockly.Msg.CRYPTO_PARTITION_SPLIT || 'Split');
    this.appendValueInput('SRC')
      .setCheck(null);
    this.appendDummyInput()
      .appendField(Blockly.Msg.CRYPTO_PARTITION_INTO || 'into');
    this.appendValueInput('COUNT')
      .setCheck(null);
    this.appendDummyInput()
      .appendField(Blockly.Msg.CRYPTO_PARTITION_COUNT || 'parts');
    this.appendValueInput('TARGET')
      .setCheck(null)
      .appendField('[]');
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(200);
    this.setTooltip(Blockly.Msg.CRYPTO_PARTITION_TOOLTIP || 'Split input data by specified count and write to target array');
    this.setHelpUrl('');
  }
};
