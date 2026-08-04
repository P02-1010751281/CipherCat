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

/** GF(2^8) AES 扩展欧几里得求逆 */
function registerGf2mInvAES(): string {
  return javascriptGenerator.provideFunction_('gf2mInvAES', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(a){',
    '  if (a === 0) return 0;',
    '  var r0 = 0x11B, r1 = a, t0 = 0, t1 = 1;',
    '  while (r1 !== 0) {',
    '    var degR0 = 0, degR1 = 0;',
    '    for (var i = 8; i >= 0; i--) { if ((r0 >> i) & 1) { degR0 = i; break; } }',
    '    for (var i = 8; i >= 0; i--) { if ((r1 >> i) & 1) { degR1 = i; break; } }',
    '    var shift = degR0 - degR1;',
    '    var q = 0, r = r0;',
    '    while (shift >= 0) { if ((r >> (degR1 + shift)) & 1) { q |= (1 << shift); r ^= (r1 << shift); } shift--; }',
    '    var t2 = t0 ^ gf2mMulAES(q, t1);',
    '    r0 = r1; r1 = r; t0 = t1; t1 = t2;',
    '  }',
    '  return t0;',
    '}',
  ]);
}

javascriptGenerator.forBlock['gf2m_add'] = function (block: Block): [string, number] {
  const a = javascriptGenerator.valueToCode(block, 'A', Order.ATOMIC) || '[]';
  const b = javascriptGenerator.valueToCode(block, 'B', Order.ATOMIC) || '[]';
  const field = block.getFieldValue('FIELD') || 'aes';
  if (field === 'aes') {
    return ['(' + a + '[0] ^ ' + b + '[0])', Order.ATOMIC];
  }
  return ['[' + a + '[0]^' + b + '[0],' + a + '[1]^' + b + '[1],' + a + '[2]^' + b + '[2],' + a + '[3]^' + b + '[3]]', Order.ATOMIC];
};

javascriptGenerator.forBlock['gf2m_inv'] = function (block: Block): [string, number] {
  const a = javascriptGenerator.valueToCode(block, 'A', Order.ATOMIC) || '[]';
  const field = block.getFieldValue('FIELD') || 'aes';
  if (field === 'aes') {
    const fn = registerGf2mInvAES();
    return ['[' + fn + '(' + a + '[0])]', Order.ATOMIC];
  }
  // GCM: 128-bit 多项式欧几里得（BigInt）
  const fn = javascriptGenerator.provideFunction_('gf2mInvGCM', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(a){',
    '  var A = 0n; for (var i = 0; i < 4; i++) A |= BigInt(a[i]) << BigInt(32 * i);',
    '  var MOD = (1n << 128n) ^ (0xE1n << 120n);',
    '  var r0 = MOD, r1 = A, t0 = 0n, t1 = 1n;',
    '  while (r1 !== 0n) {',
    '    var d0 = 0n, d1 = 0n, x = r0, y = r1;',
    '    while (x >> 1n) { x >>= 1n; d0++; }',
    '    while (y >> 1n) { y >>= 1n; d1++; }',
    '    var q = 0n, r = r0;',
    '    var sh = d0 - d1;',
    '    while (sh >= 0n) { if ((r >> (d1 + sh)) & 1n) { q ^= (1n << sh); r ^= (r1 << sh); } sh -= 1n; }',
    '    var t2 = t0 ^ gf2mMulGCMBig(q, t1);',
    '    r0 = r1; r1 = r; t0 = t1; t1 = t2;',
    '  }',
    '  var out = [0,0,0,0]; var v = t0;',
    '  for (var i = 0; i < 4; i++) { out[i] = Number(v & 0xFFFFFFFFn); v >>= 32n; }',
    '  return out;',
    '}',
  ]);
  const fnMul = javascriptGenerator.provideFunction_('gf2mMulGCMBig', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(a, b){',
    '  var MOD = (1n << 128n) ^ (0xE1n << 120n);',
    '  var p = 0n;',
    '  for (var i = 0; i < 128; i++) { if ((b >> BigInt(i)) & 1n) p ^= a; var hi = (a >> 127n) & 1n; a = (a << 1n) & ((1n << 128n) - 1n); if (hi) a ^= 0xE1n; }',
    '  return p;',
    '}',
  ]);
  return [fn + '(' + a + ')', Order.ATOMIC];
};
