/**
 * 普通多项式乘法块定义（非 NTT 域，整数系数）
 *
 * pq_poly_mul(A, B) → 卷积多项式（系数数组低位在前），MODULUS 下拉可选逐系数取模：
 *   - none：纯整数卷积（环 R_q 教学演示，系数不约减）
 *   - 3329 / 8380417 / 12289：逐系数 mod q（多项式环 Z_q[x] 乘法）
 *
 * 与 pq_ntt_mul（NTT 域点乘）对比教学：普通卷积 vs NTT 域逐点乘。
 * 性质向量：结合律 / 交换律 / 分配律 (a+b)·c = a·c + b·c。
 */
import * as Blockly from 'blockly/core';
import { TYPE_INT_LIST } from '@/constants/block-types';

export const POLY_MUL_BLOCK_TYPES = ['pq_poly_mul'] as const;
export type PolyMulBlockType = (typeof POLY_MUL_BLOCK_TYPES)[number];

Blockly.Blocks['pq_poly_mul'] = {
  init: function () {
    this.appendValueInput('A')
      .setCheck(TYPE_INT_LIST)
      .appendField('PolyMul(');
    this.appendValueInput('B')
      .setCheck(TYPE_INT_LIST)
      .appendField(' ×');
    this.appendDummyInput()
      .appendField(', mod ')
      .appendField(
        new Blockly.FieldDropdown([
          ['none', 'none'],
          ['3329 (ML-KEM)', '3329'],
          ['8380417 (ML-DSA)', '8380417'],
          ['12289', '12289'],
        ]),
        'MODULUS',
      );
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_INT_LIST);
    this.setColour(250);
    this.setTooltip(
      'PolyMul(A, B): 普通多项式卷积（整数系数，低位在前）。mod none 纯卷积（不约减），' +
        'mod q 逐系数取模——多项式环 Z_q[x] 乘法。与 NTT 域 pq_ntt_mul 点乘对比教学。',
    );
    this.setHelpUrl('https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.203.pdf');
  },
};
