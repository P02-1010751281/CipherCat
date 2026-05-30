import { pythonGenerator, Order } from 'blockly/python';
import type { Block } from 'blockly/core';

pythonGenerator.forBlock['data_convert_to_int'] = function(block: Block): string {
  const variable = pythonGenerator.valueToCode(block, 'VAR', Order.ATOMIC) || 'n';
  return `if isinstance(${variable}, bytes):\n    ${variable} = int.from_bytes(${variable}, 'big')\nelif isinstance(${variable}, str):\n    try:\n        ${variable} = int(${variable}, 16)\n    except ValueError:\n        ${variable} = int(${variable})\nelse:\n    ${variable} = int(${variable})\n`;
};

pythonGenerator.forBlock['data_convert_bits_to_bytes'] = function(block: Block): string {
  const bytes = pythonGenerator.valueToCode(block, 'BYTES', Order.ATOMIC) || 'bytes';
  const bits = pythonGenerator.valueToCode(block, 'BITS', Order.ATOMIC) || 'bits';
  return `${bytes} = int(str(${bits}), 2)\n`;
};

pythonGenerator.forBlock['data_convert_bytes_to_bits'] = function(block: Block): string {
  const bits = pythonGenerator.valueToCode(block, 'BITS', Order.ATOMIC) || 'bits';
  const bytes = pythonGenerator.valueToCode(block, 'BYTES', Order.ATOMIC) || 'bytes';
  return `${bits} = bin(${bytes})[2:]\n`;
};
