/**
 * ML-KEM 字节/比特编解码积木块定义 — 后量子基础块
 *
 * 基于 FIPS 203 (ML-KEM) 标准实现核心编解码算子：
 *   - BytesToBits (Algorithm 4): 字节数组 → 比特数组 (小端序)
 *   - BitsToBytes: 比特数组 → 字节数组 (BytesToBits 的逆操作)
 *   - ByteEncode (Algorithm 5): 多项式系数 → 紧凑字节编码 (d 位打包)
 *   - ByteDecode (Algorithm 6): 紧凑字节编码 → 多项式系数 (d 位解包)
 *
 * ML-KEM 参数 (FIPS 203 §7):
 *   q = 3329, n = 256
 *   ByteEncode_d: 将 d-bit 系数打包为 256·d/8 字节
 *   ByteDecode_d: 将 256·d/8 字节解包为 256 个 d-bit 系数
 *   常用 d 值: 12 (公钥压缩), 10/11/4/5 (密文压缩)
 *
 * 参考: FIPS 203 — https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.203.pdf
 */
import * as Blockly from 'blockly/core';

export const ENCODING_BLOCK_TYPES = [
  'pq_bytes_to_bits',
  'pq_bits_to_bytes',
  'pq_byte_encode',
  'pq_byte_decode'
] as const;

export type EncodingBlockType = typeof ENCODING_BLOCK_TYPES[number];

// BytesToBits (Algorithm 4): 将字节数组转换为比特数组
// 对每个字节 b，按小端序展开为 8 个比特: b_j = (b >> j) & 1 for j = 0..7
Blockly.Blocks['pq_bytes_to_bits'] = {
  init: function() {
    this.appendValueInput('INPUT').setCheck(null)
      .appendField('BytesToBits(');
    this.appendDummyInput()
      .appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, null);
    this.setColour(230);
    this.setTooltip('Convert byte array to bit array (little-endian per byte). Each byte b becomes 8 bits: b_j = (b >> j) & 1 for j=0..7 (FIPS 203, Algorithm 4)');
    this.setHelpUrl('https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.203.pdf');
  },
};

// BitsToBytes: 将比特数组转换为字节数组 (BytesToBits 的逆操作)
// 每 8 个连续比特 b_j 组装为一个字节: Σ b_j · 2^j for j=0..7
Blockly.Blocks['pq_bits_to_bytes'] = {
  init: function() {
    this.appendValueInput('INPUT').setCheck(null)
      .appendField('BitsToBytes(');
    this.appendDummyInput()
      .appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, null);
    this.setColour(230);
    this.setTooltip('Convert bit array back to byte array. Groups 8 consecutive bits into one byte: Σ b_j · 2^j (inverse of BytesToBits)');
    this.setHelpUrl('https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.203.pdf');
  },
};

// ByteEncode_d (Algorithm 5): 将多项式系数编码为紧凑字节数组
// 输入: 长度为 256 的系数数组 f (每个系数 < 2^d)，输出: 256·d/8 字节
// 编码方式: 连续打包，每个 d-bit 系数依次填入连续的比特位置
Blockly.Blocks['pq_byte_encode'] = {
  init: function() {
    this.appendValueInput('INPUT').setCheck(null)
      .appendField('ByteEncode(');
    this.appendDummyInput()
      .appendField(', d=')
      .appendField(new Blockly.FieldDropdown([
        ['12', '12'],
        ['11', '11'],
        ['10', '10'],
        ['5', '5'],
        ['4', '4'],
        ['1', '1'],
      ]), 'BITS');
    this.appendDummyInput()
      .appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, null);
    this.setColour(230);
    this.setTooltip('ByteEncode_d: Encode polynomial coefficients into compact bytes using d-bit packing (FIPS 203, Algorithm 5). Output length = 256·d/8 bytes.');
    this.setHelpUrl('https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.203.pdf');
  },
};

// ByteDecode_d (Algorithm 6): 将紧凑字节数组解码为多项式系数
// 输入: 256·d/8 字节数组 B，输出: 长度为 256 的系数数组 f (每个系数 < 2^d)
// 解码方式: 从字节串中依次读取 d-bit 块
Blockly.Blocks['pq_byte_decode'] = {
  init: function() {
    this.appendValueInput('INPUT').setCheck(null)
      .appendField('ByteDecode(');
    this.appendDummyInput()
      .appendField(', d=')
      .appendField(new Blockly.FieldDropdown([
        ['12', '12'],
        ['11', '11'],
        ['10', '10'],
        ['5', '5'],
        ['4', '4'],
        ['1', '1'],
      ]), 'BITS');
    this.appendDummyInput()
      .appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, null);
    this.setColour(230);
    this.setTooltip('ByteDecode_d: Decode compact bytes into polynomial coefficients using d-bit unpacking (FIPS 203, Algorithm 6). Output length = 256 coefficients.');
    this.setHelpUrl('https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.203.pdf');
  },
};
