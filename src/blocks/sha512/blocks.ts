/**
 * SHA-512 / SHA-384 积木块定义（FIPS 180-4，64 位字）
 *
 * 补齐 SHA-2 系列缺失：SHA-512（8×64-bit 状态、1024-bit 块、80 轮）。
 * SHA-384 复用同一 64 位核（不同 IV + 截断到 48 字节），由 demo/模板完成。
 */
import { TYPE_BYTES, TYPE_INT_LIST } from '@/constants/block-types';
import * as Blockly from 'blockly/core';

export const SHA512_BLOCK_TYPES = ['hash_sha512_pad', 'hash_sha512_compress', 'hash_sha512_hash'] as const;

export type Sha512BlockType = (typeof SHA512_BLOCK_TYPES)[number];

// SHA-512 填充：1024-bit 块，128-bit 大端长度字段
Blockly.Blocks['hash_sha512_pad'] = {
  init: function () {
    this.appendValueInput('INPUT')
      .setCheck(TYPE_BYTES)
      .appendField('SHA512-Pad( msg:');
    this.appendDummyInput().appendField(')');
    this.setOutput(true, TYPE_BYTES);
    this.setColour(180);
    this.setTooltip(
      Blockly.Msg.CRYPTO_SHA512_PAD_TOOLTIP ||
        'SHA-512 padding (FIPS 180-4): 0x80 + zeros to 1024-bit blocks, 128-bit big-endian length',
    );
    this.setHelpUrl('https://csrc.nist.gov/pubs/fips/180-4/final');
  },
};

// SHA-512 压缩函数：8×64-bit 状态 + 80×64-bit 消息调度 → 8×64-bit
Blockly.Blocks['hash_sha512_compress'] = {
  init: function () {
    this.appendValueInput('V')
      .setCheck(TYPE_INT_LIST)
      .appendField('SHA512-Compress( v:');
    this.appendValueInput('W').setCheck(null).appendField(' w:');
    this.appendDummyInput().appendField(')');
    this.setOutput(true, TYPE_INT_LIST);
    this.setColour(180);
    this.setTooltip(
      Blockly.Msg.CRYPTO_SHA512_COMPRESS_TOOLTIP ||
        'SHA-512 round function (64-bit words, 80 rounds): v (8 words) + w (80 words) → 8 words',
    );
    this.setHelpUrl('https://csrc.nist.gov/pubs/fips/180-4/final');
  },
};

// 独立 SHA-384/512 封装块（FIPS 180-4）：msg + SIZE 下拉 → 摘要字节（内嵌正确 IV + 截断）
Blockly.Blocks['hash_sha512_hash'] = {
  init: function () {
    this.appendValueInput('MSG')
      .setCheck(TYPE_BYTES)
      .appendField('SHA512-Hash( msg:');
    this.appendDummyInput().appendField(' size:').appendField(
      new Blockly.FieldDropdown(
        ['384', '512'].map((s) => [s + ' bits', s]),
        (v: string) => {
          this.size = v;
          return v;
        },
      ),
      'SIZE',
    );
    this.appendDummyInput().appendField(')');
    this.setOutput(true, TYPE_BYTES);
    this.setColour(180);
    this.setTooltip(
      Blockly.Msg.CRYPTO_SHA512_HASH_TOOLTIP ||
        'SHA-384/512 one-shot hash (FIPS 180-4): 64-bit core, size/8 bytes output',
    );
    this.setHelpUrl('https://csrc.nist.gov/pubs/fips/180-4/final');
  },
};
