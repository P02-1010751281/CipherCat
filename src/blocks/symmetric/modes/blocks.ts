/**
 * 分组密码模式块定义
 *
 * - mode_ecb: 电子密码本模式（每个 block 独立加密）
 * - mode_cbc: 密码分组链接模式 (Ci = E(Pi ⊕ Ci-1))
 * - mode_ctr: 计数器模式 (CTR)
 * - mode_gcm: Galois/Counter 模式（认证加密）
 */
import * as Blockly from 'blockly/core';
import { TYPE_BYTES } from '@/constants/block-types';

export const MODE_BLOCK_TYPES = [
  'mode_ecb',
  'mode_cbc',
  'mode_ctr',
  'mode_gcm',
] as const;
export type ModeBlockType = (typeof MODE_BLOCK_TYPES)[number];

Blockly.Blocks['mode_ecb'] = {
  init: function () {
    this.appendValueInput('DATA').setCheck(TYPE_BYTES).appendField('ECB(');
    this.appendValueInput('KEY').setCheck(TYPE_BYTES).appendField(', key:');
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_BYTES);
    this.setColour(175);
    this.setTooltip('ECB 模式：对每个 16 字节数据块独立调用 AES/SM4 加密');
    this.setHelpUrl('');
  },
};

Blockly.Blocks['mode_cbc'] = {
  init: function () {
    this.appendValueInput('DATA').setCheck(TYPE_BYTES).appendField('CBC(');
    this.appendValueInput('KEY').setCheck(TYPE_BYTES).appendField(', key:');
    this.appendValueInput('IV').setCheck(TYPE_BYTES).appendField(', iv:');
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_BYTES);
    this.setColour(175);
    this.setTooltip('CBC 模式：每个明文块先与前一个密文块异或，再加密 (Ci = E(Pi ⊕ Ci-1))');
    this.setHelpUrl('');
  },
};

Blockly.Blocks['mode_ctr'] = {
  init: function () {
    this.appendValueInput('DATA').setCheck(TYPE_BYTES).appendField('CTR(');
    this.appendValueInput('KEY').setCheck(TYPE_BYTES).appendField(', key:');
    this.appendValueInput('IV').setCheck(TYPE_BYTES).appendField(', iv:');
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_BYTES);
    this.setColour(175);
    this.setTooltip('CTR 模式：计数器 + nonce 经 AES/SM4 加密后与明文异或生成密文');
    this.setHelpUrl('');
  },
};

Blockly.Blocks['mode_gcm'] = {
  init: function () {
    this.appendValueInput('DATA').setCheck(TYPE_BYTES).appendField('GCM(');
    this.appendValueInput('KEY').setCheck(TYPE_BYTES).appendField(', key:');
    this.appendValueInput('IV').setCheck(TYPE_BYTES).appendField(', iv:');
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_BYTES);
    this.setColour(175);
    this.setTooltip('GCM 模式：AES-CTR + GHASH 认证标签，提供加密和完整性保障');
    this.setHelpUrl('');
  },
};
