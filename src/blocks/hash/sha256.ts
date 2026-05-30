import * as Blockly from 'blockly/core';

export const SHA256_BLOCK_TYPES = [
  'hash_sha256_pad_text',
  'hash_sha256_pad_hex',
  'hash_sha256_pad',
  'hash_sha256_compress'
] as const;

export type Sha256BlockType = typeof SHA256_BLOCK_TYPES[number];

// SHA-256 填充模块
Blockly.Blocks['hash_sha256_pad'] = {
  init: function() {
    this.appendValueInput('LEFT').setCheck(null);
    this.appendDummyInput().appendField(Blockly.Msg.CRYPTO_SHA256_PAD || '= SHA-256 Pad(');
    this.appendValueInput('RIGHT').setCheck(null);
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(200);
    this.setTooltip(Blockly.Msg.CRYPTO_SHA256_PAD_TOOLTIP || 'SHA-256 text padding');
    this.setHelpUrl('');
  }
};

Blockly.Blocks['hash_sha256_pad_hex'] = {
  init: function() {
    this.appendValueInput('LEFT').setCheck(null);
    this.appendDummyInput().appendField(Blockly.Msg.CRYPTO_SHA256_PAD_HEX || '= SHA-256 Hex Pad(');
    this.appendValueInput('RIGHT').setCheck(null);
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(200);
    this.setTooltip(Blockly.Msg.CRYPTO_SHA256_PAD_HEX_TOOLTIP || 'SHA-256 hex string padding');
    this.setHelpUrl('');
  }
};

// SHA-256 文本字符串填充
Blockly.Blocks['hash_sha256_pad_text'] = {
  init: function() {
    this.appendValueInput('LEFT').setCheck(null);
    this.appendDummyInput().appendField(Blockly.Msg.CRYPTO_SHA256_PAD_TEXT || '= SHA-256 Text Pad(');
    this.appendValueInput('RIGHT').setCheck(null);
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(200);
    this.setTooltip(Blockly.Msg.CRYPTO_SHA256_PAD_TEXT_TOOLTIP || 'SHA-256 text string padding (UTF-8)');
    this.setHelpUrl('');
  }
};

// SHA-256 压缩函数
Blockly.Blocks['hash_sha256_compress'] = {
  init: function() {
    this.appendValueInput('OUT').setCheck(null);
    this.appendDummyInput().appendField(Blockly.Msg.CRYPTO_SHA256_COMPRESS || '= SHA-256 Compress(');
    this.appendValueInput('V').setCheck(null);
    this.appendDummyInput().appendField(',');
    this.appendValueInput('W').setCheck(null);
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(200);
    this.setTooltip(Blockly.Msg.CRYPTO_SHA256_COMPRESS_TOOLTIP || 'SHA-256 compression function: OUT = CF(V, B)');
    this.setHelpUrl('');
  }
};