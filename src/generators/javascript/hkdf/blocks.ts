/**
 * HKDF 原子块 JavaScript 代码生成器
 * RFC 5869
 *
 * HMAC-SHA256 需同步实现（WebCrypto 是异步的，不适合内嵌）——内嵌完整 SHA-256（32 位字运算，
 * 参照 hash/sha256 已验证实现）→ HMAC → HKDF-Extract/Expand。官方向量 RFC 5869 §A.1。
 */
import { javascriptGenerator, Order } from 'blockly/javascript';
import type { Block } from 'blockly/core';

/** 完整同步 HKDF（HMAC-SHA256，返回派生密钥字节数组） */
function registerHkdf(): string {
  return javascriptGenerator.provideFunction_('hkdf', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(salt, ikm, info, len) {',
    '  // ---- 同步 SHA-256 ----',
    '  function sha256Hash(input) {',
    '    if (typeof input === "string") input = new TextEncoder().encode(input);',
    '    else if (Array.isArray(input)) input = Uint8Array.from(input);',
    '    var K = [0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,',
    '      0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,',
    '      0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,',
    '      0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,',
    '      0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,',
    '      0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,',
    '      0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,',
    '      0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2];',
    '    var mLen = input.length, mLenBits = mLen * 8;',
    '    var kk = (448 - mLenBits - 1) % 512; if (kk < 0) kk += 512;',
    '    var padded = new Uint8Array(mLen + 1 + Math.floor(kk / 8) + 8);',
    '    padded.set(input); padded[mLen] = 0x80;',
    '    // 注意：mLenBits >>> (8*bi) 在 bi>=4 时位移回绕（>>>32 返回原值），必须用除法',
    '    for (var bi = 0; bi < 8; bi++) padded[padded.length - 1 - bi] = Math.floor(mLenBits / Math.pow(2, 8 * bi)) & 0xFF;',
    '    var state = [0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19];',
    '    for (var off = 0; off < padded.length; off += 64) {',
    '      var w = new Array(64);',
    '      for (var j = 0; j < 16; j++) w[j] = ((padded[off+4*j]<<24)|(padded[off+4*j+1]<<16)|(padded[off+4*j+2]<<8)|padded[off+4*j+3])>>>0;',
    '      for (var j = 16; j < 64; j++) {',
    '        var s0 = ((w[j-15]>>>7)|(w[j-15]<<25)) ^ ((w[j-15]>>>18)|(w[j-15]<<14)) ^ (w[j-15]>>>3);',
    '        var s1 = ((w[j-2]>>>17)|(w[j-2]<<15)) ^ ((w[j-2]>>>19)|(w[j-2]<<13)) ^ (w[j-2]>>>10);',
    '        w[j] = (w[j-16] + s0 + w[j-7] + s1) | 0;',
    '      }',
    '      var a=state[0],b=state[1],c=state[2],d=state[3],e=state[4],f=state[5],g=state[6],h=state[7];',
    '      for (var j = 0; j < 64; j++) {',
    '        var S1 = ((e>>>6)|(e<<26)) ^ ((e>>>11)|(e<<21)) ^ ((e>>>25)|(e<<7));',
    '        var ch = (e & f) ^ (~e & g);',
    '        var t1 = (h + S1 + ch + K[j] + w[j]) | 0;',
    '        var S0 = ((a>>>2)|(a<<30)) ^ ((a>>>13)|(a<<19)) ^ ((a>>>22)|(a<<10));',
    '        var maj = (a & b) ^ (a & c) ^ (b & c);',
    '        var t2 = (S0 + maj) | 0;',
    '        h = g; g = f; f = e; e = (d + t1) | 0; d = c; c = b; b = a; a = (t1 + t2) | 0;',
    '      }',
    '      state = [(a+state[0])|0,(b+state[1])|0,(c+state[2])|0,(d+state[3])|0,(e+state[4])|0,(f+state[5])|0,(g+state[6])|0,(h+state[7])|0];',
    '    }',
    '    var out = [];',
    '    for (var i = 0; i < 8; i++) out.push((state[i]>>>24)&0xFF,(state[i]>>>16)&0xFF,(state[i]>>>8)&0xFF,state[i]&0xFF);',
    '    return out;',
    '  }',
    '  // ---- HMAC-SHA256（同步）----',
    '  function hmacSha256(key, msg) {',
    '    var kk = Array.from(key);',
    '    if (kk.length > 64) kk = sha256Hash(kk);',
    '    while (kk.length < 64) kk.push(0);',
    '    var ipad = kk.map(function (x) { return x ^ 0x36; });',
    '    var opad = kk.map(function (x) { return x ^ 0x5c; });',
    '    return sha256Hash(opad.concat(sha256Hash(ipad.concat(Array.from(msg)))));',
    '  }',
    '  // ---- HKDF-Extract/Expand ----',
    '  var s = Array.from(salt || []);',
    '  if (s.length === 0) { s = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]; }',
    '  var PRK = hmacSha256(s, ikm);',
    '  var T = [], out = [], i = 1;',
    '  while (out.length < len) {',
    '    T = hmacSha256(PRK, T.concat(Array.from(info)).concat([i]));',
    '    for (var j = 0; j < T.length && out.length < len; j++) out.push(T[j]);',
    '    i++;',
    '  }',
    '  return out;',
    '}',
  ]);
}

javascriptGenerator.forBlock['hkdf'] = function (block: Block): [string, number] {
  const salt = javascriptGenerator.valueToCode(block, 'SALT', Order.ATOMIC) || '[]';
  const ikm = javascriptGenerator.valueToCode(block, 'IKM', Order.ATOMIC) || '[]';
  const info = javascriptGenerator.valueToCode(block, 'INFO', Order.ATOMIC) || '[]';
  const len = javascriptGenerator.valueToCode(block, 'LEN', Order.ATOMIC) || '32';
  const fn = registerHkdf();
  return [fn + '(' + salt + ', ' + ikm + ', ' + info + ', ' + len + ')', Order.ATOMIC];
};
