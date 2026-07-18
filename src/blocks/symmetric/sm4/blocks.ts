/**
 * SM4 分组密码算法原子块定义 (GM/T 0002-2012)
 *
 * - sm4_round_func: 32-bit word×4 + round_key → 4 words (轮函数 F)
 * - sm4_linear_transform: L(B) 线性变换
 * - sm4_round: SM4 完整轮 (含密钥异或) — 便利块
 * - sm4_key_schedule: SM4 32轮密钥生成 — 便利块
 */
import * as Blockly from 'blockly/core';
import { TYPE_BYTES, TYPE_INT_LIST } from '@/constants/block-types';

export const SM4_BLOCK_TYPES = [
  'sm4_round_func',
  'sm4_linear_transform',
  'sm4_round',
  'sm4_key_schedule',
] as const;
export type Sm4BlockType = (typeof SM4_BLOCK_TYPES)[number];

Blockly.Blocks['sm4_round_func'] = {
  init: function () {
    this.appendValueInput('X0').setCheck(TYPE_INT_LIST).appendField('SM4 F(');
    this.appendValueInput('X1').setCheck(TYPE_INT_LIST).appendField(',');
    this.appendValueInput('X2').setCheck(TYPE_INT_LIST).appendField(',');
    this.appendValueInput('X3').setCheck(TYPE_INT_LIST).appendField(',');
    this.appendValueInput('RK').setCheck('Number').appendField(' rk:');
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_INT_LIST);
    this.setColour(180);
    this.setTooltip('SM4 轮函数 F(X0,X1,X2,X3,rk) = (X0⊕X1⊕X2⊕X3⊕rk) 经 S-box + L 变换 (GM/T 0002-2012)');
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
    this.setTooltip('SM4 L(B) = B ⊕ (B<<<2) ⊕ (B<<<10) ⊕ (B<<<18) ⊕ (B<<<24) (GM/T 0002-2012)');
    this.setHelpUrl('');
  },
};

// ─────────────────────────────────────────────
// SM4 便利块（colour 195 = 180 + 15 便利层偏移）
// ─────────────────────────────────────────────

Blockly.Blocks['sm4_round'] = {
  init: function () {
    this.appendValueInput('X0').setCheck(TYPE_INT_LIST).appendField('SM4Round(');
    this.appendValueInput('X1').setCheck(TYPE_INT_LIST).appendField(',');
    this.appendValueInput('X2').setCheck(TYPE_INT_LIST).appendField(',');
    this.appendValueInput('X3').setCheck(TYPE_INT_LIST).appendField(',');
    this.appendValueInput('RK').setCheck('Number').appendField(' rk:');
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_INT_LIST);
    this.setColour(195);
    this.setTooltip('SM4 完整轮: F(X0,X1,X2,X3,rk) 经 S-box + L 变换后异或到 X0 (GM/T 0002-2012)');
    this.setHelpUrl('');
  },
};

Blockly.Blocks['sm4_key_schedule'] = {
  init: function () {
    this.appendValueInput('KEY').setCheck(TYPE_BYTES).appendField('SM4KeySchedule(');
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_INT_LIST);
    this.setColour(195);
    this.setTooltip('SM4 密钥扩展: 输入 16 字节密钥，输出 32 轮 32-bit 轮密钥 (GM/T 0002-2012)');
    this.setHelpUrl('');
  },
};
