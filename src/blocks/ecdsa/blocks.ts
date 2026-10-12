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

export const ECDSA_BLOCK_TYPES = ['ecdsa_sign', 'ecdsa_verify', 'ecdsa_k_rfc6979'] as const;
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
      'ECDSA 教学签名 (RFC 6979, P-256/SHA-256)：私钥标量须在 [1,n−1]；非生产、非认证实现。',
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
      'ECDSA 教学验签 (P-256/SHA-256)：检查签名和公钥边界；非生产、非认证实现。',
    );
    this.setHelpUrl('https://www.rfc-editor.org/rfc/rfc6979');
  },
};

Blockly.Blocks['ecdsa_k_rfc6979'] = {
  init: function () {
    this.appendValueInput('PRIV').setCheck(TYPE_BYTES).appendField('RFC 6979 确定性 k( priv:');
    this.appendValueInput('HASH').setCheck(TYPE_BYTES).appendField(' msgHash:');
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_BYTES);
    this.setColour(190);
    this.setTooltip(
      'RFC 6979 §3.2 确定性 k（P-256 + SHA-256）：以 HMAC-SHA256 作为伪随机生成器，从私钥标量与消息哈希派生 k，输出 32 字节。输入 msgHash 必须是 32 字节 SHA-256 摘要；本块只返回 k，不生成 r/s。',
    );
    this.setHelpUrl('https://www.rfc-editor.org/rfc/rfc6979');
  },
};
