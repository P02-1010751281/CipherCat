/**
 * RSA 原子块 JavaScript 代码生成器
 * FIPS 186-4 / RFC 8017（PKCS#1 v1.5）
 *
 * 内嵌（与 /tmp/vectors/rsa_ref.js 同构，cryptography 交叉验证全 PASS）：
 * - rsaKeygen：crypto.getRandomValues + BigInt Miller-Rabin（小素数筛 + 20 轮随机基底）
 * - rsaEncrypt/rsaDecrypt：PKCS#1 v1.5（随机非零 PS，crypto.getRandomValues）
 * - rsaSign/rsaVerify：PKCS#1 v1.5 + SHA-256（sha256Hash 复用 hash/hmac-sha256 共享模块）
 * - rsaModPow：BigInt 平方乘模幂（现有 powMod 是 32 位版，RSA 不用）
 * - 大端字节拆分一律 Math.floor 除法（>>> 在 bi≥4 位移回绕）
 * SHA-256 复用 src/generators/javascript/hash/hmac-sha256.ts（provideFunction_ 按名去重）。
 */
import { javascriptGenerator, Order } from 'blockly/javascript';
import type { Block } from 'blockly/core';
import { registerSha256Hash } from '../hash/hmac-sha256';

/** BigInt 模幂（平方乘，RSA 专用；现有 powMod 为 32 位版不适用） */
function registerRsaModPow(): string {
  return javascriptGenerator.provideFunction_('rsaModPow', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(b, e, m) {',
    '  b = ((b % m) + m) % m;',
    '  var r = 1n;',
    '  while (e > 0n) { if (e & 1n) r = (r * b) % m; b = (b * b) % m; e >>= 1n; }',
    '  return r;',
    '}',
  ]);
}

/** BigInt 扩展欧几里得模逆（RSA 专用名，避免与既有 modInverse/modInverseBig 混淆） */
function registerRsaModInverse(): string {
  return javascriptGenerator.provideFunction_('rsaModInverse', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(a, m) {',
    '  a = ((a % m) + m) % m;',
    '  var oldR = a, r = m, oldS = 1n, s = 0n;',
    '  while (r !== 0n) {',
    '    var q = oldR / r;',
    '    var tmp = r; r = oldR - q * r; oldR = tmp;',
    '    tmp = s; s = oldS - q * s; oldS = tmp;',
    '  }',
    '  if (oldR !== 1n) throw new Error("RSA inverse does not exist");',
    '  return ((oldS % m) + m) % m;',
    '}',
  ]);
}

/** BigInt 最大公约数 */
function registerRsaGcd(): string {
  return javascriptGenerator.provideFunction_('rsaGcd', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(a, b) {',
    '  while (b !== 0n) { var t = a % b; a = b; b = t; }',
    '  return a;',
    '}',
  ]);
}

/** 随机 BigInt ∈ [0, limit)（crypto.getRandomValues，拒绝采样去偏） */
function registerRsaRandBelow(): string {
  return javascriptGenerator.provideFunction_('rsaRandBelow', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(limit) {',
    '  var nb = Math.ceil(limit.toString(16).length / 2) + 1;',
    '  while (true) {',
    '    var buf = new Uint8Array(nb);',
    '    crypto.getRandomValues(buf);',
    '    var v = 0n;',
    '    for (var i = 0; i < nb; i++) v = (v << 8n) | BigInt(buf[i]);',
    '    if (v < limit) return v;',
    '  }',
    '}',
  ]);
}

/** 随机 bits 位整数：顶两位 + 最低位置 1（FIPS 186-4 素数候选） */
function registerRsaRandBits(): string {
  return javascriptGenerator.provideFunction_('rsaRandBits', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(bits) {',
    '  var nb = Math.ceil(bits / 8);',
    '  var buf = new Uint8Array(nb);',
    '  crypto.getRandomValues(buf);',
    '  var v = 0n;',
    '  for (var i = 0; i < nb; i++) v = (v << 8n) | BigInt(buf[i]);',
    '  v >>= BigInt(nb * 8 - bits);',
    '  v |= 1n << BigInt(bits - 1);',
    '  v |= 1n << BigInt(bits - 2);',
    '  v |= 1n;',
    '  return v;',
    '}',
  ]);
}

