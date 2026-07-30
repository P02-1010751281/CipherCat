/**
 * 填充模式原子块定义
 *
 * - pad_pkcs7: PKCS#7 填充
 * - pad_zero: 零填充
 */
import * as Blockly from 'blockly/core';
import { TYPE_BYTES, TYPE_NUMBER } from '@/constants/block-types';

export const PADDING_BLOCK_TYPES = [
  'pad_pkcs7',
  'pad_zero',
] as const;
export type PaddingBlockType = (typeof PADDING_BLOCK_TYPES)[number];

Blockly.Blocks['pad_pkcs7'] = {
  init: function () {
    this.appendValueInput('DATA').setCheck(TYPE_BYTES).appendField('PKCS7(');
    this.appendValueInput('BLOCK_SIZE').setCheck(TYPE_NUMBER).appendField(', blockSize:');
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_BYTES);
    this.setColour(180);
    this.setTooltip('PKCS#7 填充：填充 padLen 个值为 padLen 的字节');
    this.setHelpUrl('');
  },
};

Blockly.Blocks['pad_zero'] = {
  init: function () {
    this.appendValueInput('DATA').setCheck(TYPE_BYTES).appendField('ZeroPad(');
    this.appendValueInput('BLOCK_SIZE').setCheck(TYPE_NUMBER).appendField(', blockSize:');
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_BYTES);
    this.setColour(180);
    this.setTooltip('零填充：填充 0x00 字节至 blockSize 的整数倍  [Bytes & Number → Bytes]');
    this.setHelpUrl('');
  },
};
