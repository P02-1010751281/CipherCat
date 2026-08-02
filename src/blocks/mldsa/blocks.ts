/**
 * ML-DSA-44 原子块定义 (FIPS 204 final)
 *
 * - mldsa_sign:   ML-DSA-44 Sign(secret_key 2560B, message) → Bytes（签名 2420B）
 * - mldsa_verify: ML-DSA-44 Verify(public_key 1312B, message, signature) → Boolean
 *
 * 算法要点（FIPS 204）：
 *   - 确定性签名：rnd = 0^32，外部接口 mprime = [0x00, len(ctx)] ‖ ctx ‖ M（空 ctx）
 *   - Dilithium 结构：NTT 多项式环 Rq (q = 2^23 - 2^13 + 1)、模掩码 y ← γ1 域、
 *     rejection sampling、hint 打包（ω = 80）
 *   - SHAKE128/256（rate 168/136，自实现 Keccak-f1600，BigInt 64 位字）
 *   - 官方向量：NIST ACVP sigGen ML-DSA-44 deterministic 30/30 双语言 PASS
 *     （mldsa_prompt.json / mldsa_expectedResults.json，external+internal 接口）
 */
import * as Blockly from 'blockly/core';
import { TYPE_BOOLEAN, TYPE_BYTES } from '@/constants/block-types';

export const MLDSA_BLOCK_TYPES = ['mldsa_sign', 'mldsa_verify'] as const;
export type MldsaBlockType = (typeof MLDSA_BLOCK_TYPES)[number];

Blockly.Blocks['mldsa_sign'] = {
  init: function () {
    this.appendValueInput('SECRET_KEY')
      .setCheck(TYPE_BYTES)
      .appendField('ML-DSA-44 Sign(');
    this.appendValueInput('MESSAGE')
      .setCheck(TYPE_BYTES)
      .appendField(' msg:');
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_BYTES);
    this.setColour(290);
    this.setTooltip(
      'ML-DSA-44 签名 (FIPS 204)：2560 字节私钥 + 消息 → 2420 字节签名（确定性，rnd=0，空上下文）。官方向量（NIST ACVP sigGen 30/30）验证通过。',
    );
    this.setHelpUrl('https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.204.pdf');
  },
};

Blockly.Blocks['mldsa_verify'] = {
  init: function () {
    this.appendValueInput('PUBLIC_KEY')
      .setCheck(TYPE_BYTES)
      .appendField('ML-DSA-44 Verify(');
    this.appendValueInput('MESSAGE')
      .setCheck(TYPE_BYTES)
      .appendField(' msg:');
    this.appendValueInput('SIGNATURE')
      .setCheck(TYPE_BYTES)
      .appendField(' sig:');
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_BOOLEAN);
    this.setColour(290);
    this.setTooltip(
      'ML-DSA-44 验签 (FIPS 204)：1312 字节公钥 + 消息 + 2420 字节签名 → 布尔。官方向量（NIST ACVP sigGen 30/30）验证通过。',
    );
    this.setHelpUrl('https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.204.pdf');
  },
};
