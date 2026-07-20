// eslint-disable-next-line @typescript-eslint/no-unused-vars
/**
 * M2 对称密码便利层 + 模式块 — JavaScript 生成器
 */
import { javascriptGenerator, Order } from 'blockly/javascript';
import type { Block } from 'blockly/core';

// ─── AES S-box 表 (与 M1 共享) ───
const AES_SBOX = [
  0x63,0x7c,0x77,0x7b,0xf2,0x6b,0x6f,0xc5,0x30,0x01,0x67,0x2b,0xfe,0xd7,0xab,0x76,
  0xca,0x82,0xc9,0x7d,0xfa,0x59,0x47,0xf0,0xad,0xd4,0xa2,0xaf,0x9c,0xa4,0x72,0xc0,
  0xb7,0xfd,0x93,0x26,0x36,0x3f,0xf7,0xcc,0x34,0xa5,0xe5,0xf1,0x71,0xd8,0x31,0x15,
  0x04,0xc7,0x23,0xc3,0x18,0x96,0x05,0x9a,0x07,0x12,0x80,0xe2,0xeb,0x27,0xb2,0x75,
  0x09,0x83,0x2c,0x1a,0x1b,0x6e,0x5a,0xa0,0x52,0x3b,0xd6,0xb3,0x29,0xe3,0x2f,0x84,
  0x53,0xd1,0x00,0xed,0x20,0xfc,0xb1,0x5b,0x6a,0xcb,0xbe,0x39,0x4a,0x4c,0x58,0xcf,
  0xd0,0xef,0xaa,0xfb,0x43,0x4d,0x33,0x85,0x45,0xf9,0x02,0x7f,0x50,0x3c,0x9f,0xa8,
  0x51,0xa3,0x40,0x8f,0x92,0x9d,0x38,0xf5,0xbc,0xb6,0xda,0x21,0x10,0xff,0xf3,0xd2,
  0xcd,0x0c,0x13,0xec,0x5f,0x97,0x44,0x17,0xc4,0xa7,0x7e,0x3d,0x64,0x5d,0x19,0x73,
  0x60,0x81,0x4f,0xdc,0x22,0x2a,0x90,0x88,0x46,0xee,0xb8,0x14,0xde,0x5e,0x0b,0xdb,
  0xe0,0x32,0x3a,0x0a,0x49,0x06,0x24,0x5c,0xc2,0xd3,0xac,0x62,0x91,0x95,0xe4,0x79,
  0xe7,0xc8,0x37,0x6d,0x8d,0xd5,0x4e,0xa9,0x6c,0x56,0xf4,0xea,0x65,0x7a,0xae,0x08,
  0xba,0x78,0x25,0x2e,0x1c,0xa6,0xb4,0xc6,0xe8,0xdd,0x74,0x1f,0x4b,0xbd,0x8b,0x8a,
  0x70,0x3e,0xb5,0x66,0x48,0x03,0xf6,0x0e,0x61,0x35,0x57,0xb9,0x86,0xc1,0x1d,0x9e,
  0xe1,0xf8,0x98,0x11,0x69,0xd9,0x8e,0x94,0x9b,0x1e,0x87,0xe9,0xce,0x55,0x28,0xdf,
  0x8c,0xa1,0x89,0x0d,0xbf,0xe6,0x42,0x68,0x41,0x99,0x2d,0x0f,0xb0,0x54,0xbb,0x16,
];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const RCON = [0x01,0x02,0x04,0x08,0x10,0x20,0x40,0x80,0x1b,0x36];

function registerAesHelpers() {
  if (javascriptGenerator.forBlock['__aes_helpers_registered']) return;
  javascriptGenerator.forBlock['__aes_helpers_registered'] = function() { return ''; };

  javascriptGenerator.provideFunction_('aesSubWord', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(w) {',
    '  var s = ' + JSON.stringify(AES_SBOX) + ';',
    '  return ((s[w>>>24])<<24) | ((s[(w>>>16)&0xFF])<<16) | ((s[(w>>>8)&0xFF])<<8) | (s[w&0xFF]);',
    '}',
  ]);

  javascriptGenerator.provideFunction_('aesRotWord', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(w) {',
    '  return ((w<<8) | (w>>>24)) >>> 0;',
    '}',
  ]);

  javascriptGenerator.provideFunction_('aesKeyExpansion', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(key, bits) {',
    '  var Nk = bits/32, Nr = Nk+6, w = [];',
    '  for (var i=0; i<Nk*4; i++) w[i] = (key[i*4]<<24)|(key[i*4+1]<<16)|(key[i*4+2]<<8)|key[i*4+3];',
    '  for (var i=Nk; i<4*(Nr+1); i++) {',
    '    var t = w[i-1];',
    '    if (i%Nk===0) t = aesSubWord(aesRotWord(t)) ^ (RCON[Math.floor(i/Nk)-1]<<24);',
    '    else if (Nk>6 && i%Nk===4) t = aesSubWord(t);',
    '    w[i] = w[i-Nk] ^ t;',
    '  }',
    '  var rk = [];',
    '  for (var i=0; i<=Nr; i++) for (var j=0; j<4; j++) {',
    '    var v = w[i*4+j];',
    '    rk.push((v>>>24)&0xFF, (v>>>16)&0xFF, (v>>>8)&0xFF, v&0xFF);',
    '  }',
    '  return rk;',
    '}',
  ]);
}

