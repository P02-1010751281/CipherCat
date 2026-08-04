/**
 * 多变量与通用数学块定义（Multivariate / 通用线性代数）
 *
 * 教学研究用途：
 * - gauss_elim:   高斯消元解线性方程组（Ax = b）——多变量签名（油醋结构）、
 *                 通用线性代数、格约减入门
 * - mv_quad_eval: 多元二次多项式求值 Q(x) = Σ a_ij·xi·xj + Σ b_i·xi + c
 *                 ——MQ（多变量二次）困难问题教学核心
 * - comb:         组合数 C(n, k)——CBD 采样（二项式分布）教学
 *
 * 约定：gauss_elim 输入增广矩阵 [A|b] 展平（行优先，n×(n+1)）；mv_quad_eval
 * 系数展平 = 二次上三角 n(n+1)/2 项（i≤j，行优先）‖ 一次 n 项 ‖ 常数 1。
 */
import * as Blockly from 'blockly/core';
import { TYPE_INT_LIST, TYPE_NUMBER } from '@/constants/block-types';

export const MULTIVARIATE_BLOCK_TYPES = [
  'gauss_elim',
  'mv_quad_eval',
  'comb',
  'vec_dot',
  'poly_scale',
] as const;
export type MultivariateBlockType = (typeof MULTIVARIATE_BLOCK_TYPES)[number];

const COLOUR = 210;

/** 高斯消元解线性方程组 */
Blockly.Blocks['gauss_elim'] = {
  init: function () {
    this.appendValueInput('AUG')
      .setCheck(TYPE_INT_LIST)
      .appendField('GaussElim(');
    this.appendValueInput('N').setCheck(TYPE_NUMBER).appendField(' n=');
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_INT_LIST);
    this.setColour(COLOUR);
    this.setTooltip(
      '高斯消元解线性方程组 Ax=b：输入增广矩阵 [A|b] 展平（行优先 n×(n+1)）+ 阶数 n → 解向量 [x0..x(n-1)]。唯一解系统；无解/无穷解返回空数组',
    );
  },
};

/** 多元二次多项式求值 */
Blockly.Blocks['mv_quad_eval'] = {
  init: function () {
    this.appendValueInput('COEFFS')
      .setCheck(TYPE_INT_LIST)
      .appendField('MVQuadEval(');
    this.appendValueInput('X').setCheck(TYPE_INT_LIST).appendField(' x=');
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_NUMBER);
    this.setColour(COLOUR);
    this.setTooltip(
      '多元二次多项式求值 Q(x) = Σ_{i≤j} a_ij·xi·xj + Σ b_i·xi + c。系数展平：二次上三角 n(n+1)/2 项（i≤j 行优先）‖ 一次 n 项 ‖ 常数。MQ 困难问题教学核心',
    );
  },
};

/** 组合数 */
Blockly.Blocks['comb'] = {
  init: function () {
    this.appendValueInput('N').setCheck(TYPE_NUMBER).appendField('C(');
    this.appendValueInput('K').setCheck(TYPE_NUMBER).appendField(',');
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_NUMBER);
    this.setColour(COLOUR);
    this.setTooltip(
      '组合数 C(n,k) = n!/(k!(n-k)!)：CBD 采样（中心二项分布）与二项式教学。C(n,0)=C(n,n)=1，C(n,k)=C(n,n-k)',
    );
  },
};

/** 向量点积 */
Blockly.Blocks['vec_dot'] = {
  init: function () {
    this.appendValueInput('A').setCheck(TYPE_INT_LIST).appendField('VecDot(');
    this.appendValueInput('B').setCheck(TYPE_INT_LIST).appendField(' ·');
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_NUMBER);
    this.setColour(COLOUR);
    this.setTooltip(
      '向量点积 a·b = Σ a_i·b_i。格基内积、正交性与线性代数通用基础',
    );
    this.setHelpUrl('');
  },
};

/** 多项式乘标量 */
Blockly.Blocks['poly_scale'] = {
  init: function () {
    this.appendValueInput('P').setCheck(TYPE_INT_LIST).appendField('PolyScale(');
    this.appendValueInput('K').setCheck(TYPE_NUMBER).appendField(' ×');
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_INT_LIST);
    this.setColour(COLOUR);
    this.setTooltip(
      '多项式乘标量：逐系数乘 k（不取模）。格基多项式环 R_q 标量运算基础',
    );
    this.setHelpUrl('');
  },
};
