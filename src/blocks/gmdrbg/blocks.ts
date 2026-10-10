/**
 * Deterministic SM3-HMAC teaching example. It is not a complete or conformant RNG.
 */
import * as Blockly from 'blockly/core';
import { TYPE_BYTES, TYPE_NUMBER } from '@/constants/block-types';

export const GMDRBG_BLOCK_TYPES = ['gm_rng'] as const;
export type GmDrbgBlockType = (typeof GMDRBG_BLOCK_TYPES)[number];

Blockly.Blocks['gm_rng'] = {
  init: function () {
    this.appendValueInput('ENTROPY')
      .setCheck(TYPE_BYTES)
      .appendField('GM-RNG(');
    this.appendValueInput('NONCE').setCheck(TYPE_BYTES).appendField(' nonce:');
    this.appendValueInput('PERSO').setCheck(TYPE_BYTES).appendField(' perso:');
    this.appendValueInput('LEN').setCheck(TYPE_NUMBER).appendField(' len:');
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_BYTES);
    this.setColour(200);
    this.setTooltip(
      '教学用确定性 SM3-HMAC 伪随机生成示例，输出长度为 0–65536 字节。同输入同输出；不含熵源、' +
        '熵评估、健康检测或故障响应，不代表符合 GM/T 0103、GM/T 0105 或 SP 800-90A。' +
        '输入可为空仅用于可复现演示，不表示具备密码学安全熵；内嵌 SM3-HMAC 的有限回归不是官方向量验证或认证。',
    );
    this.setHelpUrl('https://csrc.nist.gov/pubs/sp/800/90/a/r1/final');
  },
};
