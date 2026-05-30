import { javascriptGenerator, Order } from 'blockly/javascript';
import type { Block } from 'blockly/core';
import { registerPolyAddModQ } from '../postquantum/helpers';

/**
 * Polynomial addition modulo q: (a + b) mod q
 */
javascriptGenerator.forBlock['pq_poly_add'] = function(block: Block): [string, number] {
  const a = javascriptGenerator.valueToCode(block, 'A', Order.ATOMIC) || '[]';
  const b = javascriptGenerator.valueToCode(block, 'B', Order.ATOMIC) || '[]';
  const modulus = block.getFieldValue('MODULUS') || '3329';

  const polyAddFn = registerPolyAddModQ();
  return [`${polyAddFn}(${a}, ${b}, ${modulus})`, Order.ATOMIC];
};
