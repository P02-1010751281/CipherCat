/**
 * HMAC-DRBG 确定性随机位生成原子块定义 (NIST SP 800-90A Rev1 §10.1.2, HMAC-SHA-256)
 *
 * - drbg_generate: DRBG-Generate(entropy, nonce, perso, bits) → Bytes
 *   Instantiate：K = 0x00‖32、V = 0x01‖32，update(entropy‖nonce‖perso)；
 *   Generate：循环 V = HMAC(K, V)，按请求位数截取左端输出；字节数组末字节的低位补零是项目编码约定，随后 update()（无 additional_input）。
 *   相同输入 → 相同输出（确定性；真实 DRBG 需按 SP 800-90A 注入熵源）。
 *   项目回归：少量固定实例化/重播种输出；未运行完整 NIST CAVP 向量集。
 *   内嵌 drbgGenerate/drbgReseed 状态函数支持连续 generate 与 reseed 流程。
 */
import * as Blockly from 'blockly/core';
import { TYPE_BYTES, TYPE_NUMBER } from '@/constants/block-types';

export const DRBG_BLOCK_TYPES = ['drbg_generate', 'drbg_update'] as const;
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
      'HMAC-DRBG 确定性随机位生成 (NIST SP 800-90A Rev1, HMAC-SHA-256)：请求位数须为 0 至 2^19 的整数；Generate 按标准输出左端请求位。字节数组末字节未请求的低位清零是项目编码约定，不是标准规定的字节格式。相同输入产生相同输出。仓库含少量实例化/重播种固定回归，不是完整 CAVP 测试或认证。',
    );
    this.setHelpUrl('https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-90Ar1.pdf');
  },
};

Blockly.Blocks['drbg_update'] = {
  init: function () {
    this.appendValueInput('STATE').setCheck(TYPE_BYTES).appendField('HMAC-DRBG Update( state(K‖V):');
    this.appendValueInput('PROVIDED').setCheck(TYPE_BYTES).appendField(' provided:');
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_BYTES);
    this.setColour(190);
    this.setTooltip(
      'HMAC_DRBG Update（SP 800-90A Rev.1 §10.1.2.2）：K = HMAC(K, V‖0x00‖provided)、V = HMAC(K, V)，provided 非空时再执行 0x01 分支。输入/输出都是 64 字节 K‖V；这是状态更新原语，不产生随机输出。',
    );
    this.setHelpUrl('https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-90A.Rev.1.pdf');
  },
};
