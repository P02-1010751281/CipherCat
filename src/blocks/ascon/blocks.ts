/**
 * ASCON 轻量级认证加密原子块定义 (NIST SP 800-232)
 *
 * - ascon_encrypt: Ascon-AEAD128(key, nonce, ad, msg) → Bytes（密文 ‖ 128 位标签）
 *   320 位置换（Ascon-p，5×64 位字）；rate 128 位 / 初始化与终结 12 轮 / 数据处理 8 轮；
 *   little-endian 字节序；官方向量（ascon-c 仓 LWC KAT，1089 例全过）。
 */
import * as Blockly from 'blockly/core';
import { TYPE_BYTES, TYPE_INT_LIST, TYPE_NUMBER } from '@/constants/block-types';

export const ASCON_BLOCK_TYPES = [
  'ascon_encrypt',
  'ascon_decrypt',
  'ascon_hash256',
  'ascon_xof128',
  'ascon_cxof128',
] as const;
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

Blockly.Blocks['ascon_decrypt'] = {
  init: function () {
    this.appendValueInput('KEY').setCheck(TYPE_BYTES).appendField('Ascon-Decrypt(');
    this.appendValueInput('NONCE').setCheck(TYPE_INT_LIST).appendField(' nonce:');
    this.appendValueInput('AD').setCheck(TYPE_INT_LIST).appendField(' ad:');
    this.appendValueInput('CT').setCheck(TYPE_BYTES).appendField(' ciphertext‖tag:');
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_BYTES);
    this.setColour(190);
    this.setTooltip('Ascon-AEAD128 解密并验证 128 位标签；标签错误时抛出异常，不返回明文。');
    this.setHelpUrl('https://csrc.nist.gov/pubs/sp/800/232/final');
  },
};

Blockly.Blocks['ascon_hash256'] = {
  init: function () {
    this.appendValueInput('MSG').setCheck(TYPE_BYTES).appendField('Ascon-Hash256(');
    this.appendDummyInput().appendField(' msg:)');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_BYTES);
    this.setColour(190);
    this.setTooltip('Ascon-Hash256（NIST SP 800-232）：输入字节串，输出 32 字节摘要。');
    this.setHelpUrl('https://csrc.nist.gov/pubs/sp/800/232/final');
  },
};

Blockly.Blocks['ascon_xof128'] = {
  init: function () {
    this.appendValueInput('MSG').setCheck(TYPE_BYTES).appendField('Ascon-XOF128(');
    this.appendValueInput('LEN').setCheck(TYPE_NUMBER).appendField(' outLen:');
    this.appendDummyInput().appendField(' bytes)');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_BYTES);
    this.setColour(190);
    this.setTooltip('Ascon-XOF128（NIST SP 800-232）：输入消息和输出字节数，生成可扩展输出；playground 单次输出上限为 1 MiB（资源限制，非标准算法限制）。');
    this.setHelpUrl('https://csrc.nist.gov/pubs/sp/800/232/final');
  },
};

Blockly.Blocks['ascon_cxof128'] = {
  init: function () {
    this.appendValueInput('MSG').setCheck(TYPE_BYTES).appendField('Ascon-CXOF128(');
    this.appendValueInput('CUSTOM').setCheck(TYPE_BYTES).appendField(' customization:');
    this.appendValueInput('LEN').setCheck(TYPE_NUMBER).appendField(' outLen:');
    this.appendDummyInput().appendField(' bytes)');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_BYTES);
    this.setColour(190);
    this.setTooltip('Ascon-CXOF128（NIST SP 800-232）：定制字符串最多 256 字节，输出长度单位为字节；playground 单次输出上限为 1 MiB（资源限制，非标准算法限制）。');
    this.setHelpUrl('https://csrc.nist.gov/pubs/sp/800/232/final');
  },
};
