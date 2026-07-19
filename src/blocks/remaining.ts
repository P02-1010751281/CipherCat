import * as Blockly from 'blockly/core';
import { TYPE_BYTES, TYPE_INT_LIST, TYPE_NUMBER, TYPE_STRING } from '@/constants/block-types';

// M2.5 后量子便利层
const _pq = (t: string, l: string, tip: string, ot = TYPE_INT_LIST) => {
  Blockly.Blocks[t] = { init: function(this: any) {
    this.appendValueInput('INPUT').setCheck(TYPE_INT_LIST).appendField('🔧 ' + l + '(');
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true); this.setOutput(true, ot); this.setColour(305); this.setTooltip(tip);
  }};
};
_pq('pq_ntt_vec','NTT Vec','向量NTT', TYPE_INT_LIST);
_pq('pq_intt_vec','INTT Vec','向量INTT');
_pq('pq_cbd_ntt_vec','CBD+NTT Vec','CBD采样+NTT');
_pq('pq_mat_vec_mul_ntt','Mat×Vec NTT','NTT域矩阵×向量');
_pq('pq_vec_add','Vec Add','向量加法');
_pq('pq_vec_sub','Vec Sub','向量减法');

Blockly.Blocks['pq_sample_ntt_mat'] = { init: function(this: any) {
  this.appendValueInput('SEED').setCheck(TYPE_BYTES).appendField('🔧 SampleNTT Mat(');
  this.appendDummyInput().appendField(')'); this.setInputsInline(true);
  this.setOutput(true, TYPE_INT_LIST); this.setColour(305); this.setTooltip('NTT矩阵生成');
}};

// M3 数学
const _math = (t: string, l: string, tip: string) => { Blockly.Blocks[t] = { init: function(this: any) {
  this.appendValueInput('A').setCheck(TYPE_NUMBER).appendField(l + '(');
  this.appendValueInput('B').setCheck(TYPE_NUMBER).appendField(',');
  this.appendDummyInput().appendField(')'); this.setInputsInline(true);
  this.setOutput(true, TYPE_NUMBER); this.setColour(20); this.setTooltip(tip);
}};};
_math('nt_mod','Mod','a mod n'); _math('nt_mod_pow','ModPow','a^b mod n'); _math('nt_div_rem','DivRem','除余');

const _bn = (t: string, l: string) => { Blockly.Blocks[t] = { init: function(this: any) {
  this.appendValueInput('A').setCheck(TYPE_INT_LIST).appendField(l + '(');
  this.appendValueInput('B').setCheck(TYPE_INT_LIST).appendField(',');
  this.appendDummyInput().appendField(')'); this.setInputsInline(true);
  this.setOutput(true, TYPE_INT_LIST); this.setColour(60); this.setTooltip('大数' + l);
}};};
['bn_add','bn_sub','bn_mul','bn_div'].forEach(t => _bn(t, t.replace('bn_','BN ')));

Blockly.Blocks['hash_hmac'] = { init: function(this: any) {
  this.appendValueInput('KEY').setCheck(TYPE_BYTES).appendField('🔧 HMAC(');
  this.appendValueInput('MSG').setCheck(TYPE_BYTES).appendField(',msg:');
  this.appendDummyInput().appendField(')'); this.setInputsInline(true);
  this.setOutput(true, TYPE_BYTES); this.setColour(270); this.setTooltip('HMAC');
}};
Blockly.Blocks['md_iterate'] = { init: function(this: any) {
  this.appendValueInput('IV').setCheck(TYPE_INT_LIST).appendField('🔧 MD Iterate(');
  this.appendValueInput('BLOCKS').setCheck(TYPE_INT_LIST).appendField(',blocks:');
  this.appendDummyInput().appendField(',algo:').appendField(new Blockly.FieldDropdown([['SHA-256','sha256'],['SM3','sm3']]), 'ALGO').appendField(')');
  this.setInputsInline(true); this.setOutput(true, TYPE_INT_LIST); this.setColour(285);
  this.setTooltip('Merkle-Damgård迭代: H_i=compress(H_{i-1},M_i)');
}};
Blockly.Blocks['sponge_duplex'] = { init: function(this: any) {
  this.appendValueInput('STATE').setCheck(TYPE_INT_LIST).appendField('🔧 Sponge Duplex(');
  this.appendValueInput('DATA').setCheck(TYPE_BYTES).appendField(',data:');
  this.appendDummyInput().appendField(',perm:').appendField(new Blockly.FieldDropdown([['Keccak-f[1600]','keccak_f1600'],['Keccak-f[800]','keccak_f800']]), 'PERM').appendField(')');
  this.setInputsInline(true); this.setOutput(true, TYPE_BYTES); this.setColour(285);
  this.setTooltip('海绵双工: absorb→permutation→squeeze一步完成');
}};

// M4 一键块
const _o = (t: string, l: string, ot = TYPE_BYTES) => { Blockly.Blocks[t] = { init: function(this: any) {
  this.appendValueInput('INPUT').setCheck(TYPE_BYTES).appendField('⚡ ' + l + '(');
  this.appendDummyInput().appendField(')'); this.setInputsInline(true);
  this.setOutput(true, ot); this.setColour(320); this.setTooltip(l);
}};};
_o('ml_kem_keygen','ML-KEM.KeyGen');
_o('sm3_hash','SM3.Hash'); _o('sm3_hmac','HMAC-SM3');
_o('hmac_sha256','HMAC-SHA256'); _o('kdf_pbkdf2','PBKDF2'); _o('kdf_hkdf','HKDF');

Blockly.Blocks['base64_encode'] = { init: function(this: any) {
  this.appendValueInput('INPUT').setCheck(TYPE_BYTES).appendField('⚡Base64 Encode(');
  this.appendDummyInput().appendField(')'); this.setInputsInline(true);
  this.setOutput(true, TYPE_STRING); this.setColour(220); this.setTooltip('Base64');
}};
Blockly.Blocks['base64_decode'] = { init: function(this: any) {
  this.appendValueInput('INPUT').setCheck(TYPE_STRING).appendField('⚡Base64 Decode(');
  this.appendDummyInput().appendField(')'); this.setInputsInline(true);
  this.setOutput(true, TYPE_BYTES); this.setColour(220); this.setTooltip('Base64');
}};
Blockly.Blocks['hex_to_bytes'] = { init: function(this: any) {
  this.appendValueInput('INPUT').setCheck(TYPE_STRING).appendField('⚡Hex→Bytes(');
  this.appendDummyInput().appendField(')'); this.setInputsInline(true);
  this.setOutput(true, TYPE_BYTES); this.setColour(220); this.setTooltip('Hex→Bytes');
}};
Blockly.Blocks['bytes_to_hex'] = { init: function(this: any) {
  this.appendValueInput('INPUT').setCheck(TYPE_BYTES).appendField('⚡Bytes→Hex(');
  this.appendDummyInput().appendField(')'); this.setInputsInline(true);
  this.setOutput(true, TYPE_STRING); this.setColour(220); this.setTooltip('Bytes→Hex');
}};
Blockly.Blocks['endian_swap'] = { init: function(this: any) {
  this.appendValueInput('INPUT').setCheck(TYPE_INT_LIST).appendField('⚡Endian Swap(');
  this.appendDummyInput().appendField(')'); this.setInputsInline(true);
  this.setOutput(true, TYPE_INT_LIST); this.setColour(220); this.setTooltip('字节序转换');
}};
