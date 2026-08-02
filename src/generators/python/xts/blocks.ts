/**
 * XTS 原子块 Python 代码生成器
 * NIST SP 800-38E
 *
 * XTS = T = E_K2(tweak)·α^i（tweak 逐块乘 α）+ C_i = E_K1(P_i ⊕ T) ⊕ T。
 * AES-128 块加密复用 symmetric/modes/helpers 的 aes_encrypt_block（registerAesEcb 注册，list→list）。
 * 注意：α 乘法是 GF(2^128) little-endian 进位（字节 15 进位、0x87 异或进字节 0），
 * 与 CMAC 的 K1/K2 加倍（big-endian）字节序相反，不能复用。
 */
import { pythonGenerator, Order } from 'blockly/python';
import type { Block } from 'blockly/core';
import { registerAesEcb } from '../symmetric/modes/helpers';

/** XTS tweak ×α：GF(2^128) 乘 x（little-endian） */
function registerXtsTweakMul(): string {
  return pythonGenerator.provideFunction_('xts_tweak_mul', [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(t):',
    '    msb = t[15] & 0x80',
    '    out = [(t[0] << 1) & 0xFF]',
    '    for i in range(1, 16):',
    '        out.append(((t[i] << 1) | (t[i - 1] >> 7)) & 0xFF)',
    '    if msb:',
    '        out[0] ^= 0x87',
    '    return out',
  ]);
}

/** 完整 XTS-Encrypt（XTS-AES-128，返回密文字节数组） */
function registerXtsEncrypt(): string {
  const mul = registerXtsTweakMul();
  return pythonGenerator.provideFunction_('xts_encrypt', [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(key, tweak, data):',
    '    if len(key) != 32:',
    '        raise ValueError("XTS-AES-128 key must be 32 bytes (K1||K2)")',
    '    if len(tweak) != 16:',
    '        raise ValueError("XTS tweak must be 16 bytes")',
    '    if not data or len(data) % 16:',
    '        raise ValueError("XTS data must be non-empty multiple of 16")',
    '    K1, K2 = key[:16], key[16:]',
    '    T = aes_encrypt_block(tweak, K2)',
    '    out = bytearray()',
    '    for i in range(0, len(data), 16):',
    '        blk = data[i:i + 16]',
    '        pp = bytes([(blk[j] ^ T[j]) & 0xFF for j in range(16)])',
    '        cc = aes_encrypt_block(pp, K1)',
    '        for j in range(16):',
    '            out.append((cc[j] ^ T[j]) & 0xFF)',
    '        T = ' + mul + '(T)',
    '    return list(out)',
  ]);
}

pythonGenerator.forBlock['xts_encrypt'] = function (block: Block): [string, number] {
  const key = pythonGenerator.valueToCode(block, 'KEY', Order.ATOMIC) || '[]';
  const tweak = pythonGenerator.valueToCode(block, 'TWEAK', Order.ATOMIC) || '[]';
  const msg = pythonGenerator.valueToCode(block, 'MSG', Order.ATOMIC) || '[]';
  registerAesEcb();
  const fn = registerXtsEncrypt();
  return [fn + '(' + key + ', ' + tweak + ', ' + msg + ')', Order.ATOMIC];
};
