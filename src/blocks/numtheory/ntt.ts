/**
 * NTT (数论变换) 积木块定义
 *
 * 基于后量子密码学标准实现，支持 Kyber (FIPS 203) 和 NewHope 参数集：
 *   - NTT:  Cooley-Tukey (CT) 蝶形运算，系数形式 → NTT 评估形式
 *   - INTT: Gentleman-Sande (GS) 蝶形运算，NTT 评估形式 → 系数形式
 *   - NTT 域乘法: Kyber half-NTT 域乘法（q=3329）
 *   - 蝶形运算: CT/GS 单步蝶形运算原语
 *
 * 参数说明:
 *   Kyber (FIPS 203): q=3329, n=256, 原根 ζ=17 (256 次本原单位根)
 *     - 17^256 ≡ 1 (mod 3329), 17^128 ≢ 1 (mod 3329)
 *     - 使用 half-NTT 技巧: 将 n=256 拆分为两个 n=128 的子变换
 *   NewHope: q=12289, n=256, 原根 ζ=3 (512 次本原单位根)
 *
 * 参考: FIPS 203 — https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.203.pdf
 *       NTT 教程 — https://higashi.blog/2023/12/15/ntt-03/
 */
import * as Blockly from 'blockly/core';

export const NTT_BLOCK_TYPES = [
  'pq_ntt',
  'pq_intt',
  'pq_ntt_mul',
  'pq_ntt_butterfly',
] as const;

export type NttBlockType = (typeof NTT_BLOCK_TYPES)[number];

// 数论变换 (NTT): Cooley-Tukey 蝶形运算
// 将多项式从系数形式转换为 NTT 评估形式
// CT 蝶形: (a, b) → (a + ζ·b, a - ζ·b)
// 迭代方向: stride 从 n/2 递减到 1
Blockly.Blocks['pq_ntt'] = {
  init: function () {
    this.appendValueInput('INPUT').setCheck(null).appendField('NTT(');
    this.appendDummyInput()
      .appendField(', q=')
      .appendField(
        new Blockly.FieldDropdown([
          ['3329 (Kyber)', '3329'],
          ['12289 (NewHope)', '12289'],
        ]),
        'MODULUS',
      );
    this.appendDummyInput()
      .appendField(', n=')
      .appendField(
        new Blockly.FieldDropdown([
          ['256', '256'],
          ['128', '128'],
        ]),
        'DEGREE',
      );
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, null);
    this.setColour(230);
    this.setTooltip(
      Blockly.Msg.CRYPTO_NTT_TOOLTIP ||
        'Number Theoretic Transform (NTT): Cooley-Tukey butterfly, convert polynomial from coefficient form to NTT evaluation form (FIPS 203)',
    );
    this.setHelpUrl('https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.203.pdf');
  },
};

// 逆数论变换 (INTT): Gentleman-Sande 蝶形运算
// 将 NTT 评估形式转换回系数形式
// GS 蝶形: (a, b) → ((a+b)/2, ζ·(b-a)/2)
// 迭代方向: stride 从 1 递增到 n/2
// 最后需乘以 n⁻¹ mod q
Blockly.Blocks['pq_intt'] = {
  init: function () {
    this.appendValueInput('INPUT').setCheck(null).appendField('INTT(');
    this.appendDummyInput()
      .appendField(', q=')
      .appendField(
        new Blockly.FieldDropdown([
          ['3329 (Kyber)', '3329'],
          ['12289 (NewHope)', '12289'],
        ]),
        'MODULUS',
      );
    this.appendDummyInput()
      .appendField(', n=')
      .appendField(
        new Blockly.FieldDropdown([
          ['256', '256'],
          ['128', '128'],
        ]),
        'DEGREE',
      );
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, null);
    this.setColour(230);
    this.setTooltip(
      Blockly.Msg.CRYPTO_INTT_TOOLTIP ||
        'Inverse NTT (INTT): Gentleman-Sande butterfly, convert NTT evaluation form back to coefficient form (FIPS 203)',
    );
    this.setHelpUrl('https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.203.pdf');
  },
};

// NTT 域乘法 (Kyber half-NTT 技巧，仅 q=3329)
// 在 NTT 评估形式下，对相邻的 (even, odd) 对进行乘法:
//   res[i]   = (a_even·b_even + ζ^(2·brv(i/2)+1)·a_odd·b_odd) mod q
//   res[i+1] = (a_odd·b_even + a_even·b_odd) mod q
// 其中 ζ^(2·brv(i/2)+1) 是 NWC (负缠绕卷积) 的缩放因子
Blockly.Blocks['pq_ntt_mul'] = {
  init: function () {
    this.appendValueInput('A')
      .setCheck(null)
      .appendField(Blockly.Msg.CRYPTO_NTT_MUL || 'NTT Mul(');
    this.appendValueInput('B').setCheck(null).appendField(',');
    this.appendDummyInput()
      .appendField(', q=')
      .appendField(
        new Blockly.FieldDropdown([['3329 (Kyber)', '3329']]),
        'MODULUS',
      );
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, null);
    this.setColour(230);
    this.setTooltip(
      Blockly.Msg.CRYPTO_NTT_MUL_TOOLTIP ||
        'Kyber half-NTT domain multiplication for q=3329, O(n) complexity (FIPS 203)',
    );
    this.setHelpUrl('https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.203.pdf');
  },
};

// 蝶形运算原语
// CT (Cooley-Tukey): 用于 NTT 正变换
//   (a, b) → (a + ζ·b mod q, a - ζ·b mod q)
// GS (Gentleman-Sande): 用于 INTT 逆变换
//   (a, b) → ((a + b)·2⁻¹ mod q, ζ·(b - a)·2⁻¹ mod q)
// 其中 2⁻¹ mod q = (q+1)/2 (当 q 为奇素数时)
Blockly.Blocks['pq_ntt_butterfly'] = {
  init: function () {
    this.appendValueInput('A')
      .setCheck(null)
      .appendField(Blockly.Msg.CRYPTO_NTT_BUTTERFLY || 'Butterfly(');
    this.appendValueInput('B').setCheck(null).appendField(',');
    this.appendValueInput('ZETA')
      .setCheck(null)
      .appendField(Blockly.Msg.CRYPTO_NTT_ZETA || ', ζ=');
    this.appendDummyInput()
      .appendField(', q=')
      .appendField(
        new Blockly.FieldDropdown([
          ['3329', '3329'],
          ['12289', '12289'],
        ]),
        'MODULUS',
      );
    this.appendDummyInput()
      .appendField(Blockly.Msg.CRYPTO_NTT_TYPE || ', Type=')
      .appendField(
        new Blockly.FieldDropdown([
          ['CT (NTT)', 'ct'],
          ['GS (INTT)', 'gs'],
        ]),
        'TYPE',
      );
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, null);
    this.setColour(230);
    this.setTooltip(
      Blockly.Msg.CRYPTO_NTT_BUTTERFLY_TOOLTIP ||
        'Butterfly operation: CT=(a+ζ·b, a-ζ·b) for NTT, GS=((a+b)/2, ζ·(b-a)/2) for INTT',
    );
    this.setHelpUrl('https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.203.pdf');
  },
};
