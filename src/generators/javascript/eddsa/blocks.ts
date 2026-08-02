/**
 * EdDSA (Ed25519, RFC 8032) 原子块 JavaScript 代码生成器
 *
 * 内嵌完整实现（项目无 sha512，自建 FIPS 180-4 SHA-512，64 位字用 BigInt）：
 *   - 曲线 edwards25519：p = 2^255-19, d = -121665/121666 mod p, L = 2^252+27742317777372353535851937790883648493
 *   - 扩展坐标点加/标量乘/编解码，sha512_modq = LE(sha512(x)) mod L
 *   - 签名 S = (r + h(R‖A‖msg)·a) mod L；验签 sB == R + h(R‖A‖msg)·A（含 s < L、解码失败检查）
 *
 * JS 坑（已踩）：BigInt `%` 保留被除数符号（与 Python 不同），负中间量会传播污染——
 *  pointAdd/recoverX/modPow 内所有模归约必须显式 `(x % P + P) % P`（或保证非负），
 *  否则小标量碰巧对、大标量（a 含位 254）错。官方向量（RFC 8032 §7.1 TEST 1-3）全 PASS。
 */
import { javascriptGenerator, Order } from 'blockly/javascript';
import type { Block } from 'blockly/core';

/** SHA-512 (FIPS 180-4)，输入 number[]，输出 64 字节 number[]；64 位字运算用 BigInt */
function registerSha512(): string {
  return javascriptGenerator.provideFunction_('sha512Hash', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(input) {',
    '  var MASK = 0xffffffffffffffffn;',
    '  var K = [',
    '    0x428a2f98d728ae22n, 0x7137449123ef65cdn, 0xb5c0fbcfec4d3b2fn, 0xe9b5dba58189dbbcn,',
    '    0x3956c25bf348b538n, 0x59f111f1b605d019n, 0x923f82a4af194f9bn, 0xab1c5ed5da6d8118n,',
    '    0xd807aa98a3030242n, 0x12835b0145706fben, 0x243185be4ee4b28cn, 0x550c7dc3d5ffb4e2n,',
    '    0x72be5d74f27b896fn, 0x80deb1fe3b1696b1n, 0x9bdc06a725c71235n, 0xc19bf174cf692694n,',
    '    0xe49b69c19ef14ad2n, 0xefbe4786384f25e3n, 0x0fc19dc68b8cd5b5n, 0x240ca1cc77ac9c65n,',
    '    0x2de92c6f592b0275n, 0x4a7484aa6ea6e483n, 0x5cb0a9dcbd41fbd4n, 0x76f988da831153b5n,',
    '    0x983e5152ee66dfabn, 0xa831c66d2db43210n, 0xb00327c898fb213fn, 0xbf597fc7beef0ee4n,',
    '    0xc6e00bf33da88fc2n, 0xd5a79147930aa725n, 0x06ca6351e003826fn, 0x142929670a0e6e70n,',
    '    0x27b70a8546d22ffcn, 0x2e1b21385c26c926n, 0x4d2c6dfc5ac42aedn, 0x53380d139d95b3dfn,',
    '    0x650a73548baf63den, 0x766a0abb3c77b2a8n, 0x81c2c92e47edaee6n, 0x92722c851482353bn,',
    '    0xa2bfe8a14cf10364n, 0xa81a664bbc423001n, 0xc24b8b70d0f89791n, 0xc76c51a30654be30n,',
    '    0xd192e819d6ef5218n, 0xd69906245565a910n, 0xf40e35855771202an, 0x106aa07032bbd1b8n,',
    '    0x19a4c116b8d2d0c8n, 0x1e376c085141ab53n, 0x2748774cdf8eeb99n, 0x34b0bcb5e19b48a8n,',
    '    0x391c0cb3c5c95a63n, 0x4ed8aa4ae3418acbn, 0x5b9cca4f7763e373n, 0x682e6ff3d6b2b8a3n,',
    '    0x748f82ee5defb2fcn, 0x78a5636f43172f60n, 0x84c87814a1f0ab72n, 0x8cc702081a6439ecn,',
    '    0x90befffa23631e28n, 0xa4506cebde82bde9n, 0xbef9a3f7b2c67915n, 0xc67178f2e372532bn,',
    '    0xca273eceea26619cn, 0xd186b8c721c0c207n, 0xeada7dd6cde0eb1en, 0xf57d4f7fee6ed178n,',
    '    0x06f067aa72176fban, 0x0a637dc5a2c898a6n, 0x113f9804bef90daen, 0x1b710b35131c471bn,',
    '    0x28db77f523047d84n, 0x32caab7b40c72493n, 0x3c9ebe0a15c9bebcn, 0x431d67c49c100d4cn,',
    '    0x4cc5d4becb3e42b6n, 0x597f299cfc657e2an, 0x5fcb6fab3ad6faecn, 0x6c44198c4a475817n,',
    '  ];',
    '  function rotr(x, n) { return ((x >> BigInt(n)) | (x << (64n - BigInt(n)))) & MASK; }',
    '  var msg = input.slice();',
    '  var bitLen = BigInt(msg.length) * 8n;',
    '  msg.push(0x80);',
    '  while (msg.length % 128 !== 112) msg.push(0);',
    '  var hi = bitLen >> 64n, lo = bitLen & MASK;',
    '  for (var k = 7; k >= 0; k--) msg.push(Number((hi >> BigInt(8 * k)) & 0xffn));',
    '  for (var k = 7; k >= 0; k--) msg.push(Number((lo >> BigInt(8 * k)) & 0xffn));',
    '  var H = [',
    '    0x6a09e667f3bcc908n, 0xbb67ae8584caa73bn, 0x3c6ef372fe94f82bn, 0xa54ff53a5f1d36f1n,',
    '    0x510e527fade682d1n, 0x9b05688c2b3e6c1fn, 0x1f83d9abfb41bd6bn, 0x5be0cd19137e2179n,',
    '  ];',
    '  for (var i = 0; i < msg.length; i += 128) {',
    '    var w = new Array(80);',
    '    for (var t = 0; t < 16; t++) {',
    '      var word = 0n;',
    '      for (var j = 0; j < 8; j++) word = (word << 8n) | BigInt(msg[i + 8 * t + j]);',
    '      w[t] = word;',
    '    }',
    '    for (var t = 16; t < 80; t++) {',
    '      var s0 = rotr(w[t - 15], 1) ^ rotr(w[t - 15], 8) ^ (w[t - 15] >> 7n);',
    '      var s1 = rotr(w[t - 2], 19) ^ rotr(w[t - 2], 61) ^ (w[t - 2] >> 6n);',
    '      w[t] = (w[t - 16] + s0 + w[t - 7] + s1) & MASK;',
    '    }',
    '    var a = H[0], b = H[1], c = H[2], d = H[3], e = H[4], f = H[5], g = H[6], h = H[7];',
    '    for (var t = 0; t < 80; t++) {',
    '      var S1 = rotr(e, 14) ^ rotr(e, 18) ^ rotr(e, 41);',
    '      var ch = (e & f) ^ ((~e & MASK) & g);',
    '      var temp1 = (h + S1 + ch + K[t] + w[t]) & MASK;',
    '      var S0 = rotr(a, 28) ^ rotr(a, 34) ^ rotr(a, 39);',
    '      var maj = (a & b) ^ (a & c) ^ (b & c);',
    '      var temp2 = (S0 + maj) & MASK;',
    '      h = g; g = f; f = e; e = (d + temp1) & MASK;',
    '      d = c; c = b; b = a; a = (temp1 + temp2) & MASK;',
    '    }',
    '    H[0] = (H[0] + a) & MASK; H[1] = (H[1] + b) & MASK; H[2] = (H[2] + c) & MASK; H[3] = (H[3] + d) & MASK;',
    '    H[4] = (H[4] + e) & MASK; H[5] = (H[5] + f) & MASK; H[6] = (H[6] + g) & MASK; H[7] = (H[7] + h) & MASK;',
    '  }',
    '  var out = [];',
    '  for (var i = 0; i < 8; i++) {',
    '    for (var j = 7; j >= 0; j--) out.push(Number((H[i] >> BigInt(8 * j)) & 0xffn));',
    '  }',
    '  return out;',
    '}',
  ]);
}

