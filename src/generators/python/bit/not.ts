import { pythonGenerator, Order } from 'blockly/python';
import type { Block } from 'blockly/core';
import { uint32Expression } from './uint32';

pythonGenerator.forBlock['bit_not32'] = function(block: Block): [string, number] {
  const a = pythonGenerator.valueToCode(block, 'A', Order.ATOMIC) || '0';
  const code = `(~${uint32Expression(a)}) & 0xFFFFFFFF`;
  return [code, Order.ATOMIC];
};
