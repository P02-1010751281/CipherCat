/**
 * CMAC 分组 MAC 原子块定义 (NIST SP 800-38B)
 *
 * - cmac_mac: CMAC(key, message) → 16 字节认证标签（子密钥 K1/K2 + CBC-MAC）
 *   CIPHER 下拉：AES-128（官方向量）/ SM4（GB/T 15852 同类结构）
 */
import * as Blockly from 'blockly/core';
import { TYPE_BYTES, TYPE_INT_LIST } from '@/constants/block-types';

export const CMAC_BLOCK_TYPES = ['cmac_mac', 'cmac_double', 'cmac_subkeys'] as const;
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
      'CMAC 认证标签 (NIST SP 800-38B)：子密钥生成（GF(2^128) 加倍）+ CBC-MAC。已核对 SP 800-38B / RFC 4493 的 AES-128 向量（0/16/40/64 字节）与 SM4 同类结构路径；不是完整 CMAC 测试集或认证。',
    );
    this.setHelpUrl('https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-38B.pdf');
  },
};

/** CMAC 内部算子（SP 800-38B §6.1）：GF(2¹²⁸) 加倍与 AES-128 子密钥。 */
Blockly.Blocks['cmac_double'] = {
  init: function () {
    this.appendValueInput('X').setCheck(TYPE_INT_LIST).appendField('GF(2¹²⁸) 加倍  X:');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_INT_LIST);
    this.setColour(190);
    this.setTooltip(
      'CMAC 子密钥加倍（SP 800-38B §6.1）：向左移一位，最高位为 1 时与 0x87 异或。RFC 4493 §4 的 L→K1→K2 向量可核对。',
    );
    this.setHelpUrl('https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-38B.pdf');
  },
};

Blockly.Blocks['cmac_subkeys'] = {
  init: function () {
    this.appendValueInput('KEY').setCheck(TYPE_BYTES).appendField('CMAC 子密钥( key:');
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_BYTES);
    this.setColour(190);
    this.setTooltip(
      'CMAC 子密钥 K1‖K2（SP 800-38B §6.1，AES-128）：L = AES_K(0¹²⁸)，K1 = 2·L，K2 = 2·K1。输出 32 字节；RFC 4493 §4 给出示例密钥的 L/K1/K2。',
    );
    this.setHelpUrl('https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-38B.pdf');
  },
};