/**
 * Ed25519 内部实现（eddsaSign / eddsaVerify 共用，按行数组维护单份源）。
 * 注意 JS BigInt `%` 保留被除数符号：所有可能为负的中间量一律 `(x % P + P) % P`。
 */
const ED25519_INTERNALS: string[] = [
  '  var P = 0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffedn; // 2^255 - 19',
  '  var D = 37095705934669439343138083508754565189542113879843219016388785533085940283555n;',
  '  var Q = (1n << 252n) + 27742317777372353535851937790883648493n; // 组阶 L',
  '  var MODP_SQRT_M1 = 19681161376707505956807079304988542015446066515923890162744021073123829784752n;',
  '  function inv(x) {',
  '    x = ((x % P) + P) % P;',
  '    var old_r = x, r = P, old_s = 1n, s = 0n;',
  '    while (r !== 0n) {',
  '      var qq = old_r / r;',
  '      var tmp = r; r = old_r - qq * r; old_r = tmp;',
  '      tmp = s; s = old_s - qq * s; old_s = tmp;',
  '    }',
  '    if (old_r !== 1n) return 1n;',
  '    return ((old_s % P) + P) % P;',
  '  }',
  '  function modPow(base, exp) {',
  '    var result = 1n;',
  '    base = ((base % P) + P) % P;',
  '    while (exp > 0n) {',
  '      if (exp & 1n) result = result * base % P;',
  '      base = base * base % P;',
  '      exp >>= 1n;',
  '    }',
  '    return result;',
  '  }',
  '  // 恢复 x 坐标（y 奇偶 = sign）',
  '  function recoverX(y, sign) {',
  '    if (y >= P) return null;',
  '    var x2 = ((y * y - 1n) % P + P) % P;',
  '    x2 = x2 * inv((D * y * y + 1n) % P) % P;',
  '    if (x2 === 0n) { if (sign) return null; return 0n; }',
  '    var x = modPow(x2, (P + 3n) / 8n);',
  '    if ((x * x - x2) % P !== 0n) x = x * MODP_SQRT_M1 % P;',
  '    if ((x * x - x2) % P !== 0n) return null;',
  '    if ((x & 1n) !== (sign ? 1n : 0n)) x = P - x;',
  '    return x;',
  '  }',
  '  // 扩展坐标 (X, Y, Z, T)：x = X/Z, y = Y/Z, x*y = T/Z',
  '  function pointAdd(Pt, Qt) {',
  '    var A = ((Pt[1] - Pt[0]) * (Qt[1] - Qt[0]) % P + P) % P;',
  '    var B = ((Pt[1] + Pt[0]) * (Qt[1] + Qt[0]) % P + P) % P;',
  '    var C = (2n * Pt[3] * Qt[3] % P * D % P + P) % P;',
  '    var Dd = (2n * Pt[2] * Qt[2] % P + P) % P;',
  '    var E = (B - A + P) % P, F = (Dd - C + P) % P, G = (Dd + C) % P, H = (B + A) % P;',
  '    return [E * F % P, G * H % P, F * G % P, E * H % P];',
  '  }',
  '  function pointMul(s, Pt) {',
  '    var Qr = [0n, 1n, 1n, 0n]; // 单位元',
  '    while (s > 0n) {',
  '      if (s & 1n) Qr = pointAdd(Qr, Pt);',
  '      Pt = pointAdd(Pt, Pt);',
  '      s >>= 1n;',
  '    }',
  '    return Qr;',
  '  }',
  '  function pointCompress(Pt) {',
  '    var zinv = inv(Pt[2]);',
  '    var x = Pt[0] * zinv % P;',
  '    var y = Pt[1] * zinv % P;',
  '    var enc = y | ((x & 1n) << 255n);',
  '    var out = [];',
  '    for (var i = 0; i < 32; i++) { out.push(Number(enc & 0xffn)); enc >>= 8n; }',
  '    return out;',
  '  }',
  '  function pointDecompress(s) {',
  '    if (s.length !== 32) return null;',
  '    var y = 0n;',
  '    for (var i = 0; i < 32; i++) y |= BigInt(s[i]) << (8n * BigInt(i));',
  '    var sign = y >> 255n;',
  '    y &= (1n << 255n) - 1n;',
  '    var x = recoverX(y, sign === 1n);',
  '    if (x === null) return null;',
  '    return [x, y, 1n, x * y % P];',
  '  }',
  '  function pointEqual(Pt, Qt) {',
  '    return ((Pt[0] * Qt[2] - Qt[0] * Pt[2]) % P + P) % P === 0n &&',
  '           ((Pt[1] * Qt[2] - Qt[1] * Pt[2]) % P + P) % P === 0n;',
  '  }',
  '  function sha512Modq(bytes) {',
  '    var hh = sha512Hash(bytes);',
  '    var v = 0n;',
  '    for (var i = 0; i < 64; i++) v |= BigInt(hh[i]) << (8n * BigInt(i));',
  '    return v % Q;',
  '  }',
  '  // 基点 G：y = 4/5 mod p, x = recover_x(y, 0)',
  '  var gy = 4n * inv(5n) % P;',
  '  var gx = recoverX(gy, false);',
  '  var G = [gx, gy, 1n, gx * gy % P];',
];

