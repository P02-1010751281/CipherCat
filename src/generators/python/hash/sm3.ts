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
  const wp = pythonGenerator.valueToCode(block, 'WP', Order.ATOMIC) || '[]';
  const fn = pythonGenerator.provideFunction_('sm3_compress', [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(V, W, WP):',
    '    vw = list(V)',
    '    A,B,C,D,E,F,G,H = vw[0],vw[1],vw[2],vw[3],vw[4],vw[5],vw[6],vw[7]',
    '    for j in range(64):',
    '        T = 0x79cc4519 if j <= 15 else 0x7a879d8a',
    '        A12 = ((A << 12) | (A >> 20)) & 0xFFFFFFFF',
    '        SS1 = ((A12 + E + (((T << (j % 32)) | (T >> (32 - (j % 32)))) & 0xFFFFFFFF)) & 0xFFFFFFFF)',
    '        SS1 = ((SS1 << 7) | (SS1 >> 25)) & 0xFFFFFFFF',
    '        SS2 = SS1 ^ A12',
    '        if j <= 15:',
    '            FF = (A ^ B ^ C) & 0xFFFFFFFF',
    '            GG = (E ^ F ^ G) & 0xFFFFFFFF',
    '        else:',
    '            FF = ((A & B) | (A & C) | (B & C)) & 0xFFFFFFFF',
    '            GG = ((E & F) | ((~E) & G)) & 0xFFFFFFFF',
    '        TT1 = (FF + D + SS2 + WP[j]) & 0xFFFFFFFF',
    '        TT2 = (GG + H + SS1 + W[j]) & 0xFFFFFFFF',
    '        D,C,B,A = C,((B<<9)|(B>>23))&0xFFFFFFFF,B,TT1',
    '        H,G,F,E = G,((F<<19)|(F>>13))&0xFFFFFFFF,F,(TT2 ^ ((TT2<<9)|(TT2>>23)) ^ ((TT2<<17)|(TT2>>15)))&0xFFFFFFFF',
    '    return [(A^vw[0])&0xFFFFFFFF,(B^vw[1])&0xFFFFFFFF,(C^vw[2])&0xFFFFFFFF,(D^vw[3])&0xFFFFFFFF,',
    '            (E^vw[4])&0xFFFFFFFF,(F^vw[5])&0xFFFFFFFF,(G^vw[6])&0xFFFFFFFF,(H^vw[7])&0xFFFFFFFF]',
  ]);
  return [fn + '(' + v + ', ' + w + ', ' + wp + ')', Order.ATOMIC];
};
