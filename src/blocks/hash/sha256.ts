/**
 * SHA-256 积木块定义 (FIPS 180-4)
 *
 * - pad: 消息填充 (1 || 0* || len), 对齐 512-bit 块
 * - compress: Merkle-Damgård 压缩函数 (64 轮)
 *
 * 参考: https://csrc.nist.gov/pubs/fips/180-4/upd1/final
 */
import * as Blockly from 'blockly/core';

export const SHA256_BLOCK_TYPES = [
  'hash_sha256_pad',
  'hash_sha256_pad_text',
  'hash_sha256_pad_hex',
  'hash_sha256_compress',
] as const;

export type Sha256BlockType = (typeof SHA256_BLOCK_TYPES)[number];

Blockly.Blocks['hash_sha256_pad'] = {
  init: function () {
    this.appendValueInput('INPUT')
      .setCheck(null)
      .appendField(Blockly.Msg.CRYPTO_SHA256_PAD || 'SHA-256 Pad');
    this.setInputsInline(true);
    this.setOutput(true, null);
    this.setColour(200);
    this.setTooltip(
      Blockly.Msg.CRYPTO_SHA256_PAD_TOOLTIP ||
        'SHA-256 message padding (1 || 0* || len)',
    );
    this.setHelpUrl('');
  },
};

Blockly.Blocks['hash_sha256_pad_text'] = {
  init: function () {
    this.appendValueInput('INPUT')
      .setCheck(null)
      .appendField(Blockly.Msg.CRYPTO_SHA256_PAD_TEXT || 'SHA-256 Text Pad');
    this.setInputsInline(true);
    this.setOutput(true, null);
    this.setColour(200);
    this.setTooltip(
      Blockly.Msg.CRYPTO_SHA256_PAD_TEXT_TOOLTIP ||
        'SHA-256 text string padding (UTF-8)',
    );
    this.setHelpUrl('');
  },
};

Blockly.Blocks['hash_sha256_pad_hex'] = {
  init: function () {
    this.appendValueInput('INPUT')
      .setCheck(null)
      .appendField(Blockly.Msg.CRYPTO_SHA256_PAD_HEX || 'SHA-256 Hex Pad');
    this.setInputsInline(true);
    this.setOutput(true, null);
    this.setColour(200);
    this.setTooltip(
      Blockly.Msg.CRYPTO_SHA256_PAD_HEX_TOOLTIP || 'SHA-256 hex string padding',
    );
    this.setHelpUrl('');
  },
};

// SHA-256 compression: CF(V, W) → 8-word state XOR
Blockly.Blocks['hash_sha256_compress'] = {
  init: function () {
    this.appendDummyInput().appendField(
      Blockly.Msg.CRYPTO_SHA256_COMPRESS || 'SHA-256 Compress',
    );
    this.appendValueInput('V').setCheck(null).appendField('V=');
    this.appendValueInput('W').setCheck(null).appendField('W=');
    this.setInputsInline(true);
    this.setOutput(true, null);
    this.setColour(200);
    this.setTooltip(
      Blockly.Msg.CRYPTO_SHA256_COMPRESS_TOOLTIP ||
        'SHA-256 compression function: CF(V, W)',
    );
    this.setHelpUrl('');
  },
};
