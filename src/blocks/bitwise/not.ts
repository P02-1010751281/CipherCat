import * as Blockly from 'blockly/core';
import { TYPE_NUMBER } from '@/constants/block-types';

export const NOT_BLOCK_TYPES = [
  'bit_not32'
] as const;

export type NotBlockType = typeof NOT_BLOCK_TYPES[number];

Blockly.Blocks['bit_not32'] = {
  init: function() {
    this.appendDummyInput()
      .appendField(Blockly.Msg.CRYPTO_BIT_NOT32 || 'NOT32(');
    this.appendValueInput('A')
      .setCheck(TYPE_NUMBER);
    this.appendDummyInput()
      .appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_NUMBER);
    this.setColour(345);
    this.setTooltip(Blockly.Msg.CRYPTO_BIT_NOT32_TOOLTIP || '对输入值进行32位按位取反');
    this.setHelpUrl('');
  }
};
