import { javascriptGenerator, Order } from 'blockly/javascript';
import type { Block } from 'blockly/core';
import { registerMatVecMulQ } from '../postquantum/helpers';

/** Matrix-vector multiplication modulo q */
javascriptGenerator.forBlock['pq_mat_vec_mul'] = function(block: Block): [string, number] {
  const A = javascriptGenerator.valueToCode(block, 'MATRIX', Order.ATOMIC) || '[]';
  const v = javascriptGenerator.valueToCode(block, 'VEC', Order.ATOMIC) || '[]';
  const modulus = block.getFieldValue('MODULUS') || '3329';

  const fn = registerMatVecMulQ();
  return [`${fn}(${A}, ${v}, ${modulus})`, Order.ATOMIC];
};
