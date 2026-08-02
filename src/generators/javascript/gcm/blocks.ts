/**
 * GCM 原子块 JavaScript 代码生成器
 * NIST SP 800-38D
 *
 * GHASH（GF(2^128) 多项式乘法：右移 V + 进位从 byte15 LSB + 0xE1 异或进 byte0）
 * + GCTR。AES-128 复用 modes/helpers 的 aesEncryptBlock。官方向量 TC2/TC3/TC16。
 */
import { javascriptGenerator, Order } from 'blockly/javascript';
import type { Block } from 'blockly/core';
import { registerAesEcb } from '../symmetric/modes/helpers';

/** GCM GHASH 乘法（MSB-first 位扫描 + V 右移，SP 800-38D Algorithm 1） */
function registerGcmMul(): string {
  return javascriptGenerator.provideFunction_('gcmMul', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(x, y) {',
    '  var z = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];',
    '  var v = y.slice();',
    '  for (var i = 0; i < 16; i++) {',
    '    for (var j = 0; j < 8; j++) {',
    '      if (x[i] & (0x80 >> j)) { for (var k = 0; k < 16; k++) z[k] ^= v[k]; }',
    '      var carry = v[15] & 1;',
    '      for (var k2 = 15; k2 > 0; k2--) v[k2] = ((v[k2] >> 1) | (v[k2 - 1] << 7)) & 0xFF;',
    '      v[0] = (v[0] >> 1) & 0xFF;',
    '      if (carry) v[0] ^= 0xE1;',
    '    }',
    '  }',
    '  return z;',
    '}',
  ]);
}

/** GHASH_H(A, C)：块串联 + 64 位长度块 */
function registerGhash(): string {
  const mul = registerGcmMul();
  return javascriptGenerator.provideFunction_('gcmGhash', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(h, a, c) {',
    '  var y = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];',
    '  var srcs = [a, c];',
    '  for (var s = 0; s < 2; s++) {',
    '    var src = srcs[s];',
    '    for (var i = 0; i < src.length; i += 16) {',
    '      var blk = src.slice(i, i + 16);',
    '      while (blk.length < 16) blk.push(0);',
    '      for (var j = 0; j < 16; j++) blk[j] = (blk[j] ^ y[j]) & 0xFF;',
    '      y = ' + mul + '(blk, h);',
    '    }',
    '  }',
    '  var la = a.length * 8, lc = c.length * 8;',
    '  // 64 位大端长度块；>>> 在 bi>=4 回绕，用除法',
    '  var lenBlk = [];',
    '  for (var bi = 7; bi >= 0; bi--) lenBlk.push(Math.floor(la / Math.pow(2, 8 * bi)) & 0xFF);',
    '  for (var bi2 = 7; bi2 >= 0; bi2--) lenBlk.push(Math.floor(lc / Math.pow(2, 8 * bi2)) & 0xFF);',
    '  for (var j2 = 0; j2 < 16; j2++) lenBlk[j2] = (lenBlk[j2] ^ y[j2]) & 0xFF;',
    '  return ' + mul + '(lenBlk, h);',
    '}',
  ]);
}

/** 完整 GCM-Encrypt（返回 密文‖标签 字节数组） */
function registerGcmEncrypt(): string {
  const ghash = registerGhash();
  return javascriptGenerator.provideFunction_('gcmEncrypt', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(key, iv, aad, msg) {',
    '  if (key.length !== 16) throw new Error("GCM-AES-128 key must be 16 bytes");',
    '  var H = aesEncryptBlock([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], key);',
    '  var J0;',
    '  if (iv.length === 12) J0 = Array.from(iv).concat([0, 0, 0, 1]);',
    '  else J0 = ' + ghash + '(H, [], Array.from(iv));',
    '  var inc32 = function (x) {',
    '    var b = x.slice();',
    '    for (var i = 15; i > 11; i--) { b[i] = (b[i] + 1) & 0xFF; if (b[i] !== 0) break; }',
    '    return b;',
    '  };',
    '  var ct = [];',
    '  var cb = inc32(J0);',
    '  for (var i = 0; i < msg.length; i += 16) {',
    '    var s = aesEncryptBlock(cb, key);',
    '    for (var j = 0; j < 16 && i + j < msg.length; j++) ct.push((msg[i + j] ^ s[j]) & 0xFF);',
    '    cb = inc32(cb);',
    '  }',
    '  var S = ' + ghash + '(H, Array.from(aad), ct);',
    '  var s0 = aesEncryptBlock(J0, key);',
    '  var tag = [];',
    '  for (var t = 0; t < 16; t++) tag.push((S[t] ^ s0[t]) & 0xFF);',
    '  return ct.concat(tag);',
    '}',
  ]);
}

javascriptGenerator.forBlock['gcm_encrypt'] = function (block: Block): [string, number] {
  const key = javascriptGenerator.valueToCode(block, 'KEY', Order.ATOMIC) || '[]';
  const iv = javascriptGenerator.valueToCode(block, 'IV', Order.ATOMIC) || '[]';
  const aad = javascriptGenerator.valueToCode(block, 'AAD', Order.ATOMIC) || '[]';
  const msg = javascriptGenerator.valueToCode(block, 'MSG', Order.ATOMIC) || '[]';
  registerAesEcb();
  const fn = registerGcmEncrypt();
  return [fn + '(' + key + ', ' + iv + ', ' + aad + ', ' + msg + ')', Order.ATOMIC];
};
