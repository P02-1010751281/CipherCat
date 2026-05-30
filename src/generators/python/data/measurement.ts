import { pythonGenerator, Order } from 'blockly/python';
import type { Block } from 'blockly/core';

pythonGenerator.forBlock['data_bit_length'] = function(block: Block): [string, number] {
  const x = pythonGenerator.valueToCode(block, 'X', Order.ATOMIC) || '0';
  const code = `len(${x}) * 8`;
  return [code, Order.ATOMIC];
};

pythonGenerator.forBlock['data_byte_length'] = function(block: Block): [string, number] {
  const x = pythonGenerator.valueToCode(block, 'X', Order.ATOMIC) || '0';
  const code = `len(${x})`;
  return [code, Order.ATOMIC];
};
