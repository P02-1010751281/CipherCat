/**
 * Argon2 原子块定义 (RFC 9106, v1.3 / version 0x13)
 *
 * - argon2_hash: Argon2(password, salt, secret, ad, mCost, tCost, lanes, tagLen, VARIANT) → Bytes
 *   VARIANT 下拉：Argon2d（数据相关）/ Argon2i（数据无关）/ Argon2id（前半个第一 pass 用 i，其余 d）。
 *   H0 = BLAKE2b-64(LE32(p)‖LE32(T)‖LE32(m)‖LE32(t)‖LE32(v)‖LE32(y)‖LE32(len(P))‖P‖…)。
 *   RFC 9106 限制 P/S/K/X 各不超过 2^32−1 字节；项目生成代码接受字节序列或 UTF-8 文本，每项输入限制为 1 MiB。
 *   Demo 回归运行 RFC 9106 §5.1-5.3 的 Argon2d/i/id 最终 Tag 样例；不覆盖 RFC 全量测试集。
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
      'Argon2 v1.3（RFC 9106）教学实现：拒绝非整数及越界参数、mCost < 8×lanes、mCost > 65,536 KiB、tCost > 10、lanes > 16、tagLen > 1,024 字节及 mCost×tCost > 65,536 KiB-pass。这些是项目执行上限，不是 RFC 最大值；RFC 推荐 16 字节盐。该实现不支持 RFC 推荐的生产参数配置。',
    );
    this.setHelpUrl('https://www.rfc-editor.org/rfc/rfc9106');
  },
};
