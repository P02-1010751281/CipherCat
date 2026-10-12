/**
 * HKDF 密钥派生原子块定义 (RFC 5869)
 *
 * - hkdf: HKDF(salt, ikm, info, keyLen) → Bytes
 *   Extract：PRK = HMAC-SHA256(salt ‖ 32 零字节兜底, IKM)；Expand：T(i) = HMAC-SHA256(PRK, T(i-1)‖info‖i)。
 *   官方向量：RFC 5869 §A.1（SHA-256，L=42）。
 */
import * as Blockly from 'blockly/core';
import { TYPE_BYTES, TYPE_INT_LIST, TYPE_NUMBER } from '@/constants/block-types';

export const HKDF_BLOCK_TYPES = ['hkdf', 'hkdf_extract', 'hkdf_expand'] as const;
export type HkdfBlockType = (typeof HKDF_BLOCK_TYPES)[number];

Blockly.Blocks['hkdf'] = {
  init: function () {
    this.appendValueInput('SALT')
      .setCheck(TYPE_INT_LIST)
      .appendField('HKDF(');
    this.appendValueInput('IKM').setCheck(TYPE_BYTES).appendField(' ikm:');
    this.appendValueInput('INFO').setCheck(TYPE_INT_LIST).appendField(' info:');
    this.appendValueInput('LEN').setCheck(TYPE_NUMBER).appendField(' keyLen:');
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_BYTES);
    this.setColour(190);
    this.setTooltip(
      'HKDF 密钥派生 (RFC 5869, HMAC-SHA256)：Extract = HMAC(salt, IKM) → PRK，Expand = HMAC(PRK, T‖info‖i) 串联截断。salt 为空时按 32 字节零兜底。官方向量（RFC 5869 §A.1）验证通过。',
    );
    this.setHelpUrl('https://www.rfc-editor.org/rfc/rfc5869');
  },
};

Blockly.Blocks['hkdf_extract'] = {
  init: function () {
    this.appendValueInput('SALT').setCheck(TYPE_INT_LIST).appendField('HKDF-Extract( salt:');
    this.appendValueInput('IKM').setCheck(TYPE_BYTES).appendField(' ikm:');
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_BYTES);
    this.setColour(190);
    this.setTooltip(
      'HKDF-Extract(salt, IKM) (RFC 5869 §2.2)：PRK = HMAC-SHA256(salt, IKM)；salt 为空时按 32 字节零兜底。输出 32 字节伪随机密钥 PRK。',
    );
    this.setHelpUrl('https://www.rfc-editor.org/rfc/rfc5869');
  },
};

Blockly.Blocks['hkdf_expand'] = {
  init: function () {
    this.appendValueInput('PRK').setCheck(TYPE_BYTES).appendField('HKDF-Expand( prk:');
    this.appendValueInput('INFO').setCheck(TYPE_INT_LIST).appendField(' info:');
    this.appendValueInput('LEN').setCheck(TYPE_NUMBER).appendField(' keyLen:');
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_BYTES);
    this.setColour(190);
    this.setTooltip(
      'HKDF-Expand(PRK, info, L) (RFC 5869 §2.3)：T(i) = HMAC-SHA256(PRK, T(i-1)‖info‖i)，串联后截断到 L 字节。L 上限 255×32=8160 字节。',
    );
    this.setHelpUrl('https://www.rfc-editor.org/rfc/rfc5869');
  },
};
