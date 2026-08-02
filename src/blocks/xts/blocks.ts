/**
 * XTS 磁盘加密模式原子块定义 (NIST SP 800-38E)
 *
 * - xts_encrypt: XTS-Encrypt(key, tweak, data) → Bytes
 *   key = K1‖K2（两个 AES-128 密钥，共 32 字节）；tweak = 数据单元号（16 字节）；
 *   data 必须为非空 16 字节倍数（SP 800-38E 仅定义整块操作，无填充）。
 *   每块：T = E_K2(tweak)·α^i（α 乘法 = GF(2^128) 乘 x，little-endian 进位），C_i = E_K1(P_i ⊕ T) ⊕ T。
 *   官方向量：IEEE 1619-2007 XTS-AES-128 经典向量 + cryptography 权威实现交叉验证。
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
      'XTS 磁盘加密模式 (NIST SP 800-38E)：key = K1‖K2（32 字节，两个 AES-128 密钥），tweak = 数据单元号（16 字节），data 须为 16 字节倍数。T = E_K2(tweak)·α^i，C_i = E_K1(P_i ⊕ T) ⊕ T。官方向量（IEEE 1619-2007）验证通过。',
    );
    this.setHelpUrl('https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-38E.pdf');
  },
};
