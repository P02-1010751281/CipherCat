import { javascriptGenerator, Order } from 'blockly/javascript';
import type { Block } from 'blockly/core';

javascriptGenerator.forBlock['bit_expr_infix'] = function(block: Block): [string, number] {
  const a = javascriptGenerator.valueToCode(block, 'A', Order.ATOMIC) || '0';
  const b = javascriptGenerator.valueToCode(block, 'B', Order.ATOMIC) || '0';
  const op = block.getFieldValue('OP') || 'XOR';

  const operations: Record<string, string> = { 'XOR': '^', 'AND': '&', 'OR': '|', 'EQ': '===' };
  const operation = operations[op] || '^';

  if (op === 'EQ') {
    return [`(${a} ${operation} ${b})`, Order.ATOMIC];
  }
  return [`((${a} ${operation} ${b}) >>> 0)`, Order.ATOMIC];
};