/** Ed25519 签名：secret 32 字节 → 64 字节签名 R‖S（RFC 8032 §5.1.6） */
function registerEddsaSign(): string {
  return javascriptGenerator.provideFunction_('eddsaSign', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(secret, msg) {',
    ...ED25519_INTERNALS,
    '  if (secret.length !== 32) throw new Error("Ed25519 secret key must be 32 bytes");',
    '  var h = sha512Hash(secret);',
    '  var a = 0n;',
    '  for (var i = 0; i < 32; i++) a |= BigInt(h[i]) << (8n * BigInt(i));',
    '  a &= (1n << 254n) - 8n; // clamp：位 0-2 清 0',
    '  a |= 1n << 254n;         // 位 254 置 1',
    '  var prefix = h.slice(32, 64);',
    '  var A = pointCompress(pointMul(a, G));',
    '  var r = sha512Modq(prefix.concat(msg));',
    '  var R = pointCompress(pointMul(r, G));',
    '  var hh = sha512Modq(R.concat(A).concat(msg));',
    '  var s = (r + hh * a) % Q;',
    '  var out = R.slice();',
    '  for (var i = 0; i < 32; i++) { out.push(Number(s & 0xffn)); s >>= 8n; }',
    '  return out;',
    '}',
  ]);
}

