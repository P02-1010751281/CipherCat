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
