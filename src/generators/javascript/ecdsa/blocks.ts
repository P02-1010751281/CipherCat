/**
 * ECDSA 原子块 JavaScript 代码生成器
 * FIPS 186-5 / RFC 6979（P-256 + SHA-256）
 *
 * 内嵌：
 * - P-256 曲线参数（p/a/n/Gx/Gy，BigInt 字面量；n 即向量 JSON 的 q 字段）
 * - Weierstrass 点加/点乘（BigInt，模逆扩展欧几里得）
 * - RFC 6979 §3.2 确定性 k（HMAC-SHA256 DRBG，bits2octets(h1) = bits2int(h1) mod n）
 * - z = bits2int(SHA-256(msg))（P-256 下 blen == qlen == 256，取全量 hash）
 * SHA-256/HMAC 复用 hash/hmac-sha256 共享模块（provideFunction_ 按名去重）。
 * 官方向量：RFC 6979 A.2.5（sample/test）→ r/s 完全一致 + verify 通过。
 */
import { javascriptGenerator, Order } from 'blockly/javascript';
import type { Block } from 'blockly/core';
import { registerHmacSha256 } from '../hash/hmac-sha256';

/** BigInt 模逆（扩展欧几里得）——与 x25519/ecc 生成器同款，provideFunction_ 按名去重 */
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

