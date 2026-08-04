/**
 * 编码基（Code-based）数学基础块定义
 *
 * 教学研究用途：基于编码的后量子密码（McEliece / HQC / BIKE）底层数学。
 * - GF(2) 多项式运算（乘/除/模/欧几里得）：Goppa 码构造与纠错译码核心
 * - 二进制矩阵运算（GF(2) 乘/求逆）：生成矩阵 / 校验矩阵 / syndrome
 * - 汉明重量/距离：编码理论基本量
 *
 * 表示约定：GF(2) 多项式 = IntList 系数数组，index i = x^i 系数（低位在前，
 * 与 pq_poly_add/sub 数组语义一致）；二进制矩阵 = 按行优先展平 IntList + 阶数 n。
 */
import * as Blockly from 'blockly/core';
import { TYPE_INT_LIST, TYPE_NUMBER } from '@/constants/block-types';

export const CODEBASED_BLOCK_TYPES = [
  'gf2_poly_mul',
  'gf2_poly_div',
  'gf2_poly_mod',
  'gf2_poly_gcd',
  'bin_mat_mul',
  'bin_mat_inv',
  'ham_weight',
  'ham_dist',
  'goppa_gen_poly',
  'syndrome_calc',
  'berlekamp_massey',
] as const;
export type CodeBasedBlockType = (typeof CODEBASED_BLOCK_TYPES)[number];

const COLOUR = 250;

/** GF(2) 多项式乘法（XOR 卷积） */
Blockly.Blocks['gf2_poly_mul'] = {
  init: function () {
    this.appendValueInput('A').setCheck(TYPE_INT_LIST).appendField('GF(2) PolyMul(');
    this.appendValueInput('B').setCheck(TYPE_INT_LIST).appendField(' ×');
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_INT_LIST);
    this.setColour(COLOUR);
    this.setTooltip(
      'GF(2) 多项式乘法：系数按模 2 卷积（XOR + 移位）。Goppa 码生成多项式构造基础。输入为 0/1 系数数组（index = 幂次）',
    );
  },
};

/** GF(2) 多项式除法（商） */
Blockly.Blocks['gf2_poly_div'] = {
  init: function () {
    this.appendValueInput('A').setCheck(TYPE_INT_LIST).appendField('GF(2) PolyDiv(');
    this.appendValueInput('B').setCheck(TYPE_INT_LIST).appendField(' ÷');
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_INT_LIST);
    this.setColour(COLOUR);
    this.setTooltip(
      'GF(2) 多项式除法（商）：长除法（最高位对齐 XOR）。A = Q·B + R',
    );
  },
};

/** GF(2) 多项式取模（余数） */
Blockly.Blocks['gf2_poly_mod'] = {
  init: function () {
    this.appendValueInput('A').setCheck(TYPE_INT_LIST).appendField('GF(2) PolyMod(');
    this.appendValueInput('B').setCheck(TYPE_INT_LIST).appendField(' mod');
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_INT_LIST);
    this.setColour(COLOUR);
    this.setTooltip(
      'GF(2) 多项式取模（余数）：A mod B，次数 < deg(B)。纠错码校验（CRC/syndrome）与欧几里得核心',
    );
  },
};

/** GF(2) 多项式欧几里得 GCD */
Blockly.Blocks['gf2_poly_gcd'] = {
  init: function () {
    this.appendValueInput('A').setCheck(TYPE_INT_LIST).appendField('GF(2) PolyGCD(');
    this.appendValueInput('B').setCheck(TYPE_INT_LIST).appendField(',');
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_INT_LIST);
    this.setColour(COLOUR);
    this.setTooltip(
      'GF(2) 多项式最大公因式（欧几里得迭代）。gcd(A,B) = gcd(B, A mod B)；用于 Goppa 码生成多项式与 Berlekamp 译码',
    );
  },
};

/** GF(2) 二进制矩阵乘法（展平 n×n） */
Blockly.Blocks['bin_mat_mul'] = {
  init: function () {
    this.appendValueInput('A').setCheck(TYPE_INT_LIST).appendField('BinMatMul(');
    this.appendValueInput('B').setCheck(TYPE_INT_LIST).appendField(' ×');
    this.appendValueInput('N').setCheck(TYPE_NUMBER).appendField(' n=');
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_INT_LIST);
    this.setColour(COLOUR);
    this.setTooltip(
      'GF(2) 二进制矩阵乘法：n×n 展平矩阵（按行优先），元素模 2。编码基生成矩阵/校验矩阵运算基础',
    );
  },
};

