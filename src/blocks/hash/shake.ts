/**
 * XOF/PRF 密码学原语积木块定义 — 后量子基础块
 *
 * 基于 FIPS 202 (SHA-3) 标准实现:
 *   - XOF (SHAKE128): 可扩展输出函数，从种子生成任意长度伪随机字节流
 *   - PRF (SHAKE256): 伪随机函数，seed || nonce → 输出字节，用于 CBD 采样
 *
 * 在 ML-KEM (FIPS 203) 中的用途:
 *   - XOF 用于 SampleNTT (Algorithm 7): 从 SHAKE128 读取拒绝采样字节
 *   - PRF 用于 SamplePolyCBD (Algorithm 8): SHAKE256(seed || nonce) → 64η 字节
 *
 * 参考:
 *   FIPS 202 — https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.202.pdf
 *   FIPS 203 — https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.203.pdf
 */
import * as Blockly from 'blockly/core';

export const SHAKE_BLOCK_TYPES = [
  'pq_xof',
  'pq_prf',
] as const;

export type ShakeBlockType = typeof SHAKE_BLOCK_TYPES[number];

// XOF: Extendable Output Function
// Supports SHAKE128 (rate=168, default) and SHAKE256 (rate=136)
// Input: seed bytes, output length
// Output: byte array of specified length
Blockly.Blocks['pq_xof'] = {
  init: function() {
    this.appendDummyInput()
      .appendField('XOF')
      .appendField(new Blockly.FieldDropdown([
        ['SHAKE128', 'SHAKE128'],
        ['SHAKE256', 'SHAKE256'],
      ]), 'ALGO')
      .appendField('(');
    this.appendValueInput('SEED').setCheck(null)
      .appendField(', seed=');
    this.appendValueInput('OUTLEN').setCheck('Number')
      .appendField(', outLen=');
    this.appendDummyInput()
      .appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, null);
    this.setColour(200);
    this.setTooltip(Blockly.Msg.CRYPTO_XOF_TOOLTIP || 'XOF: Extendable Output Function (SHAKE128/SHAKE256). Generates arbitrary-length pseudorandom byte stream from a seed (FIPS 202).');
    this.setHelpUrl('https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.202.pdf');
  },
};

// PRF: Pseudo-Random Function
// Supports SHAKE256 (rate=136, default) and SHAKE128 (rate=168)
// Input: seed bytes, nonce (single byte), output length
// Output: byte array (typically 64*eta bytes for CBD sampling)
Blockly.Blocks['pq_prf'] = {
  init: function() {
    this.appendDummyInput()
      .appendField('PRF')
      .appendField(new Blockly.FieldDropdown([
        ['SHAKE256', 'SHAKE256'],
        ['SHAKE128', 'SHAKE128'],
      ]), 'ALGO')
      .appendField('(');
    this.appendValueInput('SEED').setCheck(null)
      .appendField(', seed=');
    this.appendValueInput('NONCE').setCheck('Number')
      .appendField(', nonce=');
    this.appendValueInput('OUTLEN').setCheck('Number')
      .appendField(', outLen=');
    this.appendDummyInput()
      .appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, null);
    this.setColour(200);
    this.setTooltip(Blockly.Msg.CRYPTO_PRF_TOOLTIP || 'PRF: Pseudo-Random Function (SHAKE128/SHAKE256). seed || nonce → outLen bytes. Used by CBD sampling (FIPS 203, Algorithm 8).');
    this.setHelpUrl('https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.202.pdf');
  },
};
