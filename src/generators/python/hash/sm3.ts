import { pythonGenerator, Order } from 'blockly/python';
import type { Block } from 'blockly/core';

pythonGenerator.forBlock['hash_sm3_pad'] = function (
  block: Block,
): [string, number] {
  const input =
    pythonGenerator.valueToCode(block, 'INPUT', Order.ATOMIC) || 'b\'\'';
  const fn = pythonGenerator.provideFunction_('sm3_pad', [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(msg):',
    '    if isinstance(msg, str):',
    '        msg = msg.encode("utf-8")',
    '    elif isinstance(msg, list):',
    '        msg = bytes(msg)',
    '    msg = bytes(msg)',
    '    mlen = len(msg) * 8',
    '    msg += b"\\x80"',
    '    while (len(msg) * 8) % 512 != 448:',
    '        msg += b"\\x00"',
    '    msg += mlen.to_bytes(8, "big")',
    '    return msg',
  ]);
  return [fn + '(' + input + ')', Order.ATOMIC];
};

pythonGenerator.forBlock['hash_sm3_pad_text'] =
  pythonGenerator.forBlock['hash_sm3_pad'];

pythonGenerator.forBlock['hash_sm3_pad_hex'] = function (
  block: Block,
): [string, number] {
  const input =
    pythonGenerator.valueToCode(block, 'INPUT', Order.ATOMIC) || '\'\'';
  const fn = pythonGenerator.provideFunction_('sm3_pad_hex', [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(msg):',
    '    if isinstance(msg, bytes):',
    '        data = msg',
    '    elif isinstance(msg, str):',
    '        data = bytes.fromhex(msg)',
    '    elif isinstance(msg, int):',
    '        bl = (msg.bit_length() + 7) // 8',
    '        data = msg.to_bytes(bl, "big")',
    '    else:',
    '        data = bytes(msg)',
    '    mlen = len(data) * 8',
    '    data += b"\\x80"',
    '    while (len(data) * 8) % 512 != 448:',
    '        data += b"\\x00"',
    '    data += mlen.to_bytes(8, "big")',
    '    return data',
  ]);
  return [fn + '(' + input + ')', Order.ATOMIC];
};

pythonGenerator.forBlock['hash_sm3_compress'] = function (
  block: Block,
): [string, number] {
  const v = pythonGenerator.valueToCode(block, 'V', Order.ATOMIC) || '[]';
  const w = pythonGenerator.valueToCode(block, 'W', Order.ATOMIC) || '[]';
  // 与 JS 生成器对齐：W 输入为填充后的 512-bit 块，W/W' 消息扩展在函数内部完成
  // （旧 Python 版要求外部预计算 W/WP，与 JS 语义不一致——单块官方向量可验证）
  const fn = pythonGenerator.provideFunction_('sm3_compress', [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(V, B):',
    '    def rotl(x, n):',
    '        return ((x << n) | (x >> (32 - n))) & 0xFFFFFFFF',
    '    def p0(x):',
    '        return x ^ rotl(x, 9) ^ rotl(x, 17)',
    '    def p1(x):',
    '        return x ^ rotl(x, 15) ^ rotl(x, 23)',
    '    if isinstance(B, (bytes, bytearray)):',
    '        B = list(B)',
    '    W = [0] * 68',
    '    for j in range(16):',
    '        W[j] = ((B[4*j] << 24) | (B[4*j+1] << 16) | (B[4*j+2] << 8) | B[4*j+3]) & 0xFFFFFFFF',
    '    for j in range(16, 68):',
    '        W[j] = (p1(W[j-16] ^ W[j-9] ^ rotl(W[j-3], 15)) ^ rotl(W[j-13], 7) ^ W[j-6]) & 0xFFFFFFFF',
    '    W1 = [W[j] ^ W[j+4] for j in range(64)]',
    '    vw = list(V)',
    '    A,B,C,D,E,F,G,H = vw[0],vw[1],vw[2],vw[3],vw[4],vw[5],vw[6],vw[7]',
    '    for j in range(64):',
    '        T = 0x79cc4519 if j <= 15 else 0x7a879d8a',
    '        A12 = rotl(A, 12)',
    '        SS1 = rotl((A12 + E + rotl(T, j % 32)) & 0xFFFFFFFF, 7)',
    '        SS2 = SS1 ^ A12',
    '        if j <= 15:',
    '            FF = (A ^ B ^ C) & 0xFFFFFFFF',
    '            GG = (E ^ F ^ G) & 0xFFFFFFFF',
    '        else:',
    '            FF = ((A & B) | (A & C) | (B & C)) & 0xFFFFFFFF',
    '            GG = ((E & F) | ((~E) & G)) & 0xFFFFFFFF',
    '        TT1 = (FF + D + SS2 + W1[j]) & 0xFFFFFFFF',
    '        TT2 = (GG + H + SS1 + W[j]) & 0xFFFFFFFF',
    '        D,C,B,A = C,rotl(B,9),A,TT1',
    '        H,G,F,E = G,rotl(F,19),E,(TT2 ^ rotl(TT2,9) ^ rotl(TT2,17)) & 0xFFFFFFFF',
    '    return [(A^vw[0])&0xFFFFFFFF,(B^vw[1])&0xFFFFFFFF,(C^vw[2])&0xFFFFFFFF,(D^vw[3])&0xFFFFFFFF,',
    '            (E^vw[4])&0xFFFFFFFF,(F^vw[5])&0xFFFFFFFF,(G^vw[6])&0xFFFFFFFF,(H^vw[7])&0xFFFFFFFF]',
  ]);
  return [fn + '(' + v + ', ' + w + ')', Order.ATOMIC];
};
