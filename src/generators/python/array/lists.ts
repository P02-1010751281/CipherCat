import { pythonGenerator, Order } from 'blockly/python';
import type { Block } from 'blockly/core';

// 覆盖 lists_getIndex：使用 0-based 索引（与 ctrl_iterate 的 0-based 循环一致）
pythonGenerator.forBlock['lists_getIndex'] = function (
  block: Block,
): [string, Order] {
  const list = pythonGenerator.valueToCode(block, 'VALUE', Order.MEMBER) || '[]';
  const at = pythonGenerator.valueToCode(block, 'AT', Order.ATOMIC) || '0';
  return [`${list}[${at}]`, Order.MEMBER];
};

// 覆盖 lists_setIndex：使用 0-based 索引
pythonGenerator.forBlock['lists_setIndex'] = function (block: Block): string {
  const list = pythonGenerator.valueToCode(block, 'LIST', Order.ATOMIC) || '[]';
  const at = pythonGenerator.valueToCode(block, 'AT', Order.ATOMIC) || '0';
  const value = pythonGenerator.valueToCode(block, 'TO', Order.ATOMIC) || 'None';
  return `${list}[${at}] = ${value}\n`;
};
