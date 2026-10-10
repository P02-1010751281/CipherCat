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

/** One Cooley-Tukey or Gentleman-Sande butterfly over canonical residues. */
javascriptGenerator.forBlock['pq_ntt_butterfly'] = function (
  block: Block,
): [string, number] {
  const a = javascriptGenerator.valueToCode(block, 'A', Order.ATOMIC) || '0';
  const b = javascriptGenerator.valueToCode(block, 'B', Order.ATOMIC) || '0';
  const zeta =
    javascriptGenerator.valueToCode(block, 'ZETA', Order.ATOMIC) || '1';
  const modulus = block.getFieldValue('MODULUS') || '3329';
  const type = block.getFieldValue('TYPE') || 'ct';

  const butterflyFn = javascriptGenerator.provideFunction_('nttButterfly', [
    'function ' +
      javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ +
      '(a, b, zeta, q, direction) {',
    '  if (![a, b, zeta, q].every(Number.isSafeInteger) || q <= 2 || q % 2 === 0 || a < 0 || a >= q || b < 0 || b >= q || zeta < 0 || zeta >= q) {',
    '    throw new RangeError("expected canonical integer residues and an odd modulus");',
    '  }',
    '  if (direction === "gs") {',
    '    const inv2 = (q + 1) / 2;',
    '    const sum = (a + b) % q;',
    '    const difference = (b - a + q) % q;',
    '    return [(sum * inv2) % q, (zeta * difference % q * inv2) % q];',
    '  }',
    '  const product = (zeta * b) % q;',
    '  return [(a + product) % q, (a - product + q) % q];',
    '}',
  ]);

  return [`${butterflyFn}(${a}, ${b}, ${zeta}, ${modulus}, "${type}")`, Order.ATOMIC];
};
