/**
 * FORS 完整签名块定义（FIPS 205 §8，SPHINCS+ 少时签名 FORS）
 *
 * - fors_sign:       FORS.SigGen(SK.seed, M) → 签名 640 字节
 *                    （4 棵树 × (32B 叶私钥 + 4×32B 认证路径)）
 * - fors_verify:     FORS.PkFromSig 语义：由签名+消息重建 FORS 根 → 与公钥比对 → Boolean
 * - fors_pk_from_sk: FORS 公钥派生：4 棵 FORS 树根 → pk = H(ADRS(FORS_ROOTS) ‖ roots)
 *
 * 教学参数（固定）：n = 32（SHAKE-256 32B，即 FIPS 205 的 H）、k = 4 棵树、a = 4
 * （每树 2^4 = 16 叶）；消息摘要 M = k·a = 16 bit（2 字节），按 a-bit 分块（块 0 为
 * 最高位）选叶。结构严格对齐 FIPS 205：sk = PRF(SK.seed, ADRS(FORS_TREE, kp, 0, j))、
 * 节点 H(ADRS(FORS_TREE, kp, h, idx) ‖ l ‖ r)、pk = H(ADRS(FORS_ROOTS) ‖ roots)。
 * 验证用性质向量（确定性 / 往返 / 篡改检测）——FORS 无独立官方向量
 * （FIPS 205 KAT 为完整 SLH-DSA 签名，FORS 只是其中部件）。
 */
import * as Blockly from 'blockly/core';
import { TYPE_BOOLEAN, TYPE_BYTES } from '@/constants/block-types';

export const FORS_BLOCK_TYPES = ['fors_sign', 'fors_verify', 'fors_pk_from_sk'] as const;
export type ForsBlockType = (typeof FORS_BLOCK_TYPES)[number];

const FORS_COLOUR = 230; // 与哈希基结构件同色（Hash & Padding 类目）
const FIPS205_URL = 'https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.205.pdf';
const FORS_TOOLTIP =
  'FORS 少时签名 (FIPS 205 §8)：n=32 / k=4 树 / a=4（每树 16 叶）。' +
  'sk_seed 32B + 消息摘要 M 2B（16 bit，按 4-bit 分块选叶）。' +
  '教学参数集，性质向量验证（确定性/往返/篡改检测）。';

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
