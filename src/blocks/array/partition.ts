import * as Blockly from 'blockly/core';
import { TYPE_NUMBER } from '@/constants/block-types';

export const PARTITION_BLOCK_TYPES = [
  'arr_partition_to_array'
] as const;

export type PartitionBlockType = typeof PARTITION_BLOCK_TYPES[number];

Blockly.Blocks['arr_partition_to_array'] = {
  init: function() {
    const mode = new Blockly.FieldDropdown([
      [Blockly.Msg.CRYPTO_PARTITION_MODE_BYTES || '字节切片', 'BYTES'],
      [Blockly.Msg.CRYPTO_PARTITION_MODE_WORDS32 || '32 位字', 'WORDS32'],
    ]);
    this.appendDummyInput()
      .appendField(Blockly.Msg.CRYPTO_PARTITION_SPLIT || 'Split');
    this.appendValueInput('SRC')
      .setCheck(null);
    this.appendDummyInput()
      .appendField(Blockly.Msg.CRYPTO_PARTITION_INTO || 'into');
    this.appendValueInput('COUNT')
      .setCheck(TYPE_NUMBER);
    this.appendDummyInput()
      .appendField(Blockly.Msg.CRYPTO_PARTITION_COUNT || 'parts');
    this.appendDummyInput()
      .appendField(Blockly.Msg.CRYPTO_PARTITION_AS || 'mode')
      .appendField(mode, 'MODE');
    this.appendValueInput('TARGET')
      .setCheck(null)
      .appendField(Blockly.Msg.CRYPTO_PARTITION_TARGET || 'as');
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(200);
    this.setTooltip(Blockly.Msg.CRYPTO_PARTITION_TOOLTIP || 'Split bytes into equal slices or 32-bit big-endian words and assign the result to a variable');
    this.setHelpUrl('');
  }
};
