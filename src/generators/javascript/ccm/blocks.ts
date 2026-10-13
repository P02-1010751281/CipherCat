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

/** B0（SP 800-38C §A.2）：flags ‖ nonce ‖ 明文长度（L 字节大端） */
function registerCcmB0(): string {
  return javascriptGenerator.provideFunction_('ccmB0', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(nonce, msgLen, aadLen, tagLen) {',
    '  var L = 15 - nonce.length;',
    '  if (L < 2 || L > 8) throw new Error("CCM nonce must be 7-13 bytes");',
    '  var flags = (aadLen > 0 ? 0x40 : 0) | (((tagLen - 2) / 2) << 3) | (L - 1);',
    '  var B = [flags].concat(nonce);',
    '  // 注意：q >>> (8*bi) 在 bi>=4 时位移回绕，必须用 Math.floor 除法',
    '  for (var bi = L - 1; bi >= 0; bi--) B.push(Math.floor(msgLen / Math.pow(2, 8 * bi)) & 0xFF);',
    '  return B;',
    '}',
  ]);
}

/** 计数器块 A_i（SP 800-38C §A.3）：flags(=L−1) ‖ nonce ‖ i（L 字节大端） */
function registerCcmCounterBlock(): string {
  return javascriptGenerator.provideFunction_('ccmCounterBlock', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(nonce, i, tagLen) {',
    '  var L = 15 - nonce.length;',
    '  if (L < 2 || L > 8) throw new Error("CCM nonce must be 7-13 bytes");',
    '  return ' + registerCcmCtrBlock() + '(L - 1, nonce, L, i);',
    '}',
  ]);
}

/** 格式化数据 B = B0 ‖ A(长度编码) ‖ P，A 段与 P 段各自独立填充到 16 字节边界 */
function registerCcmFormatted(): string {
  const b0 = registerCcmB0();
  return javascriptGenerator.provideFunction_('ccmFormatted', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(nonce, aad, msg, tagLen) {',
    '  var B = ' + b0 + '(nonce, msg.length, aad.length, tagLen);',
    '  if (aad.length > 0) {',
    '    var alen = aad.length;',
    '    if (alen < 0xFF00) B.push((alen >> 8) & 0xFF, alen & 0xFF);',
    '    else B.push(0xFF, 0xFE, (alen >>> 24) & 0xFF, (alen >>> 16) & 0xFF, (alen >>> 8) & 0xFF, alen & 0xFF);',
    '    for (var ai = 0; ai < aad.length; ai++) B.push(aad[ai]);',
    '    while (B.length % 16 !== 0) B.push(0);',
    '  }',
    '  for (var pi = 0; pi < msg.length; pi++) B.push(msg[pi]);',
    '  while (B.length % 16 !== 0) B.push(0);',
    '  return B;',
    '}',
  ]);
}

/** CBC-MAC：对格式化数据整串做 CBC-MAC，返回 16 字节 X */
function registerCcmCbcMac(): string {
  const formatted = registerCcmFormatted();
  registerAesEcb();
  return javascriptGenerator.provideFunction_('ccmCbcMac', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(key, nonce, aad, msg, tagLen) {',
    '  if (key.length !== 16) throw new Error("CCM key must be 16 bytes");',
    '  var B = ' + formatted + '(nonce, aad, msg, tagLen);',
    '  // CBC-MAC',
    '  var X = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];',
    '  for (var i = 0; i < B.length; i += 16) {',
    '    var xin = [];',
    '    for (var j = 0; j < 16; j++) xin.push((X[j] ^ B[i + j]) & 0xFF);',
    '    X = aesEncryptBlock(xin, key);',
    '  }',
    '  return X;',
    '}',
  ]);
}

/** CTR 部分（SP 800-38C §A.3）：只输出密文，不含标签 */
function registerCcmCtr(): string {
  const counterBlock = registerCcmCounterBlock();
  registerAesEcb();
  return javascriptGenerator.provideFunction_('ccmCtr', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(key, nonce, msg, tagLen) {',
    '  if (key.length !== 16) throw new Error("CCM key must be 16 bytes");',
    '  var out = [];',
    '  var nBlocks = Math.ceil(msg.length / 16);',
    '  for (var i2 = 1; i2 <= nBlocks; i2++) {',
    '    var S = aesEncryptBlock(' + counterBlock + '(nonce, i2, tagLen), key);',
    '    var start = (i2 - 1) * 16;',
    '    for (var j2 = 0; j2 < 16 && start + j2 < msg.length; j2++) out.push((msg[start + j2] ^ S[j2]) & 0xFF);',
    '  }',
    '  return out;',
    '}',
  ]);
}

/** 完整 CCM-Encrypt（返回 密文‖标签 字节数组） */
function registerCcmEncrypt(): string {
  const cbcMac = registerCcmCbcMac();
  const counterBlock = registerCcmCounterBlock();
  const ctr = registerCcmCtr();
  return javascriptGenerator.provideFunction_('ccmEncrypt', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(key, nonce, aad, msg, tagLen) {',
    '  if (key.length !== 16) throw new Error("CCM key must be 16 bytes");',
    '  var L = 15 - nonce.length;',
    '  if (L < 2 || L > 8) throw new Error("CCM nonce must be 7-13 bytes");',
    '  var X = ' + cbcMac + '(key, nonce, aad, msg, tagLen);',
    '  // CTR：计数器块 flags 仅含 (L-1)（无 AAD/标签长度位，SP 800-38C A.3）；S0 掩码标签，S1..Sn 加密明文',
    '  var S0 = aesEncryptBlock(' + counterBlock + '(nonce, 0, tagLen), key);',
    '  var out = ' + ctr + '(key, nonce, msg, tagLen);',
    '  for (var t = 0; t < tagLen; t++) out.push((X[t] ^ S0[t]) & 0xFF);',
    '  return out;',
    '}',
  ]);
}

