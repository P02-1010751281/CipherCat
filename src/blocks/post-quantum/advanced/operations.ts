/**
 * ML-KEM 高级复合运算积木块定义 — 后量子高级块
 *
 * 基于 FIPS 203 (ML-KEM) 标准实现，由基础块组合封装而成：
 *   - SampleNTTMat: 生成 k×k 的 NTT 域矩阵 A
 *   - CBDNTTVec: 生成 k 个 CBD 采样并 NTT 变换的多项式向量
 *   - ATrINTTAddE1: 计算 u = NTT⁻¹(Âᵀ∘r̂) + e₁ (ML-KEM 加密步骤 7-8)
 *   - TrINTTAddE2Mu: 计算 v = NTT⁻¹(t̂ᵀ∘r̂) + e₂ + μ (步骤 9-10)
 *   - BuildVec3: 将三个值组合为长度为 3 的向量
 *   - VecCompressEncode: 向量压缩编码 (步骤 11-12)
 *
 * 参考: FIPS 203 — https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.203.pdf
 */
import * as Blockly from 'blockly/core';

export const ADVANCED_OPERATIONS_BLOCK_TYPES = [
  'pq_sample_ntt_mat',
  'pq_cbd_ntt_vec',
  'pq_atr_intt_add_e1',
  'pq_tr_intt_add_e2_mu',
  'pq_build_vec3',
  'pq_vec_compress_encode',
] as const;

export type AdvancedOperationsBlockType = typeof ADVANCED_OPERATIONS_BLOCK_TYPES[number];

Blockly.Blocks['pq_sample_ntt_mat'] = {
  init: function() {
    this.appendValueInput('SEED').setCheck(null)
      .appendField('SampleNTTMat(');
    this.appendDummyInput()
      .appendField('k=')
      .appendField(new Blockly.FieldDropdown([
        ['1', '1'],
        ['2', '2'],
        ['3', '3'],
        ['4', '4'],
      ]), 'K');
    this.appendDummyInput()
      .appendField(', q=')
      .appendField(new Blockly.FieldDropdown([
        ['3329', '3329'],
      ]), 'MODULUS');
    this.appendDummyInput()
      .appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, null);
    this.setColour(290);
    this.setTooltip(
      'SampleNTTMat(seed, k, q): Generate k×k SampleNTT matrix A from seed ρ. ' +
      'For i,j in range(k): A[i][j] = SampleNTT(SeedWithNonce(seed, i*k+j)). ' +
      '(FIPS 203 Alg 14 step 4)'
    );
    this.setHelpUrl('https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.203.pdf');
  },
};

Blockly.Blocks['pq_cbd_ntt_vec'] = {
  init: function() {
    this.appendValueInput('SEED').setCheck(null)
      .appendField('CBDNTTVec(');
    this.appendDummyInput()
      .appendField('k=')
      .appendField(new Blockly.FieldDropdown([
        ['1', '1'],
        ['2', '2'],
        ['3', '3'],
        ['4', '4'],
      ]), 'K');
    this.appendDummyInput()
      .appendField(', η=')
      .appendField(new Blockly.FieldDropdown([
        ['2', '2'],
        ['3', '3'],
      ]), 'ETA');
    this.appendDummyInput()
      .appendField(', q=')
      .appendField(new Blockly.FieldDropdown([
        ['3329', '3329'],
      ]), 'MODULUS');
    this.appendDummyInput()
      .appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, null);
    this.setColour(290);
    this.setTooltip(
      'CBDNTTVec(seed, k, η, q): Generate k CBD polynomials and NTT them. ' +
      'For i in range(k): vec[i] = NTT(CBDη(SeedWithNonce(seed, i))). ' +
      '(FIPS 203 Alg 14 step 5-6 for r, step 7-9 for e1/e2)'
    );
    this.setHelpUrl('https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.203.pdf');
  },
};

