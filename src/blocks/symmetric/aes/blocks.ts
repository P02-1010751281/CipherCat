/**
 * AES SubBytes — 对 16 字节状态执行 S-box 替换
 * FIPS 197 §5.1.1
 */
import * as Blockly from 'blockly/core';
import { TYPE_BYTES, TYPE_INT_LIST } from '@/constants/block-types';

export const AES_BLOCK_TYPES = [
  'aes_sub_bytes',
  'aes_shift_rows',
  'aes_mix_columns',
  'aes_add_round_key',
  'aes_round',
  'aes_last_round',
  'aes_key_schedule',
] as const;
export type AesBlockType = (typeof AES_BLOCK_TYPES)[number];

Blockly.Blocks['aes_sub_bytes'] = {
  init: function () {
    this.appendValueInput('STATE').setCheck(TYPE_INT_LIST).appendField('SubBytes(');
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_INT_LIST);
    this.setColour(180);
    this.setTooltip('AES SubBytes: S-box 替换状态的每个字节 (FIPS 197 §5.1.1)');
    this.setHelpUrl('https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.197.pdf');
  },
};

Blockly.Blocks['aes_shift_rows'] = {
  init: function () {
    this.appendValueInput('STATE').setCheck(TYPE_INT_LIST).appendField('ShiftRows(');
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_INT_LIST);
    this.setColour(180);
    this.setTooltip('AES ShiftRows: 第 i 行循环左移 i 个字节 (FIPS 197 §5.1.2)');
    this.setHelpUrl('https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.197.pdf');
  },
};

Blockly.Blocks['aes_mix_columns'] = {
  init: function () {
    this.appendValueInput('STATE').setCheck(TYPE_INT_LIST).appendField('MixColumns(');
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_INT_LIST);
    this.setColour(180);
    this.setTooltip('AES MixColumns: GF(2⁸) 矩阵列混合 (FIPS 197 §5.1.3)');
    this.setHelpUrl('https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.197.pdf');
  },
};

Blockly.Blocks['aes_add_round_key'] = {
  init: function () {
    this.appendValueInput('STATE').setCheck(TYPE_INT_LIST).appendField('AddRoundKey(');
    this.appendValueInput('ROUND_KEY').setCheck(TYPE_INT_LIST).appendField(', rk:');
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_INT_LIST);
    this.setColour(180);
    this.setTooltip('AES AddRoundKey: 状态 ⊕ 轮密钥 (FIPS 197 §5.1.4)');
    this.setHelpUrl('https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.197.pdf');
  },
};

// ─────────────────────────────────────────────
// AES 便利块（colour 195 = 180 + 15 便利层偏移）
// ─────────────────────────────────────────────

Blockly.Blocks['aes_round'] = {
  init: function () {
    this.appendValueInput('STATE').setCheck(TYPE_INT_LIST).appendField('AESRound(');
    this.appendValueInput('ROUND_KEY').setCheck(TYPE_INT_LIST).appendField(', rk:');
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_INT_LIST);
    this.setColour(195);
    this.setTooltip('AES 完整轮: SubBytes→ShiftRows→MixColumns→AddRoundKey (FIPS 197 §5.1)');
    this.setHelpUrl('https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.197.pdf');
  },
};

Blockly.Blocks['aes_last_round'] = {
  init: function () {
    this.appendValueInput('STATE').setCheck(TYPE_INT_LIST).appendField('AESLastRound(');
    this.appendValueInput('ROUND_KEY').setCheck(TYPE_INT_LIST).appendField(', rk:');
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_INT_LIST);
    this.setColour(195);
    this.setTooltip('AES 最后一轮: SubBytes→ShiftRows→AddRoundKey (跳过 MixColumns) (FIPS 197 §5.1)');
    this.setHelpUrl('https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.197.pdf');
  },
};

Blockly.Blocks['aes_key_schedule'] = {
  init: function () {
    this.appendValueInput('KEY').setCheck(TYPE_BYTES).appendField('AESKeySchedule(');
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_INT_LIST);
    this.setColour(195);
    this.setTooltip('AES 密钥扩展: 输入 16/24/32 字节密钥，输出展平的轮密钥序列 (11/13/15 轮) (FIPS 197 §5.2)');
    this.setHelpUrl('https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.197.pdf');
  },
};
