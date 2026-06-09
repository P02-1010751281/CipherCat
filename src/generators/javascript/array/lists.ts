import { javascriptGenerator, Order } from 'blockly/javascript';
import type { Block } from 'blockly/core';

// Override lists_getIndex: use 0-based indexing (consistent with ctrl_iterate's 0-based loop)
javascriptGenerator.forBlock['lists_getIndex'] = function (
  block: Block,
): [string, Order] {
  const list = javascriptGenerator.valueToCode(block, 'VALUE', Order.MEMBER) || '[]';
  const at = javascriptGenerator.valueToCode(block, 'AT', Order.ATOMIC) || '0';
  return [`${list}[${at}]`, Order.MEMBER];
};

// Override lists_setIndex: use 0-based indexing
javascriptGenerator.forBlock['lists_setIndex'] = function (block: Block): string {
  const list = javascriptGenerator.valueToCode(block, 'LIST', Order.ATOMIC) || '[]';
  const at = javascriptGenerator.valueToCode(block, 'AT', Order.ATOMIC) || '0';
  const value = javascriptGenerator.valueToCode(block, 'TO', Order.ATOMIC) || 'null';
  return `${list}[${at}] = ${value};\n`;
};
