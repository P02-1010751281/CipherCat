import { pythonGenerator, Order } from 'blockly/python';
import type { Block } from 'blockly/core';

pythonGenerator.forBlock['bit_byte_substitute'] = function(block: Block): string {
  const input = pythonGenerator.valueToCode(block, 'INPUT', Order.ATOMIC) || '0x00';
  const output = pythonGenerator.valueToCode(block, 'OUTPUT', Order.ATOMIC) || 'B';
  return `
_byte_substitute_index = ${input}
if isinstance(_byte_substitute_index, bool) or not isinstance(_byte_substitute_index, (int, float)) or not 0 <= _byte_substitute_index <= 255 or int(_byte_substitute_index) != _byte_substitute_index:
    raise ValueError("S-box input must be a byte")
if not isinstance(sbox, list) or len(sbox) < 256:
    raise TypeError("sbox must contain at least 256 entries")
_byte_substitute_value = sbox[int(_byte_substitute_index)]
if isinstance(_byte_substitute_value, bool) or not isinstance(_byte_substitute_value, (int, float)) or not 0 <= _byte_substitute_value <= 255 or int(_byte_substitute_value) != _byte_substitute_value:
    raise ValueError("S-box output must be a byte")
${output} = int(_byte_substitute_value)
`;
};
