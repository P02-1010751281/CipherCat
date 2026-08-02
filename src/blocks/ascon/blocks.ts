/**
 * ASCON 轻量级认证加密原子块定义 (NIST SP 800-232)
 *
 * - ascon_encrypt: Ascon-AEAD128(key, nonce, ad, msg) → Bytes（密文 ‖ 128 位标签）
 *   320 位置换（Ascon-p，5×64 位字）；rate 128 位 / 初始化与终结 12 轮 / 数据处理 8 轮；
 *   little-endian 字节序；官方向量（ascon-c 仓 LWC KAT，1089 例全过）。
 */
import * as Blockly from 'blockly/core';
import { TYPE_BYTES, TYPE_INT_LIST } from '@/constants/block-types';

export const ASCON_BLOCK_TYPES = ['ascon_encrypt'] as const;
export type AsconBlockType = (typeof ASCON_BLOCK_TYPES)[number];

Blockly.Blocks['ascon_encrypt'] = {
  init: function () {
    this.appendValueInput('KEY')
      .setCheck(TYPE_BYTES)
      .appendField('Ascon-Encrypt(');
    this.appendValueInput('NONCE').setCheck(TYPE_INT_LIST).appendField(' nonce:');
    this.appendValueInput('AD').setCheck(TYPE_INT_LIST).appendField(' ad:');
    this.appendValueInput('MSG').setCheck(TYPE_BYTES).appendField(' msg:');
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_BYTES);
    this.setColour(190);
    this.setTooltip(
      'ASCON 轻量级认证加密 (NIST SP 800-232, Ascon-AEAD128)：key 16 字节 / nonce 16 字节 / ad 关联数据 / msg 明文 → 密文‖128 位标签。320 位置换（rate 128 位，12/8 轮），官方向量（LWC KAT）验证通过。',
    );
    this.setHelpUrl('https://csrc.nist.gov/pubs/sp/800/232/final');
  },
};
