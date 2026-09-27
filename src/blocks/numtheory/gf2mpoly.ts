/**
 * GF(2^m) 系数多项式原子块定义（McEliece/Goppa 基于纠错码方案的核心运算）
 *
 * 系数 ∈ GF(2^8)（AES 域，不可约 x⁸+x⁴+x³+x+1 = 0x11B，与 goppa_gen_poly/gf2m 块同域），
 * 多项式表示为系数数组（index = 幂次，低位在前，与 goppa_gen_poly 输出一致）。
 *
 * - gf2m_poly_add:   逐系数 XOR（特征 2，减 = 加）
 * - gf2m_poly_mul:   一般化卷积（复用 goppa_gen_poly 内嵌的 GF(2^8) 乘法）
 * - gf2m_poly_mod:   长除取余（模首一多项式，如 Goppa 生成多项式 G(z)）
 * - gf2m_poly_xgcd:  扩展欧几里得 → [len_u, u…, len_v, v…, g…]（u·a ⊕ v·b = g，
 *                    g 归一化为首一）——Patterson 译码提取错误定位子的核心
 * - gf2m_poly_eval:  Horner 求值 P(α)——Chien 搜索求根的基础
 *
 * Patterson 译码链路：syndrome 多项式 → mod G(z) → xgcd → 错误定位子 σ(x) →
 * poly_eval 在 α⁰…αⁿ⁻¹ 求根定错误位置。性质向量：加法交换/零元、乘法结合律、
 * (a·b) mod b = 0、Bezout 恒等式、Goppa 多项式在 α_i 处求值为 0。
 */
import * as Blockly from 'blockly/core';
import { TYPE_INT_LIST, TYPE_NUMBER } from '@/constants/block-types';

export const GF2MPOLY_BLOCK_TYPES = [
  'gf2m_poly_add',
  'gf2m_poly_mul',
  'gf2m_poly_mod',
  'gf2m_poly_xgcd',
  'gf2m_poly_eval',
] as const;
export type Gf2mPolyBlockType = (typeof GF2MPOLY_BLOCK_TYPES)[number];

const COLOUR = 250;
const GOPPA_TOOLTIP =
  'GF(2^8) 系数多项式（AES 域 0x11B，与 goppa_gen_poly 同域）。系数数组低次到高次。';

Blockly.Blocks['gf2m_poly_add'] = {
  init: function () {
    this.appendValueInput('A').setCheck(TYPE_INT_LIST).appendField('GF2mPolyAdd(');
    this.appendValueInput('B').setCheck(TYPE_INT_LIST).appendField(' ,');
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_INT_LIST);
    this.setColour(COLOUR);
    this.setTooltip(GOPPA_TOOLTIP + '加法 = 逐系数 XOR（特征 2，减=加）。');
    this.setHelpUrl('');
  },
};

Blockly.Blocks['gf2m_poly_mul'] = {
  init: function () {
    this.appendValueInput('A').setCheck(TYPE_INT_LIST).appendField('GF2mPolyMul(');
    this.appendValueInput('B').setCheck(TYPE_INT_LIST).appendField(' ,');
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_INT_LIST);
    this.setColour(COLOUR);
    this.setTooltip(GOPPA_TOOLTIP + '卷积乘法，系数乘用 GF(2^8) 域乘法（模 0x11B）。');
    this.setHelpUrl('');
  },
};

Blockly.Blocks['gf2m_poly_mod'] = {
  init: function () {
    this.appendValueInput('A').setCheck(TYPE_INT_LIST).appendField('GF2mPolyMod(');
    this.appendValueInput('B').setCheck(TYPE_INT_LIST).appendField(' mod ');
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_INT_LIST);
    this.setColour(COLOUR);
    this.setTooltip(GOPPA_TOOLTIP + '长除取余 mod B（B 归一化为首一，余数不变）。');
    this.setHelpUrl('');
  },
};

Blockly.Blocks['gf2m_poly_xgcd'] = {
  init: function () {
    this.appendValueInput('A').setCheck(TYPE_INT_LIST).appendField('GF2mPolyXgcd(');
    this.appendValueInput('B').setCheck(TYPE_INT_LIST).appendField(' ,');
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_INT_LIST);
    this.setColour(COLOUR);
    this.setTooltip(
      GOPPA_TOOLTIP +
        '扩展欧几里得：输出 [len_u, u…, len_v, v…, g…]，满足 u·A ⊕ v·B = g（g 首一）。Patterson 译码提取错误定位子核心。',
    );
    this.setHelpUrl('');
  },
};

Blockly.Blocks['gf2m_poly_eval'] = {
  init: function () {
    this.appendValueInput('P').setCheck(TYPE_INT_LIST).appendField('GF2mPolyEval(');
    this.appendValueInput('X').setCheck(TYPE_NUMBER).appendField(' at ');
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_NUMBER);
    this.setColour(COLOUR);
    this.setTooltip(
      GOPPA_TOOLTIP +
        'Horner 求值 P(X)，X ∈ GF(2^8)。Goppa 多项式 G(z) 在码位 α_i 处求值为 0（根的判定，Chien 搜索基础）。',
    );
    this.setHelpUrl('');
  },
};
