/**
 * P-256 (secp256r1) ECDH 共享密钥原子块定义
 *
 * - ecdh_shared_secret: ECDH-SharedSecret(d, qx, qy) → String（64 hex chars）
 *   共享点 S = [d]Q 的 x 坐标 32 字节大端 hex。d 为私钥 hex（32B，自动模 n 截断，
 *   结果须在 [1, n-1]）；(qx, qy) 为对方公钥坐标 hex（32B，须在曲线上）。
 *   官方向量：RFC 5903 §8.1（IKE P-256）+ cryptography 确定性派生 2 组，JS/Python 双语言全 PASS。
 */
import * as Blockly from 'blockly/core';
import { TYPE_STRING } from '@/constants/block-types';

export const ECDH_BLOCK_TYPES = ['ecdh_shared_secret'] as const;
export type EcdhBlockType = (typeof ECDH_BLOCK_TYPES)[number];

Blockly.Blocks['ecdh_shared_secret'] = {
  init: function () {
    this.appendValueInput('D')
      .setCheck(TYPE_STRING)
      .appendField('ECDH-SharedSecret( d:');
    this.appendValueInput('QX').setCheck(TYPE_STRING).appendField(' qx:');
    this.appendValueInput('QY').setCheck(TYPE_STRING).appendField(' qy:');
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_STRING);
    this.setColour(230);
    this.setTooltip(
      'P-256 ECDH 共享密钥 (RFC 5903, secp256r1)：d = 私钥 hex(32B)，qx/qy = 对方公钥坐标 hex(32B)。' +
        '输出共享点 S = [d]Q 的 x 坐标 32 字节大端 hex（64 字符）。d 自动模 n 截断并校验 [1, n-1]，公钥须在曲线上。' +
        '官方向量（RFC 5903 §8.1 + cryptography 派生 2 组）验证通过。',
    );
    this.setHelpUrl('https://www.rfc-editor.org/rfc/rfc5903');
  },
};
