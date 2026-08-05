/**
 * 普通多项式乘法 Python 生成器（整数系数卷积，可选模 q）
 */
import { pythonGenerator, Order } from 'blockly/python';
import type { Block } from 'blockly/core';

function registerPolyMul(): string {
  return pythonGenerator.provideFunction_('pq_poly_mul', [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(a, b, q):',
    '    out = [0] * (len(a) + len(b) - 1)',
    '    for i, ai in enumerate(a):',
    '        if ai:',
    '            for j, bj in enumerate(b):',
    '                if bj:',
    '                    out[i + j] += ai * bj',
    '    if q:',
    '        out = [v % q for v in out]',
    '    return out',
    '',
  ]);
}

pythonGenerator.forBlock['pq_poly_mul'] = function (block: Block): [string, number] {
  const a = pythonGenerator.valueToCode(block, 'A', Order.ATOMIC) || '[]';
  const b = pythonGenerator.valueToCode(block, 'B', Order.ATOMIC) || '[]';
  const m = block.getFieldValue('MODULUS') || 'none';
  const q = m === 'none' ? '0' : m;
  const fn = registerPolyMul();
  return [fn + '(' + a + ', ' + b + ', ' + q + ')', Order.ATOMIC];
};
