import { pythonGenerator, Order } from 'blockly/python';
import type { Block } from 'blockly/core';
import {
  registerNtt,
  registerIntt,
  registerNttMul,
} from '../postquantum/helpers';

/** Forward NTT (Number Theoretic Transform). */
pythonGenerator.forBlock['pq_ntt'] = function (block: Block): [string, number] {
  const input =
    pythonGenerator.valueToCode(block, 'INPUT', Order.ATOMIC) || 'input';
  const modulus = block.getFieldValue('MODULUS') || '3329';
  const degree = block.getFieldValue('DEGREE') || '256';

  const funcName = registerNtt();
  return [
    funcName + '(' + input + ', q=' + modulus + ', n=' + degree + ')',
    Order.ATOMIC,
  ];
};

/** Inverse NTT (Number Theoretic Transform). */
pythonGenerator.forBlock['pq_intt'] = function (
  block: Block,
): [string, number] {
  const input =
    pythonGenerator.valueToCode(block, 'INPUT', Order.ATOMIC) || 'input';
  const modulus = block.getFieldValue('MODULUS') || '3329';
  const degree = block.getFieldValue('DEGREE') || '256';

  const funcName = registerIntt();
  return [
    funcName + '(' + input + ', q=' + modulus + ', n=' + degree + ')',
    Order.ATOMIC,
  ];
};

/** Pointwise (Hadamard) multiplication of two NTT-domain vectors modulo q. */
pythonGenerator.forBlock['pq_ntt_mul'] = function (
  block: Block,
): [string, number] {
  const a = pythonGenerator.valueToCode(block, 'A', Order.ATOMIC) || 'a';
  const b = pythonGenerator.valueToCode(block, 'B', Order.ATOMIC) || 'b';
  const modulus = block.getFieldValue('MODULUS') || '3329';

  const funcName = registerNttMul();
  return [funcName + '(' + a + ', ' + b + ', q=' + modulus + ')', Order.ATOMIC];
};

/** One Cooley-Tukey or Gentleman-Sande butterfly over canonical residues. */
pythonGenerator.forBlock['pq_ntt_butterfly'] = function (
  block: Block,
): [string, number] {
  const a = pythonGenerator.valueToCode(block, 'A', Order.ATOMIC) || 'a';
  const b = pythonGenerator.valueToCode(block, 'B', Order.ATOMIC) || 'b';
  const zeta = pythonGenerator.valueToCode(block, 'ZETA', Order.ATOMIC) || '1';
  const modulus = block.getFieldValue('MODULUS') || '3329';
  const type = block.getFieldValue('TYPE') || 'ct';

  const funcName = pythonGenerator.provideFunction_('ntt_butterfly', [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(a, b, zeta, q, direction):',
    '    import math',
    '    limit = 2**53 - 1',
    '    def is_safe_integer(value):',
    '        if isinstance(value, bool): return False',
    '        if isinstance(value, int): return abs(value) <= limit',
    '        return isinstance(value, float) and math.isfinite(value) and value.is_integer() and abs(value) <= limit',
    '    if not all(is_safe_integer(value) for value in (a, b, zeta, q)) or q <= 2 or q % 2 == 0:',
    '        raise ValueError("expected canonical integer residues and an odd modulus")',
    '    a, b, zeta, q = int(a), int(b), int(zeta), int(q)',
    '    if not all(0 <= value < q for value in (a, b, zeta)):',
    '        raise ValueError("expected canonical integer residues and an odd modulus")',
    '    if direction == "gs":',
    '        inv2 = (q + 1) // 2',
    '        total = (a + b) % q',
    '        difference = (b - a + q) % q',
    '        return [(total * inv2) % q, (zeta * difference % q * inv2) % q]',
    '    product = (zeta * b) % q',
    '    return [(a + product) % q, (a - product + q) % q]',
  ]);
  return [
    funcName + '(' + a + ', ' + b + ', ' + zeta + ', ' + modulus + ', "' + type + '")',
    Order.ATOMIC,
  ];
};
