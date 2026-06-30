/**
 * 通用值输入块定义
 *
 * data_value 接受任意文本值——数字、表达式、数组字面量等，
 * 生成器原样透传，不做数值转换和引号包裹。
 */
import * as Blockly from 'blockly/core';

export const NUMBER_BLOCK_TYPES = [
  'cipher_key_from_seed',
  'seed_bytes',
  'seed_hex',
  'data_value',
] as const;

export type NumberBlockType = (typeof NUMBER_BLOCK_TYPES)[number];

Blockly.Blocks['data_value'] = {
  init: function () {
    this.appendDummyInput().appendField(new Blockly.FieldTextInput('0'), 'NUM');
    this.setOutput(true, null);
    this.setColour(230);
    this.setTooltip(
      Blockly.Msg.CRYPTO_NUMBER_TOOLTIP || 'Enter a number or expression',
    );
    this.setHelpUrl('');
  },
};

// Seed 值块：输出 data (bytes) / data.hex() (hex 字符串)
Blockly.Blocks['seed_bytes'] = {
  init: function () {
    this.appendDummyInput().appendField('seed (bytes)');
    this.setOutput(true, null);
    this.setColour(230);
    this.setTooltip('当前种子原始字节 (data)');
    this.setHelpUrl('');
  },
};

Blockly.Blocks['seed_hex'] = {
  init: function () {
    this.appendDummyInput().appendField('seed (hex)');
    this.setOutput(true, null);
    this.setColour(230);
    this.setTooltip('当前种子的十六进制字符串 (data.hex())');
    this.setHelpUrl('');
  },
};

// 密钥派生块：从 data (seed) 生成 4×32-bit 密钥列表
Blockly.Blocks['cipher_key_from_seed'] = {
  init: function () {
    this.appendDummyInput().appendField('密钥 (from seed)');
    this.setOutput(true, null);
    this.setColour(230);
    this.setTooltip('从 seed 派生 4 个 32-bit 字，输出 Python 列表表达式');
    this.setHelpUrl('');
  },
};
