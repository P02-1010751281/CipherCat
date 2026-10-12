/**
 * GCM 原子块 Python 代码生成器
 * NIST SP 800-38D
 *
 * GHASH（GF(2^128) 多项式乘法：右移 V + 进位从 byte15 LSB + 0xE1 异或进 byte0）
 * + GCTR。AES-128 复用 modes/helpers 的 aes_encrypt_block。已核对向量：GCM 规范 Test Case 2/13 + NIST ACVP AES-GCM 官方用例（tagLen=128）。
 */
import { pythonGenerator, Order } from 'blockly/python';
import type { Block } from 'blockly/core';
import { registerAesEcb } from '../symmetric/modes/helpers';

/** GCM GHASH 乘法（MSB-first 位扫描 + V 右移，SP 800-38D Algorithm 1） */
function registerGcmMul(): string {
  return pythonGenerator.provideFunction_('gcm_mul', [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(x, y):',
    '    z = [0] * 16',
    '    v = list(y)',
    '    for i in range(16):',
    '        for j in range(8):',
    '            if x[i] & (1 << (7 - j)):',
    '                for k in range(16):',
    '                    z[k] = (z[k] ^ v[k]) & 0xFF',
    '            carry = v[15] & 1',
    '            for k in range(15, 0, -1):',
    '                v[k] = ((v[k] >> 1) | (v[k - 1] << 7)) & 0xFF',
    '            v[0] = (v[0] >> 1) & 0xFF',
    '            if carry:',
    '                v[0] ^= 0xE1',
    '    return z',
  ]);
}

/** GHASH_H(A, C)：块串联 + 64 位长度块 */
function registerGhash(): string {
  const mul = registerGcmMul();
  return pythonGenerator.provideFunction_('gcm_ghash', [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(h, a, c):',
    '    y = [0] * 16',
    '    for src in (a, c):',
    '        for i in range(0, len(src), 16):',
    '            blk = list(src[i:i + 16]) + [0] * (16 - min(16, len(src) - i))',
    '            blk = blk[:16]',
    '            for j in range(16):',
    '                blk[j] = (blk[j] ^ y[j]) & 0xFF',
    '            y = ' + mul + '(blk, h)',
    '    la = len(a) * 8',
    '    lc = len(c) * 8',
    '    lenblk = list(la.to_bytes(8, "big")) + list(lc.to_bytes(8, "big"))',
    '    for j in range(16):',
    '        lenblk[j] = (lenblk[j] ^ y[j]) & 0xFF',
    '    return ' + mul + '(lenblk, h)',
  ]);
}

/** inc32（SP 800-38D §6.2）：只递增最右 32 位 */
function registerGcmInc32(): string {
  return pythonGenerator.provideFunction_('gcm_inc32', [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(x):',
    '    b = list(x)',
    '    for i in range(len(b) - 1, max(len(b) - 5, -1), -1):',
    '        b[i] = (b[i] + 1) & 0xFF',
    '        if b[i] != 0:',
    '            break',
    '    return b',
  ]);
}

/** J0（SP 800-38D §7.1 Step 1）：96 位 IV 直接拼接，否则 GHASH 派生 */
function registerGcmJ0(): string {
  const ghash = registerGhash();
  return pythonGenerator.provideFunction_('gcm_j0', [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(h, iv):',
    '    if len(iv) == 12:',
    '        return list(iv) + [0, 0, 0, 1]',
    '    return ' + ghash + '(h, [], list(iv))',
  ]);
}

/** GCTR（SP 800-38D Algorithm 3）：AES-128 计数器模式 */
function registerGcmGctr(): string {
  const inc32 = registerGcmInc32();
  registerAesEcb();
  return pythonGenerator.provideFunction_('gcm_gctr', [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(key, icb, x):',
    '    if len(key) != 16:',
    '        raise ValueError("GCM-AES-128 key must be 16 bytes")',
    '    out = bytearray()',
    '    cb = list(icb)',
    '    for i in range(0, len(x), 16):',
    '        s = aes_encrypt_block(cb, key)',
    '        for j in range(min(16, len(x) - i)):',
    '            out.append((x[i + j] ^ s[j]) & 0xFF)',
    '        cb = ' + inc32 + '(cb)',
    '    return list(out)',
  ]);
}

