import { pythonGenerator, Order } from 'blockly/python';
import type { Block } from 'blockly/core';
import { uint32Expression } from './uint32';

pythonGenerator.forBlock['bit_operation'] = function(block: Block): [string, number] {
  const a = pythonGenerator.valueToCode(block, 'A', Order.ATOMIC) || '0';
  const b = pythonGenerator.valueToCode(block, 'B', Order.ATOMIC) || '0';
  const op = block.getFieldValue('OP') || 'AND';
  const a32 = uint32Expression(a);
  const b32 = uint32Expression(b);
  const shift = `(${b32} & 31)`;

  const operations: Record<string, string> = {
    'AND':          `${a32} & ${b32}`,
    'OR':           `${a32} | ${b32}`,
    'XOR':          `${a32} ^ ${b32}`,
    'LEFT_SHIFT':   `(${a32} << ${shift}) & 0xFFFFFFFF`,
    'RIGHT_SHIFT':  `${a32} >> ${shift}`,
    'LEFT_ROTATE':  `((${a32} << ${shift}) | (${a32} >> (32 - ${shift}))) & 0xFFFFFFFF`,
    'RIGHT_ROTATE': `((${a32} >> ${shift}) | (${a32} << (32 - ${shift}))) & 0xFFFFFFFF`,
  };
  const code = operations[op] || '';
  return [code, Order.ATOMIC];
};
