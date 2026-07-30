import { javascriptGenerator, Order } from 'blockly/javascript';
import type { Block } from 'blockly/core';

javascriptGenerator.forBlock['gf2m_mul'] = function (block: Block): [string, number] {
  const a = javascriptGenerator.valueToCode(block, 'A', Order.ATOMIC) || '[]';
  const b = javascriptGenerator.valueToCode(block, 'B', Order.ATOMIC) || '[]';
  const field = block.getFieldValue('FIELD') || 'aes';

  if (field === 'aes') {
    // GF(2^8) with irreducible x^8+x^4+x^3+x+1 (0x11B)
    const fn = javascriptGenerator.provideFunction_('gf2mMulAES', [
      'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(a,b){',
      '  var p=0;',
      '  for(var i=0;i<8;i++){',
      '    if(b&1)p^=a;',
      '    var hi=a&0x80;a=(a<<1)&0xFF;',
      '    if(hi)a^=0x1B;',
      '    b>>=1;',
      '  }',
      '  return p;',
      '}',
    ]);
    return [fn + '(' + a + '[0],' + b + '[0])', Order.ATOMIC];
  }

  // GCM: GF(2^128) with irreducible x^128+x^7+x^2+x+1
  // IntList representation: 4 x 32-bit limbs, LSB first
  const fn = javascriptGenerator.provideFunction_('gf2mMulGCM', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(a,b){',
    '  var z=[0,0,0,0];',
    '  var v=b.slice();',
    '  for(var i=0;i<128;i++){',
    '    if(a[Math.floor(i/32)]&(1<<(i%32))){',
    '      z[0]^=v[0];z[1]^=v[1];z[2]^=v[2];z[3]^=v[3];',
    '    }',
    '    var lsb=v[3]>>>31;',
    '    v[3]=(v[3]<<1)|(v[2]>>>31);',
    '    v[2]=(v[2]<<1)|(v[1]>>>31);',
    '    v[1]=(v[1]<<1)|(v[0]>>>31);',
    '    v[0]=(v[0]<<1)&0xFFFFFFFF;',
    '    if(lsb){v[0]^=0xE1;v[4]=0;}', // R = x^128 mod f = 0xE1 (E1 = 11100001 = x^7+x^2+x+1)
    '  }',
    '  return z;',
    '}',
  ]);
  return [fn + '(' + a + ',' + b + ')', Order.ATOMIC];
};
