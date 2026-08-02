/**
 * CMAC 原子块 JavaScript 代码生成器
 * NIST SP 800-38B
 *
 * CMAC = 子密钥生成（AES(0) + GF(2^128) 加倍 K1/K2）+ CBC-MAC（最后块 K1/K2 选择）。
 * AES-128 加密复用 symmetric/modes/helpers 的 registerAesEcb（同 generator 注册空间）。
 */
import { javascriptGenerator, Order } from 'blockly/javascript';
import type { Block } from 'blockly/core';
import { registerAesEcb } from '../symmetric/modes/helpers';

/** GF(2^128) 左移加倍（SP 800-38B §6.1，不可约多项式 x^128+x^7+x^2+x+1） */
function registerCmacDoubling(): string {
  return javascriptGenerator.provideFunction_('cmacDouble', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(block) {',
    '  var msb = block[0] & 0x80;',
    '  var out = [];',
    '  for (var i = 0; i < 15; i++) out.push(((block[i] << 1) | (block[i + 1] >> 7)) & 0xFF);',
    '  out.push((block[15] << 1) & 0xFF);',
    '  if (msb) out[15] ^= 0x87;',
    '  return out;',
    '}',
  ]);
}

/** 子密钥生成：K1 = 2·AES(K,0)，K2 = 2·K1 */
function registerCmacSubkeys(): string {
  return javascriptGenerator.provideFunction_('cmacSubkeys', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(key, doubleFn) {',
    '  var zero = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];',
    '  var L = aesEncryptBlock(zero, key);',
    '  var K1 = doubleFn(L);',
    '  var K2 = doubleFn(K1);',
    '  return { K1: K1, K2: K2 };',
    '}',
  ]);
}

