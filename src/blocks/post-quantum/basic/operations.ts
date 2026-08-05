/**
 * ML-KEM 辅助运算积木块定义 — 后量子基础块
 *
 * 基于 FIPS 203 (ML-KEM) 标准实现:
 *   - BytesConcat: 字节串拼接 A || B
 *   - BytesSlice: 字节串切片 B[start:end]
 *   - SeedWithNonce: 种子追加单字节序号，用于矩阵A和CBD向量展开
 *
 * FIPS 203 参考:
 *   - Concat:    §5.2 字节串运算, Alg 20: G(m || H(ek)), KDF(K̂ || H(c))
 *   - Slice:     Alg 20 step 2: G output → K̂=bytes[0:32], r=bytes[32:64]
 *   - SeedWithNonce: Alg 14 step 4: A[i][j] = SampleNTT(rho || i || j)
 *                    Alg 14 step 5/8: r/e1 vector CBD sampling with distinct nonces
 *
 * 参考: FIPS 203 — https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.203.pdf
 */
import { TYPE_BYTES, TYPE_NUMBER } from '@/constants/block-types';
import * as Blockly from 'blockly/core';

export const BASIC_OPERATIONS_BLOCK_TYPES = [
  'pq_byte_concat',
  'pq_bytes_slice',
  'pq_seed_with_nonce',
  'pq_rej_sample',
] as const;

export type BasicOperationsBlockType =
  (typeof BASIC_OPERATIONS_BLOCK_TYPES)[number];

Blockly.Blocks['pq_byte_concat'] = {
  init: function () {
    this.appendValueInput('A').setCheck(TYPE_BYTES).appendField('BytesConcat(');
    this.appendValueInput('B').setCheck(TYPE_BYTES).appendField('||');
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_BYTES);
    this.setColour(190);
    this.setTooltip(
      'BytesConcat(A, B): Concatenate two byte strings A || B. ' +
        '(FIPS 203 §5.2, Alg 20 step 2/4)',
    );
    this.setHelpUrl('https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.203.pdf');
  },
};

Blockly.Blocks['pq_bytes_slice'] = {
  init: function () {
    this.appendValueInput('INPUT').setCheck(TYPE_BYTES).appendField('BytesSlice(');
    this.appendValueInput('START').setCheck(null).appendField('[');
    this.appendValueInput('END').setCheck(null).appendField(':');
    this.appendDummyInput().appendField('])');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_BYTES);
    this.setColour(190);
    this.setTooltip(
      'BytesSlice(B, start, end): Extract bytes B[start:end]. Used to split 64-byte G output ' +
        'into K̂=bytes[0:32] and r=bytes[32:64]. (FIPS 203 Alg 20)',
    );
    this.setHelpUrl('https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.203.pdf');
  },
};

Blockly.Blocks['pq_seed_with_nonce'] = {
  init: function () {
    this.appendValueInput('SEED').setCheck(TYPE_BYTES).appendField('SeedWithNonce(');
    this.appendValueInput('NONCE').setCheck(null).appendField('||');
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_BYTES);
    this.setColour(190);
    this.setTooltip(
      'SeedWithNonce(seed, nonce): Append single byte nonce to seed bytes. ' +
        'Used for generating distinct seeds in Kyber matrix A (Alg 14 step 4) ' +
        'and CBD vector sampling (Alg 14 step 5/8). (FIPS 203)',
    );
    this.setHelpUrl('https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.203.pdf');
  },
};

/** Rejection sampling（ML-DSA RejBounded 单值版）：X < BOUND 接受，否则拒绝返回 -1 */
Blockly.Blocks['pq_rej_sample'] = {
  init: function () {
    this.appendValueInput('X').setCheck(null).appendField('RejSample(');
    this.appendValueInput('BOUND').setCheck(null).appendField(' < ');
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_NUMBER);
    this.setColour(190);
    this.setTooltip(
      'RejSample(X, BOUND): 拒绝采样（ML-DSA RejBoundedPoly 单系数）。' +
        'X < BOUND 接受返回 X；否则拒绝返回 -1（表示需重试采样）。' +
        'ML-DSA 用均匀采样 γ1 域/eta 域系数（FIPS 204 Alg 13/14）。',
    );
    this.setHelpUrl('https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.204.pdf');
  },
};
