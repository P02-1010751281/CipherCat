/**
 * P-256 (secp256r1) ECDH 共享密钥原子块 JavaScript 代码生成器
 * RFC 5903 / NIST SP 800-56A（secp256r1）
 *
 * 内嵌（BigInt，provideFunction_ 按名去重）：
 *   modInverse —— 扩展欧几里得模逆（与 x25519/ecc/ecdsa 生成器同款同名，去重共用）
 *   ecdhToBig  —— hex 字符串 / bigint / 字节数组 → BigInt
 *   ecdhPointAdd / ecdhPointMul —— Weierstrass 点加/倍点（仿射，模逆除法）
 *   ecdhSharedSecret —— S = [d]Q 的 x 坐标 32 字节大端 hex（64 字符）
 * 官方向量：RFC 5903 §8.1 + cryptography 确定性派生 2 组，与 python3 cryptography ECDH 逐字节一致。
 */
import { javascriptGenerator, Order } from 'blockly/javascript';
import type { Block } from 'blockly/core';

/** BigInt 模逆（扩展欧几里得）——与 x25519/ecc/ecdsa 生成器同款，provideFunction_ 按名去重 */
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

/** hex 字符串（可带 0x）/ bigint / 字节数组 → BigInt */
function registerEcdhToBig(): string {
  return javascriptGenerator.provideFunction_('ecdhToBig', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(v) {',
    '  if (typeof v === "bigint") return v;',
    '  if (typeof v === "string") return BigInt("0x" + v.replace(/^0x/, ""));',
    '  var r = 0n;',
    '  for (var i = 0; i < v.length; i++) r = (r << 8n) | BigInt(v[i]);',
    '  return r;',
    '}',
  ]);
}

/** Weierstrass 点加（仿射，模逆除法）；无穷远点用 null 表示 */
function registerEcdhPointAdd(): string {
  return javascriptGenerator.provideFunction_('ecdhPointAdd', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(P1, P2, p, a) {',
    '  if (P1 === null) return P2;',
    '  if (P2 === null) return P1;',
    '  var x1 = P1.x, y1 = P1.y, x2 = P2.x, y2 = P2.y;',
    '  if (x1 === x2 && (y1 + y2) % p === 0n) return null;',
    '  var lam;',
    '  if (x1 === x2 && y1 === y2) {',
    '    lam = (3n * x1 * x1 + a) * modInverse(2n * y1, p) % p;',
    '  } else {',
    '    lam = (y2 - y1) * modInverse(x2 - x1, p) % p;',
    '  }',
    '  var x3 = (lam * lam - x1 - x2) % p;',
    '  var y3 = (lam * (x1 - x3) - y1) % p;',
    '  if (x3 < 0n) x3 += p;',
    '  if (y3 < 0n) y3 += p;',
    '  return {x: x3, y: y3};',
    '}',
  ]);
}

/** 标量倍点（double-and-add） */
function registerEcdhPointMul(): string {
  return javascriptGenerator.provideFunction_('ecdhPointMul', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(k, G, p, a) {',
    '  var R = null, Q = G;',
    '  while (k > 0n) {',
    '    if (k & 1n) R = ecdhPointAdd(R, Q, p, a);',
    '    Q = ecdhPointAdd(Q, Q, p, a);',
    '    k >>= 1n;',
    '  }',
    '  return R;',
    '}',
  ]);
}

/** ECDH 共享密钥：S = [d]Q 的 x 坐标 32 字节大端 hex（64 字符） */
function registerEcdhSharedSecret(): string {
  return javascriptGenerator.provideFunction_('ecdhSharedSecret', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(dHex, qxHex, qyHex) {',
    '  var P = 0xffffffff00000001000000000000000000000000ffffffffffffffffffffffffn;',
    '  var A = 0xffffffff00000001000000000000000000000000fffffffffffffffffffffffcn;',
    '  var B = 0x5ac635d8aa3a93e7b3ebbd55769886bc651d06b0cc53b0f63bce3c3e27d2604bn;',
    '  var N = 0xffffffff00000000ffffffffffffffffbce6faada7179e84f3b9cac2fc632551n;',
    '  var d = ecdhToBig(dHex) % N;',
    '  if (d === 0n) throw new Error("ECDH: private key out of [1, n-1]");',
    '  var qx = ecdhToBig(qxHex), qy = ecdhToBig(qyHex);',
    '  if (qx < 0n || qx >= P || qy < 0n || qy >= P) throw new Error("ECDH: public key out of range");',
    '  if ((qy * qy - (qx * qx * qx + A * qx + B)) % P !== 0n) throw new Error("ECDH: public key not on curve");',
    '  var S = ecdhPointMul(d, {x: qx, y: qy}, P, A);',
    '  if (S === null) throw new Error("ECDH: shared point is identity");',
    '  return S.x.toString(16).padStart(64, "0");',
    '}',
  ]);
}

javascriptGenerator.forBlock['ecdh_shared_secret'] = function (block: Block): [string, number] {
  const d = javascriptGenerator.valueToCode(block, 'D', Order.ATOMIC) || '""';
  const qx = javascriptGenerator.valueToCode(block, 'QX', Order.ATOMIC) || '""';
  const qy = javascriptGenerator.valueToCode(block, 'QY', Order.ATOMIC) || '""';
  registerModInverse();
  registerEcdhToBig();
  registerEcdhPointAdd();
  registerEcdhPointMul();
  const fn = registerEcdhSharedSecret();
  return [fn + '(' + d + ', ' + qx + ', ' + qy + ')', Order.ATOMIC];
};
