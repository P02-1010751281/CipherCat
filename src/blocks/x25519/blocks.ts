/**
 * X25519 椭圆曲线标量乘法原子块定义 (RFC 7748)
 *
 * - x25519: X25519(k, u) → Bytes 32
 *   Montgomery ladder（曲线 25519：v² = u³ + 486662·u² + u，p = 2^255-19）。
 *   k 自动 clamp（字节 0 低 3 位清零、字节 31 最高位清零 + 次高位置 1）；u 坐标清位 255。
 *   官方向量：RFC 7748 §5.2 Test Vectors（V1/V2）。
 */
import * as Blockly from 'blockly/core';
import { TYPE_BYTES, TYPE_INT_LIST } from '@/constants/block-types';

export const X25519_BLOCK_TYPES = ['x25519'] as const;
export type X25519BlockType = (typeof X25519_BLOCK_TYPES)[number];

Blockly.Blocks['x25519'] = {
  init: function () {
    this.appendValueInput('SCALAR')
      .setCheck(TYPE_INT_LIST)
      .appendField('X25519(');
    this.appendValueInput('U').setCheck(TYPE_INT_LIST).appendField(' u:');
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_BYTES);
    this.setColour(230);
    this.setTooltip(
      'X25519 标量乘法 (RFC 7748)：k 32 字节（自动 clamp），u 坐标 32 字节 → 共享密钥 32 字节。Montgomery ladder，p = 2^255-19。官方向量（RFC 7748 §5.2 V1/V2）验证通过。',
    );
    this.setHelpUrl('https://www.rfc-editor.org/rfc/rfc7748');
  },
};