/** Ed25519 验签：pk 32 字节 + msg + sig 64 字节 → Boolean（RFC 8032 §5.1.7） */
function registerEddsaVerify(): string {
  return javascriptGenerator.provideFunction_('eddsaVerify', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(publicKey, msg, signature) {',
    ...ED25519_INTERNALS,
    '  if (publicKey.length !== 32 || signature.length !== 64) return false;',
    '  var A = pointDecompress(publicKey);',
    '  if (A === null) return false;',
    '  var R = pointDecompress(signature.slice(0, 32));',
    '  if (R === null) return false;',
    '  var s = 0n;',
    '  for (var i = 32; i < 64; i++) s |= BigInt(signature[i]) << (8n * BigInt(i - 32));',
    '  if (s >= Q) return false;',
    '  var hh = sha512Modq(signature.slice(0, 32).concat(publicKey).concat(msg));',
    '  var sB = pointMul(s, G);',
    '  var hA = pointMul(hh, A);',
    '  return pointEqual(sB, pointAdd(R, hA));',
    '}',
  ]);
}

javascriptGenerator.forBlock['eddsa_sign'] = function (block: Block): [string, number] {
  const secret = javascriptGenerator.valueToCode(block, 'SECRET', Order.ATOMIC) || '[]';
  const msg = javascriptGenerator.valueToCode(block, 'MSG', Order.ATOMIC) || '[]';
  registerSha512();
  const fn = registerEddsaSign();
  return [fn + '(' + secret + ', ' + msg + ')', Order.ATOMIC];
};

javascriptGenerator.forBlock['eddsa_verify'] = function (block: Block): [string, number] {
  const publicKey = javascriptGenerator.valueToCode(block, 'PUBLIC', Order.ATOMIC) || '[]';
  const msg = javascriptGenerator.valueToCode(block, 'MSG', Order.ATOMIC) || '[]';
  const signature = javascriptGenerator.valueToCode(block, 'SIGNATURE', Order.ATOMIC) || '[]';
  registerSha512();
  const fn = registerEddsaVerify();
  return [fn + '(' + publicKey + ', ' + msg + ', ' + signature + ')', Order.ATOMIC];
};
