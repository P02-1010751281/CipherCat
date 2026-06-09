/**
 * ML-KEM 多项式采样积木块定义 — 后量子高级块
 *
 * 基于 FIPS 203 (ML-KEM) 标准实现多项式采样算子：
 *   - SampleNTT (Algorithm 7): 使用 XOF (SHAKE128) 采样 NTT 域多项式
 *   - SamplePolyCBD (Algorithm 8): 使用 PRF (SHAKE256) 从 CBD 分布采样多项式
 *
 * ML-KEM 参数 (FIPS 203 §7):
 *   q = 3329, n = 256
 *   eta1 = 3 (ML-KEM-512) / 2 (ML-KEM-768, -1024)
 *   eta2 = 2 (所有参数集)
 *
 * SampleNTT 流程 (Algorithm 7):
 *   吸收 seed 到 XOF (SHAKE128)，持续挤压 3 字节块
 *   从每个 3 字节块解码 2 个 12-bit 候选系数 d₁, d₂
 *   若 c < q 则接受，否则跳过
 *   收集到 256 个有效系数即返回（SHAKE128 输出本身就是 NTT 域表示，无需额外 NTT()）
 *
 * SamplePolyCBD 流程 (Algorithm 8):
 *   PRF = SHAKE256(seed || nonce)
 *   读取 64*eta 字节，按 CBD_eta 分布计算系数:
 *   c = Σ_{i=0}^{eta-1} (b_{2i} - b_{2i+1}) mod q
 *
 * 参考: FIPS 203 — https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.203.pdf
 */
import * as Blockly from 'blockly/core';

export const ADVANCED_SAMPLING_BLOCK_TYPES = [
  'pq_sample_ntt',
  'pq_sample_poly_cbd',
] as const;

export type AdvancedSamplingBlockType =
  (typeof ADVANCED_SAMPLING_BLOCK_TYPES)[number];

// SampleNTT (Algorithm 7): 使用 XOF (SHAKE128) 采样 NTT 域多项式
// 内部流程:
//   1. 吸收 seed 到 XOF (SHAKE128)，一次性挤压足量字节
//   2. 每 3 字节解码 2 个 12-bit 候选系数
//   3. 若候选系数 < q，接受；否则跳过
//   4. 收集到 256 个有效系数（SHAKE128 输出即 NTT 域，无需再调用 NTT()）
Blockly.Blocks['pq_sample_ntt'] = {
  init: function () {
    this.appendValueInput('SEED').setCheck(null).appendField('SampleNTT(');
    this.appendDummyInput()
      .appendField(', q=')
      .appendField(
        new Blockly.FieldDropdown([['3329 (Kyber)', '3329']]),
        'MODULUS',
      );
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, null);
    this.setColour(230);
    this.setTooltip(
      'SampleNTT: Sample a polynomial in NTT domain using XOF/SHAKE128. Reads 3-byte chunks, accepts values < q. SHAKE128 output coefficients are already in NTT domain (FIPS 203, Algorithm 7)',
    );
    this.setHelpUrl('https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.203.pdf');
  },
};

// SamplePolyCBD_eta (Algorithm 8): 从 CBD_eta 分布采样多项式
// 内部流程:
//   1. 构造 PRF = SHAKE256(seed || nonce)，nonce 用于区分 256 个系数
//   2. 从 PRF 一次性读取 64*eta 字节
//   3. CBD_eta 分布: c = Σ_{i=0}^{eta-1} (b_{2i} - b_{2i+1}) mod q
//      其中 b_i 是 PRF 输出字节的对应比特
Blockly.Blocks['pq_sample_poly_cbd'] = {
  init: function () {
    this.appendValueInput('SEED').setCheck(null).appendField('SamplePolyCBD(');
    this.appendDummyInput()
      .appendField(', η=')
      .appendField(
        new Blockly.FieldDropdown([
          ['3 (ML-KEM-512)', '3'],
          ['2 (ML-KEM-768/1024)', '2'],
        ]),
        'ETA',
      );
    this.appendDummyInput()
      .appendField(', q=')
      .appendField(
        new Blockly.FieldDropdown([['3329 (Kyber)', '3329']]),
        'MODULUS',
      );
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, null);
    this.setColour(230);
    this.setTooltip(
      'SamplePolyCBD_η: Sample a polynomial from centered binomial distribution CBD_η using PRF/SHAKE256 (FIPS 203, Algorithm 8)',
    );
    this.setHelpUrl('https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.203.pdf');
  },
};
