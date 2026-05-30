import { javascriptGenerator, Order } from 'blockly/javascript';
import type { Block } from 'blockly/core';

javascriptGenerator.forBlock['nt_field_add'] = function(block: Block): [string, number] {
  const a = javascriptGenerator.valueToCode(block, 'A', Order.ATOMIC) || '0';
  const b = javascriptGenerator.valueToCode(block, 'B', Order.ATOMIC) || '0';
  const p = javascriptGenerator.valueToCode(block, 'P', Order.ATOMIC) || 'p';
  const op = block.getFieldValue('OP') || 'ADD';

  const operations: Record<string, string> = { 'ADD': '+', 'SUB': '-', 'MUL': '*' };
  const operation = operations[op] || '+';

  return [`((${a} ${operation} ${b}) % ${p} + ${p}) % ${p}`, Order.ATOMIC];
};
