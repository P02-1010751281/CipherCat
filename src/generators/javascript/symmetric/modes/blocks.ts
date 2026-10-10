import { javascriptGenerator, Order } from 'blockly/javascript';
import type { Block } from 'blockly/core';
import { registerAesEcb, registerAesCbc, registerAesCtr, registerAesEcbDecrypt } from './helpers';

javascriptGenerator.forBlock['mode_ecb_encrypt'] = function(block: Block): [string, number] {
  const data = javascriptGenerator.valueToCode(block, 'DATA', Order.ATOMIC) || '[]';
  const key = javascriptGenerator.valueToCode(block, 'KEY', Order.ATOMIC) || '[]';
  const fn = registerAesEcb();
  return [`Uint8Array.from(${fn}(${data}, ${key}))`, Order.ATOMIC];
};

javascriptGenerator.forBlock['mode_ecb_decrypt'] = function(block: Block): [string, number] {
  const data = javascriptGenerator.valueToCode(block, 'DATA', Order.ATOMIC) || '[]';
  const key = javascriptGenerator.valueToCode(block, 'KEY', Order.ATOMIC) || '[]';
  const fn = registerAesEcbDecrypt();
  return [`Uint8Array.from(${fn}(${data}, ${key}))`, Order.ATOMIC];
};

javascriptGenerator.forBlock['mode_cbc_encrypt'] = function(block: Block): [string, number] {
  const data = javascriptGenerator.valueToCode(block, 'DATA', Order.ATOMIC) || '[]';
  const key = javascriptGenerator.valueToCode(block, 'KEY', Order.ATOMIC) || '[]';
  const iv = javascriptGenerator.valueToCode(block, 'IV', Order.ATOMIC) || '[]';
  const fn = registerAesCbc();
  return [`Uint8Array.from(${fn}(${data}, ${key}, ${iv}))`, Order.ATOMIC];
};

javascriptGenerator.forBlock['mode_ctr_encrypt'] = function(block: Block): [string, number] {
  const data = javascriptGenerator.valueToCode(block, 'DATA', Order.ATOMIC) || '[]';
  const key = javascriptGenerator.valueToCode(block, 'KEY', Order.ATOMIC) || '[]';
  const nonce = javascriptGenerator.valueToCode(block, 'NONCE', Order.ATOMIC) || '[]';
  const fn = registerAesCtr();
  return [`Uint8Array.from(${fn}(${data}, ${key}, ${nonce}))`, Order.ATOMIC];
};
