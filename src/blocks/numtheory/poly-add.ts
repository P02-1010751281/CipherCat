/**
 * 多项式加法积木块定义
 *
 * 基于 FIPS 203 (ML-KEM) 的 R_q 域多项式逐系数加法:
 *   - PolyAdd: (a_i + b_i) mod q for i=0..255
 *
 * FIPS 203 参考:
 *   §4 多项式环 R_q = Z_q[X]/(X^256+1), 逐系数加法 mod q
 *
 * 参考: FIPS 203 — https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.203.pdf
 */
import { TYPE_INT_LIST } from '@/constants/block-types';
import * as Blockly from 'blockly/core';

export const POLY_ADD_BLOCK_TYPES = [
  'pq_poly_add',
] as const;

export type PolyAddBlockType = typeof POLY_ADD_BLOCK_TYPES[number];

Blockly.Blocks['pq_poly_add'] = {
  init: function() {
    this.appendValueInput('A').setCheck(TYPE_INT_LIST)
      .appendField('PolyAdd(');
    this.appendValueInput('B').setCheck(TYPE_INT_LIST)
      .appendField('+');
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
      'PolyAdd(A, B): Component-wise polynomial addition in R_q, each coefficient mod q. ' +
      '(a_i + b_i) mod q for i=0..255. (FIPS 203 §4 / FIPS 204 §2.4)'
    );
    this.setHelpUrl('https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.203.pdf');
  },
};
