/**
 * CCM 原子块 JavaScript 代码生成器
 * NIST SP 800-38C
 *
 * CCM = CBC-MAC 认证（B0 ‖ 长度编码 AAD ‖ 明文，整串零填充）+ CTR 加密（flags‖nonce‖计数器）。
 * AES-128 块加密复用 symmetric/modes/helpers 的 aesEncryptBlock（registerAesEcb 注册）。
 */
import { javascriptGenerator, Order } from 'blockly/javascript';
import type { Block } from 'blockly/core';
import { registerAesEcb } from '../symmetric/modes/helpers';

/** CCM 计数器块：flags ‖ nonce ‖ L 字节大端计数器 */
function registerCcmCtrBlock(): string {
  return javascriptGenerator.provideFunction_('ccmCtrBlock', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(flags, nonce, L, i) {',
    '  var b = [flags].concat(nonce);',
    '  // 注意：i >>> (8*k) 在 k>=4 时位移回绕（>>> 32 == i），必须用 Math.floor 除法',
    '  for (var k = L - 1; k >= 0; k--) b.push(Math.floor(i / Math.pow(2, 8 * k)) & 0xFF);',
    '  return b;',
    '}',
  ]);
}

/** 完整 CCM-Encrypt（返回 密文‖标签 字节数组） */
function registerCcmEncrypt(): string {
  const ctr = registerCcmCtrBlock();
  return javascriptGenerator.provideFunction_('ccmEncrypt', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(key, nonce, aad, msg, tagLen) {',
    '  if (key.length !== 16) throw new Error("CCM key must be 16 bytes");',
    '  var L = 15 - nonce.length;',
    '  if (L < 2 || L > 8) throw new Error("CCM nonce must be 7-13 bytes");',
    '  var flags = (aad.length > 0 ? 0x40 : 0) | (((tagLen - 2) / 2) << 3) | (L - 1);',
    '  // 格式化数据 B = B0 ‖ A(长度编码) ‖ P，A 段与 P 段各自独立填充到 16 字节边界',
    '  var B = [flags].concat(nonce);',
    '  var q = msg.length;',
    '  // 注意：q >>> (8*bi) 在 bi>=4 时位移回绕，必须用 Math.floor 除法',
    '  for (var bi = L - 1; bi >= 0; bi--) B.push(Math.floor(q / Math.pow(2, 8 * bi)) & 0xFF);',
    '  if (aad.length > 0) {',
    '    var alen = aad.length;',
    '    if (alen < 0xFF00) B.push((alen >> 8) & 0xFF, alen & 0xFF);',
    '    else B.push(0xFF, 0xFE, (alen >>> 24) & 0xFF, (alen >>> 16) & 0xFF, (alen >>> 8) & 0xFF, alen & 0xFF);',
    '    for (var ai = 0; ai < aad.length; ai++) B.push(aad[ai]);',
    '    while (B.length % 16 !== 0) B.push(0);',
    '  }',
    '  for (var pi = 0; pi < msg.length; pi++) B.push(msg[pi]);',
    '  while (B.length % 16 !== 0) B.push(0);',
    '  // CBC-MAC',
    '  var X = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];',
    '  for (var i = 0; i < B.length; i += 16) {',
    '    var xin = [];',
    '    for (var j = 0; j < 16; j++) xin.push((X[j] ^ B[i + j]) & 0xFF);',
    '    X = aesEncryptBlock(xin, key);',
    '  }',
    '  // CTR：计数器块 flags 仅含 (L-1)（无 AAD/标签长度位，SP 800-38C A.3）；S0 掩码标签，S1..Sn 加密明文',
    '  var cflags = L - 1;',
    '  var S0 = aesEncryptBlock(' + ctr + '(cflags, nonce, L, 0), key);',
    '  var out = [];',
    '  var nBlocks = Math.ceil(msg.length / 16);',
    '  for (var i2 = 1; i2 <= nBlocks; i2++) {',
    '    var S = aesEncryptBlock(' + ctr + '(cflags, nonce, L, i2), key);',
    '    var start = (i2 - 1) * 16;',
    '    for (var j2 = 0; j2 < 16 && start + j2 < msg.length; j2++) out.push((msg[start + j2] ^ S[j2]) & 0xFF);',
    '  }',
    '  for (var t = 0; t < tagLen; t++) out.push((X[t] ^ S0[t]) & 0xFF);',
    '  return out;',
    '}',
  ]);
}

javascriptGenerator.forBlock['ccm_encrypt'] = function (block: Block): [string, number] {
  const key = javascriptGenerator.valueToCode(block, 'KEY', Order.ATOMIC) || '[]';
  const nonce = javascriptGenerator.valueToCode(block, 'NONCE', Order.ATOMIC) || '[]';
  const aad = javascriptGenerator.valueToCode(block, 'AAD', Order.ATOMIC) || '[]';
  const msg = javascriptGenerator.valueToCode(block, 'MSG', Order.ATOMIC) || '[]';
  const tagLen = Number(block.getFieldValue('TAGLEN')) || 16;
  registerAesEcb();
  const fn = registerCcmEncrypt();
  return [fn + '(' + key + ', ' + nonce + ', ' + aad + ', ' + msg + ', ' + tagLen + ')', Order.ATOMIC];
};
