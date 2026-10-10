/**
 * 普通多项式乘法 JavaScript 生成器（整数系数卷积，可选模 q）
 */
import { javascriptGenerator, Order } from 'blockly/javascript';
import type { Block } from 'blockly/core';

function registerPolyMul(): string {
  return javascriptGenerator.provideFunction_('pqPolyMul', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(a, b, q) {',
    '  if (!Array.isArray(a) || !Array.isArray(b)) throw new TypeError("polynomial coefficients must be arrays");',
    '  if (![0, 3329, 8380417, 12289].includes(q)) throw new RangeError("unsupported coefficient modulus");',
    '  for (let i = 0; i < a.length; i++) if (!Number.isSafeInteger(a[i])) throw new TypeError("coefficients must be safe integers");',
    '  for (let i = 0; i < b.length; i++) if (!Number.isSafeInteger(b[i])) throw new TypeError("coefficients must be safe integers");',
    '  let out = new Array(Math.max(0, a.length + b.length - 1)).fill(0);',
    '  for (let i = 0; i < a.length; i++) {',
    '    const ai = q ? ((a[i] % q) + q) % q : a[i];',
    '    for (let j = 0; j < b.length; j++) {',
    '      const bj = q ? ((b[j] % q) + q) % q : b[j];',
    '      const value = out[i + j] + ai * bj;',
    '      if (!q && !Number.isSafeInteger(value)) throw new RangeError("convolution coefficient exceeds the safe-integer range");',
    '      out[i + j] = q ? value % q : value;',
    '    }',
    '  }',
    '  return out;',
    '}',
  ]);
}

javascriptGenerator.forBlock['pq_poly_mul'] = function (block: Block): [string, number] {
  const a = javascriptGenerator.valueToCode(block, 'A', Order.ATOMIC) || '[]';
  const b = javascriptGenerator.valueToCode(block, 'B', Order.ATOMIC) || '[]';
  const m = block.getFieldValue('MODULUS') || 'none';
  const q = m === 'none' ? '0' : m;
  const fn = registerPolyMul();
  return [fn + '(' + a + ', ' + b + ', ' + q + ')', Order.ATOMIC];
};
