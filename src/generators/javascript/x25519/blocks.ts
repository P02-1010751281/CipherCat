/**
 * X25519 原子块 JavaScript 代码生成器
 * RFC 7748
 *
 * Montgomery ladder（p = 2^255-19, a24 = 121665）：
 *   k 解码后 clamp（低 3 位 + 最高位清 0、位 254 置 1）；u 坐标清位 255（RFC decodeUCoordinate）。
 *   z2^(-1) = z2^(p-2) 用扩展欧几里得 modInverse（SM2 ecc 生成器同款 BigInt 技巧）。
 */
import { javascriptGenerator, Order } from 'blockly/javascript';
import type { Block } from 'blockly/core';

/** X25519 完整标量乘法（返回 32 字节共享密钥） */
function registerX25519(): string {
  return javascriptGenerator.provideFunction_('x25519', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(scalar, u) {',
    '  var P = 0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffedn;',
    '  var A24 = 121665n;',
    '  if (scalar.length !== 32 || u.length !== 32) throw new Error("X25519 inputs must be 32 bytes");',
    '  // clamp 标量（RFC 7748 §5）',
    '  var k = scalar.slice();',
    '  k[0] &= 248; k[31] &= 127; k[31] |= 64;',
    '  // little-endian 解码 + u 坐标清位 255（decodeUCoordinate）',
    '  var kInt = 0n, x1 = 0n;',
    '  for (var i = 0; i < 32; i++) { kInt |= BigInt(k[i]) << (8n * BigInt(i)); x1 |= BigInt(u[i]) << (8n * BigInt(i)); }',
    '  x1 &= (1n << 255n) - 1n;',
    '  // Montgomery ladder（RFC 7748 Appendix A）',
    '  var x2 = 1n, z2 = 0n, x3 = x1, z3 = 1n, swap = 0n;',
    '  for (var t = 254; t >= 0; t--) {',
    '    var kt = (kInt >> BigInt(t)) & 1n;',
    '    swap ^= kt;',
    '    if (swap) { var tx = x2; x2 = x3; x3 = tx; var tz = z2; z2 = z3; z3 = tz; }',
    '    swap = kt;',
    '    var A = (x2 + z2) % P, AA = A * A % P;',
    '    var B = (x2 - z2 + P) % P, BB = B * B % P;',
    '    var E = (AA - BB + P) % P;',
    '    var C = (x3 + z3) % P, D = (x3 - z3 + P) % P;',
    '    var DA = D * A % P, CB = C * B % P;',
    '    var s = (DA + CB) % P;',
    '    var d = (DA - CB + P) % P;',
    '    x3 = s * s % P;',
    '    z3 = x1 * d % P * d % P;',
    '    x2 = AA * BB % P;',
    '    z2 = E * ((AA + A24 * E) % P) % P;',
    '  }',
    '  // x2 / z2 = x2 · z2^(p-2)（z2 的模逆）',
    '  var r = x2 * modInverse(z2, P) % P;',
    '  var out = [];',
    '  for (var o = 0; o < 32; o++) { out.push(Number(r & 0xffn)); r >>= 8n; }',
    '  return out;',
    '}',
  ]);
}

/** BigInt 模逆（扩展欧几里得）——与 SM2 ecc 生成器同款 */
function registerModInverse(): string {
  return javascriptGenerator.provideFunction_('modInverse', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(a, m) {',
    '  a = ((a % m) + m) % m;',
    '  var old_r = a, r = m, old_s = 1n, s = 0n;',
    '  while (r !== 0n) {',
    '    var q = old_r / r;',
    '    var tmp = r; r = old_r - q * r; old_r = tmp;',
    '    tmp = s; s = old_s - q * s; old_s = tmp;',
    '  }',
    '  if (old_r !== 1n) return 1n;',
    '  return ((old_s % m) + m) % m;',
    '}',
  ]);
}

javascriptGenerator.forBlock['x25519'] = function (block: Block): [string, number] {
  const scalar = javascriptGenerator.valueToCode(block, 'SCALAR', Order.ATOMIC) || '[]';
  const u = javascriptGenerator.valueToCode(block, 'U', Order.ATOMIC) || '[]';
  registerModInverse();
  const fn = registerX25519();
  return [fn + '(' + scalar + ', ' + u + ')', Order.ATOMIC];
};
