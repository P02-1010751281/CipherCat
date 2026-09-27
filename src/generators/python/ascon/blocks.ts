/**
 * ASCON 原子块 Python 代码生成器
 * NIST SP 800-232 (Ascon-AEAD128)
 *
 * 320 位状态（5×64 位字），rate 128 位（每块 x0‖x1），初始化/终结 12 轮、数据 8 轮；
 * 字节序 little-endian。官方向量：ascon-c 仓 LWC_AEAD_KAT_128_128.txt（1089 例全过）。
 */
import { pythonGenerator, Order } from 'blockly/python';
import type { Block } from 'blockly/core';

const MAX_ASCON_OUTPUT_BYTES = 1024 * 1024;

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

/** Ascon-AEAD128 解密并拒绝错误标签。 */
function registerAsconDecrypt(): string {
  const perm = registerAsconPermute();
  return pythonGenerator.provideFunction_('ascon_decrypt', [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(key, nonce, ad, ct_tag):',
    '    if len(key) != 16 or len(nonce) != 16 or len(ct_tag) < 16:',
    '        raise ValueError("Ascon key/nonce/ciphertext length is invalid")',
    '    def w(b): return int.from_bytes(bytes(b), "little")',
    '    def pad(x, n): return x | (0x01 << (8 * n))',
    '    K0, K1 = w(key[:8]), w(key[8:16])',
    '    S = [0x00001000808C0001, K0, K1, w(nonce[:8]), w(nonce[8:16])]',
    '    ' + perm + '(S, 12); S[3] ^= K0; S[4] ^= K1',
    '    if ad:',
    '        i = 0',
    '        while len(ad) - i >= 16:',
    '            S[0] ^= w(ad[i:i + 8]); S[1] ^= w(ad[i + 8:i + 16]); ' + perm + '(S, 8); i += 16',
    '        r = ad[i:]',
    '        if len(r) >= 8: S[0] ^= w(r[:8]); S[1] ^= pad(w(r[8:]), len(r) - 8)',
    '        else: S[0] ^= pad(w(r), len(r))',
    '        ' + perm + '(S, 8)',
    '    S[4] ^= 0x8000000000000000',
    '    ciphertext, tag = list(ct_tag[:-16]), list(ct_tag[-16:])',
    '    out = bytearray(); i = 0',
    '    while len(ciphertext) - i >= 16:',
    '        c0, c1 = w(ciphertext[i:i + 8]), w(ciphertext[i + 8:i + 16])',
    '        out += (S[0] ^ c0).to_bytes(8, "little") + (S[1] ^ c1).to_bytes(8, "little")',
    '        S[0] = c0; S[1] = c1; ' + perm + '(S, 8); i += 16',
    '    r = ciphertext[i:]',
    '    if len(r) >= 8:',
    '        c0 = w(r[:8]); out += (S[0] ^ c0).to_bytes(8, "little"); S[0] = c0',
    '        n = len(r) - 8; mask = (1 << (8 * n)) - 1; c1 = w(r[8:])',
    '        out += ((S[1] ^ c1) & mask).to_bytes(8, "little")[:n]; S[1] = (S[1] & ~mask) | (c1 & mask); S[1] ^= 0x01 << (8 * n)',
    '    else:',
    '        n = len(r); mask = (1 << (8 * n)) - 1; c0 = w(r)',
    '        out += ((S[0] ^ c0) & mask).to_bytes(8, "little")[:n]; S[0] = (S[0] & ~mask) | (c0 & mask); S[0] ^= 0x01 << (8 * n)',
    '    S[2] ^= K0; S[3] ^= K1; ' + perm + '(S, 12); S[3] ^= K0; S[4] ^= K1',
    '    expected = S[3].to_bytes(8, "little") + S[4].to_bytes(8, "little"); bad = 0',
    '    for a, b in zip(tag, expected): bad |= a ^ b',
    '    if bad != 0: raise ValueError("Ascon authentication failed")',
    '    return list(out)',
  ]);
}

