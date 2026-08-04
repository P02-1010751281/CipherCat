/**
 * 数组切片 JavaScript 生成器
 */
import { javascriptGenerator, Order } from 'blockly/javascript';
import type { Block } from 'blockly/core';

javascriptGenerator.forBlock['arr_slice'] = function (block: Block): [string, number] {
  const lst = javascriptGenerator.valueToCode(block, 'LIST', Order.ATOMIC) || '[]';
  const start = javascriptGenerator.valueToCode(block, 'START', Order.ATOMIC) || '0';
  const length = javascriptGenerator.valueToCode(block, 'LENGTH', Order.ATOMIC) || '0';
  return ['Array.from(' + lst + ').slice(' + start + ', ' + start + ' + ' + length + ')', Order.ATOMIC];
};
