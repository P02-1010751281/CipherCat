import { pythonGenerator, Order } from 'blockly/python';
import type { Block } from 'blockly/core';

pythonGenerator.forBlock['bit_operation'] = function(block: Block): [string, number] {
  const a = pythonGenerator.valueToCode(block, 'A', Order.ATOMIC) || '0';
  const b = pythonGenerator.valueToCode(block, 'B', Order.ATOMIC) || '0';
  const op = block.getFieldValue('OP') || 'AND';

  const operations: Record<string, string> = {
    'AND':          `(${a} & ${b}) & 0xFFFFFFFF`,
    'OR':           `(${a} | ${b}) & 0xFFFFFFFF`,
    'XOR':          `(${a} ^ ${b}) & 0xFFFFFFFF`,
    'LEFT_SHIFT':   `(${a} << ${b}) & 0xFFFFFFFF`,
    'RIGHT_SHIFT':  `((${a} & 0xFFFFFFFF) >> ${b})`,
    'LEFT_ROTATE':  `((${a} << ${b}) | ((${a} & 0xFFFFFFFF) >> (32 - ${b}))) & 0xFFFFFFFF`,
    'RIGHT_ROTATE': `(((${a} & 0xFFFFFFFF) >> ${b}) | ((${a} & 0xFFFFFFFF) << (32 - ${b}))) & 0xFFFFFFFF`,
  };
  const code = operations[op] || '';
  return [code, Order.ATOMIC];
};
