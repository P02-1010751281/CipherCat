/**
 * 填充模式 Python 代码生成器
 */
import { pythonGenerator, Order } from 'blockly/python';
import type { Block } from 'blockly/core';

pythonGenerator.forBlock['pad_pkcs7'] = function (block: Block): [string, number] {
  const data = pythonGenerator.valueToCode(block, 'DATA', Order.ATOMIC) || 'b\'\'';
  const blockSize = pythonGenerator.valueToCode(block, 'BLOCK_SIZE', Order.ATOMIC) || '16';
  const fn = pythonGenerator.provideFunction_('pad_pkcs7', [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(data, block_size):',
    '    pad_len = block_size - (len(data) % block_size)',
    '    return data + bytes([pad_len] * pad_len)',
  ]);
  return [fn + '(' + data + ', ' + blockSize + ')', Order.ATOMIC];
};

pythonGenerator.forBlock['pad_zero'] = function (block: Block): [string, number] {
  const data = pythonGenerator.valueToCode(block, 'DATA', Order.ATOMIC) || 'b\'\'';
  const blockSize = pythonGenerator.valueToCode(block, 'BLOCK_SIZE', Order.ATOMIC) || '16';
  const fn = pythonGenerator.provideFunction_('pad_zero', [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(data, block_size):',
    '    pad_len = block_size - (len(data) % block_size)',
    '    return data + b\'\\x00\' * pad_len',
  ]);
  return [fn + '(' + data + ', ' + blockSize + ')', Order.ATOMIC];
};
