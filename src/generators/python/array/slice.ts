/**
 * 数组切片 Python 生成器
 */
import { pythonGenerator, Order } from 'blockly/python';
import type { Block } from 'blockly/core';

pythonGenerator.forBlock['arr_slice'] = function (block: Block): [string, number] {
  const lst = pythonGenerator.valueToCode(block, 'LIST', Order.ATOMIC) || '[]';
  const start = pythonGenerator.valueToCode(block, 'START', Order.ATOMIC) || '0';
  const length = pythonGenerator.valueToCode(block, 'LENGTH', Order.ATOMIC) || '0';
  return ['list(' + lst + '[' + start + ':' + start + ' + ' + length + '])', Order.ATOMIC];
};
