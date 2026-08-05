/**
 * 普通多项式乘法 JavaScript 生成器（整数系数卷积，可选模 q）
 */
import { javascriptGenerator, Order } from 'blockly/javascript';
import type { Block } from 'blockly/core';

function registerPolyMul(): string {
  return javascriptGenerator.provideFunction_('pqPolyMul', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(a, b, q) {',
    '  let out = new Array(a.length + b.length - 1).fill(0);',
    '  for (let i = 0; i < a.length; i++) {',
    '    if (!a[i]) continue;',
    '    for (let j = 0; j < b.length; j++) {',
    '      if (b[j]) out[i + j] += a[i] * b[j];',
    '    }',
    '  }',
    '  if (q) out = out.map((v) => v % q);',
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
