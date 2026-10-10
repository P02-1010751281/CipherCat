/**
 * FORS-inspired project teaching variant; not compatible with FIPS 205.
 *
 * - fors_sign:       项目变体签名 → 固定输出 640 字节
 * - fors_verify:     项目变体验签 → 内部重建根并与项目公钥比较
 * - fors_pk_from_sk: 项目变体公钥派生 → 拼接四棵教学树根后哈希
 *
 * 固定教学参数 n=32/k=4/a=4。项目 SHAKE 拼接代替标准 PRF/F/T_k 调用；性质测试只证明项目内自洽。
 */
import * as Blockly from 'blockly/core';
import { TYPE_BOOLEAN, TYPE_BYTES } from '@/constants/block-types';

export const FORS_BLOCK_TYPES = ['fors_sign', 'fors_verify', 'fors_pk_from_sk'] as const;
export type ForsBlockType = (typeof FORS_BLOCK_TYPES)[number];

const FORS_COLOUR = 230; // 与哈希基结构件同色（Hash & Padding 类目）
const FIPS205_URL = 'https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.205.pdf';
const FORS_TOOLTIP =
  'FORS 结构教学变体（参考 FIPS 205 §8，不兼容标准实现）：n=32 / k=4 树 / a=4。' +
  'sk_seed 32B + 消息摘要 M 2B（16 bit，按 4-bit 分块选叶）。' +
  '使用项目自定义 SHAKE 拼接；性质回归不是官方向量或符合性证明。';

Blockly.Blocks['fors_sign'] = {
  init: function () {
    this.appendValueInput('SK_SEED')
      .setCheck(TYPE_BYTES)
      .appendField('FORS Sign(');
    this.appendValueInput('MESSAGE')
      .setCheck(TYPE_BYTES)
      .appendField(' m:');
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_BYTES);
    this.setColour(FORS_COLOUR);
    this.setTooltip(FORS_TOOLTIP + '输出 640 字节签名。');
    this.setHelpUrl(FIPS205_URL);
  },
};

Blockly.Blocks['fors_verify'] = {
  init: function () {
    this.appendValueInput('PUBLIC_KEY')
      .setCheck(TYPE_BYTES)
      .appendField('FORS Verify(');
    this.appendValueInput('MESSAGE')
      .setCheck(TYPE_BYTES)
      .appendField(' m:');
    this.appendValueInput('SIGNATURE')
      .setCheck(TYPE_BYTES)
      .appendField(' sig:');
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_BOOLEAN);
    this.setColour(FORS_COLOUR);
    this.setTooltip(FORS_TOOLTIP + '由签名重建根并比对公钥。');
    this.setHelpUrl(FIPS205_URL);
  },
};

Blockly.Blocks['fors_pk_from_sk'] = {
  init: function () {
    this.appendValueInput('SK_SEED')
      .setCheck(TYPE_BYTES)
      .appendField('FORS PkFromSk(');
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_BYTES);
    this.setColour(FORS_COLOUR);
    this.setTooltip(FORS_TOOLTIP + '由 32B 种子派生 32B 公钥（与消息无关）。');
    this.setHelpUrl(FIPS205_URL);
  },
};
