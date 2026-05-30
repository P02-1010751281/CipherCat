import { javascriptGenerator, Order } from 'blockly/javascript';
import type { Block } from 'blockly/core';

javascriptGenerator.forBlock['lgc_operation'] = function(block: Block): string {
  const instr = block.getFieldValue('instr') || 'XOR';
  const a = javascriptGenerator.valueToCode(block, 'A', Order.ATOMIC) || '0';
  const b = javascriptGenerator.valueToCode(block, 'B', Order.ATOMIC) || '0';
  const c = javascriptGenerator.valueToCode(block, 'C', Order.ATOMIC) || 'result';

  const operations: Record<string, string> = { 'XOR': '^', 'OR': '|', 'AND': '&' };
  const operation = operations[instr] || '^';

  return `${c} = (${a} ${operation} ${b}) >>> 0;\n`;
};

javascriptGenerator.forBlock['lgc_compound'] = function(block: Block): string {
  const instr = block.getFieldValue('instr') || 'XOR_XOR';
  const a = javascriptGenerator.valueToCode(block, 'A', Order.ATOMIC) || '0';
  const b = javascriptGenerator.valueToCode(block, 'B', Order.ATOMIC) || '0';
  const c = javascriptGenerator.valueToCode(block, 'C', Order.ATOMIC) || 'result';

  const [op1, op2] = instr.split('_');
  const operations: Record<string, string> = { 'XOR': '^', 'OR': '|', 'AND': '&' };
  const operation1 = operations[op1] || '^';
  const operation2 = operations[op2] || '^';

  return `${c} = ((${a} ${operation1} ${b}) ${operation2} ${b}) >>> 0;\n`;
};

javascriptGenerator.forBlock['lgc_not'] = function(block: Block): string {
  const value1 = javascriptGenerator.valueToCode(block, 'VALUE1', Order.ATOMIC) || '0';
  const value2 = javascriptGenerator.valueToCode(block, 'VALUE2', Order.ATOMIC) || 'result';

  return `${value2} = (~${value1}) >>> 0;\n`;
};
