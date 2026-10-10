import { pythonGenerator, Order } from 'blockly/python';
import type { Block } from 'blockly/core';

pythonGenerator.forBlock['data_bit_length'] = function(block: Block): [string, number] {
  const x = pythonGenerator.valueToCode(block, 'X', Order.ATOMIC) || '0';
  const code = `(lambda value: len(value.encode('utf-8')) * 8 if isinstance(value, str) else len(value) * 8 if isinstance(value, (bytes, list)) else 32 if isinstance(value, (int, float)) and not isinstance(value, bool) else 0)(${x})`;
  return [code, Order.ATOMIC];
};

pythonGenerator.forBlock['data_byte_length'] = function(block: Block): [string, number] {
  const x = pythonGenerator.valueToCode(block, 'X', Order.ATOMIC) || '0';
  const code = `(lambda value: len(value.encode('utf-8')) if isinstance(value, str) else len(value) if isinstance(value, (bytes, list)) else 4 if isinstance(value, (int, float)) and not isinstance(value, bool) else 0)(${x})`;
  return [code, Order.ATOMIC];
};
