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

/** B0（SP 800-38C §A.2）：flags ‖ nonce ‖ 明文长度（L 字节大端） */
function registerCcmB0(): string {
  return pythonGenerator.provideFunction_('ccm_b0', [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(nonce, msg_len, aad_len, tag_len):',
    '    L = 15 - len(nonce)',
    '    if not (2 <= L <= 8):',
    '        raise ValueError("CCM nonce must be 7-13 bytes")',
    '    flags = (0x40 if aad_len else 0) | (((tag_len - 2) // 2) << 3) | (L - 1)',
    '    return [flags] + list(nonce) + list(int(msg_len).to_bytes(L, "big"))',
  ]);
}

/** 计数器块 A_i（SP 800-38C §A.3）：flags(=L−1) ‖ nonce ‖ i（L 字节大端） */
function registerCcmCounterBlock(): string {
  return pythonGenerator.provideFunction_('ccm_counter_block', [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(nonce, i, tag_len):',
    '    L = 15 - len(nonce)',
    '    if not (2 <= L <= 8):',
    '        raise ValueError("CCM nonce must be 7-13 bytes")',
    '    return [L - 1] + list(nonce) + list(int(i).to_bytes(L, "big"))',
  ]);
}

/** 格式化数据 B = B0 ‖ A(长度编码) ‖ P，A 段与 P 段各自独立填充到 16 字节边界 */
function registerCcmFormatted(): string {
  const b0 = registerCcmB0();
  return pythonGenerator.provideFunction_('ccm_formatted', [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(nonce, aad, msg, tag_len):',
    '    B = bytearray(' + b0 + '(nonce, len(msg), len(aad), tag_len))',
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
    '    return list(B)',
  ]);
}

/** CBC-MAC：对格式化数据整串做 CBC-MAC，返回 16 字节 X */
function registerCcmCbcMac(): string {
  const formatted = registerCcmFormatted();
  registerAesEcb();
  return pythonGenerator.provideFunction_('ccm_cbc_mac', [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(key, nonce, aad, msg, tag_len):',
    '    if len(key) != 16:',
    '        raise ValueError("CCM key must be 16 bytes")',
    '    B = ' + formatted + '(nonce, aad, msg, tag_len)',
    '    X = bytearray(16)',
    '    for i in range(0, len(B), 16):',
    '        inp = bytes([(X[j] ^ B[i + j]) & 0xFF for j in range(16)])',
    '        X = bytearray(aes_encrypt_block(inp, key))',
    '    return list(X)',
  ]);
}

/** CTR 部分（SP 800-38C §A.3）：只输出密文，不含标签 */
function registerCcmCtr(): string {
  const counterBlock = registerCcmCounterBlock();
  registerAesEcb();
  return pythonGenerator.provideFunction_('ccm_ctr', [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(key, nonce, msg, tag_len):',
    '    if len(key) != 16:',
    '        raise ValueError("CCM key must be 16 bytes")',
    '    out = bytearray()',
    '    n = (len(msg) + 15) // 16',
    '    for i in range(1, n + 1):',
    '        S = aes_encrypt_block(' + counterBlock + '(nonce, i, tag_len), key)',
    '        start = (i - 1) * 16',
    '        for j in range(min(16, len(msg) - start)):',
    '            out.append((msg[start + j] ^ S[j]) & 0xFF)',
    '    return list(out)',
  ]);
}

/** 完整 CCM-Encrypt（返回 密文‖标签 字节数组） */
function registerCcmEncrypt(): string {
  const cbcMac = registerCcmCbcMac();
  const counterBlock = registerCcmCounterBlock();
  const ctr = registerCcmCtr();
  return pythonGenerator.provideFunction_('ccm_encrypt', [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(key, nonce, aad, msg, tag_len):',
    '    if len(key) != 16:',
    '        raise ValueError("CCM key must be 16 bytes")',
    '    X = bytearray(' + cbcMac + '(key, nonce, aad, msg, tag_len))',
    '    # CTR：计数器块 flags 仅含 (L-1)（无 AAD/标签长度位，SP 800-38C A.3）；S0 掩码标签，S1..Sn 加密明文',
    '    S0 = aes_encrypt_block(' + counterBlock + '(nonce, 0, tag_len), key)',
    '    out = bytearray(' + ctr + '(key, nonce, msg, tag_len))',
    '    for t in range(tag_len):',
    '        out.append((X[t] ^ S0[t]) & 0xFF)',
    '    return list(out)',
  ]);
}

