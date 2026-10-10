/**
 * ML-KEM 字节/比特编解码 Python 代码生成器 — 后量子基础块
 *
 * 参考: FIPS 203 — https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.203.pdf
 */
import { pythonGenerator, Order } from 'blockly/python';
import type { Block } from 'blockly/core';

// BytesToBits (Algorithm 4): 字节数组 → 比特数组
pythonGenerator.forBlock['pq_bytes_to_bits'] = function(block: Block): [string, number] {
  const input = pythonGenerator.valueToCode(block, 'INPUT', Order.ATOMIC) || 'input';
  const funcName = pythonGenerator.provideFunction_('bytes_to_bits', [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(data):',
    '    values = list(data)',
    '    bits = []',
    '    for b in values:',
    '        if type(b) not in (int, float) or not 0 <= b <= 255 or int(b) != b:',
    '            raise ValueError("BytesToBits input must contain bytes (0..255)")',
    '        b = int(b)',
    '        for j in range(8):',
    '            bits.append((b >> j) & 1)',
    '    return bits',
  ]);
  return [funcName + '(' + input + ')', Order.ATOMIC];
};

// BitsToBytes: 比特数组 → 字节数组
pythonGenerator.forBlock['pq_bits_to_bytes'] = function(block: Block): [string, number] {
  const input = pythonGenerator.valueToCode(block, 'INPUT', Order.ATOMIC) || 'input';
  const funcName = pythonGenerator.provideFunction_('bits_to_bytes', [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(bits):',
    '    values = list(bits)',
    '    if len(values) % 8 != 0:',
    '        raise ValueError("BitsToBytes input length must be a multiple of 8")',
    '    out = bytearray()',
    '    for i in range(0, len(values), 8):',
    '        b = 0',
    '        for j in range(8):',
    '            bit = values[i + j]',
    '            if type(bit) not in (int, float) or bit not in (0, 1):',
    '                raise ValueError("BitsToBytes input must contain only 0 or 1")',
    '            b |= int(bit) << j',
    '        out.append(b)',
    '    return bytes(out)',
  ]);
  return [funcName + '(' + input + ')', Order.ATOMIC];
};

// ByteEncode_d (Algorithm 5): 多项式系数 → 紧凑字节
pythonGenerator.forBlock['pq_byte_encode'] = function(block: Block): [string, number] {
  const input = pythonGenerator.valueToCode(block, 'INPUT', Order.ATOMIC) || 'input';
  const bits = parseInt(block.getFieldValue('BITS') || '12');

  const funcName = pythonGenerator.provideFunction_('byte_encode_d' + bits, [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(f):',
    '    d = ' + bits,
    '    n = 256',
    '    modulus = 3329 if d == 12 else 1 << d',
    '    if not isinstance(f, list) or len(f) != n: raise TypeError("ByteEncode input must contain 256 coefficients")',
    '    for value in f:',
    '        if isinstance(value, bool) or not isinstance(value, (int, float)) or (isinstance(value, float) and not value.is_integer()) or not 0 <= value < modulus: raise ValueError("ByteEncode coefficient is outside its declared range")',
    '    out_len = (n * d) // 8',
    '    out = bytearray(out_len)',
    '    bit_pos = 0',
    '    for i in range(n):',
    '        val = int(f[i])',
    '        for j in range(d):',
    '            byte_idx = bit_pos >> 3',
    '            bit_idx = bit_pos & 7',
    '            if (val >> j) & 1:',
    '                out[byte_idx] |= 1 << bit_idx',
    '            bit_pos += 1',
    '    return bytes(out)',
  ]);
  return [funcName + '(' + input + ')', Order.ATOMIC];
};

// ByteDecode_d (Algorithm 6): 紧凑字节 → 多项式系数
pythonGenerator.forBlock['pq_byte_decode'] = function(block: Block): [string, number] {
  const input = pythonGenerator.valueToCode(block, 'INPUT', Order.ATOMIC) || 'input';
  const bits = parseInt(block.getFieldValue('BITS') || '12');

  const funcName = pythonGenerator.provideFunction_('byte_decode_d' + bits, [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(B):',
    '    d = ' + bits,
    '    n = 256',
    '    if not isinstance(B, (bytes, bytearray)) or len(B) != (n * d) // 8: raise TypeError("ByteDecode input length must match d")',
    '    f = [0] * n',
    '    bit_pos = 0',
    '    for i in range(n):',
    '        val = 0',
    '        for j in range(d):',
    '            byte_idx = bit_pos >> 3',
    '            bit_idx = bit_pos & 7',
    '            if (B[byte_idx] >> bit_idx) & 1:',
    '                val |= 1 << j',
    '            bit_pos += 1',
    '        f[i] = val % 3329 if d == 12 else val',
    '    return f',
  ]);
  return [funcName + '(' + input + ')', Order.ATOMIC];
};
