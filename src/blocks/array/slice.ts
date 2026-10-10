/**
 * 数组切片原子块
 *
 * arr_slice(list, start, length) → `length` items from the normalized start index
 * 通用数组工具（解析多项式扩展欧几里得展平输出 [len_u, u…, len_v, v…, g…]）。
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
    this.setTooltip('起始索引须为安全整数（负值从末尾计）；长度表示元素个数，须为非负安全整数，越过数组边界时截断。');
    this.setHelpUrl('');
  },
};
