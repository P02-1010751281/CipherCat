import { javascriptGenerator, Order } from 'blockly/javascript';
import type { Block } from 'blockly/core';

javascriptGenerator.forBlock['ctrl_assign'] = function (block: Block): string {
  const left = javascriptGenerator.valueToCode(block, 'LEFT', Order.ATOMIC) || '';
  const right = javascriptGenerator.valueToCode(block, 'RIGHT', Order.ATOMIC) || '';
  return left + ' = ' + right + ';\n';
};