// ─── AES 便利块生成器 ───

javascriptGenerator.forBlock['aes_round'] = function(block: Block): [string, number] {
  registerAesHelpers();
  const s = javascriptGenerator.valueToCode(block, 'STATE', Order.ATOMIC) || '[]';
  const rk = javascriptGenerator.valueToCode(block, 'ROUND_KEY', Order.ATOMIC) || '[]';
  const fn = javascriptGenerator.provideFunction_('aesRound', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(s, rk) {',
    '  s = ' + (javascriptGenerator.forBlock['aes_sub_bytes'] as (b:Block)=>[string,number])({} as Block)[0].replace('(s)', '(s)') + ';',
    '  s = aesShiftRows(s);',
    '  s = aesMixColumns(s);',
    '  return aesAddRoundKey(s, rk);',
    '}',
  ]);
  return [fn + '(' + s + ', ' + rk + ')', Order.ATOMIC];
};
// Use simple inline for aesRound since we already have atomic functions
// Override with cleaner approach:
javascriptGenerator.forBlock['aes_round'] = function(block: Block): [string, number] {
  registerAesHelpers();
  const s = javascriptGenerator.valueToCode(block, 'STATE', Order.ATOMIC) || '[]';
  const rk = javascriptGenerator.valueToCode(block, 'ROUND_KEY', Order.ATOMIC) || '[]';
  const fn = javascriptGenerator.provideFunction_('aesRound', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(s, rk, sbox) {',
    '  for (var i=0; i<16; i++) s[i]=sbox[s[i]];',
    '  var t=s.slice(); s[1]=t[5];s[5]=t[9];s[9]=t[13];s[13]=t[1]; s[2]=t[10];s[6]=t[14];s[10]=t[2];s[14]=t[6]; s[3]=t[15];s[7]=t[3];s[11]=t[7];s[15]=t[11];',
    '  function xt(x){return((x<<1)^(((x>>7)&1)*0x1b))&0xFF;}',
    '  for(var c=0;c<4;c++){var a=s[c],b=s[c+4],d=s[c+8],e=s[c+12];var ab=a^b,cd=d^e,x=xt(ab^cd);s[c]=a^x^cd;s[c+4]=b^x^ab;s[c+8]=d^x^ab^cd;s[c+12]=e^x^ab;}',
    '  for(var i=0;i<16;i++)s[i]^=rk[i]; return s;',
    '}',
  ]);
  return [fn + '(' + s + ', ' + rk + ', ' + JSON.stringify(AES_SBOX) + ')', Order.ATOMIC];
};

javascriptGenerator.forBlock['aes_last_round'] = function(block: Block): [string, number] {
  registerAesHelpers();
  const s = javascriptGenerator.valueToCode(block, 'STATE', Order.ATOMIC) || '[]';
  const rk = javascriptGenerator.valueToCode(block, 'ROUND_KEY', Order.ATOMIC) || '[]';
  const fn = javascriptGenerator.provideFunction_('aesLastRound', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(s, rk, sbox) {',
    '  for (var i=0; i<16; i++) s[i]=sbox[s[i]];',
    '  var t=s.slice(); s[1]=t[5];s[5]=t[9];s[9]=t[13];s[13]=t[1]; s[2]=t[10];s[6]=t[14];s[10]=t[2];s[14]=t[6]; s[3]=t[15];s[7]=t[3];s[11]=t[7];s[15]=t[11];',
    '  for(var i=0;i<16;i++)s[i]^=rk[i]; return s;',
    '}',
  ]);
  return [fn + '(' + s + ', ' + rk + ', ' + JSON.stringify(AES_SBOX) + ')', Order.ATOMIC];
};

javascriptGenerator.forBlock['aes_key_schedule'] = function(block: Block): [string, number] {
  registerAesHelpers();
  const key = javascriptGenerator.valueToCode(block, 'KEY', Order.ATOMIC) || 'new Uint8Array(16)';
  const bits = block.getFieldValue('BITS') || '128';
  return ['aesKeyExpansion(' + key + ', ' + bits + ')', Order.ATOMIC];
};

