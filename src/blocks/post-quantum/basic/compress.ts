/**
 * ML-KEM 压缩/解压缩积木块定义 — 后量子基础块
 *
 * 基于 FIPS 203 (ML-KEM) 标准实现 (§4.2.1 Conversion and Compression Algorithms):
 *   - Compress_q(x, d): 将模 q 整数 x 压缩为 d 位整数
 *   - Decompress_q(y, d): 将 d 位整数 y 解压缩回模 q 整数
 *
 * 公式:
 *   Compress_q(x, d) = ⌊(2^d / q) · x⌉ mod 2^d
 *   Decompress_q(y, d) = ⌊(q / 2^d) · y⌉
 *
 * ML-KEM 参数 (FIPS 203 §7):
 *   q = 3329
 *   压缩参数:
 *     d_u = 10 (ML-KEM-512/768) / 11 (ML-KEM-1024) — 用于 u 分量
 *     d_v = 4  (ML-KEM-512/768) / 5  (ML-KEM-1024) — 用于 v 分量
 *
 * 注意:
 *   - Compress 的输出范围为 [0, 2^d - 1]
 *   - Decompress 的输出范围近似还原原始值，会引入小数舍入误差
 *   - 舍入用最近整数: ⌊x⌉ = ⌊x + 0.5⌋
 *
 * 参考: FIPS 203 — https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.203.pdf
 */
import * as Blockly from 'blockly/core';

export const COMPRESS_BLOCK_TYPES = ['pq_compress', 'pq_decompress'] as const;

export type CompressBlockType = (typeof COMPRESS_BLOCK_TYPES)[number];

// Compress_q(x, d): 将模 q 整数 x 压缩为 d 位整数
// Compress_q(x, d) = round((2^d / q) · x) mod 2^d
// 实现: (x · 2^d + q/2) / q mod 2^d  (整数运算等效)
Blockly.Blocks['pq_compress'] = {
  init: function () {
    this.appendValueInput('INPUT').setCheck(null).appendField('Compress(');
    this.appendDummyInput()
      .appendField(', d=')
      .appendField(
        new Blockly.FieldDropdown([
          ['11 (ML-KEM-1024 du)', '11'],
          ['10 (ML-KEM-512/768 du)', '10'],
          ['5 (ML-KEM-1024 dv)', '5'],
          ['4 (ML-KEM-512/768 dv)', '4'],
          ['12', '12'],
          ['6', '6'],
          ['3', '3'],
          ['1', '1'],
        ]),
        'BITS',
      );
    this.appendDummyInput()
      .appendField(', q=')
      .appendField(new Blockly.FieldDropdown([['3329', '3329']]), 'MODULUS');
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, null);
    this.setColour(230);
    this.setTooltip(
      'Compress_q(x, d): Compress integer(s) modulo q to d bits. Compress(x,d) = round((2^d/q)·x) mod 2^d (FIPS 203 §4.2.1)',
    );
    this.setHelpUrl('https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.203.pdf');
  },
};

// Decompress_q(y, d): 将 d 位整数 y 解压缩回模 q 整数
// Decompress_q(y, d) = round((q / 2^d) · y)
// 实现: (y · q + 2^{d-1}) / 2^d  (整数运算等效)
Blockly.Blocks['pq_decompress'] = {
  init: function () {
    this.appendValueInput('INPUT').setCheck(null).appendField('Decompress(');
    this.appendDummyInput()
      .appendField(', d=')
      .appendField(
        new Blockly.FieldDropdown([
          ['11 (ML-KEM-1024 du)', '11'],
          ['10 (ML-KEM-512/768 du)', '10'],
          ['5 (ML-KEM-1024 dv)', '5'],
          ['4 (ML-KEM-512/768 dv)', '4'],
          ['12', '12'],
          ['6', '6'],
          ['3', '3'],
          ['1', '1'],
        ]),
        'BITS',
      );
    this.appendDummyInput()
      .appendField(', q=')
      .appendField(new Blockly.FieldDropdown([['3329', '3329']]), 'MODULUS');
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, null);
    this.setColour(230);
    this.setTooltip(
      'Decompress_q(y, d): Decompress d-bit integer(s) back to modulo q. Decompress(y,d) = round((q/2^d)·y) (FIPS 203 §4.2.1)',
    );
    this.setHelpUrl('https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.203.pdf');
  },
};
