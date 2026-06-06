/**
 * SM3 密码杂凑算法积木块定义 (GB/T 32905-2016)
 *
 * - pad: 消息填充 (1 || 0* || len), 对齐 512-bit 块
 * - compress: CF 压缩函数 (64 轮)
 */
import * as Blockly from 'blockly/core';

export const SM3_BLOCK_TYPES = [
  'hash_sm3_pad',
  'hash_sm3_pad_text',
  'hash_sm3_pad_hex',
  'hash_sm3_compress',
] as const;

export type Sm3BlockType = (typeof SM3_BLOCK_TYPES)[number];

Blockly.Blocks['hash_sm3_pad'] = {
  init: function () {
    this.appendValueInput('INPUT')
      .setCheck(null)
      .appendField(Blockly.Msg.CRYPTO_SM3_PAD || 'SM3 Pad');
    this.setInputsInline(true);
    this.setOutput(true, null);
    this.setColour(200);
    this.setTooltip(
      Blockly.Msg.CRYPTO_SM3_PAD_TOOLTIP ||
        'SM3 message padding: pad to multiple of 512 bits',
    );
    this.setHelpUrl('');
  },
};

Blockly.Blocks['hash_sm3_pad_text'] = {
  init: function () {
    this.appendValueInput('INPUT')
      .setCheck(null)
      .appendField(Blockly.Msg.CRYPTO_SM3_PAD_TEXT || 'SM3 Text Pad');
    this.setInputsInline(true);
    this.setOutput(true, null);
    this.setColour(200);
    this.setTooltip(
      Blockly.Msg.CRYPTO_SM3_PAD_TEXT_TOOLTIP ||
        'SM3 text string padding (UTF-8)',
    );
    this.setHelpUrl('');
  },
};

Blockly.Blocks['hash_sm3_pad_hex'] = {
  init: function () {
    this.appendValueInput('INPUT')
      .setCheck(null)
      .appendField(Blockly.Msg.CRYPTO_SM3_PAD_HEX || 'SM3 Hex Pad');
    this.setInputsInline(true);
    this.setOutput(true, null);
    this.setColour(200);
    this.setTooltip(
      Blockly.Msg.CRYPTO_SM3_PAD_HEX_TOOLTIP || 'SM3 hex string padding',
    );
    this.setHelpUrl('');
  },
};

// SM3 compression: CF(V, W, WP) → 8-word state XOR
Blockly.Blocks['hash_sm3_compress'] = {
  init: function () {
    this.appendDummyInput().appendField(
      Blockly.Msg.CRYPTO_SM3_COMPRESS || 'SM3 Compress',
    );
    this.appendValueInput('V').setCheck(null).appendField('V=');
    this.appendValueInput('W').setCheck(null).appendField('W=');
    this.appendValueInput('WP').setCheck(null).appendField('WP=');
    this.setInputsInline(true);
    this.setOutput(true, null);
    this.setColour(200);
    this.setTooltip(
      Blockly.Msg.CRYPTO_SM3_COMPRESS_TOOLTIP ||
        'SM3 compression function: CF(V, W, WP)',
    );
    this.setHelpUrl('');
  },
};