/** Ascon-Hash256 / XOF128 / CXOF128，输出长度单位为字节。 */
function registerAsconHashXof(): string {
  const perm = registerAsconPermute();
  return pythonGenerator.provideFunction_('ascon_hash_xof', [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(msg, out_len, custom, iv):',
    '    if type(out_len) not in (int, float) or (type(out_len) is float and not out_len.is_integer()): raise ValueError("Ascon output length must be an integer")',
    '    out_len = int(out_len)',
    '    if not 1 <= out_len <= ' + MAX_ASCON_OUTPUT_BYTES + ': raise ValueError("Ascon output length must be from 1 to 1048576 bytes")',
    '    if custom is not None and len(custom) > 256: raise ValueError("Ascon customization is at most 256 bytes")',
    '    def w(b): return int.from_bytes(bytes(b), "little")',
    '    def pad(x, n): return x | (0x01 << (8 * n))',
    '    S = [iv, 0, 0, 0, 0]; ' + perm + '(S, 12)',
    '    def absorb(data):',
    '        i = 0',
    '        while len(data) - i >= 8: S[0] ^= w(data[i:i + 8]); ' + perm + '(S, 12); i += 8',
    '        S[0] ^= pad(w(data[i:]), len(data) - i); ' + perm + '(S, 12)',
    '    if custom is not None: S[0] ^= len(custom) * 8; ' + perm + '(S, 12); absorb(custom)',
    '    absorb(msg)',
    '    out = bytearray()',
    '    while len(out) < out_len:',
    '        out += S[0].to_bytes(8, "little")',
    '        if len(out) < out_len: ' + perm + '(S, 12)',
    '    return list(out[:out_len])',
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

pythonGenerator.forBlock['ascon_decrypt'] = function (block: Block): [string, number] {
  const key = pythonGenerator.valueToCode(block, 'KEY', Order.ATOMIC) || '[]';
  const nonce = pythonGenerator.valueToCode(block, 'NONCE', Order.ATOMIC) || '[]';
  const ad = pythonGenerator.valueToCode(block, 'AD', Order.ATOMIC) || '[]';
  const ct = pythonGenerator.valueToCode(block, 'CT', Order.ATOMIC) || '[]';
  const fn = registerAsconDecrypt();
  return [fn + '(' + key + ', ' + nonce + ', ' + ad + ', ' + ct + ')', Order.ATOMIC];
};

pythonGenerator.forBlock['ascon_hash256'] = function (block: Block): [string, number] {
  const msg = pythonGenerator.valueToCode(block, 'MSG', Order.ATOMIC) || '[]';
  const fn = registerAsconHashXof();
  return [fn + '(' + msg + ', 32, None, 0x0000080100CC0002)', Order.ATOMIC];
};

pythonGenerator.forBlock['ascon_xof128'] = function (block: Block): [string, number] {
  const msg = pythonGenerator.valueToCode(block, 'MSG', Order.ATOMIC) || '[]';
  const len = pythonGenerator.valueToCode(block, 'LEN', Order.ATOMIC) || '0';
  const fn = registerAsconHashXof();
  return [fn + '(' + msg + ', ' + len + ', None, 0x0000080000CC0003)', Order.ATOMIC];
};

pythonGenerator.forBlock['ascon_cxof128'] = function (block: Block): [string, number] {
  const msg = pythonGenerator.valueToCode(block, 'MSG', Order.ATOMIC) || '[]';
  const custom = pythonGenerator.valueToCode(block, 'CUSTOM', Order.ATOMIC) || '[]';
  const len = pythonGenerator.valueToCode(block, 'LEN', Order.ATOMIC) || '0';
  const fn = registerAsconHashXof();
  return [fn + '(' + msg + ', ' + len + ', ' + custom + ', 0x0000080000CC0004)', Order.ATOMIC];
};
