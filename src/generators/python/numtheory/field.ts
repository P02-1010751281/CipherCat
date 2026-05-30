import { pythonGenerator, Order } from 'blockly/python';
import type { Block } from 'blockly/core';

pythonGenerator.forBlock['nt_field_add'] = function(block: Block): [string, number] {
  const a = pythonGenerator.valueToCode(block, 'A', Order.ATOMIC) || '0';
  const b = pythonGenerator.valueToCode(block, 'B', Order.ATOMIC) || '0';
  const p = pythonGenerator.valueToCode(block, 'P', Order.ATOMIC) || 'p';
  const op = block.getFieldValue('OP') || 'ADD';

  const operations: Record<string, string> = { 'ADD': '+', 'SUB': '-', 'MUL': '*' };
  const operation = operations[op] || '+';

  return [`(${a} ${operation} ${b}) % ${p}`, Order.ATOMIC];
};
