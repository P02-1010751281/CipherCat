/**
 * CMAC 分组 MAC 原子块定义 (NIST SP 800-38B)
 *
 * - cmac_mac: CMAC(key, message) → 16 字节认证标签（子密钥 K1/K2 + CBC-MAC）
 *   CIPHER 下拉：AES-128（官方向量）/ SM4（GB/T 15852 同类结构）
 */
import * as Blockly from 'blockly/core';
import { TYPE_BYTES } from '@/constants/block-types';

export const CMAC_BLOCK_TYPES = ['cmac_mac'] as const;
export type CmacBlockType = (typeof CMAC_BLOCK_TYPES)[number];

Blockly.Blocks['cmac_mac'] = {
  init: function () {
    this.appendValueInput('KEY')
      .setCheck(TYPE_BYTES)
      .appendField('CMAC(');
    this.appendValueInput('MSG').setCheck(TYPE_BYTES).appendField(' msg:');
    this.appendDummyInput()
      .appendField(new Blockly.FieldDropdown([
        ['AES-128 (SP 800-38B)', 'aes'],
        ['SM4 (GB/T 15852)', 'sm4'],
      ]), 'CIPHER')
      .appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_BYTES);
    this.setColour(190);
    this.setTooltip(
      'CMAC 认证标签 (NIST SP 800-38B)：子密钥生成（GF(2^128) 加倍）+ CBC-MAC。AES-128 官方向量验证通过；SM4 为 GB/T 15852 同类结构。',
    );
    this.setHelpUrl('https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-38B.pdf');
  },
};
