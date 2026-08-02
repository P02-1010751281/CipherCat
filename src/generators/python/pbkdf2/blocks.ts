/**
 * PBKDF2 原子块 Python 代码生成器
 * RFC 8018 / SP 800-132（SM3 路径 = GM/T 0091 同构）
 *
 * SHA-256 用 hashlib.pbkdf2_hmac（stdlib）；SM3 内嵌纯 Python（sm3_hmac 与 remaining.ts
 * hash_hmac SM3 分支同体，provideFunction_ 按名去重）。
 */
import { pythonGenerator, Order } from 'blockly/python';
import type { Block } from 'blockly/core';

/** SM3-HMAC（与 hash_hmac SM3 分支完全同体） */
function registerSm3Hmac(): string {
  return pythonGenerator.provideFunction_('sm3_hmac', [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(key,msg):',
    '    def sm3_hash(input):',
    '        if isinstance(input, str):',
    '            input = input.encode("utf-8")',
    '        m = list(input)',
    '        m_len_bits = len(m) * 8',
    '        kk = (448 - m_len_bits - 1) % 512',
    '        if kk < 0:',
    '            kk += 512',
    '        m = m + [0x80] + [0] * (kk // 8) + [0] * 8',
    '        for i in range(4):',
    '            m[-1-i] = (m_len_bits >> (8*i)) & 0xFF',
    '        def rotl(x, n):',
    '            return ((x << n) | (x >> (32 - n))) & 0xFFFFFFFF',
    '        def p0(x):',
    '            return x ^ rotl(x, 9) ^ rotl(x, 17)',
    '        def p1(x):',
    '            return x ^ rotl(x, 15) ^ rotl(x, 23)',
    '        IV = [0x7380166f,0x4914b2b9,0x172442d7,0xda8a0600,0xa96f30bc,0x163138aa,0xe38dee4d,0xb0fb0e4e]',
    '        v = list(IV)',
    '        for off in range(0, len(m), 64):',
    '            b = m[off:off+64]',
    '            w = [0]*68',
    '            for j in range(16):',
    '                w[j] = (b[j*4]<<24) | (b[j*4+1]<<16) | (b[j*4+2]<<8) | b[j*4+3]',
    '            for j in range(16, 68):',
    '                w[j] = (p1(w[j-16]^w[j-9]^rotl(w[j-3],15)) ^ rotl(w[j-13],7) ^ w[j-6]) & 0xFFFFFFFF',
    '            a,b2,c,d,e,f,g,h = v',
    '            for j in range(64):',
    '                if j < 16:',
    '                    ff = a ^ b2 ^ c',
    '                    gg = e ^ f ^ g',
    '                    t = 0x79cc4519',
    '                else:',
    '                    ff = (a & b2) | (a & c) | (b2 & c)',
    '                    gg = (e & f) | ((~e) & g)',
    '                    t = 0x7a879d8a',
    '                ss1 = rotl((rotl(a,12) + e + rotl(t, j % 32)) & 0xFFFFFFFF, 7)',
    '                ss2 = ss1 ^ rotl(a, 12)',
    '                tt1 = (ff + d + ss2 + (w[j] ^ w[j+4])) & 0xFFFFFFFF',
    '                tt2 = (gg + h + ss1 + w[j]) & 0xFFFFFFFF',
    '                d = c',
    '                c = rotl(b2, 9)',
    '                b2 = a',
    '                a = tt1',
    '                h = g',
    '                g = rotl(f, 19)',
    '                f = e',
    '                e = p0(tt2)',
    '            v = [(x ^ y) & 0xFFFFFFFF for x, y in zip(v, [a,b2,c,d,e,f,g,h])]',
    '        out = []',
    '        for x in v:',
    '            out += [(x>>24)&0xFF, (x>>16)&0xFF, (x>>8)&0xFF, x&0xFF]',
    '        return out',
    '    if isinstance(key, str):',
    '        key = key.encode("utf-8")',
    '    if isinstance(msg, str):',
    '        msg = msg.encode("utf-8")',
    '    k = list(key)',
    '    if len(k) > 64:',
    '        k = sm3_hash(k)',
    '    k = k + [0] * (64 - len(k))',
    '    ipad = [x ^ 0x36 for x in k]',
    '    opad = [x ^ 0x5c for x in k]',
    '    return bytes(sm3_hash(opad + sm3_hash(ipad + list(msg))))',
  ]);
}

/** 完整 PBKDF2（PRF 作为参数，返回派生密钥字节列表） */
function registerPbkdf2(): string {
  return pythonGenerator.provideFunction_('pbkdf2', [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(pw, salt, iter, dklen, prf):',
    '    out = bytearray()',
    '    block = 1',
    '    while len(out) < dklen:',
    '        u = list(prf(pw, list(salt) + [(block >> 24) & 0xFF, (block >> 16) & 0xFF, (block >> 8) & 0xFF, block & 0xFF]))',
    '        T = list(u)',
    '        for _ in range(iter - 1):',
    '            u = list(prf(pw, u))',
    '            for j in range(len(T)):',
    '                T[j] ^= u[j]',
    '        for j in range(len(T)):',
    '            if len(out) >= dklen:',
    '                break',
    '            out.append(T[j])',
    '        block += 1',
    '    return list(out)',
  ]);
}

pythonGenerator.forBlock['pbkdf2'] = function (block: Block): [string, number] {
  const pw = pythonGenerator.valueToCode(block, 'PASSWORD', Order.ATOMIC) || '[]';
  const salt = pythonGenerator.valueToCode(block, 'SALT', Order.ATOMIC) || '[]';
  const iter = pythonGenerator.valueToCode(block, 'ITER', Order.ATOMIC) || '1000';
  const keylen = pythonGenerator.valueToCode(block, 'KEYLEN', Order.ATOMIC) || '32';
  const hash = block.getFieldValue('HASH') || 'sha256';
  const fn = registerPbkdf2();
  if (hash === 'sm3') {
    const hmac = registerSm3Hmac();
    return [fn + '(' + pw + ', ' + salt + ', ' + iter + ', ' + keylen + ', ' + hmac + ')', Order.ATOMIC];
  }
  const hmac = pythonGenerator.provideFunction_('pbkdf2_hmac_sha256', [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(key, msg):',
    '    import hashlib, hmac',
    '    return list(hmac.new(bytes(key), bytes(msg), hashlib.sha256).digest())',
  ]);
  return [fn + '(' + pw + ', ' + salt + ', ' + iter + ', ' + keylen + ', ' + hmac + ')', Order.ATOMIC];
};
