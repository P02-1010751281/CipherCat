/**
 * HMAC-DRBG 确定性随机位生成原子块定义 (NIST SP 800-90A Rev1 §10.1.2, HMAC-SHA-256)
 *
 * - drbg_generate: DRBG-Generate(entropy, nonce, perso, bits) → Bytes
 *   Instantiate：K = 0x00‖32、V = 0x01‖32，update(entropy‖nonce‖perso)；
 *   Generate：循环 V = HMAC(K, V)，串联截取 ceil(bits/8) 字节，随后 update()（无 additional_input）。
 *   相同输入 → 相同输出（确定性；真实 DRBG 需按 SP 800-90A 注入熵源）。
 *   官方向量：NIST CAVP drbgtestvectors（no_reseed + pr_false，SHA-256 480 例全过；
 *   内嵌 drbgGenerate/drbgReseed 状态函数支持 CAVS 双 generate 流程与 reseed 流程）。
 */
import * as Blockly from 'blockly/core';
import { TYPE_BYTES, TYPE_NUMBER } from '@/constants/block-types';

export const DRBG_BLOCK_TYPES = ['drbg_generate'] as const;
export type DrbgBlockType = (typeof DRBG_BLOCK_TYPES)[number];

Blockly.Blocks['drbg_generate'] = {
  init: function () {
    this.appendValueInput('ENTROPY')
      .setCheck(TYPE_BYTES)
      .appendField('DRBG-Generate(');
    this.appendValueInput('NONCE').setCheck(TYPE_BYTES).appendField(' nonce:');
    this.appendValueInput('PERSO').setCheck(TYPE_BYTES).appendField(' perso:');
    this.appendValueInput('BITS').setCheck(TYPE_NUMBER).appendField(' bits:');
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_BYTES);
    this.setColour(190);
    this.setTooltip(
      'HMAC-DRBG 确定性随机位生成 (NIST SP 800-90A Rev1, HMAC-SHA-256)：K = 0x00×32、V = 0x01×32 后 update(entropy‖nonce‖perso)；Generate 循环 V = HMAC(K,V) 串联截取 ceil(bits/8) 字节。bits 建议 8 的倍数。相同输入产生相同输出。官方向量（NIST CAVP drbgtestvectors，SHA-256 480 例）验证通过。',
    );
    this.setHelpUrl('https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-90Ar1.pdf');
  },
};
