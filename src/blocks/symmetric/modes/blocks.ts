/**
 * 分组模式积木块定义
 *
 * ECB / CBC / CTR 分组模式的块加密原语。
 * 基于 AES-128 块加密，展示分组密码模式的教学核心。
 */
import { TYPE_BYTES, TYPE_INT_LIST } from '@/constants/block-types';
import * as Blockly from 'blockly/core';

export const MODE_BLOCK_TYPES = [
  'mode_ecb_encrypt',
  'mode_cbc_encrypt',
  'mode_ctr_encrypt',
] as const;

export type ModeBlockType = typeof MODE_BLOCK_TYPES[number];

Blockly.Blocks['mode_ecb_encrypt'] = {
  init: function () {
    this.appendValueInput('DATA').setCheck(TYPE_BYTES).appendField('ECB-Encrypt(');
    this.appendValueInput('KEY').setCheck(TYPE_BYTES).appendField(', key:');
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_BYTES);
    this.setColour(190);
    this.setTooltip('AES-ECB 加密：每个明文块独立用 AES-128 加密。 (SP 800-38A §6.1)');
    this.setHelpUrl('https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-38A.pdf');
  },
};

Blockly.Blocks['mode_cbc_encrypt'] = {
  init: function () {
    this.appendValueInput('DATA').setCheck(TYPE_BYTES).appendField('CBC-Encrypt(');
    this.appendValueInput('KEY').setCheck(TYPE_BYTES).appendField(', key:');
    this.appendValueInput('IV').setCheck(TYPE_BYTES).appendField(', iv:');
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_BYTES);
    this.setColour(190);
    this.setTooltip('AES-CBC 加密：每个块先与前一块密文 XOR 再加密。 (SP 800-38A §6.2)');
    this.setHelpUrl('https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-38A.pdf');
  },
};

Blockly.Blocks['mode_ctr_encrypt'] = {
  init: function () {
    this.appendValueInput('DATA').setCheck(TYPE_BYTES).appendField('CTR-Encrypt(');
    this.appendValueInput('KEY').setCheck(TYPE_BYTES).appendField(', key:');
    this.appendValueInput('NONCE').setCheck(TYPE_BYTES).appendField(', nonce:');
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_BYTES);
    this.setColour(190);
    this.setTooltip('AES-CTR 加密：计数器值加密后与明文 XOR。 (SP 800-38A §6.5)');
    this.setHelpUrl('https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-38A.pdf');
  },
};
