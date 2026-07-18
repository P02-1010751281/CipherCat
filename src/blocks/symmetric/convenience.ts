/**
 * AES 便利块 + SM4 便利块 + 模式块 — M2 对称密码便利层
 * 集中定义以减少文件碎片
 */
import * as Blockly from 'blockly/core';
import { TYPE_BYTES, TYPE_INT_LIST, TYPE_NUMBER } from '@/constants/block-types';

// ─── AES 便利块 ───────────────────────

export const AES_CONVENIENCE_TYPES = [
  'aes_round',
  'aes_last_round',
  'aes_key_schedule',
] as const;

Blockly.Blocks['aes_round'] = {
  init: function () {
    this.appendValueInput('STATE').setCheck(TYPE_INT_LIST).appendField('🔧 AES Round(');
    this.appendValueInput('ROUND_KEY').setCheck(TYPE_INT_LIST).appendField(', rk:');
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_INT_LIST);
    this.setColour(195);
    this.setTooltip('AES 完整轮: SubBytes→ShiftRows→MixColumns→AddRoundKey\n右键可展开为 4 个原子块');
    this.setHelpUrl('https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.197.pdf');
  },
};

Blockly.Blocks['aes_last_round'] = {
  init: function () {
    this.appendValueInput('STATE').setCheck(TYPE_INT_LIST).appendField('🔧 AES Last Round(');
    this.appendValueInput('ROUND_KEY').setCheck(TYPE_INT_LIST).appendField(', rk:');
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_INT_LIST);
    this.setColour(195);
    this.setTooltip('AES 最后一轮: SubBytes→ShiftRows→AddRoundKey (跳过 MixColumns)');
    this.setHelpUrl('https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.197.pdf');
  },
};

Blockly.Blocks['aes_key_schedule'] = {
  init: function () {
    this.appendValueInput('KEY').setCheck(TYPE_BYTES).appendField('🔧 AES KeySchedule(');
    this.appendDummyInput()
      .appendField('bits:')
      .appendField(new Blockly.FieldDropdown([['128','128'],['192','192'],['256','256']]), 'BITS');
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_INT_LIST);
    this.setColour(195);
    this.setTooltip('AES 密钥扩展 128/192/256-bit → 轮密钥列表');
    this.setHelpUrl('https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.197.pdf');
  },
};

// ─── SM4 便利块 ───────────────────────

export const SM4_CONVENIENCE_TYPES = [
  'sm4_round',
  'sm4_key_schedule',
] as const;

Blockly.Blocks['sm4_round'] = {
  init: function () {
    this.appendValueInput('STATE').setCheck(TYPE_INT_LIST).appendField('🔧 SM4 Round(');
    this.appendValueInput('ROUND_KEY').setCheck(TYPE_NUMBER).appendField(', rk:');
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_INT_LIST);
    this.setColour(195);
    this.setTooltip('SM4 完整轮: 轮函数 F + 异或轮密钥\n右键可展开为原子块');
    this.setHelpUrl('http://www.gmbz.org.cn/');
  },
};

Blockly.Blocks['sm4_key_schedule'] = {
  init: function () {
    this.appendValueInput('KEY').setCheck(TYPE_BYTES).appendField('🔧 SM4 KeySchedule(');
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_INT_LIST);
    this.setColour(195);
    this.setTooltip('SM4 32轮密钥生成 (GM/T 0002-2012)');
    this.setHelpUrl('http://www.gmbz.org.cn/');
  },
};

// ─── 模式块 ───────────────────────────

export const MODE_BLOCK_TYPES = [
  'mode_ecb',
  'mode_cbc',
  'mode_ctr',
  'mode_gcm',
] as const;
export type ModeBlockType = (typeof MODE_BLOCK_TYPES)[number];

function _makeModeBlock(type: string, label: string, hasIv: boolean): void {
  Blockly.Blocks[type] = {
    init: function () {
      this.appendValueInput('DATA').setCheck(TYPE_BYTES).appendField(label + '(');
      this.appendValueInput('KEY').setCheck(TYPE_BYTES).appendField(', key:');
      if (hasIv) {
        this.appendValueInput('IV').setCheck(TYPE_BYTES).appendField(', iv:');
      }
      this.appendDummyInput().appendField(')');
      this.setInputsInline(true);
      this.setOutput(true, TYPE_BYTES);
      this.setColour(175);
      this.setTooltip(label + ' 分组密码模式');
      this.setHelpUrl('');
    },
  };
}

_makeModeBlock('mode_ecb', '🔧 ECB', false);
_makeModeBlock('mode_cbc', '🔧 CBC', true);
_makeModeBlock('mode_ctr', '🔧 CTR', true);
_makeModeBlock('mode_gcm', '🔧 GCM', true);
