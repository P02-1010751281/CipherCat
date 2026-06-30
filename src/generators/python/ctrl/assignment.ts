import { pythonGenerator, Order } from 'blockly/python';
import type { Block } from 'blockly/core';

pythonGenerator.forBlock['ctrl_assign'] = function (block: Block): string {
  const left = pythonGenerator.valueToCode(block, 'LEFT', Order.ATOMIC) || '';
  const right = pythonGenerator.valueToCode(block, 'RIGHT', Order.ATOMIC) || '';
  return left + ' = ' + right + '\n';
};
