/**
 * 数组切片 JavaScript 生成器
 */
import { javascriptGenerator, Order } from 'blockly/javascript';
import type { Block } from 'blockly/core';

javascriptGenerator.forBlock['arr_slice'] = function (block: Block): [string, number] {
  const lst = javascriptGenerator.valueToCode(block, 'LIST', Order.ATOMIC) || '[]';
  const start = javascriptGenerator.valueToCode(block, 'START', Order.ATOMIC) || '0';
  const length = javascriptGenerator.valueToCode(block, 'LENGTH', Order.ATOMIC) || '0';
  const slice = javascriptGenerator.provideFunction_('cryptoArraySlice', [
    'function cryptoArraySlice(source, start, length) {',
    '  if (!Number.isSafeInteger(start)) throw new TypeError("slice start must be a safe integer");',
    '  if (!Number.isSafeInteger(length) || length < 0) throw new TypeError("slice length must be a non-negative safe integer");',
    '  const values = Array.from(source);',
    '  const startIndex = start < 0 ? Math.max(values.length + start, 0) : Math.min(start, values.length);',
    '  return values.slice(startIndex, Math.min(values.length, startIndex + length));',
    '}',
  ]);
  return [slice + '(' + lst + ', ' + start + ', ' + length + ')', Order.FUNCTION_CALL];
};
