import { pythonGenerator, Order } from 'blockly/python';
import type { Block } from 'blockly/core';
import { registerHexToBytes } from '../data/helpers';

export function registerSm3LengthField(): string {
  return pythonGenerator.provideFunction_('sm3_length_field', [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(byte_length):',
    '    return (byte_length * 8).to_bytes(8, "big")',
  ]);
}

function registerSm3Pad(): string {
  const lengthField = registerSm3LengthField();
  return pythonGenerator.provideFunction_('sm3_pad', [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(msg):',
    '    if isinstance(msg, str):',
    '        msg = msg.encode("utf-8")',
    '    elif isinstance(msg, (list, tuple)):',
    '        if any(isinstance(value, bool) or not isinstance(value, (int, float)) or not 0 <= value <= 255 or int(value) != value for value in msg): raise ValueError("SM3 input must contain byte integers from 0 to 255")',
    '        msg = bytes(int(value) for value in msg)',
    '    elif not isinstance(msg, (bytes, bytearray)):',
    '        raise TypeError("SM3 input must be UTF-8 text or bytes")',
    '    else:',
    '        msg = bytes(msg)',
    '    mlen = len(msg)',
    '    msg += b"\\x80"',
    '    while (len(msg) * 8) % 512 != 448:',
    '        msg += b"\\x00"',
    '    msg += ' + lengthField + '(mlen)',
    '    return msg',
  ]);
}

function registerSm3PadText(): string {
  const pad = registerSm3Pad();
  return pythonGenerator.provideFunction_('sm3_pad_text', [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(text):',
    '    if not isinstance(text, str): raise TypeError("expected UTF-8 text")',
    '    return ' + pad + '(text)',
  ]);
}

pythonGenerator.forBlock['hash_sm3_pad'] = function (
  block: Block,
): [string, number] {
  const input =
    pythonGenerator.valueToCode(block, 'INPUT', Order.ATOMIC) || 'b\'\'';
  return [registerSm3Pad() + '(' + input + ')', Order.ATOMIC];
};

pythonGenerator.forBlock['hash_sm3_pad_text'] = function (
  block: Block,
): [string, number] {
  const input =
    pythonGenerator.valueToCode(block, 'INPUT', Order.ATOMIC) || "''";
  return [registerSm3PadText() + '(' + input + ')', Order.ATOMIC];
};

pythonGenerator.forBlock['hash_sm3_pad_hex'] = function (
  block: Block,
): [string, number] {
  const input =
    pythonGenerator.valueToCode(block, 'INPUT', Order.ATOMIC) || '\'\'';
  const hexToBytes = registerHexToBytes();
  return [registerSm3Pad() + '(' + hexToBytes + '(' + input + '))', Order.ATOMIC];
};

/** SM3 压缩函数 CF（GB/T 32905-2016 §5.3.3），供模板与哈希助手复用 */
export function registerSm3Compress(): string {
  return pythonGenerator.provideFunction_('sm3_compress', [
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
}

/** SM3 哈希（GB/T 32905-2016）：输入 UTF-8 文本或字节，输出 32 字节 */
export function registerSm3Hash(): string {
  const pad = registerSm3Pad();
  const compress = registerSm3Compress();
  return pythonGenerator.provideFunction_('sm3_hash', [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(msg):',
    '    data = ' + pad + '(msg)',
    '    v = [0x7380166f,0x4914b2b9,0x172442d7,0xda8a0600,0xa96f30bc,0x163138aa,0xe38dee4d,0xb0fb0e4e]',
    '    for off in range(0, len(data), 64):',
    '        v = ' + compress + '(v, data[off:off + 64])',
    '    out = []',
    '    for word in v:',
    '        out += [(word >> 24) & 0xFF, (word >> 16) & 0xFF, (word >> 8) & 0xFF, word & 0xFF]',
    '    return out',
  ]);
}

pythonGenerator.forBlock['hash_sm3_compress'] = function (
  block: Block,
): [string, number] {
  const v = pythonGenerator.valueToCode(block, 'V', Order.ATOMIC) || '[]';
  const w = pythonGenerator.valueToCode(block, 'W', Order.ATOMIC) || '[]';
  // 与 JS 生成器对齐：W 输入为填充后的 512-bit 块，W/W' 消息扩展在函数内部完成
  // （旧 Python 版要求外部预计算 W/WP，与 JS 语义不一致——单块官方向量可验证）
  const fn = registerSm3Compress();
  return [fn + '(' + v + ', ' + w + ')', Order.ATOMIC];
};
