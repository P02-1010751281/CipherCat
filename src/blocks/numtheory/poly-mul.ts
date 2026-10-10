/**
 * 普通多项式乘法块定义（非 NTT 域，整数系数）
 *
 * pq_poly_mul(A, B) → 系数卷积（低位在前）；要求安全整数系数，未取模时超出安全范围即拒绝。
 *   - none：安全整数系数卷积
 *   - 3329 / 8380417 / 12289：在 Z_q[X] 中逐项约简，不对 X^256+1 取商
 *
 * 这是通用算术教学块，不是 ML-KEM/ML-DSA 的 R_q 乘法；不能与 pq_ntt_mul 的 NTT 域输入直接比较。
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
          ['q=3329', '3329'],
          ['q=8380417', '8380417'],
          ['q=12289 (teaching)', '12289'],
        ]),
        'MODULUS',
      );
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_INT_LIST);
    this.setColour(250);
    this.setTooltip(
      'PolyMul(A, B): 通用安全整数系数卷积。mod q 时先归一系数再逐项约简；未取模时输出溢出安全整数范围则拒绝。非 FIPS 203/204 R_q 乘法。',
    );
  },
};