/** 完整 GCM-Encrypt（返回 密文‖标签 字节列表） */
function registerGcmEncrypt(): string {
  const ghash = registerGhash();
  const j0 = registerGcmJ0();
  const gctr = registerGcmGctr();
  const inc32 = registerGcmInc32();
  return pythonGenerator.provideFunction_('gcm_encrypt', [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(key, iv, aad, msg):',
    '    H = aes_encrypt_block([0] * 16, key)',
    '    J0 = ' + j0 + '(H, list(iv))',
    '    ct = bytearray(' + gctr + '(key, ' + inc32 + '(J0), msg))',
    '    S = ' + ghash + '(H, list(aad), list(ct))',
    '    s0 = aes_encrypt_block(J0, key)',
    '    for t in range(16):',
    '        ct.append((S[t] ^ s0[t]) & 0xFF)',
    '    return list(ct)',
  ]);
}

pythonGenerator.forBlock['gcm_encrypt'] = function (block: Block): [string, number] {
  const key = pythonGenerator.valueToCode(block, 'KEY', Order.ATOMIC) || '[]';
  const iv = pythonGenerator.valueToCode(block, 'IV', Order.ATOMIC) || '[]';
  const aad = pythonGenerator.valueToCode(block, 'AAD', Order.ATOMIC) || '[]';
  const msg = pythonGenerator.valueToCode(block, 'MSG', Order.ATOMIC) || '[]';
  registerAesEcb();
  const fn = registerGcmEncrypt();
  return ['bytes(' + fn + '(' + key + ', ' + iv + ', ' + aad + ', ' + msg + '))', Order.ATOMIC];
};

pythonGenerator.forBlock['gcm_gf128_mul'] = function (block: Block): [string, number] {
  const x = pythonGenerator.valueToCode(block, 'X', Order.ATOMIC) || '[]';
  const y = pythonGenerator.valueToCode(block, 'Y', Order.ATOMIC) || '[]';
  const fn = registerGcmMul();
  return [fn + '(' + x + ', ' + y + ')', Order.ATOMIC];
};

pythonGenerator.forBlock['gcm_ghash'] = function (block: Block): [string, number] {
  const h = pythonGenerator.valueToCode(block, 'H', Order.ATOMIC) || '[]';
  const a = pythonGenerator.valueToCode(block, 'A', Order.ATOMIC) || '[]';
  const c = pythonGenerator.valueToCode(block, 'C', Order.ATOMIC) || '[]';
  const fn = registerGhash();
  return [fn + '(' + h + ', ' + a + ', ' + c + ')', Order.ATOMIC];
};

pythonGenerator.forBlock['gcm_gctr'] = function (block: Block): [string, number] {
  const key = pythonGenerator.valueToCode(block, 'KEY', Order.ATOMIC) || '[]';
  const icb = pythonGenerator.valueToCode(block, 'ICB', Order.ATOMIC) || '[]';
  const x = pythonGenerator.valueToCode(block, 'X', Order.ATOMIC) || '[]';
  const fn = registerGcmGctr();
  return ['bytes(' + fn + '(' + key + ', ' + icb + ', ' + x + '))', Order.ATOMIC];
};

pythonGenerator.forBlock['gcm_inc32'] = function (block: Block): [string, number] {
  const x = pythonGenerator.valueToCode(block, 'X', Order.ATOMIC) || '[]';
  const fn = registerGcmInc32();
  return [fn + '(' + x + ')', Order.ATOMIC];
};

pythonGenerator.forBlock['gcm_j0'] = function (block: Block): [string, number] {
  const h = pythonGenerator.valueToCode(block, 'H', Order.ATOMIC) || '[]';
  const iv = pythonGenerator.valueToCode(block, 'IV', Order.ATOMIC) || '[]';
  const fn = registerGcmJ0();
  return [fn + '(' + h + ', ' + iv + ')', Order.ATOMIC];
};
