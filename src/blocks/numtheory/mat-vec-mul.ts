/** Teaching block for scalar matrix-vector multiplication modulo q. */
import { TYPE_INT_LIST } from '@/constants/block-types';
import * as Blockly from 'blockly/core';

export const MAT_VEC_MUL_BLOCK_TYPES = [
  'pq_mat_vec_mul',
] as const;

export type MatVecMulBlockType = typeof MAT_VEC_MUL_BLOCK_TYPES[number];

Blockly.Blocks['pq_mat_vec_mul'] = {
  init: function() {
    this.appendValueInput('MATRIX').setCheck(TYPE_INT_LIST)
      .appendField('ScalarMatVec(');
    this.appendValueInput('VEC').setCheck(TYPE_INT_LIST)
      .appendField('·');
    this.appendDummyInput()
      .appendField(', q=')
      .appendField(new Blockly.FieldDropdown([
        ['3329', '3329'],
        ['8380417', '8380417'],
      ]), 'MODULUS');
    this.appendDummyInput()
      .appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_INT_LIST);
    this.setColour(250);
    this.setTooltip(
      'Teaching helper for scalar modular matrix-vector multiplication. ' +
      'A is a row-major flattened k×k matrix; this is not the polynomial-ring operation in FIPS 203/204.'
    );
    this.setHelpUrl('');
  },
};
