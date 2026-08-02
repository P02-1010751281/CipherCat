/**
 * ASCON 原子块 Python 代码生成器
 * NIST SP 800-232 (Ascon-AEAD128)
 *
 * 320 位状态（5×64 位字），rate 128 位（每块 x0‖x1），初始化/终结 12 轮、数据 8 轮；
 * 字节序 little-endian。官方向量：ascon-c 仓 LWC_AEAD_KAT_128_128.txt（1089 例全过）。
 */
import { pythonGenerator, Order } from 'blockly/python';
import type { Block } from 'blockly/core';

/** Ascon 置换（rounds = 12 或 8） */
function registerAsconPermute(): string {
  return pythonGenerator.provideFunction_('ascon_permute', [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(S, rounds):',
    '    MASK = (1 << 64) - 1',
    '    RC = [0xf0, 0xe1, 0xd2, 0xc3, 0xb4, 0xa5, 0x96, 0x87, 0x78, 0x69, 0x5a, 0x4b]',
    '    def rotr(x, n):',
    '        return ((x >> n) | (x << (64 - n))) & MASK',
    '    for r in range(12 - rounds, 12):',
    '        S[2] ^= RC[r]',
    '        S[0] ^= S[4]; S[4] ^= S[3]; S[2] ^= S[1]',
    '        t0 = (~S[0]) & S[1]; t1 = (~S[1]) & S[2]; t2 = (~S[2]) & S[3]',
    '        t3 = (~S[3]) & S[4]; t4 = (~S[4]) & S[0]',
    '        S[0] ^= t1; S[1] ^= t2; S[2] ^= t3; S[3] ^= t4; S[4] ^= t0',
    '        S[1] ^= S[0]; S[0] ^= S[4]; S[3] ^= S[2]; S[2] = (~S[2]) & MASK',
    '        S[0] ^= rotr(S[0], 19) ^ rotr(S[0], 28)',
    '        S[1] ^= rotr(S[1], 61) ^ rotr(S[1], 39)',
    '        S[2] ^= rotr(S[2], 1) ^ rotr(S[2], 6)',
    '        S[3] ^= rotr(S[3], 10) ^ rotr(S[3], 17)',
    '        S[4] ^= rotr(S[4], 7) ^ rotr(S[4], 41)',
  ]);
}

/** 完整 Ascon-AEAD128 加密（返回 密文‖标签 字节列表） */
function registerAsconEncrypt(): string {
  const perm = registerAsconPermute();
  return pythonGenerator.provideFunction_('ascon_encrypt', [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(key, nonce, ad, msg):',
    '    if len(key) != 16 or len(nonce) != 16:',
    '        raise ValueError("Ascon key/nonce must be 16 bytes")',
    '    def w(b):',
    '        return int.from_bytes(bytes(b), "little")',
    '    def pad(x, n):',
    '        return x | (0x01 << (8 * n))',
    '    K0, K1 = w(key[:8]), w(key[8:16])',
    '    S = [0x00001000808C0001, K0, K1, w(nonce[:8]), w(nonce[8:16])]',
    '    ' + perm + '(S, 12)',
    '    S[3] ^= K0; S[4] ^= K1',
    '    if ad:',
    '        i = 0',
    '        while len(ad) - i >= 16:',
    '            S[0] ^= w(ad[i:i + 8]); S[1] ^= w(ad[i + 8:i + 16])',
    '            ' + perm + '(S, 8)',
    '            i += 16',
    '        r = ad[i:]',
    '        if len(r) >= 8:',
    '            S[0] ^= w(r[:8]); S[1] ^= pad(w(r[8:]), len(r) - 8)',
    '        else:',
    '            S[0] ^= pad(w(r), len(r))',
    '        ' + perm + '(S, 8)',
    '    S[4] ^= 0x8000000000000000',
    '    out = bytearray()',
    '    i = 0',
    '    while len(msg) - i >= 16:',
    '        S[0] ^= w(msg[i:i + 8]); S[1] ^= w(msg[i + 8:i + 16])',
    '        out += S[0].to_bytes(8, "little") + S[1].to_bytes(8, "little")',
    '        ' + perm + '(S, 8)',
    '        i += 16',
    '    r = msg[i:]',
    '    if len(r) >= 8:',
    '        S[0] ^= w(r[:8]); S[1] ^= pad(w(r[8:]), len(r) - 8)',
    '        out += S[0].to_bytes(8, "little") + S[1].to_bytes(8, "little")[:len(r) - 8]',
    '    else:',
    '        # 空/短末块也要 PAD（PAD(0)=0x01）',
    '        S[0] ^= pad(w(r), len(r))',
    '        out += S[0].to_bytes(8, "little")[:len(r)]',
    '    S[2] ^= K0; S[3] ^= K1',
    '    ' + perm + '(S, 12)',
    '    S[3] ^= K0; S[4] ^= K1',
    '    out += S[3].to_bytes(8, "little") + S[4].to_bytes(8, "little")',
    '    return list(out)',
  ]);
}

pythonGenerator.forBlock['ascon_encrypt'] = function (block: Block): [string, number] {
  const key = pythonGenerator.valueToCode(block, 'KEY', Order.ATOMIC) || '[]';
  const nonce = pythonGenerator.valueToCode(block, 'NONCE', Order.ATOMIC) || '[]';
  const ad = pythonGenerator.valueToCode(block, 'AD', Order.ATOMIC) || '[]';
  const msg = pythonGenerator.valueToCode(block, 'MSG', Order.ATOMIC) || '[]';
  const fn = registerAsconEncrypt();
  return [fn + '(' + key + ', ' + nonce + ', ' + ad + ', ' + msg + ')', Order.ATOMIC];
};
