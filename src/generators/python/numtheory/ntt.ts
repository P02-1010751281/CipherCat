import { pythonGenerator, Order } from 'blockly/python';
import type { Block } from 'blockly/core';
import { registerNtt, registerIntt } from '../postquantum/helpers';

/** Forward NTT (Number Theoretic Transform). */
pythonGenerator.forBlock['pq_ntt'] = function(block: Block): [string, number] {
  const input = pythonGenerator.valueToCode(block, 'INPUT', Order.ATOMIC) || 'input';
  const modulus = block.getFieldValue('MODULUS') || '3329';
  const degree = block.getFieldValue('DEGREE') || '256';

  const funcName = registerNtt();
  return [funcName + '(' + input + ', q=' + modulus + ', n=' + degree + ')', Order.ATOMIC];
};

/** Inverse NTT (Number Theoretic Transform). */
pythonGenerator.forBlock['pq_intt'] = function(block: Block): [string, number] {
  const input = pythonGenerator.valueToCode(block, 'INPUT', Order.ATOMIC) || 'input';
  const modulus = block.getFieldValue('MODULUS') || '3329';
  const degree = block.getFieldValue('DEGREE') || '256';

  const funcName = registerIntt();
  return [funcName + '(' + input + ', q=' + modulus + ', n=' + degree + ')', Order.ATOMIC];
};

/** Pointwise (Hadamard) multiplication of two NTT-domain vectors modulo q. */
pythonGenerator.forBlock['pq_ntt_mul'] = function(block: Block): [string, number] {
  const a = pythonGenerator.valueToCode(block, 'A', Order.ATOMIC) || 'a';
  const b = pythonGenerator.valueToCode(block, 'B', Order.ATOMIC) || 'b';
  const modulus = block.getFieldValue('MODULUS') || '3329';

  const funcName = pythonGenerator.provideFunction_('ntt_mul', [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(a, b, q=3329):',
    '    gen = 17 if q == 3329 else 3',
    '    n = len(a)',
    '    res = [0] * n',
    '    def _brv(x, bits):',
    '        r = 0',
    '        for _ in range(bits):',
    '            r = (r << 1) | (x & 1)',
    '            x >>= 1',
    '        return r',
    '    nbits = n.bit_length() - 1',
    '    for i in range(0, n, 2):',
    '        a_even, a_odd = a[i], a[i+1]',
    '        b_even, b_odd = b[i], b[i+1]',
    '        z = pow(gen, 2 * _brv(i // 2, nbits - 1) + 1, q)',
    '        res[i] = (a_even * b_even + z * a_odd * b_odd) % q',
    '        res[i+1] = (a_odd * b_even + a_even * b_odd) % q',
    '    return res',
  ]);
  return [funcName + '(' + a + ', ' + b + ', q=' + modulus + ')', Order.ATOMIC];
};

/**
 * Cooley-Tukey or Gentleman-Sande butterfly.
 * Forward direction uses CT: (a + zeta*b, a - zeta*b)
 * Inverse direction uses GS: ((a+b)/2, zeta*(b-a)/2)
 */
pythonGenerator.forBlock['pq_ntt_butterfly'] = function(block: Block): [string, number] {
  const a = pythonGenerator.valueToCode(block, 'A', Order.ATOMIC) || 'a';
  const b = pythonGenerator.valueToCode(block, 'B', Order.ATOMIC) || 'b';
  const zeta = pythonGenerator.valueToCode(block, 'ZETA', Order.ATOMIC) || '1';
  const modulus = block.getFieldValue('MODULUS') || '3329';
  const type = block.getFieldValue('TYPE') || 'ct';

  const funcName = pythonGenerator.provideFunction_(
    type === 'ct' ? 'ct_butterfly' : 'gs_butterfly',
    type === 'ct' ? [
      'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(a, b, zeta, q=3329):',
      '    t = (zeta * b) % q',
      '    return [(a + t) % q, (a - t + q) % q]',
    ] : [
      'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(a, b, zeta, q=3329):',
      '    s = (a + b) % q',
      '    d = (b - a + q) % q',
      '    inv2 = (q + 1) >> 1',
      '    return [(s * inv2) % q, (zeta * d % q * inv2) % q]',
    ]
  );
  return [funcName + '(' + a + ', ' + b + ', ' + zeta + ', ' + modulus + ')', Order.ATOMIC];
};
