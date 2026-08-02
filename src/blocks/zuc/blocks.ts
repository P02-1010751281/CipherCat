/**
 * ZUC 祖冲之序列密码原子块定义 (GB/T 33133-2016)
 *
 * 教学原子分解：
 * - zuc_s0: 8×8 S0 S-box 查表
 * - zuc_s1: 8×8 S1 S-box 查表
 * - zuc_l1: 32-bit 线性变换 L1(X) = X ^ rotl(X,2) ^ rotl(X,10) ^ rotl(X,18) ^ rotl(X,24)
 * - zuc_l2: 32-bit 线性变换 L2(X) = X ^ rotl(X,8) ^ rotl(X,14) ^ rotl(X,22) ^ rotl(X,30)
 * - zuc_f:  非线性函数 F(X0,X1,X2,R1,R2) → W（S0/S1 交织 + L1/L2 组合）
 * - zuc_keystream: 完整密钥流生成（LFSR + 比特重组 + F，32 轮初始化 + 工作模式）
 */
import * as Blockly from 'blockly/core';
import { TYPE_BYTES, TYPE_INT_LIST, TYPE_NUMBER } from '@/constants/block-types';

export const ZUC_BLOCK_TYPES = [
  'zuc_s0',
  'zuc_s1',
  'zuc_l1',
  'zuc_l2',
  'zuc_f',
  'zuc_keystream',
] as const;
export type ZucBlockType = (typeof ZUC_BLOCK_TYPES)[number];

Blockly.Blocks['zuc_s0'] = {
  init: function () {
    this.appendValueInput('INPUT')
      .setCheck(TYPE_NUMBER)
      .appendField('ZUC S0(');
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_NUMBER);
    this.setColour(180);
    this.setTooltip(
      'ZUC 8×8 S0 S-box 查找 (GB/T 33133 附录 A.1)：输入 0-255 字节，输出 S0 值',
    );
    this.setHelpUrl('');
  },
};

Blockly.Blocks['zuc_s1'] = {
  init: function () {
    this.appendValueInput('INPUT')
      .setCheck(TYPE_NUMBER)
      .appendField('ZUC S1(');
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_NUMBER);
    this.setColour(180);
    this.setTooltip(
      'ZUC 8×8 S1 S-box 查找 (GB/T 33133 附录 A.2)：输入 0-255 字节，输出 S1 值',
    );
    this.setHelpUrl('');
  },
};

Blockly.Blocks['zuc_l1'] = {
  init: function () {
    this.appendValueInput('INPUT')
      .setCheck(TYPE_NUMBER)
      .appendField('ZUC L1(');
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_NUMBER);
    this.setColour(180);
    this.setTooltip(
      'ZUC 32-bit 线性变换 L1(X) = X ⊕ (X<<<2) ⊕ (X<<<10) ⊕ (X<<<18) ⊕ (X<<<24)',
    );
    this.setHelpUrl('');
  },
};

Blockly.Blocks['zuc_l2'] = {
  init: function () {
    this.appendValueInput('INPUT')
      .setCheck(TYPE_NUMBER)
      .appendField('ZUC L2(');
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_NUMBER);
    this.setColour(180);
    this.setTooltip(
      'ZUC 32-bit 线性变换 L2(X) = X ⊕ (X<<<8) ⊕ (X<<<14) ⊕ (X<<<22) ⊕ (X<<<30)',
    );
    this.setHelpUrl('');
  },
};

Blockly.Blocks['zuc_f'] = {
  init: function () {
    this.appendValueInput('X0')
      .setCheck(TYPE_NUMBER)
      .appendField('ZUC F(');
    this.appendValueInput('X1').setCheck(TYPE_NUMBER).appendField(' X1:');
    this.appendValueInput('X2').setCheck(TYPE_NUMBER).appendField(' X2:');
    this.appendValueInput('R1').setCheck(TYPE_NUMBER).appendField(' R1:');
    this.appendValueInput('R2').setCheck(TYPE_NUMBER).appendField(' R2:');
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_NUMBER);
    this.setColour(180);
    this.setTooltip(
      'ZUC 非线性函数 F (GB/T 33133 §5.4)：W = (X0⊕R1)⊞R2；R1/R2 记忆单元更新见生成器注释',
    );
    this.setHelpUrl('');
  },
};

Blockly.Blocks['zuc_keystream'] = {
  init: function () {
    this.appendValueInput('KEY')
      .setCheck(TYPE_BYTES)
      .appendField('ZUC Keystream(');
    this.appendValueInput('IV').setCheck(TYPE_BYTES).appendField(' iv:');
    this.appendValueInput('LEN').setCheck(TYPE_NUMBER).appendField(' len:');
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_INT_LIST);
    this.setColour(180);
    this.setTooltip(
      'ZUC 密钥流生成 (GB/T 33133 §5.6)：输入 16 字节 key/iv 与输出字数 len，返回密钥流字数组（32 轮初始化 + 工作模式）',
    );
    this.setHelpUrl('');
  },
};
