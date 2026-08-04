import { pythonGenerator, Order } from 'blockly/python';
import type { Block } from 'blockly/core';

pythonGenerator.forBlock['gf2m_mul'] = function (block: Block): [string, number] {
  const a = pythonGenerator.valueToCode(block, 'A', Order.ATOMIC) || '[]';
  const b = pythonGenerator.valueToCode(block, 'B', Order.ATOMIC) || '[]';
  const field = block.getFieldValue('FIELD') || 'aes';

  if (field === 'aes') {
    // GF(2^8) AES: irreducible x^8+x^4+x^3+x+1 (0x11B)
    const fn = pythonGenerator.provideFunction_('gf2m_mul_aes', [
      'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(a,b):',
      '    p=0',
      '    for _ in range(8):',
      '        if b&1:p^=a',
      '        hi=a&0x80',
      '        a=(a<<1)&0xFF',
      '        if hi:a^=0x1B',
      '        b>>=1',
      '    return p',
    ]);
    return [fn + '(' + a + '[0],' + b + '[0])', Order.ATOMIC];
  }

  // GCM: GF(2^128) with irreducible x^128+x^7+x^2+x+1
  const fn = pythonGenerator.provideFunction_('gf2m_mul_gcm', [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(a,b):',
    '    z=[0,0,0,0]',
    '    v=list(b)',
    '    for i in range(128):',
    '        if a[i//32]&(1<<(i%32)):',
    '            z[0]^=v[0];z[1]^=v[1];z[2]^=v[2];z[3]^=v[3]',
    '        lsb=v[3]>>31',
    '        v[3]=((v[3]<<1)|(v[2]>>31))&0xFFFFFFFF',
    '        v[2]=((v[2]<<1)|(v[1]>>31))&0xFFFFFFFF',
    '        v[1]=((v[1]<<1)|(v[0]>>31))&0xFFFFFFFF',
    '        v[0]=((v[0]<<1))&0xFFFFFFFF',
    '        if lsb:v[0]^=0xE1',
    '    return z',
  ]);
  return [fn + '(' + a + ',' + b + ')', Order.ATOMIC];
};

/** GF(2^8) AES 扩展欧几里得求逆 */
pythonGenerator.forBlock['gf2m_add'] = function (block: Block): [string, number] {
  const a = pythonGenerator.valueToCode(block, 'A', Order.ATOMIC) || '[]';
  const b = pythonGenerator.valueToCode(block, 'B', Order.ATOMIC) || '[]';
  const field = block.getFieldValue('FIELD') || 'aes';
  if (field === 'aes') {
    return ['(' + a + '[0] ^ ' + b + '[0])', Order.ATOMIC];
  }
  return ['[' + a + '[0] ^ ' + b + '[0], ' + a + '[1] ^ ' + b + '[1], ' + a + '[2] ^ ' + b + '[2], ' + a + '[3] ^ ' + b + '[3]]', Order.ATOMIC];
};

pythonGenerator.forBlock['gf2m_inv'] = function (block: Block): [string, number] {
  const a = pythonGenerator.valueToCode(block, 'A', Order.ATOMIC) || '[]';
  const field = block.getFieldValue('FIELD') || 'aes';
  if (field === 'aes') {
    const fn = pythonGenerator.provideFunction_('gf2m_inv_aes', [
      'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(a):',
      '    if a == 0: return 0',
      '    def deg(x):',
      '        d = -1',
      '        while x:',
      '            x >>= 1; d += 1',
      '        return d',
      '    def mul(x, y):',
      '        p = 0',
      '        for _ in range(8):',
      '            if y & 1: p ^= x',
      '            hi = x & 0x80',
      '            x = (x << 1) & 0xFF',
      '            if hi: x ^= 0x1B',
      '            y >>= 1',
      '        return p',
      '    r0, r1, t0, t1 = 0x11B, a, 0, 1',
      '    while r1 != 0:',
      '        q, r = 0, r0',
      '        sh = deg(r0) - deg(r1)',
      '        while sh >= 0:',
      '            if (r >> (deg(r1) + sh)) & 1:',
      '                q ^= (1 << sh)',
      '                r ^= (r1 << sh)',
      '            sh -= 1',
      '        t2 = t0 ^ mul(q, t1)',
      '        r0, r1, t0, t1 = r1, r, t1, t2',
      '    return t0',
      '',
    ]);
    return ['[' + fn + '(' + a + '[0])]', Order.ATOMIC];
  }
  const fn = pythonGenerator.provideFunction_('gf2m_inv_gcm', [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(a):',
    '    MOD = (1 << 128) ^ (0xE1 << 120)',
    '    A = 0',
    '    for i in range(4): A |= a[i] << (32 * i)',
    '    def deg(x):',
    '        d = -1',
    '        while x:',
    '            x >>= 1; d += 1',
    '        return d',
    '    def mul(x, y):',
    '        p = 0',
    '        for i in range(128):',
    '            if (y >> i) & 1: p ^= x',
    '            hi = (x >> 127) & 1',
    '            x = (x << 1) & ((1 << 128) - 1)',
    '            if hi: x ^= 0xE1',
    '        return p',
    '    r0, r1, t0, t1 = MOD, A, 0, 1',
    '    while r1 != 0:',
    '        q, r = 0, r0',
    '        sh = deg(r0) - deg(r1)',
    '        while sh >= 0:',
    '            if (r >> (deg(r1) + sh)) & 1:',
    '                q ^= (1 << sh)',
    '                r ^= (r1 << sh)',
    '            sh -= 1',
    '        t2 = t0 ^ mul(q, t1)',
    '        r0, r1, t0, t1 = r1, r, t1, t2',
    '    return [(t0 >> (32 * i)) & 0xFFFFFFFF for i in range(4)]',
    '',
  ]);
  return [fn + '(' + a + ')', Order.ATOMIC];
};
