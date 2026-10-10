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
    '    if type(block_size) is not int or not 1 <= block_size <= 255: raise ValueError("PKCS#7 block size must be an integer from 1 to 255")',
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
    '    if type(block_size) is not int or block_size < 1: raise ValueError("Zero-padding block size must be a positive integer")',
    '    pad_len = block_size - (len(data) % block_size)',
    '    return data + b\'\\x00\' * pad_len',
  ]);
  return [fn + '(' + data + ', ' + blockSize + ')', Order.ATOMIC];
};
