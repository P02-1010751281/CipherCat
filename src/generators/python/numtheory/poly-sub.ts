import { pythonGenerator, Order } from 'blockly/python';
import type { Block } from 'blockly/core';
import { registerPolySubMod } from '../postquantum/helpers';

/** Polynomial subtraction modulo q: (a - b) mod q. */
pythonGenerator.forBlock['pq_poly_sub'] = function(block: Block): [string, number] {
  const a = pythonGenerator.valueToCode(block, 'A', Order.ATOMIC) || '[]';
  const b = pythonGenerator.valueToCode(block, 'B', Order.ATOMIC) || '[]';
  const modulus = block.getFieldValue('MODULUS') || '3329';

  const funcName = registerPolySubMod();
  return [funcName + '(' + a + ', ' + b + ', q=' + modulus + ')', Order.ATOMIC];
};
