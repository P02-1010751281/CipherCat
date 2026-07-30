/**
 * GF(2^m) 通用乘法块 — 支持任意二进制扩域的乘法
 *
 * AES:  m=8,  irreducible = x⁸+x⁴+x³+x+1 (0x11B)
 * GCM:  m=128, irreducible = x¹²⁸+x⁷+x²+x+1
 * Custom: 用户指定 irreducible polynomial
 */
import * as Blockly from 'blockly/core';
import { TYPE_INT_LIST } from '@/constants/block-types';

export const GF2M_BLOCK_TYPES = ['gf2m_mul'] as const;
export type Gf2mBlockType = (typeof GF2M_BLOCK_TYPES)[number];

Blockly.Blocks['gf2m_mul'] = {
  init: function () {
    this.appendValueInput('A').setCheck(TYPE_INT_LIST).appendField('GF(2^');
    this.appendDummyInput()
      .appendField(
        new Blockly.FieldDropdown([
          ['8 (AES)', 'aes'],
          ['128 (GCM)', 'gcm'],
          ['custom', 'custom'],
        ]),
        'FIELD',
      )
      .appendField(') × (');
    this.appendValueInput('B').setCheck(TYPE_INT_LIST).appendField(' ,');
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_INT_LIST);
    this.setColour(20);
    this.setTooltip(
      'GF(2^m) 多项式乘法，模不可约多项式\n' +
      'AES: x⁸+x⁴+x³+x+1  |  GCM: x¹²⁸+x⁷+x²+x+1',
    );
    this.setHelpUrl('');
  },
};
