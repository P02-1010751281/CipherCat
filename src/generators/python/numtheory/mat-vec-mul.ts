import { pythonGenerator, Order } from 'blockly/python';
import type { Block } from 'blockly/core';
import { registerMatVecMul } from '../postquantum/helpers';

/** Matrix-vector multiplication modulo q. */
pythonGenerator.forBlock['pq_mat_vec_mul'] = function(block: Block): [string, number] {
  const A = pythonGenerator.valueToCode(block, 'MATRIX', Order.ATOMIC) || '[]';
  const v = pythonGenerator.valueToCode(block, 'VEC', Order.ATOMIC) || '[]';
  const modulus = block.getFieldValue('MODULUS') || '3329';

  const fn = registerMatVecMul();
  return [fn + '(' + A + ', ' + v + ', q=' + modulus + ')', Order.ATOMIC];
};
