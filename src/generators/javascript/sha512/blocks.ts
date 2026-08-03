/**
 * SHA-512 / SHA-384 JavaScript 生成器（FIPS 180-4，64 位字，80 轮，BigInt）
 */
import { javascriptGenerator, Order } from 'blockly/javascript';
import type { Block } from 'blockly/core';

function registerSha512(): string {
  return javascriptGenerator.provideFunction_('sha512_compress', [
    'const M64 = (1n << 64n) - 1n;',
    'const K512 = [0x428a2f98d728ae22n, 0x7137449123ef65cdn, 0xb5c0fbcfec4d3b2fn, 0xe9b5dba58189dbbcn, 0x3956c25bf348b538n, 0x59f111f1b605d019n, 0x923f82a4af194f9bn, 0xab1c5ed5da6d8118n, 0xd807aa98a3030242n, 0x12835b0145706fben, 0x243185be4ee4b28cn, 0x550c7dc3d5ffb4e2n, 0x72be5d74f27b896fn, 0x80deb1fe3b1696b1n, 0x9bdc06a725c71235n, 0xc19bf174cf692694n, 0xe49b69c19ef14ad2n, 0xefbe4786384f25e3n, 0xfc19dc68b8cd5b5n, 0x240ca1cc77ac9c65n, 0x2de92c6f592b0275n, 0x4a7484aa6ea6e483n, 0x5cb0a9dcbd41fbd4n, 0x76f988da831153b5n, 0x983e5152ee66dfabn, 0xa831c66d2db43210n, 0xb00327c898fb213fn, 0xbf597fc7beef0ee4n, 0xc6e00bf33da88fc2n, 0xd5a79147930aa725n, 0x6ca6351e003826fn, 0x142929670a0e6e70n, 0x27b70a8546d22ffcn, 0x2e1b21385c26c926n, 0x4d2c6dfc5ac42aedn, 0x53380d139d95b3dfn, 0x650a73548baf63den, 0x766a0abb3c77b2a8n, 0x81c2c92e47edaee6n, 0x92722c851482353bn, 0xa2bfe8a14cf10364n, 0xa81a664bbc423001n, 0xc24b8b70d0f89791n, 0xc76c51a30654be30n, 0xd192e819d6ef5218n, 0xd69906245565a910n, 0xf40e35855771202an, 0x106aa07032bbd1b8n, 0x19a4c116b8d2d0c8n, 0x1e376c085141ab53n, 0x2748774cdf8eeb99n, 0x34b0bcb5e19b48a8n, 0x391c0cb3c5c95a63n, 0x4ed8aa4ae3418acbn, 0x5b9cca4f7763e373n, 0x682e6ff3d6b2b8a3n, 0x748f82ee5defb2fcn, 0x78a5636f43172f60n, 0x84c87814a1f0ab72n, 0x8cc702081a6439ecn, 0x90befffa23631e28n, 0xa4506cebde82bde9n, 0xbef9a3f7b2c67915n, 0xc67178f2e372532bn, 0xca273eceea26619cn, 0xd186b8c721c0c207n, 0xeada7dd6cde0eb1en, 0xf57d4f7fee6ed178n, 0x6f067aa72176fban, 0xa637dc5a2c898a6n, 0x113f9804bef90daen, 0x1b710b35131c471bn, 0x28db77f523047d84n, 0x32caab7b40c72493n, 0x3c9ebe0a15c9bebcn, 0x431d67c49c100d4cn, 0x4cc5d4becb3e42b6n, 0x597f299cfc657e2an, 0x5fcb6fab3ad6faecn, 0x6c44198c4a475817n];',
    'function rotr64(x, n) { return ((x >> n) | (x << (64n - n))) & M64; }',
    'function sha512Pad(msg) {',
    '  if (typeof msg === "string") msg = new TextEncoder().encode(msg);',
    '  else if (Array.isArray(msg)) msg = Uint8Array.from(msg);',
    '  let mLen = msg.length;',
    '  let padded = new Uint8Array(Math.ceil((mLen + 17) / 128) * 128);',
    '  padded.set(msg);',
    '  padded[mLen] = 0x80;',
    '  let bits = BigInt(mLen * 8);',
    '  for (let i = 0; i < 8; i++) {',
    '    padded[padded.length - 1 - i] = Number((bits >> BigInt(i * 8)) & 0xffn);',
    '  }',
    '  return padded;',
    '}',
    'function sha512Compress(v, block) {',
    '  const w = new Array(80).fill(0n);',
    '  for (let i = 0; i < 16; i++) {',
    '    let x = 0n;',
    '    for (let j = 0; j < 8; j++) x = (x << 8n) | BigInt(block[i * 8 + j]);',
    '    w[i] = x;',
    '  }',
    '  for (let i = 16; i < 80; i++) {',
    '    const s0 = rotr64(w[i - 15], 1n) ^ rotr64(w[i - 15], 8n) ^ (w[i - 15] >> 7n);',
    '    const s1 = rotr64(w[i - 2], 19n) ^ rotr64(w[i - 2], 61n) ^ (w[i - 2] >> 6n);',
    '    w[i] = (w[i - 16] + s0 + w[i - 7] + s1) & M64;',
    '  }',
    '  let h = v.slice().map(x => BigInt(x));',
    '  for (let i = 0; i < 80; i++) {',
    '    const s1 = rotr64(h[4], 14n) ^ rotr64(h[4], 18n) ^ rotr64(h[4], 41n);',
    '    const ch = (h[4] & h[5]) ^ ((~h[4] & M64) & h[6]);',
    '    const t1 = (h[7] + s1 + ch + K512[i] + w[i]) & M64;',
    '    const s0 = rotr64(h[0], 28n) ^ rotr64(h[0], 34n) ^ rotr64(h[0], 39n);',
    '    const maj = (h[0] & h[1]) ^ (h[0] & h[2]) ^ (h[1] & h[2]);',
    '    const t2 = (s0 + maj) & M64;',
    '    h = [(t1 + t2) & M64, h[0], h[1], h[2], (h[3] + t1) & M64, h[4], h[5], h[6]];',
    '  }',
    '  return h.map((x, i) => (x + v[i]) & M64);',
    '}',
    'function sha512Hash(msg, sizeBits) {',
    '  const data = sha512Pad(msg);',
    '  const iv384 = [0xcbbb9d5dc1059ed8n,0x629a292a367cd507n,0x9159015a3070dd17n,0x152fecd8f70e5939n,0x67332667ffc00b31n,0x8eb44a8768581511n,0xdb0c2e0d64f98fa7n,0x47b5481dbefa4fa4n];',
    '  const iv512 = [0x6a09e667f3bcc908n,0xbb67ae8584caa73bn,0x3c6ef372fe94f82bn,0xa54ff53a5f1d36f1n,0x510e527fade682d1n,0x9b05688c2b3e6c1fn,0x1f83d9abfb41bd6bn,0x5be0cd19137e2179n];',
    '  let h = (sizeBits === 384 ? iv384 : iv512).slice();',
    '  for (let off = 0; off < data.length; off += 128) {',
    '    h = sha512Compress(h, data.slice(off, off + 128));',
    '  }',
    '  const out = new Uint8Array(sizeBits >> 3);',
    '  for (let i = 0; i < 8; i++) {',
    '    for (let j = 7; j >= 0; j--) {',
    '      const idx = i * 8 + (7 - j);',
    '      if (idx < out.length) out[idx] = Number((h[i] >> BigInt(j * 8)) & 0xffn);',
    '    }',
    '  }',
    '  return out;',
    '}',
  ]);
}

javascriptGenerator.forBlock['hash_sha512_pad'] = function (
  block: Block,
): [string, number] {
  const input =
    javascriptGenerator.valueToCode(block, 'INPUT', Order.ATOMIC) || "''";
  registerSha512();
  return ['sha512Pad(' + input + ')', Order.ATOMIC];
};

javascriptGenerator.forBlock['hash_sha512_compress'] = function (
  block: Block,
): [string, number] {
  const v = javascriptGenerator.valueToCode(block, 'V', Order.ATOMIC) || '[]';
  const w = javascriptGenerator.valueToCode(block, 'W', Order.ATOMIC) || '[]';
  registerSha512();
  return ['sha512Compress(' + v + ', ' + w + ')', Order.ATOMIC];
};

javascriptGenerator.forBlock['hash_sha512_hash'] = function (
  block: Block,
): [string, number] {
  const msg =
    javascriptGenerator.valueToCode(block, 'MSG', Order.ATOMIC) || "''";
  const size = block.getFieldValue('SIZE') || '512';
  registerSha512();
  return ['sha512Hash(' + msg + ', ' + size + ')', Order.ATOMIC];
};
