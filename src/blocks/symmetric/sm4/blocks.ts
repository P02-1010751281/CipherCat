/**
 * SM4 分组密码算法原子块定义 (GB/T 32907-2016)
 *
 * - sm4_round_func: 32-bit word×4 + round_key → 4 words (轮函数 F)
 * - sm4_linear_transform: L(B) 线性变换
 */
import * as Blockly from 'blockly/core';
import { TYPE_INT_LIST, TYPE_NUMBER } from '@/constants/block-types';

export const SM4_BLOCK_TYPES = [
  'sm4_sbox',
  'sm4_round_func',
  'sm4_linear_transform',
] as const;
export type Sm4BlockType = (typeof SM4_BLOCK_TYPES)[number];

Blockly.Blocks['sm4_sbox'] = {
  init: function () {
    this.appendValueInput('INPUT')
      .setCheck(TYPE_NUMBER)
      .appendField('SM4 Sbox(');
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_NUMBER);
    this.setColour(180);
    this.setTooltip('SM4 8×8 S-box 查找 (GB/T 32907-2016)：输入 0-255 字节，输出 S-box 值');
    this.setHelpUrl('');
  },
};

Blockly.Blocks['sm4_round_func'] = {
  init: function () {
    // 每个输入都要有可见标识：F(X0,X1,X2,X3,rk) 是位置相关的，只给 rk 标注会让人分不清前四个槽。
    // 与 zuc_eia3 等多参数块一致，采用「带标识 + 多行」而不是一行逗号分隔。
    this.appendValueInput('X0').setCheck(TYPE_INT_LIST).appendField('SM4 F( X0:');
    this.appendValueInput('X1').setCheck(TYPE_INT_LIST).appendField('X1:');
    this.appendValueInput('X2').setCheck(TYPE_INT_LIST).appendField('X2:');
    this.appendValueInput('X3').setCheck(TYPE_INT_LIST).appendField('X3:');
    this.appendValueInput('RK').setCheck(TYPE_NUMBER).appendField(' rk:');
    this.appendDummyInput().appendField(')');
    this.setInputsInline(false);
    this.setOutput(true, TYPE_INT_LIST);
    this.setColour(180);
    this.setTooltip('SM4 轮函数 F(X0,X1,X2,X3,rk) = (X0⊕X1⊕X2⊕X3⊕rk) 经 S-box + L 变换 (GB/T 32907-2016)');
    this.setHelpUrl('');
  },
};

Blockly.Blocks['sm4_linear_transform'] = {
  init: function () {
    this.appendValueInput('B').setCheck(TYPE_INT_LIST).appendField('SM4 L(');
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_INT_LIST);
    this.setColour(180);
    this.setTooltip('SM4 L(B) = B ⊕ (B<<<2) ⊕ (B<<<10) ⊕ (B<<<18) ⊕ (B<<<24) (GB/T 32907-2016)');
    this.setHelpUrl('');
  },
};
