/**
 * EdDSA (Ed25519, RFC 8032) 原子块定义
 *
 * - eddsa_sign:   Ed25519 Sign(secret 32B, msg) → Bytes 64 (R‖S)
 * - eddsa_verify: Ed25519 Verify(public 32B, msg, sig 64B) → Boolean
 *
 * 算法要点（RFC 8032 §5.1）：
 *   - secret_expand：sha512(secret)，a = clamp(LE(h[0:32]))（位 0-2 清 0、位 254 置 1），prefix = h[32:64]
 *   - 曲线 edwards25519：p = 2^255-19, d = -121665/121666 mod p, L = 2^252+27742317777372353535851937790883648493
 *   - 签名：r = sha512(prefix‖msg) mod L，R = r·G，S = (r + h(R‖A‖msg)·a) mod L
 *   - 官方向量：RFC 8032 §7.1 TEST 1/2/3（sign + verify 双语言全 PASS）
 */
import * as Blockly from 'blockly/core';
import { TYPE_BOOLEAN, TYPE_BYTES } from '@/constants/block-types';

export const EDDSA_BLOCK_TYPES = ['eddsa_sign', 'eddsa_verify'] as const;
export type EddsaBlockType = (typeof EDDSA_BLOCK_TYPES)[number];

Blockly.Blocks['eddsa_sign'] = {
  init: function () {
    this.appendValueInput('SECRET')
      .setCheck(TYPE_BYTES)
      .appendField('EdDSA-Ed25519 Sign(');
    this.appendValueInput('MSG').setCheck(TYPE_BYTES).appendField(' msg:');
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_BYTES);
    this.setColour(230);
    this.setTooltip(
      'Ed25519 签名 (RFC 8032)：32 字节私钥 + 消息 → 64 字节签名 (R‖S)。官方向量（RFC 8032 §7.1 TEST 1-3）验证通过。',
    );
    this.setHelpUrl('https://www.rfc-editor.org/rfc/rfc8032');
  },
};

Blockly.Blocks['eddsa_verify'] = {
  init: function () {
    this.appendValueInput('PUBLIC')
      .setCheck(TYPE_BYTES)
      .appendField('EdDSA-Ed25519 Verify(');
    this.appendValueInput('MSG').setCheck(TYPE_BYTES).appendField(' msg:');
    this.appendValueInput('SIGNATURE').setCheck(TYPE_BYTES).appendField(' sig:');
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_BOOLEAN);
    this.setColour(230);
    this.setTooltip(
      'Ed25519 验签 (RFC 8032)：32 字节公钥 + 消息 + 64 字节签名 → 布尔。官方向量（RFC 8032 §7.1 TEST 1-3）验证通过。',
    );
    this.setHelpUrl('https://www.rfc-editor.org/rfc/rfc8032');
  },
};
