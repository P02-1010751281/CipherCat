/**
 * ASCON 原子块 JavaScript 代码生成器
 * NIST SP 800-232 (Ascon-AEAD128)
 *
 * 320 位状态（5×64 位字），rate 128 位（每块 x0‖x1），初始化/终结 12 轮、数据 8 轮；
 * 字节序 little-endian。64 位字运算用 BigInt（>>> 移位回绕坑见 X25519 教训）。
 * 官方向量：ascon-c 仓 LWC_AEAD_KAT_128_128.txt（1089 例全过）。
 */
import { javascriptGenerator, Order } from 'blockly/javascript';
import type { Block } from 'blockly/core';

const MAX_ASCON_OUTPUT_BYTES = 1024 * 1024;

/** Ascon 置换（rounds = 12 或 8） */
function registerAsconPermute(): string {
  return javascriptGenerator.provideFunction_('asconPermute', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(S, rounds) {',
    '  var M = 0xffffffffffffffffn;',
    '  var RC = [0xf0n,0xe1n,0xd2n,0xc3n,0xb4n,0xa5n,0x96n,0x87n,0x78n,0x69n,0x5an,0x4bn];',
    '  var rotr = function(x, n) { return ((x >> BigInt(n)) | (x << (64n - BigInt(n)))) & M; };',
    '  for (var r = 12 - rounds; r < 12; r++) {',
    '    S[2] ^= RC[r];',
    '    S[0] ^= S[4]; S[4] ^= S[3]; S[2] ^= S[1];',
    '    var t0 = (~S[0]) & S[1], t1 = (~S[1]) & S[2], t2 = (~S[2]) & S[3];',
    '    var t3 = (~S[3]) & S[4], t4 = (~S[4]) & S[0];',
    '    S[0] ^= t1; S[1] ^= t2; S[2] ^= t3; S[3] ^= t4; S[4] ^= t0;',
    '    S[1] ^= S[0]; S[0] ^= S[4]; S[3] ^= S[2]; S[2] = (~S[2]) & M;',
    '    S[0] ^= rotr(S[0],19) ^ rotr(S[0],28);',
    '    S[1] ^= rotr(S[1],61) ^ rotr(S[1],39);',
    '    S[2] ^= rotr(S[2],1) ^ rotr(S[2],6);',
    '    S[3] ^= rotr(S[3],10) ^ rotr(S[3],17);',
    '    S[4] ^= rotr(S[4],7) ^ rotr(S[4],41);',
    '  }',
    '}',
  ]);
}

/** 完整 Ascon-AEAD128 加密（返回 密文‖标签 字节数组） */
function registerAsconEncrypt(): string {
  const perm = registerAsconPermute();
  return javascriptGenerator.provideFunction_('asconEncrypt', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(key, nonce, ad, msg) {',
    '  if (key.length !== 16 || nonce.length !== 16) throw new Error("Ascon key/nonce must be 16 bytes");',
    '  var w = function(b) { var x = 0n; for (var i = 0; i < b.length; i++) x |= BigInt(b[i]) << (8n * BigInt(i)); return x; };',
    '  var K0 = w(key.slice(0, 8)), K1 = w(key.slice(8, 16));',
    '  var S = [0x00001000808c0001n, K0, K1, w(nonce.slice(0, 8)), w(nonce.slice(8, 16))];',
    '  ' + perm + '(S, 12);',
    '  S[3] ^= K0; S[4] ^= K1;',
    '  var pad = function(x, n) { return x | (0x01n << (8n * BigInt(n))); };',
    '  if (ad.length > 0) {',
    '    var i = 0;',
    '    while (ad.length - i >= 16) {',
    '      S[0] ^= w(ad.slice(i, i + 8)); S[1] ^= w(ad.slice(i + 8, i + 16));',
    '      ' + perm + '(S, 8); i += 16;',
    '    }',
    '    var r = ad.slice(i);',
    '    if (r.length >= 8) { S[0] ^= w(r.slice(0, 8)); S[1] ^= pad(w(r.slice(8)), r.length - 8); }',
    '    else { S[0] ^= pad(w(r), r.length); }',
    '    ' + perm + '(S, 8);',
    '  }',
    '  S[4] ^= 0x8000000000000000n;',
    '  var out = [];',
    '  i = 0;',
    '  while (msg.length - i >= 16) {',
    '    S[0] ^= w(msg.slice(i, i + 8)); S[1] ^= w(msg.slice(i + 8, i + 16));',
    '    for (var b = 0; b < 8; b++) out.push(Number((S[0] >> (8n * BigInt(b))) & 0xffn));',
    '    for (var b1 = 0; b1 < 8; b1++) out.push(Number((S[1] >> (8n * BigInt(b1))) & 0xffn));',
    '    ' + perm + '(S, 8); i += 16;',
    '  }',
    '  r = msg.slice(i);',
    '  if (r.length >= 8) {',
    '    S[0] ^= w(r.slice(0, 8)); S[1] ^= pad(w(r.slice(8)), r.length - 8);',
    '    for (var b2 = 0; b2 < 8; b2++) out.push(Number((S[0] >> (8n * BigInt(b2))) & 0xffn));',
    '    for (var b3 = 0; b3 < r.length - 8; b3++) out.push(Number((S[1] >> (8n * BigInt(b3))) & 0xffn));',
    '  } else {',
    '    // 空/短末块也要 PAD（PAD(0)=0x01）',
    '    S[0] ^= pad(w(r), r.length);',
    '    for (var b4 = 0; b4 < r.length; b4++) out.push(Number((S[0] >> (8n * BigInt(b4))) & 0xffn));',
    '  }',
    '  S[2] ^= K0; S[3] ^= K1;',
    '  ' + perm + '(S, 12);',
    '  S[3] ^= K0; S[4] ^= K1;',
    '  for (var b5 = 0; b5 < 8; b5++) out.push(Number((S[3] >> (8n * BigInt(b5))) & 0xffn));',
    '  for (var b6 = 0; b6 < 8; b6++) out.push(Number((S[4] >> (8n * BigInt(b6))) & 0xffn));',
    '  return out;',
    '}',
  ]);
}