// ─── SM4 便利块生成器 ───

const SM4_SBOX = [0xd6,0x90,0xe9,0xfe,0xcc,0xe1,0x3d,0xb7,0x16,0xb6,0x14,0xc2,0x28,0xfb,0x2c,0x05,0x2b,0x67,0x9a,0x76,0x2a,0xbe,0x04,0xc3,0xaa,0x44,0x13,0x26,0x49,0x86,0x06,0x99,0x9c,0x42,0x50,0xf4,0x91,0xef,0x98,0x7a,0x33,0x54,0x0b,0x43,0xed,0xcf,0xac,0x62,0xe4,0xb3,0x1c,0xa9,0xc9,0x08,0xe8,0x95,0x80,0xdf,0x94,0xfa,0x75,0x8f,0x3f,0xa6,0x47,0x07,0xa7,0xfc,0xf3,0x73,0x17,0xba,0x83,0x59,0x3c,0x19,0xe6,0x85,0x4f,0xa8,0x68,0x6b,0x81,0xb2,0x71,0x64,0xda,0x8b,0xf8,0xeb,0x0f,0x4b,0x70,0x56,0x9d,0x35,0x1e,0x24,0x0e,0x5e,0x63,0x58,0xd1,0xa2,0x25,0x22,0x7c,0x3b,0x01,0x21,0x78,0x87,0xd4,0x00,0x46,0x57,0x9f,0xd3,0x27,0x52,0x4c,0x36,0x02,0xe7,0xa0,0xc4,0xc8,0x9e,0xea,0xbf,0x8a,0xd2,0x40,0xc7,0x38,0xb5,0xa3,0xf7,0xf2,0xce,0xf9,0x61,0x15,0xa1,0xe0,0xae,0x5d,0xa4,0x9b,0x34,0x1a,0x55,0xad,0x93,0x32,0x30,0xf5,0x8c,0xb1,0xe3,0x1d,0xf6,0xe2,0x2e,0x82,0x66,0xca,0x60,0xc0,0x29,0x23,0xab,0x0d,0x53,0x4e,0x6f,0xd5,0xdb,0x37,0x45,0xde,0xfd,0x8e,0x2f,0x03,0xff,0x6a,0x72,0x6d,0x6c,0x5b,0x51,0x8d,0x1b,0xaf,0x92,0xbb,0xdd,0xbc,0x7f,0x11,0xd9,0x5c,0x41,0x1f,0x10,0x5a,0xd8,0x0a,0xc1,0x31,0x88,0xa5,0xcd,0x7b,0xbd,0x2d,0x74,0xd0,0x12,0xb8,0xe5,0xb4,0xb0,0x89,0x69,0x97,0x4a,0x0c,0x96,0x77,0x7e,0x65,0xb9,0xf1,0x09,0xc5,0x6e,0xc6,0x84,0x18,0xf0,0x7d,0xec,0x3a,0xdc,0x4d,0x20,0x79,0xee,0x5f,0x3e,0xd7,0xcb,0x39,0x48];
const SM4_FK = [0xa3b1bac6, 0x56aa3350, 0x677d9197, 0xb27022dc];
const SM4_CK: number[] = [];
for (let i = 0; i < 32; i++) {
  let ck = 0;
  for (let j = 0; j < 4; j++) ck = (ck << 8) | ((4 * i + j) * 7 % 256);
  SM4_CK.push(ck >>> 0);
}

function registerSm4Helpers() {
  if (javascriptGenerator.forBlock['__sm4_helpers']) return;
  javascriptGenerator.forBlock['__sm4_helpers'] = function() { return ''; };

  javascriptGenerator.provideFunction_('sm4Sbox', [JSON.stringify(SM4_SBOX)]);

  javascriptGenerator.provideFunction_('sm4Tau', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(a, sbox) {',
    '  return ((sbox[(a>>>24)&0xFF]<<24)|(sbox[(a>>>16)&0xFF]<<16)|(sbox[(a>>>8)&0xFF]<<8)|sbox[a&0xFF])>>>0;',
    '}',
  ]);

  javascriptGenerator.provideFunction_('sm4L', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(b) {',
    '  return (b ^ ((b<<2)|(b>>>30)) ^ ((b<<10)|(b>>>22)) ^ ((b<<18)|(b>>>14)) ^ ((b<<24)|(b>>>8)))>>>0;',
    '}',
  ]);

  javascriptGenerator.provideFunction_('sm4Lprime', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(b) {',
    '  return (b ^ ((b<<13)|(b>>>19)) ^ ((b<<23)|(b>>>9)))>>>0;',
    '}',
  ]);

  javascriptGenerator.provideFunction_('sm4KeySchedule', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(key, sbox) {',
    '  var FK=' + JSON.stringify(SM4_FK) + ', CK=' + JSON.stringify(SM4_CK) + ';',
    '  var MK=[], K=[];',
    '  for(var i=0;i<4;i++) MK[i]=((key[i*4]<<24)|(key[i*4+1]<<16)|(key[i*4+2]<<8)|key[i*4+3])>>>0;',
    '  for(var i=0;i<4;i++) K[i]=MK[i]^FK[i];',
    '  var rk=[];',
    '  for(var i=0;i<32;i++){',
    '    rk[i]=K[i+1]^K[i+2]^K[i+3]^CK[i]^sm4Tau(sm4Lprime(K[i+1]^K[i+2]^K[i+3]^CK[i]),sbox);',
    '    K[i+4]=rk[i];',
    '  }',
    '  return rk;',
    '}',
  ]);
}

