import * as Blockly from 'blockly/core';

export const SM3_BLOCK_TYPES = [
  'hash_sm3_pad_text',
  'hash_sm3_pad_hex',
  'hash_sm3_pad',
  'hash_sm3_compress'
] as const;

export type Sm3BlockType = typeof SM3_BLOCK_TYPES[number];


// SM3 文本字符串填充：b = 文本字符串填充(a)
// 更名为 hash_sm3_pad_text，避免与通用填充块同名
Blockly.Blocks['hash_sm3_pad_text'] = {
  init: function() {
    this.appendValueInput('LEFT')
      .setCheck(null);
    this.appendDummyInput()
      .appendField(Blockly.Msg.CRYPTO_SM3_PAD_TEXT || '= SM3 Text Pad(');
    this.appendValueInput('RIGHT')
      .setCheck(null);
    this.appendDummyInput()
      .appendField(')');
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(200);
    this.setTooltip(Blockly.Msg.CRYPTO_SM3_PAD_TEXT_TOOLTIP || 'SM3 text string padding (UTF-8)');
    this.setHelpUrl('');
  }
};

// SM3 十六进制字符串填充：b = 十六进制字符串填充(a)
Blockly.Blocks['hash_sm3_pad_hex'] = {
  init: function() {
    this.appendValueInput('LEFT')
      .setCheck(null);
    this.appendDummyInput()
      .appendField(Blockly.Msg.CRYPTO_SM3_PAD_HEX || '= SM3 Hex Pad(');
    this.appendValueInput('RIGHT')
      .setCheck(null);
    this.appendDummyInput()
      .appendField(')');
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(200);
    this.setTooltip(Blockly.Msg.CRYPTO_SM3_PAD_HEX_TOOLTIP || 'SM3 hex string padding (2 hex chars = 1 byte)');
    this.setHelpUrl('');
  }
};

// SM3 消息填充块：b = 填充(a)
Blockly.Blocks['hash_sm3_pad'] = {
  init: function() {
    this.appendValueInput('LEFT')
      .setCheck(null);
    this.appendDummyInput()
      .appendField(Blockly.Msg.CRYPTO_SM3_PAD || '= SM3 Pad(');
    this.appendValueInput('RIGHT')
      .setCheck(null);
    this.appendDummyInput()
      .appendField(')');
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(200);
    this.setTooltip(Blockly.Msg.CRYPTO_SM3_PAD_TOOLTIP || 'SM3 message padding: pad message to multiple of 512 bits');
    this.setHelpUrl('');
  }
};

// SM3 压缩函数块：y = 压缩(V, W, W')
Blockly.Blocks['hash_sm3_compress'] = {
  init: function() {
    this.appendValueInput('OUT').setCheck(null);
    this.appendDummyInput().appendField(Blockly.Msg.CRYPTO_SM3_COMPRESS || '= SM3 Compress(');
    this.appendValueInput('V').setCheck(null);
    this.appendDummyInput().appendField(',');
    this.appendValueInput('W').setCheck(null);
    this.appendDummyInput().appendField(',');
    this.appendValueInput('WP').setCheck(null);
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(200);
    this.setTooltip(Blockly.Msg.CRYPTO_SM3_COMPRESS_TOOLTIP || 'SM3 compression function: OUT = CF(V, B) with expanded message W, W\'');
    this.setHelpUrl('');
  }
};