/**
 * Argon2 原子块定义 (RFC 9106, v1.3 / version 0x13)
 *
 * - argon2_hash: Argon2(password, salt, secret, ad, mCost, tCost, lanes, tagLen, VARIANT) → Bytes
 *   VARIANT 下拉：Argon2d（数据相关）/ Argon2i（数据无关）/ Argon2id（前半个第一 pass 用 i，其余 d）。
 *   H0 = BLAKE2b-64(LE32(p)‖LE32(T)‖LE32(m)‖LE32(t)‖LE32(v)‖LE32(y)‖LE32(len(P))‖P‖…)。
 *   官方向量：RFC 9106 §5.1-5.3（Argon2d/i/id，v19，32 KiB/3 pass/4 lanes/32 B tag），
 *   pre-hash digest + 每 pass 首末内存块 + Tag 全部一致（JS/Python 双语言）。
 */
import * as Blockly from 'blockly/core';
import { TYPE_BYTES, TYPE_NUMBER } from '@/constants/block-types';

export const ARGON2_BLOCK_TYPES = ['argon2_hash'] as const;
export type Argon2BlockType = (typeof ARGON2_BLOCK_TYPES)[number];

Blockly.Blocks['argon2_hash'] = {
  init: function () {
    this.appendValueInput('PASSWORD')
      .setCheck(TYPE_BYTES)
      .appendField('Argon2(');
    this.appendValueInput('SALT').setCheck(TYPE_BYTES).appendField(' salt:');
    this.appendValueInput('SECRET').setCheck(TYPE_BYTES).appendField(' secret:');
    this.appendValueInput('AD').setCheck(TYPE_BYTES).appendField(' ad:');
    this.appendValueInput('M_COST').setCheck(TYPE_NUMBER).appendField(' mCost:');
    this.appendValueInput('T_COST').setCheck(TYPE_NUMBER).appendField(' tCost:');
    this.appendValueInput('LANES').setCheck(TYPE_NUMBER).appendField(' lanes:');
    this.appendValueInput('TAGLEN').setCheck(TYPE_NUMBER).appendField(' tagLen:');
    this.appendDummyInput()
      .appendField(
        new Blockly.FieldDropdown([
          ['Argon2d', '0'],
          ['Argon2i', '1'],
          ['Argon2id', '2'],
        ]),
        'VARIANT',
      )
      .appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_BYTES);
    this.setColour(190);
    this.setTooltip(
      'Argon2 内存困难口令哈希 (RFC 9106 v1.3)：H0 = BLAKE2b-64(参数‖口令‖盐‖秘密‖关联数据)，m\' = 4p·⌊m/4p⌋ 块矩阵，G 压缩（BLAKE2b 轮 + 乘法），Argon2i/id 数据无关段用预计算伪随机地址。官方向量（RFC 9106 §5.1-5.3）pre-hash + 每 pass 首末块 + Tag 全部一致。',
    );
    this.setHelpUrl('https://www.rfc-editor.org/rfc/rfc9106');
  },
};
