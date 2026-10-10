/**
 * XTS 磁盘加密模式原子块定义 (NIST SP 800-38E)
 *
 * - xts_encrypt: XTS-Encrypt(key, tweak, data) → Bytes
 *   key = K1‖K2（两个 AES-128 密钥，共 32 字节）；tweak = 数据单元号（16 字节）；
 *   K1、K2 必须不同；data 长度为 16 字节至 16 MiB，支持末尾部分块的 ciphertext stealing。
 *   每块：T = E_K2(tweak)·α^i（α 乘法 = GF(2^128) 乘 x，little-endian 进位），C_i = E_K1(P_i ⊕ T) ⊕ T。
 *   向量来源：IEEE 1619-2007 / SP 800-38E XTS-AES-128 向量（demos/procedures/XTS-Encrypt.json）。
 *   仓库内暂未包含该向量的独立实现复算；容器契约与拒绝路径由单测覆盖。
 */
import * as Blockly from 'blockly/core';
import { TYPE_BYTES, TYPE_INT_LIST } from '@/constants/block-types';

export const XTS_BLOCK_TYPES = ['xts_encrypt'] as const;
export type XtsBlockType = (typeof XTS_BLOCK_TYPES)[number];

Blockly.Blocks['xts_encrypt'] = {
  init: function () {
    this.appendValueInput('KEY')
      .setCheck(TYPE_BYTES)
      .appendField('XTS-Encrypt(');
    this.appendValueInput('TWEAK').setCheck(TYPE_INT_LIST).appendField(' tweak:');
    this.appendValueInput('MSG').setCheck(TYPE_BYTES).appendField(' data:');
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_BYTES);
    this.setColour(190);
    this.setTooltip(
      'XTS 磁盘加密模式 (NIST SP 800-38E)：key = K1‖K2（32 字节且两半不同），tweak = 数据单元号（16 字节），数据单元为 16 字节至 16 MiB，支持 ciphertext stealing。',
    );
    this.setHelpUrl('https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-38E.pdf');
  },
};
