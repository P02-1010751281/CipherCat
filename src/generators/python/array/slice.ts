/**
 * 数组切片 Python 生成器
 */
import { pythonGenerator, Order } from 'blockly/python';
import type { Block } from 'blockly/core';

pythonGenerator.forBlock['arr_slice'] = function (block: Block): [string, number] {
  const lst = pythonGenerator.valueToCode(block, 'LIST', Order.ATOMIC) || '[]';
  const start = pythonGenerator.valueToCode(block, 'START', Order.ATOMIC) || '0';
  const length = pythonGenerator.valueToCode(block, 'LENGTH', Order.ATOMIC) || '0';
  const slice = pythonGenerator.provideFunction_('crypto_array_slice', [
    'def crypto_array_slice(source, start, length):',
    '    def safe_integer(value):',
    '        return (not isinstance(value, bool) and isinstance(value, (int, float))',
    '                and abs(value) <= 9007199254740991',
    '                and (not isinstance(value, float) or value.is_integer()))',
    '    if not safe_integer(start): raise TypeError("slice start must be a safe integer")',
    '    if not safe_integer(length) or length < 0: raise TypeError("slice length must be a non-negative safe integer")',
    '    start, length = int(start), int(length)',
    '    values = list(source)',
    '    start_index = max(len(values) + start, 0) if start < 0 else min(start, len(values))',
    '    return values[start_index:min(len(values), start_index + length)]',
  ]);
  return [slice + '(' + lst + ', ' + start + ', ' + length + ')', Order.FUNCTION_CALL];
};
