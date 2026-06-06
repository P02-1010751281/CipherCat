/**
 * NTT (数论变换) JavaScript 代码生成器 — 后量子基础块
 */
import { javascriptGenerator, Order } from 'blockly/javascript';
import type { Block } from 'blockly/core';
import {
  registerNtt,
  registerIntt,
  registerNttMul,
} from '../postquantum/helpers';

/** Forward NTT (Number Theoretic Transform). */
javascriptGenerator.forBlock['pq_ntt'] = function (
  block: Block,
): [string, number] {
  const input =
    javascriptGenerator.valueToCode(block, 'INPUT', Order.ATOMIC) || '[]';
  const modulus = block.getFieldValue('MODULUS') || '3329';
  const n = parseInt(block.getFieldValue('DEGREE') || '256');

  const funcName = registerNtt();
  return [`${funcName}(${input}, ${modulus}, ${n})`, Order.ATOMIC];
};

/** Inverse NTT. */
javascriptGenerator.forBlock['pq_intt'] = function (
  block: Block,
): [string, number] {
  const input =
    javascriptGenerator.valueToCode(block, 'INPUT', Order.ATOMIC) || '[]';
  const modulus = block.getFieldValue('MODULUS') || '3329';
  const n = parseInt(block.getFieldValue('DEGREE') || '256');

  const funcName = registerIntt();
  return [`${funcName}(${input}, ${modulus}, ${n})`, Order.ATOMIC];
};

/** Kyber half-NTT multiplication of two NTT-domain vectors modulo q. */
javascriptGenerator.forBlock['pq_ntt_mul'] = function (
  block: Block,
): [string, number] {
  const a = javascriptGenerator.valueToCode(block, 'A', Order.ATOMIC) || '[]';
  const b = javascriptGenerator.valueToCode(block, 'B', Order.ATOMIC) || '[]';
  const modulus = block.getFieldValue('MODULUS') || '3329';

  const nttMulFn = registerNttMul();

  return [`${nttMulFn}(${a}, ${b}, ${modulus})`, Order.ATOMIC];
};

/**
 * Cooley-Tukey or Gentleman-Sande butterfly.
 * Forward direction uses CT: (a + zeta*b, a - zeta*b)
 * Inverse direction uses GS: ((a+b)/2, zeta*(b-a)/2)
 */
javascriptGenerator.forBlock['pq_ntt_butterfly'] = function (
  block: Block,
): [string, number] {
  const a = javascriptGenerator.valueToCode(block, 'A', Order.ATOMIC) || '0';
  const b = javascriptGenerator.valueToCode(block, 'B', Order.ATOMIC) || '0';
  const zeta =
    javascriptGenerator.valueToCode(block, 'ZETA', Order.ATOMIC) || '1';
  const modulus = block.getFieldValue('MODULUS') || '3329';
  const type = block.getFieldValue('TYPE') || 'ct';

  const ctButterflyFn = javascriptGenerator.provideFunction_('ctButterfly', [
    'function ' +
      javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ +
      '(a, b, zeta, q) {',
    '  q = q || 3329;',
    '  let t = (zeta * b) % q;',
    '  return [(a + t) % q, (a - t + q) % q];',
    '}',
  ]);

  const gsButterflyFn = javascriptGenerator.provideFunction_('gsButterfly', [
    'function ' +
      javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ +
      '(a, b, zeta, q) {',
    '  q = q || 3329;',
    '  let inv2 = (q + 1) >> 1;',
    '  let s = (a + b) % q;',
    '  let d = (b - a + q) % q;',
    '  return [(s * inv2) % q, (zeta * d % q * inv2) % q];',
    '}',
  ]);

  const funcName = type === 'ct' ? ctButterflyFn : gsButterflyFn;
  return [`${funcName}(${a}, ${b}, ${zeta}, ${modulus})`, Order.ATOMIC];
};
