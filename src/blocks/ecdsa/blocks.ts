/**
 * ECDSA 原子块定义（P-256 + SHA-256，RFC 6979 确定性签名）
 *
 * - ecdsa_sign:   ECDSA-Sign(priv, msg) → Bytes 64（r‖s，各 32 字节大端）
 *   k 由 RFC 6979 §3.2 HMAC-DRBG 确定性生成（无随机数依赖）。
 * - ecdsa_verify: ECDSA-Verify(msg, pub, sig) → Boolean
 *   pub = Ux‖Uy 64 字节（无 0x04 前缀），sig = r‖s 64 字节。
 *   官方向量：RFC 6979 A.2.5（P-256/SHA-256，"sample"/"test"）双语言验证通过。
 */
import * as Blockly from 'blockly/core';
import { TYPE_BYTES, TYPE_BOOLEAN } from '@/constants/block-types';

export const ECDSA_BLOCK_TYPES = ['ecdsa_sign', 'ecdsa_verify'] as const;
export type EcdsaBlockType = (typeof ECDSA_BLOCK_TYPES)[number];

Blockly.Blocks['ecdsa_sign'] = {
  init: function () {
    this.appendValueInput('PRIV')
      .setCheck(TYPE_BYTES)
      .appendField('ECDSA-Sign(');
    this.appendValueInput('MSG').setCheck(TYPE_BYTES).appendField(' msg:');
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_BYTES);
    this.setColour(230);
    this.setTooltip(
      'ECDSA 确定性签名 (RFC 6979, P-256/SHA-256)：私钥 32 字节 + 消息（字符串或字节）→ 签名 r‖s 64 字节。k 由 RFC 6979 HMAC-DRBG 确定性生成（sample/test 与官方向量 A.2.5 完全一致）。',
    );
    this.setHelpUrl('https://www.rfc-editor.org/rfc/rfc6979');
  },
};

Blockly.Blocks['ecdsa_verify'] = {
  init: function () {
    this.appendValueInput('MSG').setCheck(TYPE_BYTES).appendField('ECDSA-Verify(');
    this.appendValueInput('PUB').setCheck(TYPE_BYTES).appendField(' pub:');
    this.appendValueInput('SIG').setCheck(TYPE_BYTES).appendField(' sig:');
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_BOOLEAN);
    this.setColour(230);
    this.setTooltip(
      'ECDSA 验签 (P-256/SHA-256)：消息 + 公钥 Ux‖Uy 64 字节 + 签名 r‖s 64 字节 → Boolean。官方向量（RFC 6979 A.2.5 sample/test）验证通过。',
    );
    this.setHelpUrl('https://www.rfc-editor.org/rfc/rfc6979');
  },
};
