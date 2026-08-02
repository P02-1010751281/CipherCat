/**
 * X25519 原子块 Python 代码生成器
 * RFC 7748
 *
 * Montgomery ladder（p = 2^255-19, a24 = 121665）：
 *   k 解码后 clamp（低 3 位 + 最高位清 0、位 254 置 1）；u 坐标清位 255（decodeUCoordinate）。
 */
import { pythonGenerator, Order } from 'blockly/python';
import type { Block } from 'blockly/core';

/** X25519 完整标量乘法（返回 32 字节共享密钥列表） */
function registerX25519(): string {
  return pythonGenerator.provideFunction_('x25519', [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(scalar, u):',
    '    P = 2 ** 255 - 19',
    '    A24 = 121665',
    '    if len(scalar) != 32 or len(u) != 32:',
    '        raise ValueError("X25519 inputs must be 32 bytes")',
    '    # clamp 标量（RFC 7748 §5）',
    '    k = list(scalar)',
    '    k[0] &= 248',
    '    k[31] &= 127',
    '    k[31] |= 64',
    '    # little-endian 解码 + u 坐标清位 255（decodeUCoordinate）',
    '    k_int = int.from_bytes(bytes(k), "little")',
    '    x1 = int.from_bytes(bytes(u), "little") & ((1 << 255) - 1)',
    '    # Montgomery ladder（RFC 7748 Appendix A）',
    '    x2, z2, x3, z3 = 1, 0, x1, 1',
    '    swap = 0',
    '    for t in range(254, -1, -1):',
    '        k_t = (k_int >> t) & 1',
    '        swap ^= k_t',
    '        if swap:',
    '            x2, x3 = x3, x2',
    '            z2, z3 = z3, z2',
    '        swap = k_t',
    '        A = (x2 + z2) % P',
    '        AA = A * A % P',
    '        B = (x2 - z2) % P',
    '        BB = B * B % P',
    '        E = (AA - BB) % P',
    '        C = (x3 + z3) % P',
    '        D = (x3 - z3) % P',
    '        DA = D * A % P',
    '        CB = C * B % P',
    '        x3 = (DA + CB) ** 2 % P',
    '        z3 = x1 * (DA - CB) ** 2 % P',
    '        x2 = AA * BB % P',
    '        z2 = E * (AA + A24 * E) % P',
    '    # x2 / z2 = x2 · z2^(p-2)',
    '    r = x2 * pow(z2, P - 2, P) % P',
    '    return [(r >> (8 * i)) & 0xFF for i in range(32)]',
  ]);
}

pythonGenerator.forBlock['x25519'] = function (block: Block): [string, number] {
  const scalar = pythonGenerator.valueToCode(block, 'SCALAR', Order.ATOMIC) || '[]';
  const u = pythonGenerator.valueToCode(block, 'U', Order.ATOMIC) || '[]';
  const fn = registerX25519();
  return [fn + '(' + scalar + ', ' + u + ')', Order.ATOMIC];
};
