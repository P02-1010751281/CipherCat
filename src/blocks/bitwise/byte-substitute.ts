import * as Blockly from 'blockly/core';

export const BYTE_SUBSTITUTE_BLOCK_TYPES = [
  'bit_byte_substitute'
] as const;

export type ByteSubstituteBlockType = typeof BYTE_SUBSTITUTE_BLOCK_TYPES[number];

Blockly.Blocks['bit_byte_substitute'] = {
  init: function() {
    this.appendValueInput('INPUT')
      .setCheck(null)
      .appendField(Blockly.Msg.CRYPTO_BYTE_SUBSTITUTE || '字节替换 输入');
    this.appendValueInput('OUTPUT')
      .setCheck(null)
      .appendField(Blockly.Msg.CRYPTO_BYTE_SUBSTITUTE_OUTPUT || '输出变量');
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(230);
    this.setTooltip(Blockly.Msg.CRYPTO_BYTE_SUBSTITUTE_TOOLTIP || '将输入字节替换为输出字节');
    this.setHelpUrl('');
  }
};
