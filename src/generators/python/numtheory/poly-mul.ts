/**
 * 普通多项式乘法 Python 生成器（整数系数卷积，可选模 q）
 */
import { pythonGenerator, Order } from 'blockly/python';
import type { Block } from 'blockly/core';

import { registerSafeIntegers } from '@/generators/python/safe-int';

function registerPolyMul(): string {
  const require_safe = registerSafeIntegers();
  return pythonGenerator.provideFunction_('pq_poly_mul', [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(a, b, q):',
    '    if type(a) is not list or type(b) is not list: raise TypeError("polynomial coefficients must be lists")',
    '    if q not in (0, 3329, 8380417, 12289): raise ValueError("unsupported coefficient modulus")',
    '    q = int(q)',
    `    ${require_safe}("coefficients must be safe integers", a, b)`,
    '    a = [int(value) for value in a]; b = [int(value) for value in b]',
    '    out = [0] * max(0, len(a) + len(b) - 1)',
    '    for i, ai in enumerate(a):',
    '        ai = ai % q if q else ai',
    '        for j, bj in enumerate(b):',
    '            bj = bj % q if q else bj',
    '            value = out[i + j] + ai * bj',
    '            if q:',
    '                out[i + j] = value % q',
    '            else:',
    '                if abs(value) > 9007199254740991: raise OverflowError("convolution coefficient exceeds the safe-integer range")',
    '                out[i + j] = value',
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
