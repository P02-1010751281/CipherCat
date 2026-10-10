/**
 * GCM 认证加密原子块定义 (NIST SP 800-38D)
 *
 * - gcm_encrypt: GCM-Encrypt(key, iv, aad, msg) → Bytes（密文 ‖ 128 位标签）
 *   GHASH（GF(2^128) 多项式哈希，R = 0xE1||0^120，右移 + 0xE1 异或进首字节）
 *   + GCTR（CTR 加密）。已核对向量：GCM 规范 Test Case 2/13（编号源自 GCM 规范，SP 800-38D 正文不含用例表；tests/unit/demo-vector-crosscheck.test.ts
 *   用独立实现复算）；TC3 未覆盖，也不存在 pycryptodome 交叉验证。
 */
import * as Blockly from 'blockly/core';
import { TYPE_BYTES, TYPE_INT_LIST } from '@/constants/block-types';

export const GCM_BLOCK_TYPES = ['gcm_encrypt'] as const;
export type GcmBlockType = (typeof GCM_BLOCK_TYPES)[number];

Blockly.Blocks['gcm_encrypt'] = {
  init: function () {
    this.appendValueInput('KEY')
      .setCheck(TYPE_BYTES)
      .appendField('GCM-Encrypt(');
    this.appendValueInput('IV').setCheck(TYPE_INT_LIST).appendField(' iv:');
    this.appendValueInput('AAD').setCheck(TYPE_INT_LIST).appendField(' aad:');
    this.appendValueInput('MSG').setCheck(TYPE_BYTES).appendField(' msg:');
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_BYTES);
    this.setColour(190);
    this.setTooltip(
      'GCM 认证加密 (NIST SP 800-38D)：GHASH（GF(2^128)）+ GCTR，输出 密文‖128 位标签。iv 为 12 字节时 J0 = iv‖0^31‖1，否则 GHASH 派生。已核对向量：GCM 规范 Test Case 2/13（编号源自 GCM 规范）+ NIST ACVP AES-GCM 官方用例（tagLen=128、96-bit IV，15 例）；SP 800-38D 正文不含用例表，也不构成完整测试集。',
    );
    this.setHelpUrl('https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-38d.pdf');
  },
};