/** Ascon-AEAD128 解密并拒绝错误标签。 */
function registerAsconDecrypt(): string {
  const perm = registerAsconPermute();
  return javascriptGenerator.provideFunction_('asconDecrypt', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(key, nonce, ad, ctTag) {',
    '  if (key.length !== 16 || nonce.length !== 16 || ctTag.length < 16) throw new Error("Ascon key/nonce/ciphertext length is invalid");',
    '  var w = function(b) { var x = 0n; for (var i = 0; i < b.length; i++) x |= BigInt(b[i]) << (8n * BigInt(i)); return x; };',
    '  var pad = function(x, n) { return x | (0x01n << (8n * BigInt(n))); };',
    '  var K0 = w(key.slice(0, 8)), K1 = w(key.slice(8, 16));',
    '  var S = [0x00001000808c0001n, K0, K1, w(nonce.slice(0, 8)), w(nonce.slice(8, 16))];',
    '  ' + perm + '(S, 12); S[3] ^= K0; S[4] ^= K1;',
    '  if (ad.length > 0) {',
    '    var ai = 0;',
    '    while (ad.length - ai >= 16) { S[0] ^= w(ad.slice(ai, ai + 8)); S[1] ^= w(ad.slice(ai + 8, ai + 16)); ' + perm + '(S, 8); ai += 16; }',
    '    var ar = ad.slice(ai);',
    '    if (ar.length >= 8) { S[0] ^= w(ar.slice(0, 8)); S[1] ^= pad(w(ar.slice(8)), ar.length - 8); } else S[0] ^= pad(w(ar), ar.length);',
    '    ' + perm + '(S, 8);',
    '  }',
    '  S[4] ^= 0x8000000000000000n;',
    '  var ciphertext = ctTag.slice(0, -16), tag = ctTag.slice(-16), out = [], i = 0;',
    '  while (ciphertext.length - i >= 16) {',
    '    var c0 = w(ciphertext.slice(i, i + 8)), c1 = w(ciphertext.slice(i + 8, i + 16));',
    '    for (var b = 0; b < 8; b++) out.push(Number(((S[0] ^ c0) >> (8n * BigInt(b))) & 0xffn));',
    '    for (var b1 = 0; b1 < 8; b1++) out.push(Number(((S[1] ^ c1) >> (8n * BigInt(b1))) & 0xffn));',
    '    S[0] = c0; S[1] = c1; ' + perm + '(S, 8); i += 16;',
    '  }',
    '  var r = ciphertext.slice(i);',
    '  if (r.length >= 8) {',
    '    var c2 = w(r.slice(0, 8)); for (var b2 = 0; b2 < 8; b2++) out.push(Number(((S[0] ^ c2) >> (8n * BigInt(b2))) & 0xffn)); S[0] = c2;',
    '    var n = r.length - 8, mask = (1n << (8n * BigInt(n))) - 1n, c3 = w(r.slice(8)); for (var b3 = 0; b3 < n; b3++) out.push(Number(((S[1] ^ c3) >> (8n * BigInt(b3))) & 0xffn)); S[1] = (S[1] & ~mask) | (c3 & mask); S[1] ^= 0x01n << (8n * BigInt(n));',
    '  } else {',
    '    var n0 = r.length, mask0 = (1n << (8n * BigInt(n0))) - 1n, c4 = w(r); for (var b4 = 0; b4 < n0; b4++) out.push(Number(((S[0] ^ c4) >> (8n * BigInt(b4))) & 0xffn)); S[0] = (S[0] & ~mask0) | (c4 & mask0); S[0] ^= 0x01n << (8n * BigInt(n0));',
    '  }',
    '  S[2] ^= K0; S[3] ^= K1; ' + perm + '(S, 12); S[3] ^= K0; S[4] ^= K1;',
    '  var expected = []; for (var b5 = 0; b5 < 8; b5++) expected.push(Number((S[3] >> (8n * BigInt(b5))) & 0xffn)); for (var b6 = 0; b6 < 8; b6++) expected.push(Number((S[4] >> (8n * BigInt(b6))) & 0xffn));',
    '  var bad = 0; for (var j = 0; j < 16; j++) bad |= (tag[j] ^ expected[j]);',
    '  if (bad !== 0) throw new Error("Ascon authentication failed");',
    '  return out;',
    '}',
  ]);
}