/** GF(2) 二进制矩阵求逆（高斯消元） */
Blockly.Blocks['bin_mat_inv'] = {
  init: function () {
    this.appendValueInput('A').setCheck(TYPE_INT_LIST).appendField('BinMatInv(');
    this.appendValueInput('N').setCheck(TYPE_NUMBER).appendField(' n=');
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_INT_LIST);
    this.setColour(COLOUR);
    this.setTooltip(
      'GF(2) 二进制矩阵求逆：增广矩阵 [A|I] 高斯消元（模 2）。满秩方阵输入；奇异矩阵返回空数组',
    );
  },
};

/** 汉明重量 */
Blockly.Blocks['ham_weight'] = {
  init: function () {
    this.appendValueInput('X').setCheck(TYPE_INT_LIST).appendField('HammingWeight(');
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_NUMBER);
    this.setColour(COLOUR);
    this.setTooltip(
      '汉明重量 wt(x)：向量中非零元素个数。编码理论基本量（最小距离 = 非零码字最小重量）',
    );
  },
};

/** 汉明距离 */
Blockly.Blocks['ham_dist'] = {
  init: function () {
    this.appendValueInput('X').setCheck(TYPE_INT_LIST).appendField('HammingDist(');
    this.appendValueInput('Y').setCheck(TYPE_INT_LIST).appendField(',');
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_NUMBER);
    this.setColour(COLOUR);
    this.setTooltip(
      '汉明距离 d(x,y)：对应位置不同元素个数 = wt(x ⊕ y)。线性码纠错能力 t = ⌊(d-1)/2⌋',
    );
  },
};

/** Goppa 生成多项式：G(z) = ∏(z - α_i)，α_i ∈ GF(2^m)（AES 域） */
Blockly.Blocks['goppa_gen_poly'] = {
  init: function () {
    this.appendValueInput('ALPHA')
      .setCheck(TYPE_INT_LIST)
      .appendField('GoppaGenPoly(');
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_INT_LIST);
    this.setColour(COLOUR);
    this.setTooltip(
      'Goppa 生成多项式 G(z) = ∏(z - α_i)（GF(2^8) AES 域，α_i 为码位对应的域元素字节值）。输出系数数组（低次到高次，GF(2^8) 元素）。McEliece 码核心构造（减号 = 加号，特征 2）',
    );
    this.setHelpUrl('');
  },
};

/** 线性码 syndrome：H·y mod 2（校验矩阵 × 接收向量） */
Blockly.Blocks['syndrome_calc'] = {
  init: function () {
    this.appendValueInput('H')
      .setCheck(TYPE_INT_LIST)
      .appendField('Syndrome(');
    this.appendValueInput('Y').setCheck(TYPE_INT_LIST).appendField(' y=');
    this.appendValueInput('ROWS').setCheck(TYPE_NUMBER).appendField(' m=');
    this.appendValueInput('COLS').setCheck(TYPE_NUMBER).appendField(' n=');
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_INT_LIST);
    this.setColour(COLOUR);
    this.setTooltip(
      '线性码 syndrome s = H·y (mod 2)：校验矩阵 H（m×n 展平）× 接收向量 y（n）→ m 维。s=0 ⟺ y 是合法码字（无错误）；非零 syndrome 用于纠错译码',
    );
    this.setHelpUrl('');
  },
};

/** Berlekamp-Massey：GF(2) 序列的最短 LFSR 综合 */
Blockly.Blocks['berlekamp_massey'] = {
  init: function () {
    this.appendValueInput('SEQ')
      .setCheck(TYPE_INT_LIST)
      .appendField('BerlekampMassey(');
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_INT_LIST);
    this.setColour(COLOUR);
    this.setTooltip(
      'Berlekamp-Massey 算法：GF(2) 序列 → 最短线性反馈移位寄存器（LFSR）连接多项式（系数数组，低位在前，c[0]=1）。BCH/RS 译码与序列综合核心',
    );
    this.setHelpUrl('');
  },
};
