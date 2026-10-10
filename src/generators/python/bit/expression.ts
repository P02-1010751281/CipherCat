import { pythonGenerator, Order } from 'blockly/python';
import type { Block } from 'blockly/core';
import { uint32Expression } from './uint32';

pythonGenerator.forBlock['bit_expr_infix'] = function(block: Block): [string, number] {
  const value_a = pythonGenerator.valueToCode(block, 'A', Order.ATOMIC) || '0';
  const value_b = pythonGenerator.valueToCode(block, 'B', Order.ATOMIC) || '0';
  const op = block.getFieldValue('OP');
  let code = '';
  if(op === 'XOR') {
    code = `${uint32Expression(value_a)} ^ ${uint32Expression(value_b)}`;
  } else if(op === 'AND') {
    code = `${uint32Expression(value_a)} & ${uint32Expression(value_b)}`;
  } else if(op === 'OR') {
    code = `${uint32Expression(value_a)} | ${uint32Expression(value_b)}`;
  } else if(op === 'EQ') {
    code = `(${value_a} == ${value_b})`;
  }
  return [code, Order.ATOMIC];
};