/** Weierstrass 点加（仿射，模逆除法）；无穷远点用 null 表示 */
function registerEcdsaPointAdd(): string {
  return javascriptGenerator.provideFunction_('ecdsaPointAdd', [
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
function registerEcdsaPointMul(): string {
  return javascriptGenerator.provideFunction_('ecdsaPointMul', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(k, G, p, a) {',
    '  var R = null, Q = G;',
    '  while (k > 0n) {',
    '    if (k & 1n) R = ecdsaPointAdd(R, Q, p, a);',
    '    Q = ecdsaPointAdd(Q, Q, p, a);',
    '    k >>= 1n;',
    '  }',
    '  return R;',
    '}',
  ]);
}

/** 字节数组 → 大端 BigInt */
function registerEcdsaBeInt(): string {
  return javascriptGenerator.provideFunction_('ecdsaBeInt', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(bytes) {',
    '  var v = 0n;',
    '  for (var i = 0; i < bytes.length; i++) v = (v << 8n) | BigInt(bytes[i]);',
    '  return v;',
    '}',
  ]);
}

/** ECDSA 确定性签名：返回 r‖s 64 字节 */
function registerEcdsaSign(): string {
  return javascriptGenerator.provideFunction_('ecdsaSign', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(priv, msg) {',
    '  var P = 0xffffffff00000001000000000000000000000000ffffffffffffffffffffffffn;',
    '  var A = 0xffffffff00000001000000000000000000000000fffffffffffffffffffffffcn;',
    '  var N = 0xffffffff00000000ffffffffffffffffbce6faada7179e84f3b9cac2fc632551n;',
    '  var GX = 0x6b17d1f2e12c4247f8bce6e563a440f277037d812deb33a0f4a13945d898c296n;',
    '  var GY = 0x4fe342e2fe1a7f9b8ee7eb4a7c0f9e162bce33576b315ececbb6406837bf51f5n;',
    '  if (priv.length !== 32) throw new Error("ECDSA private key must be 32 bytes");',
    '  if (typeof msg === "string") msg = new TextEncoder().encode(msg);',
    '  else if (Array.isArray(msg)) msg = Uint8Array.from(msg);',
    '  var h1 = sha256Hash(msg);',
    '  var z = 0n;',
    '  for (var i = 0; i < 32; i++) z = (z << 8n) | BigInt(h1[i]);',
    '  var x = 0n;',
    '  for (var i = 0; i < 32; i++) x = (x << 8n) | BigInt(priv[i]);',
    '  // RFC 6979 §2.3.5 bits2octets(h1) = int2octets(bits2int(h1) mod n)',
    '  var b2i = [];',
    '  var zz = z % N;',
    '  for (var i = 31; i >= 0; i--) { b2i[i] = Number(zz & 0xffn); zz >>= 8n; }',
    '  var xb = Array.from(priv);',
    '  // RFC 6979 §3.2 确定性 k',
    '  var V = [], K = [];',
    '  for (var i = 0; i < 32; i++) { V.push(1); K.push(0); }',
    '  K = hmacSha256(K, V.concat([0], xb, b2i));',
    '  V = hmacSha256(K, V);',
    '  K = hmacSha256(K, V.concat([1], xb, b2i));',
    '  V = hmacSha256(K, V);',
    '  var k = 0n;',
    '  while (true) {',
    '    var T = [];',
    '    while (T.length < 32) { V = hmacSha256(K, V); T = T.concat(V); }',
    '    k = 0n;',
    '    for (var i = 0; i < 32; i++) k = (k << 8n) | BigInt(T[i]);',
    '    if (k >= 1n && k < N) break;',
    '    K = hmacSha256(K, V.concat([0]));',
    '    V = hmacSha256(K, V);',
    '  }',
    '  var R = ecdsaPointMul(k, {x: GX, y: GY}, P, A);',
    '  var r = R.x % N;',
    '  var s = modInverse(k, N) * ((z + r * x) % N) % N;',
    '  var out = [];',
    '  for (var i = 31; i >= 0; i--) out.push(Number((r >> BigInt(8 * i)) & 0xffn));',
    '  for (var i = 31; i >= 0; i--) out.push(Number((s >> BigInt(8 * i)) & 0xffn));',
    '  return out;',
    '}',
  ]);
}

/** ECDSA 验签：返回布尔 */
function registerEcdsaVerify(): string {
  return javascriptGenerator.provideFunction_('ecdsaVerify', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(msg, pub, sig) {',
    '  var P = 0xffffffff00000001000000000000000000000000ffffffffffffffffffffffffn;',
    '  var A = 0xffffffff00000001000000000000000000000000fffffffffffffffffffffffcn;',
    '  var N = 0xffffffff00000000ffffffffffffffffbce6faada7179e84f3b9cac2fc632551n;',
    '  var GX = 0x6b17d1f2e12c4247f8bce6e563a440f277037d812deb33a0f4a13945d898c296n;',
    '  var GY = 0x4fe342e2fe1a7f9b8ee7eb4a7c0f9e162bce33576b315ececbb6406837bf51f5n;',
    '  if (pub.length !== 64 || sig.length !== 64) throw new Error("ECDSA pub/sig must be 64 bytes");',
    '  var Q = {x: ecdsaBeInt(pub.slice(0, 32)), y: ecdsaBeInt(pub.slice(32, 64))};',
    '  var r = ecdsaBeInt(sig.slice(0, 32));',
    '  var s = ecdsaBeInt(sig.slice(32, 64));',
    '  if (!(r >= 1n && r < N && s >= 1n && s < N)) return false;',
    '  if (typeof msg === "string") msg = new TextEncoder().encode(msg);',
    '  else if (Array.isArray(msg)) msg = Uint8Array.from(msg);',
    '  var h1 = sha256Hash(msg);',
    '  var z = 0n;',
    '  for (var i = 0; i < 32; i++) z = (z << 8n) | BigInt(h1[i]);',
    '  var w = modInverse(s, N);',
    '  var u1 = z * w % N;',
    '  var u2 = r * w % N;',
    '  var P1 = ecdsaPointMul(u1, {x: GX, y: GY}, P, A);',
    '  var P2 = ecdsaPointMul(u2, Q, P, A);',
    '  var Pt = ecdsaPointAdd(P1, P2, P, A);',
    '  if (Pt === null) return false;',
    '  return Pt.x % N === r;',
    '}',
  ]);
}

javascriptGenerator.forBlock['ecdsa_sign'] = function (block: Block): [string, number] {
  const priv = javascriptGenerator.valueToCode(block, 'PRIV', Order.ATOMIC) || '[]';
  const msg = javascriptGenerator.valueToCode(block, 'MSG', Order.ATOMIC) || '""';
  registerHmacSha256();
  registerModInverse();
  registerEcdsaPointAdd();
  registerEcdsaPointMul();
  const fn = registerEcdsaSign();
  return [fn + '(' + priv + ', ' + msg + ')', Order.ATOMIC];
};

javascriptGenerator.forBlock['ecdsa_verify'] = function (block: Block): [string, number] {
  const msg = javascriptGenerator.valueToCode(block, 'MSG', Order.ATOMIC) || '""';
  const pub = javascriptGenerator.valueToCode(block, 'PUB', Order.ATOMIC) || '[]';
  const sig = javascriptGenerator.valueToCode(block, 'SIG', Order.ATOMIC) || '[]';
  registerHmacSha256();
  registerModInverse();
  registerEcdsaPointAdd();
  registerEcdsaPointMul();
  registerEcdsaBeInt();
  const fn = registerEcdsaVerify();
  return [fn + '(' + msg + ', ' + pub + ', ' + sig + ')', Order.ATOMIC];
};
