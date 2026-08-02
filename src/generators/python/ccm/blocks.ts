/**
 * CCM 原子块 Python 代码生成器
 * NIST SP 800-38C
 *
 * CCM = CBC-MAC 认证（B0 ‖ 长度编码 AAD ‖ 明文，整串零填充）+ CTR 加密（flags‖nonce‖计数器）。
 * AES-128 块加密复用 symmetric/modes/helpers 的 aes_encrypt_block（registerAesEcb 注册，list→list）。
 */
import { pythonGenerator, Order } from 'blockly/python';
import type { Block } from 'blockly/core';
import { registerAesEcb } from '../symmetric/modes/helpers';

/** 完整 CCM-Encrypt（返回 密文‖标签 字节数组） */
function registerCcmEncrypt(): string {
  return pythonGenerator.provideFunction_('ccm_encrypt', [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(key, nonce, aad, msg, tag_len):',
    '    if len(key) != 16:',
    '        raise ValueError("CCM key must be 16 bytes")',
    '    L = 15 - len(nonce)',
    '    if not (2 <= L <= 8):',
    '        raise ValueError("CCM nonce must be 7-13 bytes")',
    '    flags = (0x40 if aad else 0) | (((tag_len - 2) // 2) << 3) | (L - 1)',
    '    # 格式化数据 B = B0 ‖ A(长度编码) ‖ P，A 段与 P 段各自独立填充到 16 字节边界',
    '    B = bytearray([flags]) + bytearray(nonce) + len(msg).to_bytes(L, "big")',
    '    if aad:',
    '        alen = len(aad)',
    '        if alen < 0xFF00:',
    '            B += alen.to_bytes(2, "big")',
    '        else:',
    '            B += b"\\xff\\xfe" + alen.to_bytes(4, "big")',
    '        B += bytearray(aad)',
    '        while len(B) % 16:  # A 段独立填充到 16 字节边界',
    '            B.append(0)',
    '    B += bytearray(msg)',
    '    while len(B) % 16:  # P 段独立填充到 16 字节边界',
    '        B.append(0)',
    '    # CBC-MAC',
    '    X = bytearray(16)',
    '    for i in range(0, len(B), 16):',
    '        inp = bytes([(X[j] ^ B[i + j]) & 0xFF for j in range(16)])',
    '        X = bytearray(aes_encrypt_block(inp, key))',
    '    # CTR：计数器块 flags 仅含 (L-1)（无 AAD/标签长度位，SP 800-38C A.3）；S0 掩码标签，S1..Sn 加密明文',
    '    cflags = L - 1',
    '    def ctr_block(i):',
    '        b = [cflags] + list(nonce)',
    '        for k in range(L - 1, -1, -1):',
    '            b.append((i >> (8 * k)) & 0xFF)',
    '        return b',
    '    S0 = aes_encrypt_block(ctr_block(0), key)',
    '    out = bytearray()',
    '    n = (len(msg) + 15) // 16',
    '    for i in range(1, n + 1):',
    '        S = aes_encrypt_block(ctr_block(i), key)',
    '        start = (i - 1) * 16',
    '        for j in range(min(16, len(msg) - start)):',
    '            out.append((msg[start + j] ^ S[j]) & 0xFF)',
    '    for t in range(tag_len):',
    '        out.append((X[t] ^ S0[t]) & 0xFF)',
    '    return list(out)',
  ]);
}

pythonGenerator.forBlock['ccm_encrypt'] = function (block: Block): [string, number] {
  const key = pythonGenerator.valueToCode(block, 'KEY', Order.ATOMIC) || '[]';
  const nonce = pythonGenerator.valueToCode(block, 'NONCE', Order.ATOMIC) || '[]';
  const aad = pythonGenerator.valueToCode(block, 'AAD', Order.ATOMIC) || '[]';
  const msg = pythonGenerator.valueToCode(block, 'MSG', Order.ATOMIC) || '[]';
  const tagLen = Number(block.getFieldValue('TAGLEN')) || 16;
  registerAesEcb();
  const fn = registerCcmEncrypt();
  return [fn + '(' + key + ', ' + nonce + ', ' + aad + ', ' + msg + ', ' + tagLen + ')', Order.ATOMIC];
};