javascriptGenerator.forBlock['cmac_mac'] = function (block: Block): [string, number] {
  const key = javascriptGenerator.valueToCode(block, 'KEY', Order.ATOMIC) || '[]';
  const msg = javascriptGenerator.valueToCode(block, 'MSG', Order.ATOMIC) || '[]';
  const cipher = block.getFieldValue('CIPHER') || 'aes';
  const doubling = registerCmacDoubling();

  if (cipher === 'aes') {
    // AES-128：复用 aesEncryptBlock（registerAesEcb 内部注册）
    registerAesEcb();
    const subkeys = registerCmacSubkeys();
    const fn = javascriptGenerator.provideFunction_('cmacAesMac', [
      'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(key, msg) {',
      '  if (key.length !== 16) throw new Error("CMAC-AES key must be 16 bytes");',
      '  var sk = ' + subkeys + '(key, ' + doubling + ');',
      '  var blocks = [];',
      '  for (var i = 0; i < msg.length; i += 16) blocks.push(msg.slice(i, i + 16));',
      '  if (blocks.length === 0) blocks.push([]);',
      '  // 最后块处理：完整 → ⊕K1；不完整 → 补 0x80.. ⊕K2',
      '  var n = blocks.length;',
      '  var last = blocks[n - 1];',
      '  if (msg.length > 0 && msg.length % 16 === 0) {',
      '    for (var j = 0; j < 16; j++) last[j] ^= sk.K1[j];',
      '  } else {',
      '    // 10* padding：原数据 + 0x80 + 补零到 16 字节',
      '    var padded = last.slice();',
      '    padded.push(0x80);',
      '    while (padded.length < 16) padded.push(0x00);',
      '    for (var k2 = 0; k2 < 16; k2++) padded[k2] ^= sk.K2[k2];',
      '    blocks[n - 1] = padded;',
      '  }',
      '  // CBC-MAC：所有块依次 AES 加密 XOR',
      '  var X = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];',
      '  for (var m = 0; m < blocks.length; m++) {',
      '    var b = blocks[m];',
      '    var inp = [];',
      '    for (var bi = 0; bi < 16; bi++) inp.push((X[bi] ^ (b[bi] || 0)) & 0xFF);',
      '    X = aesEncryptBlock(inp, key);',
      '  }',
      '  return X;',
      '}',
    ]);
    return [fn + '(' + key + ', ' + msg + ')', Order.ATOMIC];
  }

  // SM4（GB/T 15852 同类结构）——内嵌完整 SM4-CMAC
  const fnSm4 = javascriptGenerator.provideFunction_('cmacSm4Mac', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(key, msg) {',
    '  if (key.length !== 16) throw new Error("CMAC-SM4 key must be 16 bytes");',
    '  // SM4 S-box（GM/T 0002）',
    '  var sb = [' +
      '0xd6,0x90,0xe9,0xfe,0xcc,0xe1,0x3d,0xb7,0x16,0xb6,0x14,0xc2,0x28,0xfb,0x2c,0x05,' +
      '0x2b,0x67,0x9a,0x76,0x2a,0xbe,0x04,0xc3,0xaa,0x44,0x13,0x26,0x49,0x86,0x06,0x99,' +
      '0x9c,0x42,0x50,0xf4,0x91,0xef,0x98,0x7a,0x33,0x54,0x0b,0x43,0xed,0xcf,0xac,0x62,' +
      '0xe4,0xb3,0x1c,0xa9,0xc9,0x08,0xe8,0x95,0x80,0xdf,0x94,0xfa,0x75,0x8f,0x3f,0xa6,' +
      '0x47,0x07,0xa7,0xfc,0xf3,0x73,0x17,0xba,0x83,0x59,0x3c,0x19,0xe6,0x85,0x4f,0xa8,' +
      '0x68,0x6b,0x81,0xb2,0x71,0x64,0xda,0x8b,0xf8,0xeb,0x0f,0x4b,0x70,0x56,0x9d,0x35,' +
      '0x1e,0x24,0x0e,0x5e,0x63,0x58,0xd1,0xa2,0x25,0x22,0x7c,0x3b,0x01,0x21,0x78,0x87,' +
      '0xd4,0x00,0x46,0x57,0x9f,0xd3,0x27,0x52,0x4c,0x36,0x02,0xe7,0xa0,0xc4,0xc8,0x9e,' +
      '0xea,0xbf,0x8a,0xd2,0x40,0xc7,0x38,0xb5,0xa3,0xf7,0xf2,0xce,0xf9,0x61,0x15,0xa1,' +
      '0xe0,0xae,0x5d,0xa4,0x9b,0x34,0x1a,0x55,0xad,0x93,0x32,0x30,0xf5,0x8c,0xb1,0xe3,' +
      '0x1d,0xf6,0xe2,0x2e,0x82,0x66,0xca,0x60,0xc0,0x29,0x23,0xab,0x0d,0x53,0x4e,0x6f,' +
      '0xd5,0xdb,0x37,0x45,0xde,0xfd,0x8e,0x2f,0x03,0xff,0x6a,0x72,0x6d,0x6c,0x5b,0x51,' +
      '0x8d,0x1b,0xaf,0x92,0xbb,0xdd,0xbc,0x7f,0x11,0xd9,0x5c,0x41,0x1f,0x10,0x5a,0xd8,' +
      '0x0a,0xc1,0x31,0x88,0xa5,0xcd,0x7b,0xbd,0x2d,0x74,0xd0,0x12,0xb8,0xe5,0xb4,0xb0,' +
      '0x89,0x69,0x97,0x4a,0x0c,0x96,0x77,0x7e,0x65,0xb9,0xf1,0x09,0xc5,0x6e,0xc6,0x84,' +
      '0x18,0xf0,0x7d,0xec,0x3a,0xdc,0x4d,0x20,0x79,0xee,0x5f,0x3e,0xd7,0xcb,0x39,0x48];',
    '  var rotl = function (x, k) { x = x >>> 0; return ((x << k) | (x >>> (32 - k))) >>> 0; };',
    '  var L = function (b) { return b ^ rotl(b, 2) ^ rotl(b, 10) ^ rotl(b, 18) ^ rotl(b, 24); };',
    '  var Lp = function (b) { return b ^ rotl(b, 13) ^ rotl(b, 23); };',
    '  var tau = function (a) {',
    '    a = a >>> 0;',
    '    return ((sb[(a >>> 24) & 0xFF] << 24) | (sb[(a >>> 16) & 0xFF] << 16) | (sb[(a >>> 8) & 0xFF] << 8) | sb[a & 0xFF]) >>> 0;',
    '  };',
    '  var T = function (x) { return L(tau(x)); };',
    '  var Tp = function (x) { return Lp(tau(x)); };',
    '  var keyExpand = function (mk) {',
    '    var FK = [0xa3b1bac6, 0x56aa3350, 0x677d9197, 0xb27022dc];',
    '    var CK = [' +
      '0x00070e15,0x1c232a31,0x383f464d,0x545b6269,0x70777e85,0x8c939aa1,0xa8afb6bd,0xc4cbd2d9,' +
      '0xe0e7eef5,0xfc030a11,0x181f262d,0x343b4249,0x50575e65,0x6c737a81,0x888f969d,0xa4abb2b9,' +
      '0xc0c7ced5,0xdce3eaf1,0xf8ff060d,0x141b2229,0x30373e45,0x4c535a61,0x686f767d,0x848b9299,' +
      '0xa0a7aeb5,0xbcc3cad1,0xd8dfe6ed,0xf4fb0209,0x10171e25,0x2c333a41,0x484f565d,0x646b7279];',
    '    var K = [];',
    '    var k32 = [];',
    '    for (var i = 0; i < 4; i++) k32.push(((mk[4*i] << 24) | (mk[4*i+1] << 16) | (mk[4*i+2] << 8) | mk[4*i+3]) >>> 0);',
    '    K[0] = (k32[0] ^ FK[0]) >>> 0; K[1] = (k32[1] ^ FK[1]) >>> 0;',
    '    K[2] = (k32[2] ^ FK[2]) >>> 0; K[3] = (k32[3] ^ FK[3]) >>> 0;',
    '    var rk = [];',
    '    for (var r = 0; r < 32; r++) {',
    '      var t = (K[r+1] ^ K[r+2] ^ K[r+3] ^ CK[r]) >>> 0;',
    '      K[r+4] = (K[r] ^ Tp(t)) >>> 0;',
    '      rk.push(K[r+4]);',
    '    }',
    '    return rk;',
    '  };',
    '  var sm4EncryptBlock = function (pt, rk) {',
    '    var x = [];',
    '    for (var i = 0; i < 4; i++) x.push(((pt[4*i] << 24) | (pt[4*i+1] << 16) | (pt[4*i+2] << 8) | pt[4*i+3]) >>> 0);',
    '    for (var r = 0; r < 32; r++) {',
    '      var nxt = (x[0] ^ T((x[1] ^ x[2] ^ x[3] ^ rk[r]) >>> 0)) >>> 0;',
    '      x = [x[1], x[2], x[3], nxt];',
    '    }',
    '    var out = [];',
    '    for (var i = 0; i < 4; i++) {',
    '      out.push((x[3-i] >>> 24) & 0xFF); out.push((x[3-i] >>> 16) & 0xFF);',
    '      out.push((x[3-i] >>> 8) & 0xFF); out.push(x[3-i] & 0xFF);',
    '    }',
    '    return out;',
    '  };',
    '  var rk = keyExpand(key);',
    '  var zero = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];',
    '  var L0 = sm4EncryptBlock(zero, rk);',
    '  var K1 = ' + doubling + '(L0);',
    '  var K2 = ' + doubling + '(K1);',
    '  var blocks = [];',
    '  for (var i = 0; i < msg.length; i += 16) blocks.push(msg.slice(i, i + 16));',
    '  if (blocks.length === 0) blocks.push([]);',
    '  var last = blocks[blocks.length - 1];',
    '  if (msg.length % 16 === 0 && msg.length > 0) {',
    '    for (var j = 0; j < 16; j++) last[j] ^= K1[j];',
    '  } else {',
    '    // 10* padding：原数据 + 0x80 + 补零到 16 字节',
    '    var padded = last.slice();',
    '    padded.push(0x80);',
    '    while (padded.length < 16) padded.push(0);',
    '    for (var k2 = 0; k2 < 16; k2++) padded[k2] ^= K2[k2];',
    '    blocks[blocks.length - 1] = padded;',
    '  }',
    '  var X = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];',
    '  for (var m = 0; m < blocks.length; m++) {',
    '    var b = blocks[m];',
    '    var inp = [];',
    '    for (var bi = 0; bi < 16; bi++) inp.push((X[bi] ^ (b[bi] || 0)) & 0xFF);',
    '    X = sm4EncryptBlock(inp, rk);',
    '  }',
    '  return X;',
    '}',
  ]);
  return [fnSm4 + '(' + key + ', ' + msg + ')', Order.ATOMIC];
};
