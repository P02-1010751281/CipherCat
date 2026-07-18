/**
 * GF(2⁸) 域乘法 Python 代码生成器
 * 不可约多项式 x⁸ + x⁴ + x³ + x + 1 (0x11B)
 */
import { pythonGenerator, Order } from 'blockly/python';
import type { Block } from 'blockly/core';

pythonGenerator.forBlock['gf_mul'] = function (block: Block): [string, number] {
  const a = pythonGenerator.valueToCode(block, 'A', Order.ATOMIC) || '0';
  const b = pythonGenerator.valueToCode(block, 'B', Order.ATOMIC) || '0';
  const fn = pythonGenerator.provideFunction_('gf_mul', [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(a, b):',
    '    result = 0',
    '    while b > 0:',
    '        if b & 1:',
    '            result ^= a',
    '        a = ((a << 1) ^ (((a >> 7) & 1) * 0x1B)) & 0xFF',
    '        b >>= 1',
    '    return result',
  ]);
  return [fn + '(' + a + ', ' + b + ')', Order.ATOMIC];
};