/** Miller-Rabin 素性测试（小素数筛 + 20 轮随机基底） */
function registerRsaIsPrime(): string {
  return javascriptGenerator.provideFunction_('rsaIsPrime', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(n) {',
    '  var small = [2n,3n,5n,7n,11n,13n,17n,19n,23n,29n,31n,37n,41n,43n,47n,53n,59n,61n,67n,71n,73n,79n,83n,89n,97n,101n,103n,107n,109n,113n,127n,131n,137n,139n,149n,151n,157n,163n,167n,173n,179n,181n,191n,193n,197n,199n,211n,223n,227n,229n,233n,239n,241n,251n];',
    '  if (n < 2n) return false;',
    '  for (var i = 0; i < small.length; i++) {',
    '    if (n === small[i]) return true;',
    '    if (n % small[i] === 0n) return false;',
    '  }',
    '  var d = n - 1n, r = 0;',
    '  while ((d & 1n) === 0n) { d >>= 1n; r++; }',
    '  for (var t = 0; t < 20; t++) {',
    '    var a = 2n + rsaRandBelow(n - 3n);',
    '    var x = rsaModPow(a, d, n);',
    '    if (x === 1n || x === n - 1n) continue;',
    '    var ok = false;',
    '    for (var j = 0; j < r - 1; j++) {',
    '      x = (x * x) % n;',
    '      if (x === n - 1n) { ok = true; break; }',
    '    }',
    '    if (!ok) return false;',
    '  }',
    '  return true;',
    '}',
  ]);
}

/** 随机 bits 位素数 */
function registerRsaGenPrime(): string {
  return javascriptGenerator.provideFunction_('rsaGenPrime', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(bits) {',
    '  while (true) {',
    '    var v = rsaRandBits(bits);',
    '    if (rsaIsPrime(v)) return v;',
    '  }',
    '}',
  ]);
}

/** BigInt → 定长大端字节数组 */
function registerRsaIntBytes(): string {
  return javascriptGenerator.provideFunction_('rsaIntBytes', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(v, len) {',
    '  var out = new Array(len);',
    '  for (var i = len - 1; i >= 0; i--) { out[i] = Number(v & 0xffn); v >>= 8n; }',
    '  return out;',
    '}',
  ]);
}

/** RSA-KeyGen：key = n(k)‖e(4)‖d(k)‖p(k/2)‖q(k/2) */
function registerRsaKeygen(): string {
  return javascriptGenerator.provideFunction_('rsaKeygen', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(bits) {',
    '  var k = bits / 8, half = bits / 2;',
    '  var e = 65537n;',
    '  while (true) {',
    '    var p = rsaGenPrime(half);',
    '    var q = rsaGenPrime(half);',
    '    if (p === q) continue;',
    '    if ((p - 1n) % e === 0n || (q - 1n) % e === 0n) continue;',
    '    var n = p * q;',
    '    var lam = (p - 1n) / rsaGcd(p - 1n, q - 1n) * (q - 1n);',
    '    var d = rsaModInverse(e, lam);',
    '    var key = [];',
    '    var arr = [rsaIntBytes(n, k), rsaIntBytes(e, 4), rsaIntBytes(d, k), rsaIntBytes(p, half / 8), rsaIntBytes(q, half / 8)];',
    '    for (var ai = 0; ai < 5; ai++) key = key.concat(arr[ai]);',
    '    return key;',
    '  }',
    '}',
  ]);
}

/** 解析 key 前缀 n/e/d（容忍尾部 p/q），k 由 key 长度反推 */
function registerRsaParseKey(): string {
  return javascriptGenerator.provideFunction_('rsaParseKey', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(key) {',
    '  if ((key.length - 4) % 3 !== 0) throw new Error("invalid RSA key length");',
    '  var k = (key.length - 4) / 3;',
    '  var n = 0n, e = 0n, d = 0n;',
    '  for (var i = 0; i < k; i++) n = (n << 8n) | BigInt(key[i]);',
    '  for (var i = 0; i < 4; i++) e = (e << 8n) | BigInt(key[k + i]);',
    '  for (var i = 0; i < k; i++) d = (d << 8n) | BigInt(key[k + 4 + i]);',
    '  return {n: n, e: e, d: d, k: k};',
    '}',
  ]);
}

