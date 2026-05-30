/**
 * ML-KEM 字节/比特编解码 JavaScript 代码生成器 — 后量子基础块
 *
 * 参考: FIPS 203 — https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.203.pdf
 */
import { javascriptGenerator, Order } from 'blockly/javascript';
import type { Block } from 'blockly/core';

// BytesToBits (Algorithm 4): 将字节数组转换为比特数组
javascriptGenerator.forBlock['pq_bytes_to_bits'] = function(block: Block): [string, number] {
  const input = javascriptGenerator.valueToCode(block, 'INPUT', Order.ATOMIC) || 'input';

  const funcName = javascriptGenerator.provideFunction_('bytesToBits', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(bytes) {',
    '  let bits = [];',
    '  for (let i = 0; i < bytes.length; i++) {',
    '    let b = bytes[i];',
    '    for (let j = 0; j < 8; j++) {',
    '      bits.push((b >> j) & 1);',
    '    }',
    '  }',
    '  return bits;',
    '}'
  ]);

  return [`${funcName}(${input})`, Order.ATOMIC];
};

// BitsToBytes: 将比特数组转换回字节数组
javascriptGenerator.forBlock['pq_bits_to_bytes'] = function(block: Block): [string, number] {
  const input = javascriptGenerator.valueToCode(block, 'INPUT', Order.ATOMIC) || 'input';

  const funcName = javascriptGenerator.provideFunction_('bitsToBytes', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(bits) {',
    '  let bytes = [];',
    '  for (let i = 0; i < bits.length; i += 8) {',
    '    let b = 0;',
    '    for (let j = 0; j < 8 && (i + j) < bits.length; j++) {',
    '      b |= bits[i + j] << j;',
    '    }',
    '    bytes.push(b);',
    '  }',
    '  return bytes;',
    '}'
  ]);

  return [`${funcName}(${input})`, Order.ATOMIC];
};

// ByteEncode_d (Algorithm 5): 将多项式系数编码为紧凑字节数组
javascriptGenerator.forBlock['pq_byte_encode'] = function(block: Block): [string, number] {
  const input = javascriptGenerator.valueToCode(block, 'INPUT', Order.ATOMIC) || 'input';
  const bits = parseInt(block.getFieldValue('BITS') || '12');

  const funcName = javascriptGenerator.provideFunction_('byteEncode' + bits, [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(f) {',
    '  let d = ' + bits + ';',
    '  let n = 256;',
    '  let outLen = (n * d) / 8;',
    '  let out = new Uint8Array(outLen);',
    '  let bitPos = 0;',
    '  for (let i = 0; i < n; i++) {',
    '    let val = f[i];',
    '    for (let j = 0; j < d; j++) {',
    '      let byteIdx = bitPos >> 3;',
    '      let bitIdx = bitPos & 7;',
    '      if ((val >> j) & 1) out[byteIdx] |= 1 << bitIdx;',
    '      bitPos++;',
    '    }',
    '  }',
    '  return out;',
    '}'
  ]);

  return [`${funcName}(${input})`, Order.ATOMIC];
};

// ByteDecode_d (Algorithm 6): 将紧凑字节数组解码为多项式系数
javascriptGenerator.forBlock['pq_byte_decode'] = function(block: Block): [string, number] {
  const input = javascriptGenerator.valueToCode(block, 'INPUT', Order.ATOMIC) || 'input';
  const bits = parseInt(block.getFieldValue('BITS') || '12');

  const funcName = javascriptGenerator.provideFunction_('byteDecode' + bits, [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(B) {',
    '  let d = ' + bits + ';',
    '  let n = 256;',
    '  let f = new Array(n);',
    '  let bitPos = 0;',
    '  for (let i = 0; i < n; i++) {',
    '    let val = 0;',
    '    for (let j = 0; j < d; j++) {',
    '      let byteIdx = bitPos >> 3;',
    '      let bitIdx = bitPos & 7;',
    '      if ((B[byteIdx] >> bitIdx) & 1) val |= 1 << j;',
    '      bitPos++;',
    '    }',
    '    f[i] = val;',
    '  }',
    '  return f;',
    '}'
  ]);

  return [`${funcName}(${input})`, Order.ATOMIC];
};
