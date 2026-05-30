import { javascriptGenerator, Order } from 'blockly/javascript';
import type { Block } from 'blockly/core';

javascriptGenerator.forBlock['bit_byte_substitute'] = function(block: Block): string {
  const input = javascriptGenerator.valueToCode(block, 'INPUT', Order.ATOMIC) || '0x00';
  const output = javascriptGenerator.valueToCode(block, 'OUTPUT', Order.ATOMIC) || 'B';
  return `var ${output} = sbox[parseInt(${input})];\n`;
};
