/**
 * ML-DSA 签名原语块定义（FIPS 204，ML-DSA-44 固定参数：d=13, γ2=95232, τ=39）
 *
 * 教学研究用途：将 mldsa_sign/verify 黑盒内部的数学原语原子化，可拼装演示
 * 签名流程（Power2Round → Decompose → MakeHint/UseHint → SampleInBall）。
 *
 * - pq_power2round:   Power2Round_d(r) — r = r1·2^d + r0（中心化 2^d 分解）
 * - pq_decompose:     Decompose(r, 2γ2) — r = r1·2γ2 + r0（中心化 2γ2 分解，r0 ∈ (-γ2, γ2]）
 * - pq_make_hint:     MakeHint(z, r) — r 与 r+z 的 r1 分量不同 → hint 位 1
 * - pq_use_hint:      UseHint(h, r) — 用 hint 位修复 r1（验证端重建 w1'）
 * - pq_sample_in_ball: SampleInBall(ρ) — SHAKE256 采样恰 τ=39 个 ±1 的挑战多项式
 *
 * 参数：D=13（Power2Round）、GAMMA2=95232 = (q-1)/88（Decompose/MakeHint/UseHint）、
 *       TAU=39（SampleInBall），对应 ML-DSA-44；65/87 变体参数见 FIPS 204 Table 1。
 */
import * as Blockly from 'blockly/core';
import { TYPE_BYTES, TYPE_INT_LIST } from '@/constants/block-types';

export const MLDSA_PRIMITIVE_BLOCK_TYPES = [
  'pq_power2round',
  'pq_decompose',
  'pq_make_hint',
  'pq_use_hint',
  'pq_sample_in_ball',
] as const;
export type MldsaPrimitiveBlockType = (typeof MLDSA_PRIMITIVE_BLOCK_TYPES)[number];

const PQC_COLOUR = 230;
const FIPS204_URL = 'https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.204.pdf';

/** Power2Round_d: r → (r1, r0)，r = r1·2^d + r0，r0 ∈ (-2^(d-1), 2^(d-1)] */
Blockly.Blocks['pq_power2round'] = {
  init: function () {
    this.appendValueInput('INPUT')
      .setCheck(TYPE_INT_LIST)
      .appendField('Power2Round_d(');
    this.appendDummyInput()
      .appendField(', part=')
      .appendField(
        new Blockly.FieldDropdown([
          ['r1 (高位)', 'r1'],
          ['r0 (低位)', 'r0'],
        ]),
        'PART',
      );
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_INT_LIST);
    this.setColour(PQC_COLOUR);
    this.setTooltip(
      'Power2Round_d(r)：中心化 2^d 分解（d=13，ML-DSA-44）——r = r1·2^d + r0，r0 ∈ (-2^12, 2^12]。r1 用于公钥 t1，r0 用于签名提示。FIPS 204 Algorithm 12',
    );
    this.setHelpUrl(FIPS204_URL);
  },
};

/** Decompose(r, 2γ2): r → (r1, r0)，r = r1·2γ2 + r0，r0 ∈ (-γ2, γ2] */
Blockly.Blocks['pq_decompose'] = {
  init: function () {
    this.appendValueInput('INPUT')
      .setCheck(TYPE_INT_LIST)
      .appendField('Decompose(');
    this.appendDummyInput()
      .appendField(', part=')
      .appendField(
        new Blockly.FieldDropdown([
          ['r1 (高位)', 'r1'],
          ['r0 (低位)', 'r0'],
        ]),
        'PART',
      );
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_INT_LIST);
    this.setColour(PQC_COLOUR);
    this.setTooltip(
      'Decompose(r, 2γ2)：中心化 2γ2 分解（γ2=95232，ML-DSA-44）——r = r1·2γ2 + r0，r0 ∈ (-γ2, γ2]。签名取 w1=HighBits(w) 生成挑战，验证端用 w1 恢复。FIPS 204 Algorithm 13',
    );
    this.setHelpUrl(FIPS204_URL);
  },
};

/** MakeHint(z, r): HighBits(r) ≠ HighBits(r+z) → 1，否则 0 */
Blockly.Blocks['pq_make_hint'] = {
  init: function () {
    this.appendValueInput('Z')
      .setCheck(TYPE_INT_LIST)
      .appendField('MakeHint(z,');
    this.appendValueInput('R')
      .setCheck(TYPE_INT_LIST)
      .appendField(' r:');
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_INT_LIST);
    this.setColour(PQC_COLOUR);
    this.setTooltip(
      'MakeHint(z, r)：逐系数比较 HighBits(r) 与 HighBits(r+z)（γ2=95232），不同 → 1。签名端将 z=-c·t0 的舍入差异记录为 hint 位数组（0/1）。FIPS 204 Algorithm 16',
    );
    this.setHelpUrl(FIPS204_URL);
  },
};

/** UseHint(h, r): 用 hint 位修复 r1（验证端重建 w1'） */
Blockly.Blocks['pq_use_hint'] = {
  init: function () {
    this.appendValueInput('H')
      .setCheck(TYPE_INT_LIST)
      .appendField('UseHint(h,');
    this.appendValueInput('R')
      .setCheck(TYPE_INT_LIST)
      .appendField(' r:');
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_INT_LIST);
    this.setColour(PQC_COLOUR);
    this.setTooltip(
      'UseHint(h, r)：逐系数用 hint 位修正 r1（h=1 且 r0>0 → +1，r0≤0 → -1）。验证端从 w1\' 重建挑战输入。FIPS 204 Algorithm 17',
    );
    this.setHelpUrl(FIPS204_URL);
  },
};

/** SampleInBall(ρ): SHAKE256 采样恰 τ=39 个 ±1 的挑战多项式 */
Blockly.Blocks['pq_sample_in_ball'] = {
  init: function () {
    this.appendValueInput('SEED')
      .setCheck(TYPE_BYTES)
      .appendField('SampleInBall(');
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_INT_LIST);
    this.setColour(PQC_COLOUR);
    this.setTooltip(
      'SampleInBall(ρ)：SHAKE256(ρ) 采样恰 τ=39 个非零系数（±1，符号由输出字节决定）的稀疏挑战多项式 c（τ=39，ML-DSA-44；65/87 为 49/60）。FIPS 204 Algorithm 8',
    );
    this.setHelpUrl(FIPS204_URL);
  },
};
