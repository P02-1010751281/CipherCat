/**
 * ML-KEM 辅助运算积木块定义 — 后量子基础块
 *
 * 基于 FIPS 203 (ML-KEM) 标准实现:
 *   - PolyAdd: 多项式系数逐元素加法，结果模 q (R_q 中的加法)
 *   - BytesConcat: 字节串拼接 A || B
 *   - BytesSlice: 字节串切片 B[start:end]
 *   - SeedWithNonce: 种子追加单字节序号，用于矩阵A和CBD向量展开
 *
 * FIPS 203 参考:
 *   - PolyAdd: §4 多项式环 R_q = Z_q[X]/(X^256+1), 逐系数加法 mod q
 *   - Concat:  §5.2 字节串运算, Alg 20: G(m || H(ek)), KDF(K̂ || H(c))
 *   - Slice:  Alg 20 step 2: G output → K̂=bytes[0:32], r=bytes[32:64]
 *   - SeedWithNonce: Alg 14 step 4: A[i][j] = SampleNTT(rho || i || j)
 *
 * 参考: FIPS 203 — https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.203.pdf
 */
import * as Blockly from 'blockly/core';

export const BASIC_OPERATIONS_BLOCK_TYPES = [
  'pq_byte_concat',
  'pq_bytes_slice',
  'pq_seed_with_nonce',
] as const;

export type BasicOperationsBlockType = typeof BASIC_OPERATIONS_BLOCK_TYPES[number];

Blockly.Blocks['pq_byte_concat'] = {
  init: function() {
    this.appendValueInput('A').setCheck(null)
      .appendField('BytesConcat(');
    this.appendValueInput('B').setCheck(null)
      .appendField('||');
    this.appendDummyInput()
      .appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, null);
    this.setColour(190);
    this.setTooltip(
      'BytesConcat(A, B): Concatenate two byte strings A || B. ' +
      '(FIPS 203 §5.2, Alg 20 step 2/4)'
    );
    this.setHelpUrl('https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.203.pdf');
  },
};

Blockly.Blocks['pq_bytes_slice'] = {
  init: function() {
    this.appendValueInput('INPUT').setCheck(null)
      .appendField('BytesSlice(');
    this.appendValueInput('START').setCheck(null)
      .appendField('[');
    this.appendValueInput('END').setCheck(null)
      .appendField(':');
    this.appendDummyInput()
      .appendField('])');
    this.setInputsInline(true);
    this.setOutput(true, null);
    this.setColour(190);
    this.setTooltip(
      'BytesSlice(B, start, end): Extract bytes B[start:end]. Used to split 64-byte G output ' +
      'into K̂=bytes[0:32] and r=bytes[32:64]. (FIPS 203 Alg 20)'
    );
    this.setHelpUrl('https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.203.pdf');
  },
};

Blockly.Blocks['pq_seed_with_nonce'] = {
  init: function() {
    this.appendValueInput('SEED').setCheck(null)
      .appendField('SeedWithNonce(');
    this.appendValueInput('NONCE').setCheck(null)
      .appendField('||');
    this.appendDummyInput()
      .appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, null);
    this.setColour(190);
    this.setTooltip(
      'SeedWithNonce(seed, nonce): Append single byte nonce to seed bytes. ' +
      'Used for generating distinct seeds in Kyber matrix A (Alg 14 step 4) ' +
      'and CBD vector sampling (Alg 14 step 5/8). (FIPS 203)'
    );
    this.setHelpUrl('https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.203.pdf');
  },
};
