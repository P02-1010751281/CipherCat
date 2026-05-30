import { javascriptGenerator, Order } from 'blockly/javascript';
import type { Block } from 'blockly/core';

javascriptGenerator.forBlock['data_bit_length'] = function(block: Block): [string, number] {
  const x = javascriptGenerator.valueToCode(block, 'X', Order.ATOMIC) || '0';
  const code = `(function(__crypto_temp_var__) {
    if (typeof __crypto_temp_var__ === 'string') return __crypto_temp_var__.length * 8;
    if (__crypto_temp_var__ instanceof Uint8Array || Array.isArray(__crypto_temp_var__)) return __crypto_temp_var__.length * 8;
    if (typeof __crypto_temp_var__ === 'number') return 32;
    return 0;
  })(${x})`;
  return [code, Order.ATOMIC];
};

javascriptGenerator.forBlock['data_byte_length'] = function(block: Block): [string, number] {
  const x = javascriptGenerator.valueToCode(block, 'X', Order.ATOMIC) || '0';
  const code = `(function(__crypto_temp_var__) {
    if (typeof __crypto_temp_var__ === 'string') return __crypto_temp_var__.length;
    if (__crypto_temp_var__ instanceof Uint8Array || Array.isArray(__crypto_temp_var__)) return __crypto_temp_var__.length;
    if (typeof __crypto_temp_var__ === 'number') return 4;
    return 0;
  })(${x})`;
  return [code, Order.ATOMIC];
};