function ccmTagLen(block: Block): number {
  return Number(block.getFieldValue('TAGLEN')) || 16;
}

javascriptGenerator.forBlock['ccm_encrypt'] = function (block: Block): [string, number] {
  const key = javascriptGenerator.valueToCode(block, 'KEY', Order.ATOMIC) || '[]';
  const nonce = javascriptGenerator.valueToCode(block, 'NONCE', Order.ATOMIC) || '[]';
  const aad = javascriptGenerator.valueToCode(block, 'AAD', Order.ATOMIC) || '[]';
  const msg = javascriptGenerator.valueToCode(block, 'MSG', Order.ATOMIC) || '[]';
  const tagLen = Number(block.getFieldValue('TAGLEN')) || 16;
  registerAesEcb();
  const fn = registerCcmEncrypt();
  return ['Uint8Array.from(' + fn + '(' + key + ', ' + nonce + ', ' + aad + ', ' + msg + ', ' + tagLen + '))', Order.ATOMIC];
};

javascriptGenerator.forBlock['ccm_b0'] = function (block: Block): [string, number] {
  const nonce = javascriptGenerator.valueToCode(block, 'NONCE', Order.ATOMIC) || '[]';
  const msgLen = javascriptGenerator.valueToCode(block, 'MSGLEN', Order.ATOMIC) || '0';
  const aadLen = javascriptGenerator.valueToCode(block, 'AADLEN', Order.ATOMIC) || '0';
  const fn = registerCcmB0();
  return [fn + '(' + nonce + ', ' + msgLen + ', ' + aadLen + ', ' + ccmTagLen(block) + ')', Order.ATOMIC];
};

javascriptGenerator.forBlock['ccm_counter_block'] = function (block: Block): [string, number] {
  const nonce = javascriptGenerator.valueToCode(block, 'NONCE', Order.ATOMIC) || '[]';
  const index = javascriptGenerator.valueToCode(block, 'I', Order.ATOMIC) || '0';
  const fn = registerCcmCounterBlock();
  return [fn + '(' + nonce + ', ' + index + ', ' + ccmTagLen(block) + ')', Order.ATOMIC];
};

javascriptGenerator.forBlock['ccm_cbc_mac'] = function (block: Block): [string, number] {
  const key = javascriptGenerator.valueToCode(block, 'KEY', Order.ATOMIC) || '[]';
  const nonce = javascriptGenerator.valueToCode(block, 'NONCE', Order.ATOMIC) || '[]';
  const aad = javascriptGenerator.valueToCode(block, 'AAD', Order.ATOMIC) || '[]';
  const msg = javascriptGenerator.valueToCode(block, 'MSG', Order.ATOMIC) || '[]';
  registerAesEcb();
  const fn = registerCcmCbcMac();
  return ['Uint8Array.from(' + fn + '(' + key + ', ' + nonce + ', ' + aad + ', ' + msg + ', ' + ccmTagLen(block) + '))', Order.ATOMIC];
};

javascriptGenerator.forBlock['ccm_ctr'] = function (block: Block): [string, number] {
  const key = javascriptGenerator.valueToCode(block, 'KEY', Order.ATOMIC) || '[]';
  const nonce = javascriptGenerator.valueToCode(block, 'NONCE', Order.ATOMIC) || '[]';
  const msg = javascriptGenerator.valueToCode(block, 'MSG', Order.ATOMIC) || '[]';
  registerAesEcb();
  const fn = registerCcmCtr();
  return ['Uint8Array.from(' + fn + '(' + key + ', ' + nonce + ', ' + msg + ', ' + ccmTagLen(block) + '))', Order.ATOMIC];
};

/** AAD 长度编码（SP 800-38C §A.2.2） */
function registerCcmAadLenPrefix(): string {
  return javascriptGenerator.provideFunction_('ccmAadLenPrefix', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(aadLen) {',
    '  if (!Number.isSafeInteger(aadLen) || aadLen < 0 || aadLen >= 4294967296) throw new Error("CCM AAD length must be an integer from 0 to 2^32-1");',
    '  if (aadLen < 0xFF00) return [(aadLen >> 8) & 0xFF, aadLen & 0xFF];',
    '  return [0xFF, 0xFE, Math.floor(aadLen / 16777216) & 0xFF, (aadLen >>> 16) & 0xFF, (aadLen >>> 8) & 0xFF, aadLen & 0xFF];',
    '}',
  ]);
}

javascriptGenerator.forBlock['ccm_aad_len_prefix'] = function (block: Block): [string, number] {
  const aadLen = javascriptGenerator.valueToCode(block, 'AADLEN', Order.ATOMIC) || '0';
  const fn = registerCcmAadLenPrefix();
  return [fn + '(' + aadLen + ')', Order.ATOMIC];
};
