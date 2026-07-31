import { javascriptGenerator, Order } from 'blockly/javascript';
import type { Block } from 'blockly/core';
import { registerPolySubModQ } from '../postquantum/helpers';

/** Polynomial subtraction modulo q: (a - b) mod q */
javascriptGenerator.forBlock['pq_poly_sub'] = function(block: Block): [string, number] {
  const a = javascriptGenerator.valueToCode(block, 'A', Order.ATOMIC) || '[]';
  const b = javascriptGenerator.valueToCode(block, 'B', Order.ATOMIC) || '[]';
  const modulus = block.getFieldValue('MODULUS') || '3329';

  const polySubFn = registerPolySubModQ();
  return [`${polySubFn}(${a}, ${b}, ${modulus})`, Order.ATOMIC];
};