javascriptGenerator.forBlock['sm4_round'] = function(block: Block): [string, number] {
  registerSm4Helpers();
  const s = javascriptGenerator.valueToCode(block, 'STATE', Order.ATOMIC) || '[0,0,0,0]';
  const rk = javascriptGenerator.valueToCode(block, 'ROUND_KEY', Order.ATOMIC) || '0';
  const fn = javascriptGenerator.provideFunction_('sm4Round', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(x, rk, sbox) {',
    '  var x0=x[0],x1=x[1],x2=x[2],x3=x[3];',
    '  var f=x1^x2^x3^rk;',
    '  x[0]=x1;x[1]=x2;x[2]=x3;',
    '  x[3]=x0^sm4Tau(f,sbox)^sm4L(sm4Tau(f,sbox));',
    '  return x;',
    '}',
  ]);
  return [fn + '(' + s + ', ' + rk + ', ' + JSON.stringify(SM4_SBOX) + ')', Order.ATOMIC];
};

javascriptGenerator.forBlock['sm4_key_schedule'] = function(block: Block): [string, number] {
  registerSm4Helpers();
  const key = javascriptGenerator.valueToCode(block, 'KEY', Order.ATOMIC) || 'new Uint8Array(16)';
  return ['sm4KeySchedule(' + key + ', ' + JSON.stringify(SM4_SBOX) + ')', Order.ATOMIC];
};

// ─── 模式块生成器（简化版 — 占位） ───
// 完整模式实现需等 M3 HMAC/GCM 完成后完善

javascriptGenerator.forBlock['mode_ecb'] = function(block: Block): [string, number] {
  const d = javascriptGenerator.valueToCode(block, 'DATA', Order.ATOMIC) || '[]';
  const k = javascriptGenerator.valueToCode(block, 'KEY', Order.ATOMIC) || '[]';
  return ['/* ECB: ' + d + ' encrypted with ' + k + ' */ ' + d, Order.ATOMIC];
};
javascriptGenerator.forBlock['mode_cbc'] = function(block: Block): [string, number] {
  const d = javascriptGenerator.valueToCode(block, 'DATA', Order.ATOMIC) || '[]';
  const k = javascriptGenerator.valueToCode(block, 'KEY', Order.ATOMIC) || '[]';
  const iv = javascriptGenerator.valueToCode(block, 'IV', Order.ATOMIC) || '[]';
  return ['/* CBC: ' + d + ' with key=' + k + ' iv=' + iv + ' */ ' + d, Order.ATOMIC];
};
javascriptGenerator.forBlock['mode_ctr'] = function(block: Block): [string, number] {
  const d = javascriptGenerator.valueToCode(block, 'DATA', Order.ATOMIC) || '[]';
  const k = javascriptGenerator.valueToCode(block, 'KEY', Order.ATOMIC) || '[]';
  const iv = javascriptGenerator.valueToCode(block, 'IV', Order.ATOMIC) || '[]';
  return ['/* CTR: ' + d + ' with key=' + k + ' iv=' + iv + ' */ ' + d, Order.ATOMIC];
};
javascriptGenerator.forBlock['mode_gcm'] = function(block: Block): [string, number] {
  const d = javascriptGenerator.valueToCode(block, 'DATA', Order.ATOMIC) || '[]';
  const k = javascriptGenerator.valueToCode(block, 'KEY', Order.ATOMIC) || '[]';
  const iv = javascriptGenerator.valueToCode(block, 'IV', Order.ATOMIC) || '[]';
  return ['/* GCM: ' + d + ' with key=' + k + ' iv=' + iv + ' */ ' + d, Order.ATOMIC];
};