Blockly.Blocks['pq_atr_intt_add_e1'] = {
  init: function() {
    this.appendDummyInput()
      .appendField('ATrINTTAddE1(')
      .appendField('k=')
      .appendField(new Blockly.FieldDropdown([
        ['1', '1'],
        ['2', '2'],
        ['3', '3'],
        ['4', '4'],
      ]), 'K')
      .appendField('η=')
      .appendField(new Blockly.FieldDropdown([
        ['2', '2'],
        ['3', '3'],
      ]), 'ETA');
    this.appendValueInput('A').setCheck(null)
      .appendField(', A=');
    this.appendValueInput('RHAT').setCheck(null)
      .appendField(', r̂=');
    this.appendValueInput('RSEED').setCheck(null)
      .appendField(', seed=');
    this.appendDummyInput()
      .appendField(', q=')
      .appendField(new Blockly.FieldDropdown([
        ['3329', '3329'],
      ]), 'MODULUS')
      .appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, null);
    this.setColour(290);
    this.setTooltip(
      'ATrINTTAddE1(A, r̂, r_seed, k, η, q): Compute u = NTT⁻¹(Âᵀ∘r̂) + e₁. ' +
      'For i in range(k): u[i] = INTT(Σⱼ A[j][i]∘r̂[j]) + CBDη(r_seed; k+i). ' +
      '(FIPS 203 Alg 14 step 7-8)'
    );
    this.setHelpUrl('https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.203.pdf');
  },
};

Blockly.Blocks['pq_tr_intt_add_e2_mu'] = {
  init: function() {
    this.appendDummyInput()
      .appendField('TrINTTAddE2Mu(')
      .appendField('k=')
      .appendField(new Blockly.FieldDropdown([
        ['1', '1'],
        ['2', '2'],
        ['3', '3'],
        ['4', '4'],
      ]), 'K')
      .appendField('η=')
      .appendField(new Blockly.FieldDropdown([
        ['2', '2'],
        ['3', '3'],
      ]), 'ETA');
    this.appendValueInput('THAT').setCheck(null)
      .appendField(', t̂=');
    this.appendValueInput('RHAT').setCheck(null)
      .appendField(', r̂=');
    this.appendValueInput('RSEED').setCheck(null)
      .appendField(', seed=');
    this.appendValueInput('MU').setCheck(null)
      .appendField(', μ=');
    this.appendDummyInput()
      .appendField(', q=')
      .appendField(new Blockly.FieldDropdown([
        ['3329', '3329'],
      ]), 'MODULUS')
      .appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, null);
    this.setColour(290);
    this.setTooltip(
      'TrINTTAddE2Mu(t̂, r̂, r_seed, μ, k, η, q): Compute v = NTT⁻¹(t̂ᵀ∘r̂) + e₂ + μ. ' +
      'For each j: sum += t̂[j]∘r̂[j]; v = INTT(sum) + CBDη(r_seed; 2k) + μ. ' +
      '(FIPS 203 Alg 14 step 9-10)'
    );
    this.setHelpUrl('https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.203.pdf');
  },
};

Blockly.Blocks['pq_build_vec3'] = {
  init: function() {
    this.appendValueInput('A').setCheck(null)
      .appendField('BuildVec₃(');
    this.appendValueInput('B').setCheck(null)
      .appendField(',');
    this.appendValueInput('C').setCheck(null)
      .appendField(',');
    this.appendDummyInput()
      .appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, null);
    this.setColour(190);
    this.setTooltip(
      'BuildVec3(a, b, c): Combine three values into a Python list [a, b, c]. ' +
      'Used for constructing t̂ vector from individually decoded polynomials.'
    );
    this.setHelpUrl('https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.203.pdf');
  },
};

Blockly.Blocks['pq_vec_compress_encode'] = {
  init: function() {
    this.appendValueInput('U').setCheck(null)
      .appendField('VecCompressEncode(');
    this.appendDummyInput()
      .appendField('d=')
      .appendField(new Blockly.FieldDropdown([
        ['10', '10'],
        ['4', '4'],
        ['1', '1'],
        ['12', '12'],
      ]), 'BITS');
    this.appendDummyInput()
      .appendField(', q=')
      .appendField(new Blockly.FieldDropdown([
        ['3329', '3329'],
      ]), 'MODULUS');
    this.appendDummyInput()
      .appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, null);
    this.setColour(260);
    this.setTooltip(
      'VecCompressEncode(u, d, q): Compress each polynomial in vector u to d bits, ' +
      'then ByteEncode each and concatenate into bytes. ' +
      '(FIPS 203 Alg 14 step 11)'
    );
    this.setHelpUrl('https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.203.pdf');
  },
};
