import { pythonGenerator, Order } from 'blockly/python';
import type { Block } from 'blockly/core';
import { registerAesEcb, registerAesCbc, registerAesCtr } from './helpers';

pythonGenerator.forBlock['mode_ecb_encrypt'] = function(block: Block): [string, number] {
  const data = pythonGenerator.valueToCode(block, 'DATA', Order.ATOMIC) || '[]';
  const key = pythonGenerator.valueToCode(block, 'KEY', Order.ATOMIC) || '[]';
  const fn = registerAesEcb();
  return [fn + '(' + data + ', ' + key + ')', Order.ATOMIC];
};

pythonGenerator.forBlock['mode_cbc_encrypt'] = function(block: Block): [string, number] {
  const data = pythonGenerator.valueToCode(block, 'DATA', Order.ATOMIC) || '[]';
  const key = pythonGenerator.valueToCode(block, 'KEY', Order.ATOMIC) || '[]';
  const iv = pythonGenerator.valueToCode(block, 'IV', Order.ATOMIC) || '[]';
  const fn = registerAesCbc();
  return [fn + '(' + data + ', ' + key + ', ' + iv + ')', Order.ATOMIC];
};

pythonGenerator.forBlock['mode_ctr_encrypt'] = function(block: Block): [string, number] {
  const data = pythonGenerator.valueToCode(block, 'DATA', Order.ATOMIC) || '[]';
  const key = pythonGenerator.valueToCode(block, 'KEY', Order.ATOMIC) || '[]';
  const nonce = pythonGenerator.valueToCode(block, 'NONCE', Order.ATOMIC) || '[]';
  const fn = registerAesCtr();
  return [fn + '(' + data + ', ' + key + ', ' + nonce + ')', Order.ATOMIC];
};
