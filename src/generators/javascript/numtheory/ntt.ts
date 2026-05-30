/**
 * NTT (数论变换) JavaScript 代码生成器 — 后量子基础块
 */
import { javascriptGenerator, Order } from 'blockly/javascript';
import type { Block } from 'blockly/core';
import { registerNtt, registerIntt, registerPowMod } from '../postquantum/helpers';

/** Forward NTT (Number Theoretic Transform). */
javascriptGenerator.forBlock['pq_ntt'] = function(block: Block): [string, number] {
  const input = javascriptGenerator.valueToCode(block, 'INPUT', Order.ATOMIC) || '[]';
  const modulus = block.getFieldValue('MODULUS') || '3329';
  const n = parseInt(block.getFieldValue('N') || '256');

  const funcName = registerNtt();
  return [`${funcName}(${input}, ${modulus}, ${n})`, Order.ATOMIC];
};

/** Inverse NTT. */
javascriptGenerator.forBlock['pq_intt'] = function(block: Block): [string, number] {
  const input = javascriptGenerator.valueToCode(block, 'INPUT', Order.ATOMIC) || '[]';
  const modulus = block.getFieldValue('MODULUS') || '3329';
  const n = parseInt(block.getFieldValue('N') || '256');

  const funcName = registerIntt();
  return [`${funcName}(${input}, ${modulus}, ${n})`, Order.ATOMIC];
};

/** Pointwise (Hadamard) multiplication of two NTT-domain vectors modulo q. */
javascriptGenerator.forBlock['pq_ntt_mul'] = function(block: Block): [string, number] {
  const a = javascriptGenerator.valueToCode(block, 'A', Order.ATOMIC) || '[]';
  const b = javascriptGenerator.valueToCode(block, 'B', Order.ATOMIC) || '[]';
  const modulus = block.getFieldValue('MODULUS') || '3329';

  const nttMulFn = javascriptGenerator.provideFunction_('nttMul', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(a, b, q) {',
    '  q = q || 3329;',
    '  let len = Math.min(a.length, b.length);',
    '  let res = new Array(len);',
    '  for (let i = 0; i < len; i++) {',
    '    res[i] = (a[i] * b[i]) % q;',
    '  }',
    '  return res;',
    '}'
  ]);

  return [`${nttMulFn}(${a}, ${b}, ${modulus})`, Order.ATOMIC];
};

/**
 * Cooley-Tukey or Gentleman-Sande butterfly.
 * Forward direction uses CT: (a + w*b, a - w*b)
 * Inverse direction uses GS: (a + b, w*(b - a))
 */
javascriptGenerator.forBlock['pq_ntt_butterfly'] = function(block: Block): [string, number] {
  const a = javascriptGenerator.valueToCode(block, 'A', Order.ATOMIC) || '0';
  const b = javascriptGenerator.valueToCode(block, 'B', Order.ATOMIC) || '0';
  const w = javascriptGenerator.valueToCode(block, 'W', Order.ATOMIC) || '1';
  const modulus = block.getFieldValue('MODULUS') || '3329';
  const direction = block.getFieldValue('DIRECTION') || 'forward';

  const ctButterflyFn = javascriptGenerator.provideFunction_('ctButterfly', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(a, b, w, q) {',
    '  q = q || 3329;',
    '  let t = (w * b) % q;',
    '  return [(a + t) % q, (a - t + q) % q];',
    '}'
  ]);

  const gsButterflyFn = javascriptGenerator.provideFunction_('gsButterfly', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(a, b, w, q) {',
    '  q = q || 3329;',
    '  return [(a + b) % q, (w * ((b - a + q) % q)) % q];',
    '}'
  ]);

  if (direction === 'forward') {
    return [`${ctButterflyFn}(${a}, ${b}, ${w}, ${modulus})`, Order.ATOMIC];
  } else {
    return [`${gsButterflyFn}(${a}, ${b}, ${w}, ${modulus})`, Order.ATOMIC];
  }
};
