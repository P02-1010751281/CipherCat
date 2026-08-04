/**
 * 数组切片原子块
 *
 * arr_slice(list, start, length) → list[start : start+length]
 * 通用数组工具（编码基 xgcd 展平输出 [len_u, u…, len_v, v…, g…] 的解析基础）。
 */
import * as Blockly from 'blockly/core';
import { TYPE_INT_LIST, TYPE_NUMBER } from '@/constants/block-types';

export const SLICE_BLOCK_TYPES = ['arr_slice'] as const;
export type SliceBlockType = (typeof SLICE_BLOCK_TYPES)[number];

Blockly.Blocks['arr_slice'] = {
  init: function () {
    this.appendValueInput('LIST')
      .setCheck(TYPE_INT_LIST)
      .appendField('Slice(');
    this.appendValueInput('START')
      .setCheck(TYPE_NUMBER)
      .appendField(' start:');
    this.appendValueInput('LENGTH')
      .setCheck(TYPE_NUMBER)
      .appendField(' len:');
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_INT_LIST);
    this.setColour(200);
    this.setTooltip('数组切片 list[start : start+length]。越界截断到数组尾。');
    this.setHelpUrl('');
  },
};
