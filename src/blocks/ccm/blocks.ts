/**
 * CCM 认证加密原子块定义 (NIST SP 800-38C)
 *
 * - ccm_encrypt: CCM-Encrypt(key, nonce, aad, msg, tagLen) → Bytes（密文 ‖ 认证标签）
 *   CBC-MAC 认证（B0 ‖ 长度编码 AAD ‖ 明文，零填充）+ CTR 加密（flags ‖ nonce ‖ 计数器）。
 *   TAGLEN 下拉 4-16 字节（偶数），官方向量（附录 C Example 1-3）双语言通过。
 */
import * as Blockly from 'blockly/core';
import { TYPE_BYTES, TYPE_INT_LIST } from '@/constants/block-types';

export const CCM_BLOCK_TYPES = ['ccm_encrypt'] as const;
export type CcmBlockType = (typeof CCM_BLOCK_TYPES)[number];

Blockly.Blocks['ccm_encrypt'] = {
  init: function () {
    this.appendValueInput('KEY')
      .setCheck(TYPE_BYTES)
      .appendField('CCM-Encrypt(');
    this.appendValueInput('NONCE').setCheck(TYPE_INT_LIST).appendField(' nonce:');
    this.appendValueInput('AAD').setCheck(TYPE_INT_LIST).appendField(' aad:');
    this.appendValueInput('MSG').setCheck(TYPE_BYTES).appendField(' msg:');
    const tagDropdown = new Blockly.FieldDropdown([
      ['4', '4'],
      ['6', '6'],
      ['8', '8'],
      ['10', '10'],
      ['12', '12'],
      ['14', '14'],
      ['16', '16'],
    ]);
    tagDropdown.setValue('16');
    this.appendDummyInput()
      .appendField(tagDropdown, 'TAGLEN')
      .appendField(' tagLen)');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_BYTES);
    this.setColour(190);
    this.setTooltip(
      'CCM 认证加密 (NIST SP 800-38C)：CBC-MAC 认证标签（B0 标志位含 nonce 长度/明文长度/标签长度）+ CTR 加密，输出 密文‖标签。AES-128 官方向量（附录 C Example 1-3）验证通过。',
    );
    this.setHelpUrl('https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-38C.pdf');
  },
};
