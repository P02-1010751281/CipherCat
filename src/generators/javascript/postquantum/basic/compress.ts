/**
 * ML-KEM 压缩/解压缩 JavaScript 代码生成器 — 后量子基础块
 *
 * 参考: FIPS 203 — https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.203.pdf
 */
import { javascriptGenerator, Order } from 'blockly/javascript';
import type { Block } from 'blockly/core';

// Compress_q(x, d): 将模 q 整数 x 压缩为 d 位整数
javascriptGenerator.forBlock['pq_compress'] = function (
  block: Block,
): [string, number] {
  const input =
    javascriptGenerator.valueToCode(block, 'INPUT', Order.ATOMIC) || 'input';
  const bits = parseInt(block.getFieldValue('BITS') || '10');
  const modulus = block.getFieldValue('MODULUS') || '3329';

  const funcName = javascriptGenerator.provideFunction_('compressD' + bits, [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(x, q) {',
    '  q = q || 3329;',
    '  let d = ' + bits + ';',
    '  let pow2d = 1 << d;',
    '  let mask = pow2d - 1;',
    '  if (Array.isArray(x) || x instanceof Uint8Array) {',
    '    let res = new Array(x.length);',
    '    for (let i = 0; i < x.length; i++) {',
    '      let xi = x[i] | 0;',
    '      let tmp = (xi * pow2d + (q >> 1));',
    '      let comp = Math.floor(tmp / q) & mask;',
    '      res[i] = comp;',
    '    }',
    '    return res;',
    '  }',
    '  let tmp = (x * pow2d + (q >> 1));',
    '  return Math.floor(tmp / q) & mask;',
    '}',
  ]);

  return [`${funcName}(${input}, ${modulus})`, Order.ATOMIC];
};

// Decompress_q(y, d): 将 d 位整数 y 解压缩回模 q 整数
javascriptGenerator.forBlock['pq_decompress'] = function (
  block: Block,
): [string, number] {
  const input =
    javascriptGenerator.valueToCode(block, 'INPUT', Order.ATOMIC) || 'input';
  const bits = parseInt(block.getFieldValue('BITS') || '10');
  const modulus = block.getFieldValue('MODULUS') || '3329';

  const funcName = javascriptGenerator.provideFunction_('decompressD' + bits, [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(y, q) {',
    '  q = q || 3329;',
    '  let d = ' + bits + ';',
    '  let pow2d = 1 << d;',
    '  let half = pow2d >> 1;',
    '  if (Array.isArray(y) || y instanceof Uint8Array) {',
    '    let res = new Array(y.length);',
    '    for (let i = 0; i < y.length; i++) {',
    '      let yi = y[i] | 0;',
    '      let tmp = (yi * q + half);',
    '      res[i] = Math.floor(tmp / pow2d);',
    '    }',
    '    return res;',
    '  }',
    '  let tmp = (y * q + half);',
    '  return Math.floor(tmp / pow2d);',
    '}',
  ]);

  return [`${funcName}(${input}, ${modulus})`, Order.ATOMIC];
};
