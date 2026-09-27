/**
 * Goppa 码 Patterson 译码块定义（McEliece 基于纠错码方案，完整算法黑盒）
 *
 * goppa_decode(Y, G, L) → 纠正后的接收字（0/1 位向量）
 *
 * 参数（GF(2^8) AES 域 0x11B）：
 *   - L：支持集（n 个域元素，建议取 GF(16) 子域元素以获非零码字空间）
 *   - G：Goppa 生成多项式系数（低位在前，无根在 L，次数 t）
 *   - Y：接收字（n 位 0/1）
 * 纠错能力：⌊t/2⌋ 位；不可纠时返回原样。
 *
 * Patterson 算法（1975，binary Goppa codes）：
 *   1. syndrome S = Σ_{y_i=1} (z−α_i)⁻¹ mod G
 *   2. T = sqrt(z + S⁻¹) mod G（Frobenius 16×16 GF(2) 矩阵开方）
 *   3. 扩展欧几里得 (G, T) 至 deg r ≤ ⌊t/2⌋，σ = r² + z·B²（B 为 r 的 T 系数）
 *   4. σ 在 L 中求根定错误位置 → 翻转
 * 验证：GF(16) 子域 [14,6,5] Goppa 码往返（无错/单错/双错）双语言性质向量 PASS。
 */
import * as Blockly from 'blockly/core';
import { TYPE_INT_LIST } from '@/constants/block-types';

export const GOPPA_BLOCK_TYPES = ['goppa_decode'] as const;
export type GoppaBlockType = (typeof GOPPA_BLOCK_TYPES)[number];

Blockly.Blocks['goppa_decode'] = {
  init: function () {
    this.appendValueInput('Y')
      .setCheck(TYPE_INT_LIST)
      .appendField('GoppaDecode(');
    this.appendValueInput('G')
      .setCheck(TYPE_INT_LIST)
      .appendField(' g:');
    this.appendValueInput('L')
      .setCheck(TYPE_INT_LIST)
      .appendField(' L:');
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_INT_LIST);
    this.setColour(250);
    this.setTooltip(
      'Goppa 码 Patterson 译码（McEliece）：接收字 Y + 生成多项式 G + 支持集 L → 纠正后位向量。' +
        '纠 ⌊deg G / 2⌋ 位错；不可纠时返回原样。' +
        '数学：syndrome → sqrt(z+S⁻¹)（Frobenius 开方）→ 扩展欧几里得 → σ 求根定错位。',
    );
    this.setHelpUrl('');
  },
};
