/**
 * ML-KEM 压缩/解压缩 Python 代码生成器 — 后量子基础块
 *
 * 参考: FIPS 203 — https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.203.pdf
 */
import { pythonGenerator, Order } from 'blockly/python';
import type { Block } from 'blockly/core';

// Compress_q(x, d): 将模 q 整数 x 压缩为 d 位整数
pythonGenerator.forBlock['pq_compress'] = function(block: Block): [string, number] {
  const input = pythonGenerator.valueToCode(block, 'INPUT', Order.ATOMIC) || 'input';
  const bits = parseInt(block.getFieldValue('BITS') || '10');
  const modulus = block.getFieldValue('MODULUS') || '3329';

  const funcName = pythonGenerator.provideFunction_('compress_d' + bits, [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(x, q=3329):',
    '    d = ' + bits,
    '    pow2d = 1 << d',
    '    mask = pow2d - 1',
    '    if isinstance(x, (list, tuple)):',
    '        return [((xi * pow2d + q // 2) // q) & mask for xi in x]',
    '    return ((x * pow2d + q // 2) // q) & mask',
  ]);
  return [funcName + '(' + input + ', q=' + modulus + ')', Order.ATOMIC];
};

// Decompress_q(y, d): 将 d 位整数 y 解压缩回模 q 整数
pythonGenerator.forBlock['pq_decompress'] = function(block: Block): [string, number] {
  const input = pythonGenerator.valueToCode(block, 'INPUT', Order.ATOMIC) || 'input';
  const bits = parseInt(block.getFieldValue('BITS') || '10');
  const modulus = block.getFieldValue('MODULUS') || '3329';

  const funcName = pythonGenerator.provideFunction_('decompress_d' + bits, [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(y, q=3329):',
    '    d = ' + bits,
    '    pow2d = 1 << d',
    '    half = pow2d >> 1',
    '    if isinstance(y, (list, tuple)):',
    '        return [(yi * q + half) // pow2d for yi in y]',
    '    return (y * q + half) // pow2d',
  ]);
  return [funcName + '(' + input + ', q=' + modulus + ')', Order.ATOMIC];
};
