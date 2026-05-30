import { pythonGenerator, Order } from 'blockly/python';
import type { Block } from 'blockly/core';

pythonGenerator.forBlock['lgc_operation'] = function(block: Block): string {
  const instr = block.getFieldValue('instr') || 'XOR';
  const a = pythonGenerator.valueToCode(block, 'A', Order.ATOMIC) || '0';
  const b = pythonGenerator.valueToCode(block, 'B', Order.ATOMIC) || '0';
  const c = pythonGenerator.valueToCode(block, 'C', Order.ATOMIC) || 'result';

  let operation = '';
  if (instr === 'XOR') {
    operation = '^';
  } else if (instr === 'OR') {
    operation = '|';
  } else if (instr === 'AND') {
    operation = '&';
  }

  return `${c} = (${a} ${operation} ${b}) & 0xFFFFFFFF\n`;
};

pythonGenerator.forBlock['lgc_compound'] = function(block: Block): string {
  const instr = block.getFieldValue('instr') || 'XOR_XOR';
  const a = pythonGenerator.valueToCode(block, 'A', Order.ATOMIC) || '0';
  const b = pythonGenerator.valueToCode(block, 'B', Order.ATOMIC) || '0';
  const c = pythonGenerator.valueToCode(block, 'C', Order.ATOMIC) || 'result';

  const [op1, op2] = instr.split('_');

  let operation1 = '';
  let operation2 = '';

  if (op1 === 'XOR') operation1 = '^';
  else if (op1 === 'OR') operation1 = '|';
  else if (op1 === 'AND') operation1 = '&';

  if (op2 === 'XOR') operation2 = '^';
  else if (op2 === 'OR') operation2 = '|';
  else if (op2 === 'AND') operation2 = '&';

  return `${c} = ((${a} ${operation1} ${b}) ${operation2} ${b}) & 0xFFFFFFFF\n`;
};

pythonGenerator.forBlock['lgc_not'] = function(block: Block): string {
  const value1 = pythonGenerator.valueToCode(block, 'VALUE1', Order.ATOMIC) || '0';
  const value2 = pythonGenerator.valueToCode(block, 'VALUE2', Order.ATOMIC) || 'result';

  return `${value2} = (~${value1}) & 0xFFFFFFFF\n`;
};
