/**
 * PBKDF2 口令密钥派生原子块定义 (RFC 8018 / SP 800-132；SM3 路径 = GM/T 0091 同构)
 *
 * - pbkdf2: PBKDF2(password, salt, iter, keyLen, HASH) → Bytes
 *   U1 = PRF(P, S‖INT(i))，Uc = PRF(P, U_{c-1})，T_i = U_c，DK = T1‖T2‖…截断。
 *   HASH 下拉 SHA-256（RFC 8018 向量）/ SM3（国密 GM/T 0091 PBKDF 同构）。
 *   官方向量：RFC 6070（SHA-1）+ hashlib 交叉（SHA-256）。
 */
import * as Blockly from 'blockly/core';
import { TYPE_BYTES, TYPE_INT_LIST, TYPE_NUMBER } from '@/constants/block-types';

export const PBKDF2_BLOCK_TYPES = ['pbkdf2'] as const;
export type Pbkdf2BlockType = (typeof PBKDF2_BLOCK_TYPES)[number];

Blockly.Blocks['pbkdf2'] = {
  init: function () {
    this.appendValueInput('PASSWORD')
      .setCheck(TYPE_BYTES)
      .appendField('PBKDF2(');
    this.appendValueInput('SALT').setCheck(TYPE_INT_LIST).appendField(' salt:');
    this.appendValueInput('ITER').setCheck(TYPE_NUMBER).appendField(' iter:');
    this.appendValueInput('KEYLEN').setCheck(TYPE_NUMBER).appendField(' keyLen:');
    this.appendDummyInput()
      .appendField(
        new Blockly.FieldDropdown([
          ['SHA-256', 'sha256'],
          ['SM3 (GM/T 0091)', 'sm3'],
        ]),
        'HASH',
      )
      .appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_BYTES);
    this.setColour(190);
    this.setTooltip(
      'PBKDF2 口令密钥派生 (RFC 8018 / SP 800-132)：U1 = PRF(P, S‖INT(i))，Uc = PRF(P, U_{c-1})，串联截断。HASH 下拉 SHA-256 / SM3（SM3 路径与国密 GM/T 0091 PBKDF 同构）。官方向量（RFC 6070 / SHA-256 交叉）验证通过。',
    );
    this.setHelpUrl('https://www.rfc-editor.org/rfc/rfc8018');
  },
};
