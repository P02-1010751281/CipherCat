import { pythonGenerator, Order } from 'blockly/python';
import type { Block } from 'blockly/core';

pythonGenerator.forBlock['bit_byte_substitute'] = function(block: Block): string {
  const input = pythonGenerator.valueToCode(block, 'INPUT', Order.ATOMIC) || '0x00';
  const output = pythonGenerator.valueToCode(block, 'OUTPUT', Order.ATOMIC) || 'B';
  return `${output} = sbox[int(${input})]\n`;
};
