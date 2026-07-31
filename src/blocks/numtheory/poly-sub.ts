/**
 * 多项式减法积木块定义
 *
 * 基于 FIPS 203 (ML-KEM) 的 R_q 域多项式逐系数减法:
 *   - PolySub: (a_i - b_i) mod q for i=0..255
 *
 * 参考: FIPS 203 — https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.203.pdf
 */
import { TYPE_INT_LIST } from '@/constants/block-types';
import * as Blockly from 'blockly/core';

export const POLY_SUB_BLOCK_TYPES = [
  'pq_poly_sub',
] as const;

export type PolySubBlockType = typeof POLY_SUB_BLOCK_TYPES[number];

Blockly.Blocks['pq_poly_sub'] = {
  init: function() {
    this.appendValueInput('A').setCheck(TYPE_INT_LIST)
      .appendField('PolySub(');
    this.appendValueInput('B').setCheck(TYPE_INT_LIST)
      .appendField('-');
    this.appendDummyInput()
      .appendField(', q=')
      .appendField(new Blockly.FieldDropdown([
        ['3329', '3329'],
      ]), 'MODULUS');
    this.appendDummyInput()
      .appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_INT_LIST);
    this.setColour(250);
    this.setTooltip(
      'PolySub(A, B): Component-wise polynomial subtraction in R_q, each coefficient mod q. ' +
      '(a_i - b_i) mod q for i=0..255. (FIPS 203 §4)'
    );
    this.setHelpUrl('https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.203.pdf');
  },
};
