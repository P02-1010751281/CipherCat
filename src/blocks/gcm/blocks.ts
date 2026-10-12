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

export const GCM_BLOCK_TYPES = [
  'gcm_encrypt',
  'gcm_gf128_mul',
  'gcm_ghash',
  'gcm_gctr',
  'gcm_inc32',
  'gcm_j0',
] as const;
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

/**
 * GCM 内部算子（SP 800-38D §6.2–§7.1）：单独暴露给逐原语搭建。
 * 这些块与 `gcm_encrypt` 使用同一套实现，不构成新的算法结论。
 */
Blockly.Blocks['gcm_gf128_mul'] = {
  init: function () {
    this.appendValueInput('X').setCheck(TYPE_INT_LIST).appendField('GF(2¹²⁸) 乘法  X:');
    this.appendValueInput('Y').setCheck(TYPE_INT_LIST).appendField(' Y:');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_INT_LIST);
    this.setColour(190);
    this.setTooltip(
      'GF(2¹²⁸) 块乘法（NIST SP 800-38D Algorithm 1）：两个 16 字节块，右移约定 + 0xE1 约化。是 GHASH 的构件，本身不是认证加密。',
    );
    this.setHelpUrl('https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-38d.pdf');
  },
};

Blockly.Blocks['gcm_ghash'] = {
  init: function () {
    this.appendValueInput('H').setCheck(TYPE_INT_LIST).appendField('GHASH_H( a:');
    this.appendValueInput('A').setCheck(TYPE_INT_LIST).appendField(' c:');
    this.appendValueInput('C').setCheck(TYPE_INT_LIST).appendField(' )');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_INT_LIST);
    this.setColour(190);
    this.setTooltip(
      'GHASH_H(A, C)（NIST SP 800-38D Algorithm 2）：对两个字节串按 16 字节分块做 GF(2¹²⁸) 多项式哈希，末尾附 64 位长度块。输出 16 字节认证散列，不单独提供完整性保证。',
    );
    this.setHelpUrl('https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-38d.pdf');
  },
};

Blockly.Blocks['gcm_gctr'] = {
  init: function () {
    this.appendValueInput('KEY').setCheck(TYPE_BYTES).appendField('GCTR( key:');
    this.appendValueInput('ICB').setCheck(TYPE_INT_LIST).appendField(' icb:');
    this.appendValueInput('X').setCheck(TYPE_BYTES).appendField(' x:');
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_BYTES);
    this.setColour(190);
    this.setTooltip(
      'GCTR_K(ICB, X)（NIST SP 800-38D Algorithm 3）：以 AES-128 计数器模式加密或解密字节串；同一函数两个方向通用，ICB 必须由调用方按标准派生。',
    );
    this.setHelpUrl('https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-38d.pdf');
  },
};

Blockly.Blocks['gcm_inc32'] = {
  init: function () {
    this.appendValueInput('X').setCheck(TYPE_INT_LIST).appendField('inc32( X:');
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_INT_LIST);
    this.setColour(190);
    this.setTooltip(
      'inc32（NIST SP 800-38D §6.2）：只对最右 32 位做模 2³² 加一，其余位不变；供计数器块递增使用。',
    );
    this.setHelpUrl('https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-38d.pdf');
  },
};

Blockly.Blocks['gcm_j0'] = {
  init: function () {
    this.appendValueInput('H').setCheck(TYPE_INT_LIST).appendField('J0( h:');
    this.appendValueInput('IV').setCheck(TYPE_INT_LIST).appendField(' iv:');
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_INT_LIST);
    this.setColour(190);
    this.setTooltip(
      'GCM 预计数器块 J0（NIST SP 800-38D §7.1 Step 1）：96 位 IV 直接拼 0³¹‖1；其他长度 IV 用 GHASH_H({}, IV) 派生。',
    );
    this.setHelpUrl('https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-38d.pdf');
  },
};