/** 消息规范化：字符串 → UTF-8 字节 */
function registerRsaToMsg(): string {
  return javascriptGenerator.provideFunction_('rsaToMsg', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(msg) {',
    '  if (typeof msg === "string") return new TextEncoder().encode(msg);',
    '  return Uint8Array.from(msg);',
    '}',
  ]);
}

/** RSA-Encrypt：PKCS#1 v1.5 随机填充 + m^e mod n */
function registerRsaEncrypt(): string {
  return javascriptGenerator.provideFunction_('rsaEncrypt', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(key, msg) {',
    '  var pk = rsaParseKey(Array.from(key));',
    '  msg = rsaToMsg(msg);',
    '  var k = pk.k;',
    '  if (msg.length > k - 11) throw new Error("RSA message too long");',
    '  var psLen = k - 3 - msg.length;',
    '  var ps = new Uint8Array(psLen);',
    '  for (var i = 0; i < psLen; i++) {',
    '    var r = new Uint8Array(1);',
    '    do { crypto.getRandomValues(r); } while (r[0] === 0);',
    '    ps[i] = r[0];',
    '  }',
    '  var em = [0, 2].concat(Array.from(ps), [0], Array.from(msg));',
    '  var m = 0n;',
    '  for (var i = 0; i < em.length; i++) m = (m << 8n) | BigInt(em[i]);',
    '  return rsaIntBytes(rsaModPow(m, pk.e, pk.n), k);',
    '}',
  ]);
}

/** RSA-Decrypt：m = C^d mod n，去填充返回明文 */
function registerRsaDecrypt(): string {
  return javascriptGenerator.provideFunction_('rsaDecrypt', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(key, ct) {',
    '  var pk = rsaParseKey(Array.from(key));',
    '  var k = pk.k;',
    '  ct = Array.from(ct);',
    '  if (ct.length !== k) throw new Error("RSA ciphertext length mismatch");',
    '  var c = 0n;',
    '  for (var i = 0; i < k; i++) c = (c << 8n) | BigInt(ct[i]);',
    '  var em = rsaIntBytes(rsaModPow(c, pk.d, pk.n), k);',
    '  if (em[0] !== 0 || em[1] !== 2) throw new Error("RSA bad padding (type)");',
    '  var sep = 2;',
    '  while (sep < k && em[sep] !== 0) sep++;',
    '  if (sep < 10 || sep >= k) throw new Error("RSA bad padding (separator)");',
    '  return em.slice(sep + 1);',
    '}',
  ]);
}

/** RSA-Sign：DigestInfo(SHA-256) + 0x00‖0x01‖FF‖0x00‖T，m^d mod n */
function registerRsaSign(): string {
  return javascriptGenerator.provideFunction_('rsaSign', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(key, msg) {',
    '  var pk = rsaParseKey(Array.from(key));',
    '  msg = rsaToMsg(msg);',
    '  var pre = [0x30,0x31,0x30,0x0d,0x06,0x09,0x60,0x86,0x48,0x01,0x65,0x03,0x04,0x02,0x01,0x05,0x00,0x04,0x20];',
    '  var t = pre.concat(sha256Hash(msg));',
    '  var k = pk.k;',
    '  var ff = k - t.length - 3;',
    '  if (ff < 8) throw new Error("RSA key too small for SHA-256 signature");',
    '  var em = [0, 1].concat(new Array(ff).fill(0xff), [0], t);',
    '  var m = 0n;',
    '  for (var i = 0; i < em.length; i++) m = (m << 8n) | BigInt(em[i]);',
    '  return rsaIntBytes(rsaModPow(m, pk.d, pk.n), k);',
    '}',
  ]);
}

