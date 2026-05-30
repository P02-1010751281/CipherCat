import { javascriptGenerator, Order } from 'blockly/javascript';
import type { Block } from 'blockly/core';

javascriptGenerator.forBlock['bit_operation'] = function (
  block: Block,
): [string, number] {
  const a = javascriptGenerator.valueToCode(block, 'A', Order.ATOMIC) || '0';
  const b = javascriptGenerator.valueToCode(block, 'B', Order.ATOMIC) || '0';
  const op = block.getFieldValue('OP') || 'AND';

  const operations: Record<string, string> = {
    AND: `((${a} & ${b}) >>> 0)`,
    OR: `((${a} | ${b}) >>> 0)`,
    XOR: `((${a} ^ ${b}) >>> 0)`,
    LEFT_SHIFT: `((${a} << ${b}) >>> 0)`,
    RIGHT_SHIFT: `((${a} >>> ${b}) >>> 0)`,
    LEFT_ROTATE: `(((${a} << ${b}) | (${a} >>> (32 - ${b}))) >>> 0)`,
    RIGHT_ROTATE: `(((${a} >>> ${b}) | (${a} << (32 - ${b}))) >>> 0)`,
  };
  const code = operations[op] || '';
  return [code, Order.ATOMIC];
};
