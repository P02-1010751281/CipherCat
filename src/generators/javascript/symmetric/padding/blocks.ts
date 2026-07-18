/**
 * 填充模式 JavaScript 代码生成器
 */
import { javascriptGenerator, Order } from 'blockly/javascript';
import type { Block } from 'blockly/core';

javascriptGenerator.forBlock['pad_pkcs7'] = function (block: Block): [string, number] {
  const data = javascriptGenerator.valueToCode(block, 'DATA', Order.ATOMIC) || 'new Uint8Array(0)';
  const blockSize = javascriptGenerator.valueToCode(block, 'BLOCK_SIZE', Order.ATOMIC) || '16';
  const fn = javascriptGenerator.provideFunction_('padPkcs7', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(data, blockSize) {',
    '  var padLen = blockSize - (data.length % blockSize);',
    '  var result = new Uint8Array(data.length + padLen);',
    '  result.set(data);',
    '  for (var i = 0; i < padLen; i++) result[data.length + i] = padLen;',
    '  return result;',
    '}',
  ]);
  return [fn + '(' + data + ', ' + blockSize + ')', Order.ATOMIC];
};

javascriptGenerator.forBlock['pad_zero'] = function (block: Block): [string, number] {
  const data = javascriptGenerator.valueToCode(block, 'DATA', Order.ATOMIC) || 'new Uint8Array(0)';
  const blockSize = javascriptGenerator.valueToCode(block, 'BLOCK_SIZE', Order.ATOMIC) || '16';
  const fn = javascriptGenerator.provideFunction_('padZero', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(data, blockSize) {',
    '  var padLen = blockSize - (data.length % blockSize);',
    '  var result = new Uint8Array(data.length + padLen);',
    '  result.set(data);',
    '  // zero padding already fills with 0 by default',
    '  return result;',
    '}',
  ]);
  return [fn + '(' + data + ', ' + blockSize + ')', Order.ATOMIC];
};