/** Ascon-Hash256 / XOF128 / CXOF128，输出长度单位为字节。 */
function registerAsconHashXof(): string {
  const perm = registerAsconPermute();
  return javascriptGenerator.provideFunction_('asconHashXof', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(msg, outLen, custom, iv) {',
    '  if (typeof outLen !== "number" || !Number.isSafeInteger(outLen) || outLen < 1 || outLen > ' + MAX_ASCON_OUTPUT_BYTES + ') throw new RangeError("Ascon output length must be an integer from 1 to 1048576 bytes");',
    '  if (custom !== null && custom.length > 256) throw new Error("Ascon customization is at most 256 bytes");',
    '  var w = function(b) { var x = 0n; for (var i = 0; i < b.length; i++) x |= BigInt(b[i]) << (8n * BigInt(i)); return x; };',
    '  var pad = function(x, n) { return x | (0x01n << (8n * BigInt(n))); };',
    '  var S = [iv, 0n, 0n, 0n, 0n]; ' + perm + '(S, 12);',
    '  var absorb = function(data) { var i = 0; while (data.length - i >= 8) { S[0] ^= w(data.slice(i, i + 8)); ' + perm + '(S, 12); i += 8; } S[0] ^= pad(w(data.slice(i)), data.length - i); ' + perm + '(S, 12); };',
    '  if (custom !== null) { S[0] ^= BigInt(custom.length * 8); ' + perm + '(S, 12); absorb(custom); }',
    '  absorb(msg);',
    '  var out = []; while (out.length < outLen) { for (var b = 0; b < 8; b++) out.push(Number((S[0] >> (8n * BigInt(b))) & 0xffn)); if (out.length < outLen) ' + perm + '(S, 12); }',
    '  return out.slice(0, outLen);',
    '}',
  ]);
}

javascriptGenerator.forBlock['ascon_encrypt'] = function (block: Block): [string, number] {
  const key = javascriptGenerator.valueToCode(block, 'KEY', Order.ATOMIC) || '[]';
  const nonce = javascriptGenerator.valueToCode(block, 'NONCE', Order.ATOMIC) || '[]';
  const ad = javascriptGenerator.valueToCode(block, 'AD', Order.ATOMIC) || '[]';
  const msg = javascriptGenerator.valueToCode(block, 'MSG', Order.ATOMIC) || '[]';
  const fn = registerAsconEncrypt();
  return [fn + '(' + key + ', ' + nonce + ', ' + ad + ', ' + msg + ')', Order.ATOMIC];
};

javascriptGenerator.forBlock['ascon_decrypt'] = (block: Block): [string, number] => {
  const key = javascriptGenerator.valueToCode(block, 'KEY', Order.ATOMIC) || '[]';
  const nonce = javascriptGenerator.valueToCode(block, 'NONCE', Order.ATOMIC) || '[]';
  const ad = javascriptGenerator.valueToCode(block, 'AD', Order.ATOMIC) || '[]';
  const ct = javascriptGenerator.valueToCode(block, 'CT', Order.ATOMIC) || '[]';
  const fn = registerAsconDecrypt();
  return [fn + '(' + key + ', ' + nonce + ', ' + ad + ', ' + ct + ')', Order.ATOMIC];
};

javascriptGenerator.forBlock['ascon_hash256'] = (block: Block): [string, number] => {
  const msg = javascriptGenerator.valueToCode(block, 'MSG', Order.ATOMIC) || '[]';
  const fn = registerAsconHashXof();
  return [fn + '(' + msg + ', 32, null, 0x0000080100cc0002n)', Order.ATOMIC];
};

javascriptGenerator.forBlock['ascon_xof128'] = (block: Block): [string, number] => {
  const msg = javascriptGenerator.valueToCode(block, 'MSG', Order.ATOMIC) || '[]';
  const len = javascriptGenerator.valueToCode(block, 'LEN', Order.ATOMIC) || '0';
  const fn = registerAsconHashXof();
  return [fn + '(' + msg + ', ' + len + ', null, 0x0000080000cc0003n)', Order.ATOMIC];
};

javascriptGenerator.forBlock['ascon_cxof128'] = (block: Block): [string, number] => {
  const msg = javascriptGenerator.valueToCode(block, 'MSG', Order.ATOMIC) || '[]';
  const custom = javascriptGenerator.valueToCode(block, 'CUSTOM', Order.ATOMIC) || '[]';
  const len = javascriptGenerator.valueToCode(block, 'LEN', Order.ATOMIC) || '0';
  const fn = registerAsconHashXof();
  return [fn + '(' + msg + ', ' + len + ', ' + custom + ', 0x0000080000cc0004n)', Order.ATOMIC];
};
