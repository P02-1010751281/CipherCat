/**
 * 矩阵×向量乘法积木块定义
 *
 * FIPS 203 (ML-KEM) 中 NTT 域的矩阵×向量乘法:
 *   - MatVecMul(A, v): A·v mod q, A 是 k×k 矩阵(展平为 IntList), v 是 k 维向量
 *
 * 参考: FIPS 203 — https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.203.pdf
 */
import { TYPE_INT_LIST } from '@/constants/block-types';
import * as Blockly from 'blockly/core';

export const MAT_VEC_MUL_BLOCK_TYPES = [
  'pq_mat_vec_mul',
] as const;

export type MatVecMulBlockType = typeof MAT_VEC_MUL_BLOCK_TYPES[number];

Blockly.Blocks['pq_mat_vec_mul'] = {
  init: function() {
    this.appendValueInput('MATRIX').setCheck(TYPE_INT_LIST)
      .appendField('MatVecMul(');
    this.appendValueInput('VEC').setCheck(TYPE_INT_LIST)
      .appendField('·');
    this.appendDummyInput()
      .appendField(', q=')
      .appendField(new Blockly.FieldDropdown([
        ['3329', '3329'],
        ['8380417 (ML-DSA)', '8380417'],
      ]), 'MODULUS');
    this.appendDummyInput()
      .appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_INT_LIST);
    this.setColour(250);
    this.setTooltip(
      'MatVecMul(A, v): Matrix-vector multiplication in R_q. ' +
      'A is a flattened k×k matrix, v is a k-vector. (FIPS 203 §4 / FIPS 204 §2.4)'
    );
    this.setHelpUrl('https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.203.pdf');
  },
};
