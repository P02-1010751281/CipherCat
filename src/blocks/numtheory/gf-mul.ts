/**
 * GF(2⁸) 域乘法原子块定义
 *
 * AES MixColumns 使用的域：不可约多项式 x⁸ + x⁴ + x³ + x + 1 (0x11B)
 */
import * as Blockly from 'blockly/core';

export const GF_BLOCK_TYPES = [
  'gf_mul',
] as const;
export type GfBlockType = (typeof GF_BLOCK_TYPES)[number];

Blockly.Blocks['gf_mul'] = {
  init: function () {
    this.appendValueInput('A').setCheck('Number').appendField('GF(2⁸)·(');
    this.appendValueInput('B').setCheck('Number').appendField(' ×');
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, 'Number');
    this.setColour(20);
    this.setTooltip('GF(2⁸) 域乘法（AES MixColumns 使用的域，不可约多项式 x⁸+x⁴+x³+x+1）');
    this.setHelpUrl('');
  },
};
