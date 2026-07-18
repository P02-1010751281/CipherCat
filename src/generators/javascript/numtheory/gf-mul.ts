/**
 * GF(2⁸) 域乘法 JavaScript 代码生成器
 * 不可约多项式 x⁸ + x⁴ + x³ + x + 1 (0x11B)
 */
import { javascriptGenerator, Order } from 'blockly/javascript';
import type { Block } from 'blockly/core';

javascriptGenerator.forBlock['gf_mul'] = function (block: Block): [string, number] {
  const a = javascriptGenerator.valueToCode(block, 'A', Order.ATOMIC) || '0';
  const b = javascriptGenerator.valueToCode(block, 'B', Order.ATOMIC) || '0';
  const fn = javascriptGenerator.provideFunction_('gfMul', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(a, b) {',
    '  var result = 0;',
    '  while (b > 0) {',
    '    if (b & 1) result ^= a;',
    '    a = (a << 1) ^ ((a >> 7) & 1) * 0x1B;',
    '    a &= 0xFF;',
    '    b >>= 1;',
    '  }',
    '  return result;',
    '}',
  ]);
  return [fn + '(' + a + ', ' + b + ')', Order.ATOMIC];
};