function ccmTagLen(block: Block): number {
  return Number(block.getFieldValue('TAGLEN')) || 16;
}

pythonGenerator.forBlock['ccm_encrypt'] = function (block: Block): [string, number] {
  const key = pythonGenerator.valueToCode(block, 'KEY', Order.ATOMIC) || '[]';
  const nonce = pythonGenerator.valueToCode(block, 'NONCE', Order.ATOMIC) || '[]';
  const aad = pythonGenerator.valueToCode(block, 'AAD', Order.ATOMIC) || '[]';
  const msg = pythonGenerator.valueToCode(block, 'MSG', Order.ATOMIC) || '[]';
  const tagLen = Number(block.getFieldValue('TAGLEN')) || 16;
  registerAesEcb();
  const fn = registerCcmEncrypt();
  return ['bytes(' + fn + '(' + key + ', ' + nonce + ', ' + aad + ', ' + msg + ', ' + tagLen + '))', Order.ATOMIC];
};

pythonGenerator.forBlock['ccm_b0'] = function (block: Block): [string, number] {
  const nonce = pythonGenerator.valueToCode(block, 'NONCE', Order.ATOMIC) || '[]';
  const msgLen = pythonGenerator.valueToCode(block, 'MSGLEN', Order.ATOMIC) || '0';
  const aadLen = pythonGenerator.valueToCode(block, 'AADLEN', Order.ATOMIC) || '0';
  const fn = registerCcmB0();
  return [fn + '(' + nonce + ', ' + msgLen + ', ' + aadLen + ', ' + ccmTagLen(block) + ')', Order.ATOMIC];
};

pythonGenerator.forBlock['ccm_counter_block'] = function (block: Block): [string, number] {
  const nonce = pythonGenerator.valueToCode(block, 'NONCE', Order.ATOMIC) || '[]';
  const index = pythonGenerator.valueToCode(block, 'I', Order.ATOMIC) || '0';
  const fn = registerCcmCounterBlock();
  return [fn + '(' + nonce + ', ' + index + ', ' + ccmTagLen(block) + ')', Order.ATOMIC];
};

pythonGenerator.forBlock['ccm_cbc_mac'] = function (block: Block): [string, number] {
  const key = pythonGenerator.valueToCode(block, 'KEY', Order.ATOMIC) || '[]';
  const nonce = pythonGenerator.valueToCode(block, 'NONCE', Order.ATOMIC) || '[]';
  const aad = pythonGenerator.valueToCode(block, 'AAD', Order.ATOMIC) || '[]';
  const msg = pythonGenerator.valueToCode(block, 'MSG', Order.ATOMIC) || '[]';
  registerAesEcb();
  const fn = registerCcmCbcMac();
  return ['bytes(' + fn + '(' + key + ', ' + nonce + ', ' + aad + ', ' + msg + ', ' + ccmTagLen(block) + '))', Order.ATOMIC];
};

pythonGenerator.forBlock['ccm_ctr'] = function (block: Block): [string, number] {
  const key = pythonGenerator.valueToCode(block, 'KEY', Order.ATOMIC) || '[]';
  const nonce = pythonGenerator.valueToCode(block, 'NONCE', Order.ATOMIC) || '[]';
  const msg = pythonGenerator.valueToCode(block, 'MSG', Order.ATOMIC) || '[]';
  registerAesEcb();
  const fn = registerCcmCtr();
  return ['bytes(' + fn + '(' + key + ', ' + nonce + ', ' + msg + ', ' + ccmTagLen(block) + '))', Order.ATOMIC];
};
