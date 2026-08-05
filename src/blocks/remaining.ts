import * as Blockly from 'blockly/core';
import { TYPE_BYTES, TYPE_INT_LIST, TYPE_NUMBER, TYPE_STRING } from '@/constants/block-types';

type B = Blockly.Block;

// M3 数学
const _math = (t: string, l: string, tip: string) => { Blockly.Blocks[t] = { init: function(this: B) {
  this.appendValueInput('A').setCheck(TYPE_NUMBER).appendField(l + '(');
  this.appendValueInput('B').setCheck(TYPE_NUMBER).appendField(',');
  this.appendDummyInput().appendField(')'); this.setInputsInline(true);
  this.setOutput(true, TYPE_NUMBER); this.setColour(20); this.setTooltip(tip);
}};};
_math('nt_mod','Mod','a mod n'); _math('nt_div_rem','DivRem','除余');

// ModPow — 带模数下拉（生成器读取 MODULUS 字段，避免硬编码模数）
Blockly.Blocks['nt_mod_pow'] = { init: function(this: B) {
  this.appendValueInput('A').setCheck(TYPE_NUMBER).appendField('ModPow(');
  this.appendValueInput('B').setCheck(TYPE_NUMBER).appendField(',');
  this.appendDummyInput()
    .appendField(', mod ')
    .appendField(new Blockly.FieldDropdown([
      ['3329 (Kyber)', '3329'],
      ['8380417 (ML-DSA)', '8380417'],
      ['12289 (NewHope)', '12289'],
      ['65537', '65537'],
      ['1000000007', '1000000007'],
    ]), 'MODULUS');
  this.appendDummyInput().appendField(')'); this.setInputsInline(true);
  this.setOutput(true, TYPE_NUMBER); this.setColour(20); this.setTooltip('a^b mod n');
}};

const _bn = (t: string, l: string) => { Blockly.Blocks[t] = { init: function(this: B) {
  this.appendValueInput('A').setCheck(TYPE_INT_LIST).appendField(l + '(');
  this.appendValueInput('B').setCheck(TYPE_INT_LIST).appendField(',');
  this.appendDummyInput().appendField(')'); this.setInputsInline(true);
  this.setOutput(true, TYPE_INT_LIST); this.setColour(60); this.setTooltip('大数' + l);
}};};
['bn_add','bn_sub','bn_mul','bn_div'].forEach(t => _bn(t, t.replace('bn_','BN ')));

Blockly.Blocks['hash_hmac'] = { init: function(this: B) {
  this.appendValueInput('KEY').setCheck(TYPE_BYTES).appendField('🔧 HMAC(');
  this.appendValueInput('MSG').setCheck(TYPE_BYTES).appendField(',msg:');
  this.appendDummyInput().appendField(')').appendField(new Blockly.FieldDropdown([
    ['SHA-256', 'SHA-256'],
    ['SM3', 'SM3'],
  ]), 'HASH');
  this.setInputsInline(true); this.setOutput(true, TYPE_BYTES); this.setColour(270); this.setTooltip('HMAC (SHA-256 / SM3)');
}};

Blockly.Blocks['base64_encode'] = { init: function(this: B) {
  this.appendValueInput('INPUT').setCheck(TYPE_BYTES).appendField('⚡Base64 Encode(');
  this.appendDummyInput().appendField(')'); this.setInputsInline(true);
  this.setOutput(true, TYPE_STRING); this.setColour(220); this.setTooltip('Base64');
}};
Blockly.Blocks['base64_decode'] = { init: function(this: B) {
  this.appendValueInput('INPUT').setCheck(TYPE_STRING).appendField('⚡Base64 Decode(');
  this.appendDummyInput().appendField(')'); this.setInputsInline(true);
  this.setOutput(true, TYPE_BYTES); this.setColour(220); this.setTooltip('Base64');
}};
Blockly.Blocks['hex_to_bytes'] = { init: function(this: B) {
  this.appendValueInput('INPUT').setCheck(TYPE_STRING).appendField('⚡Hex→Bytes(');
  this.appendDummyInput().appendField(')'); this.setInputsInline(true);
  this.setOutput(true, TYPE_BYTES); this.setColour(220); this.setTooltip('Hex→Bytes');
}};
Blockly.Blocks['bytes_to_hex'] = { init: function(this: B) {
  this.appendValueInput('INPUT').setCheck(TYPE_BYTES).appendField('⚡Bytes→Hex(');
  this.appendDummyInput().appendField(')'); this.setInputsInline(true);
  this.setOutput(true, TYPE_STRING); this.setColour(220); this.setTooltip('Bytes→Hex');
}};
Blockly.Blocks['endian_swap'] = { init: function(this: B) {
  this.appendValueInput('INPUT').setCheck(TYPE_INT_LIST).appendField('⚡Endian Swap(');
  this.appendDummyInput().appendField(')'); this.setInputsInline(true);
  this.setOutput(true, TYPE_INT_LIST); this.setColour(220); this.setTooltip('字节序转换');
}};

/** 本文件直接注册的块类型清单（供 ALL_BLOCK_TYPES 收录，保持类型系统完整）。 */
export const REMAINING_BLOCK_TYPES = [
  'nt_mod',
  'nt_mod_pow',
  'nt_div_rem',
  'bn_add',
  'bn_sub',
  'bn_mul',
  'bn_div',
  'hash_hmac',
  'base64_encode',
  'base64_decode',
  'hex_to_bytes',
  'bytes_to_hex',
  'endian_swap',
] as const;

export type RemainingBlockType = typeof REMAINING_BLOCK_TYPES[number];