/** RSA-Verify：m = S^e mod n，校验 EM 结构与 DigestInfo */
function registerRsaVerify(): string {
  return javascriptGenerator.provideFunction_('rsaVerify', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(key, msg, sig) {',
    '  var pk = rsaParseKey(Array.from(key));',
    '  msg = rsaToMsg(msg);',
    '  var pre = [0x30,0x31,0x30,0x0d,0x06,0x09,0x60,0x86,0x48,0x01,0x65,0x03,0x04,0x02,0x01,0x05,0x00,0x04,0x20];',
    '  var t = pre.concat(sha256Hash(msg));',
    '  var k = pk.k;',
    '  sig = Array.from(sig);',
    '  if (sig.length !== k) return false;',
    '  var s = 0n;',
    '  for (var i = 0; i < k; i++) s = (s << 8n) | BigInt(sig[i]);',
    '  if (s >= pk.n) return false;',
    '  var em = rsaIntBytes(rsaModPow(s, pk.e, pk.n), k);',
    '  if (em[0] !== 0 || em[1] !== 1) return false;',
    '  var i = 2;',
    '  while (i < k && em[i] === 0xff) i++;',
    '  if (i >= k || em[i] !== 0) return false;',
    '  if (k - i - 1 !== t.length) return false;',
    '  for (var j = 0; j < t.length; j++) if (em[i + 1 + j] !== t[j]) return false;',
    '  return true;',
    '}',
  ]);
}

/** 注册 keygen 依赖链 */
function registerKeygenHelpers(): void {
  registerRsaModPow();
  registerRsaModInverse();
  registerRsaGcd();
  registerRsaRandBelow();
  registerRsaRandBits();
  registerRsaIsPrime();
  registerRsaGenPrime();
  registerRsaIntBytes();
}

/** 注册加解密/签名公共依赖 */
function registerCryptoHelpers(): void {
  registerRsaModPow();
  registerRsaIntBytes();
  registerRsaParseKey();
  registerRsaToMsg();
}

javascriptGenerator.forBlock['rsa_keygen'] = function (block: Block): [string, number] {
  const bits = block.getFieldValue('BITS') || '512';
  registerKeygenHelpers();
  const fn = registerRsaKeygen();
  return [fn + '(' + bits + ')', Order.ATOMIC];
};

javascriptGenerator.forBlock['rsa_encrypt'] = function (block: Block): [string, number] {
  const key = javascriptGenerator.valueToCode(block, 'KEY', Order.ATOMIC) || '[]';
  const msg = javascriptGenerator.valueToCode(block, 'MSG', Order.ATOMIC) || '""';
  registerCryptoHelpers();
  const fn = registerRsaEncrypt();
  return [fn + '(' + key + ', ' + msg + ')', Order.ATOMIC];
};

javascriptGenerator.forBlock['rsa_decrypt'] = function (block: Block): [string, number] {
  const key = javascriptGenerator.valueToCode(block, 'KEY', Order.ATOMIC) || '[]';
  const ct = javascriptGenerator.valueToCode(block, 'CT', Order.ATOMIC) || '[]';
  registerCryptoHelpers();
  const fn = registerRsaDecrypt();
  return [fn + '(' + key + ', ' + ct + ')', Order.ATOMIC];
};

javascriptGenerator.forBlock['rsa_sign'] = function (block: Block): [string, number] {
  const key = javascriptGenerator.valueToCode(block, 'KEY', Order.ATOMIC) || '[]';
  const msg = javascriptGenerator.valueToCode(block, 'MSG', Order.ATOMIC) || '""';
  registerSha256Hash();
  registerCryptoHelpers();
  const fn = registerRsaSign();
  return [fn + '(' + key + ', ' + msg + ')', Order.ATOMIC];
};

javascriptGenerator.forBlock['rsa_verify'] = function (block: Block): [string, number] {
  const key = javascriptGenerator.valueToCode(block, 'KEY', Order.ATOMIC) || '[]';
  const msg = javascriptGenerator.valueToCode(block, 'MSG', Order.ATOMIC) || '""';
  const sig = javascriptGenerator.valueToCode(block, 'SIG', Order.ATOMIC) || '[]';
  registerSha256Hash();
  registerCryptoHelpers();
  const fn = registerRsaVerify();
  return [fn + '(' + key + ', ' + msg + ', ' + sig + ')', Order.ATOMIC];
};
