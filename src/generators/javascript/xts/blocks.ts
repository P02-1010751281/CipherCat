/**
 * XTS 原子块 JavaScript 代码生成器
 * NIST SP 800-38E
 *
 * XTS = T = E_K2(tweak)·α^i（tweak 逐块乘 α）+ C_i = E_K1(P_i ⊕ T) ⊕ T。
 * AES-128 块加密复用 symmetric/modes/helpers 的 aesEncryptBlock（registerAesEcb 注册）。
 * 支持末尾部分块的 ciphertext stealing，且限制数据单元不超过 2^20 个 AES 块。
 * 注意：α 乘法是 GF(2^128) little-endian 进位（字节 15 进位、0x87 异或进字节 0），
 * 与 CMAC 的 K1/K2 加倍（big-endian）字节序相反，不能复用。
 */
import { javascriptGenerator, Order } from 'blockly/javascript';
import type { Block } from 'blockly/core';
import { registerAesEcb } from '../symmetric/modes/helpers';

/** XTS tweak ×α：GF(2^128) 乘 x（little-endian：字节 15 最高位进位，0x87 异或进字节 0） */
function registerXtsTweakMul(): string {
  return javascriptGenerator.provideFunction_('xtsTweakMul', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(t) {',
    '  var msb = t[15] & 0x80;',
    '  var out = [(t[0] << 1) & 0xFF];',
    '  for (var i = 1; i < 16; i++) out.push(((t[i] << 1) | (t[i - 1] >> 7)) & 0xFF);',
    '  if (msb) out[0] ^= 0x87;',
    '  return out;',
    '}',
  ]);
}

/** 完整 XTS-Encrypt（XTS-AES-128，返回密文字节数组） */
function registerXtsEncrypt(): string {
  const mul = registerXtsTweakMul();
  return javascriptGenerator.provideFunction_('xtsEncrypt', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(key, tweak, data) {',
    '  if (key.length !== 32) throw new Error("XTS-AES-128 key must be 32 bytes (K1||K2)");',
    '  var sameKey = true;',
    '  for (var i = 0; i < 16; i++) if (key[i] !== key[i + 16]) { sameKey = false; break; }',
    '  if (sameKey) throw new Error("XTS keys K1 and K2 must be distinct");',
    '  if (tweak.length !== 16) throw new Error("XTS tweak must be 16 bytes");',
    '  if (data.length < 16 || data.length > 16777216) throw new Error("XTS data unit must be 16 bytes to 16 MiB");',
    '  var K1 = key.slice(0, 16), K2 = key.slice(16);',
    '  var T = aesEncryptBlock(tweak, K2);',
    '  var out = [];',
    '  var fullBlocks = Math.floor(data.length / 16), tailLen = data.length % 16;',
    '  var normalBlocks = tailLen === 0 ? fullBlocks : fullBlocks - 1;',
    '  for (var blockIndex = 0; blockIndex < normalBlocks; blockIndex++) {',
    '    var pp = [];',
    '    for (var j = 0; j < 16; j++) pp.push((data[blockIndex * 16 + j] ^ T[j]) & 0xFF);',
    '    var cc = aesEncryptBlock(pp, K1);',
    '    for (var j2 = 0; j2 < 16; j2++) out.push((cc[j2] ^ T[j2]) & 0xFF);',
    '    T = ' + mul + '(T);',
    '  }',
    '  if (tailLen > 0) {',
    '    var start = fullBlocks * 16, pp = [], stolen = [];',
    '    for (var j3 = 0; j3 < 16; j3++) pp.push((data[start - 16 + j3] ^ T[j3]) & 0xFF);',
    '    var cc = aesEncryptBlock(pp, K1);',
    '    for (var j4 = 0; j4 < 16; j4++) stolen.push((cc[j4] ^ T[j4]) & 0xFF);',
    '    pp = data.slice(start).concat(stolen.slice(tailLen));',
    '    T = ' + mul + '(T);',
    '    for (var j5 = 0; j5 < 16; j5++) pp[j5] = (pp[j5] ^ T[j5]) & 0xFF;',
    '    cc = aesEncryptBlock(pp, K1);',
    '    for (var j6 = 0; j6 < 16; j6++) out.push((cc[j6] ^ T[j6]) & 0xFF);',
    '    out.push(...stolen.slice(0, tailLen));',
    '  }',
    '  return out;',
    '}',
  ]);
}

javascriptGenerator.forBlock['xts_encrypt'] = function (block: Block): [string, number] {
  const key = javascriptGenerator.valueToCode(block, 'KEY', Order.ATOMIC) || '[]';
  const tweak = javascriptGenerator.valueToCode(block, 'TWEAK', Order.ATOMIC) || '[]';
  const msg = javascriptGenerator.valueToCode(block, 'MSG', Order.ATOMIC) || '[]';
  registerAesEcb();
  const fn = registerXtsEncrypt();
  return ['Uint8Array.from(' + fn + '(' + key + ', ' + tweak + ', ' + msg + '))', Order.ATOMIC];
};

javascriptGenerator.forBlock['xts_tweak_mul'] = function (block: Block): [string, number] {
  const t = javascriptGenerator.valueToCode(block, 'TWEAK', Order.ATOMIC) || '[]';
  const fn = registerXtsTweakMul();
  return [fn + '(' + t + ')', Order.ATOMIC];
};
