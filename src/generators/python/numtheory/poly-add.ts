import { pythonGenerator, Order } from 'blockly/python';
import type { Block } from 'blockly/core';
import { registerPolyAddMod } from '../postquantum/helpers';

/** Polynomial addition modulo q: (a + b) mod q. */
pythonGenerator.forBlock['pq_poly_add'] = function(block: Block): [string, number] {
  const a = pythonGenerator.valueToCode(block, 'A', Order.ATOMIC) || '[]';
  const b = pythonGenerator.valueToCode(block, 'B', Order.ATOMIC) || '[]';
  const modulus = block.getFieldValue('MODULUS') || '3329';

  const funcName = registerPolyAddMod();
  return [funcName + '(' + a + ', ' + b + ', q=' + modulus + ')', Order.ATOMIC];
};
