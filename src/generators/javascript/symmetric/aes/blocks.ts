/**
 * AES 原子块 JavaScript 代码生成器
 * FIPS 197
 */
import { javascriptGenerator, Order } from 'blockly/javascript';
import type { Block } from 'blockly/core';

/** AES S-box (FIPS 197 §5.1.1) */
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

function registerAesSbox(): string {
  return javascriptGenerator.provideFunction_('aes_sbox', [
    'var ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + ' = ' + JSON.stringify(AES_SBOX) + ';',
  ]);
}

javascriptGenerator.forBlock['aes_sub_bytes'] = function (block: Block): [string, number] {
  const state = javascriptGenerator.valueToCode(block, 'STATE', Order.ATOMIC) || '[]';
  const sboxName = registerAesSbox();
  const fn = javascriptGenerator.provideFunction_('aesSubBytes', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(s) {',
    '  for (var i = 0; i < 16; i++) s[i] = ' + sboxName + '[s[i]];',
    '  return s;',
    '}',
  ]);
  return [fn + '(' + state + ')', Order.ATOMIC];
};

javascriptGenerator.forBlock['aes_shift_rows'] = function (block: Block): [string, number] {
  const state = javascriptGenerator.valueToCode(block, 'STATE', Order.ATOMIC) || '[]';
  const fn = javascriptGenerator.provideFunction_('aesShiftRows', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(s) {',
    '  var t = s.slice();',
    '  // Row 0: no shift',
    '  // Row 1: shift left 1',
    '  s[1]=t[5]; s[5]=t[9]; s[9]=t[13]; s[13]=t[1];',
    '  // Row 2: shift left 2',
    '  s[2]=t[10]; s[6]=t[14]; s[10]=t[2]; s[14]=t[6];',
    '  // Row 3: shift left 3',
    '  s[3]=t[15]; s[7]=t[3]; s[11]=t[7]; s[15]=t[11];',
    '  return s;',
    '}',
  ]);
  return [fn + '(' + state + ')', Order.ATOMIC];
};

javascriptGenerator.forBlock['aes_mix_columns'] = function (block: Block): [string, number] {
  const state = javascriptGenerator.valueToCode(block, 'STATE', Order.ATOMIC) || '[]';
  const fn = javascriptGenerator.provideFunction_('aesMixColumns', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(s) {',
    '  function xtime(x) { return ((x << 1) ^ (((x >> 7) & 1) * 0x1b)) & 0xFF; }',
    '  function mix(c) {',
    '    var t = c.slice();',
    '    c[0] = xtime(t[0]^t[1]) ^ t[1] ^ t[2] ^ t[3];',
    '    c[1] = xtime(t[1]^t[2]) ^ t[2] ^ t[3] ^ t[0];',
    '    c[2] = xtime(t[2]^t[3]) ^ t[3] ^ t[0] ^ t[1];',
    '    c[3] = xtime(t[3]^t[0]) ^ t[0] ^ t[1] ^ t[2];',
    '  }',
    '  for (var c = 0; c < 4; c++) {',
    '    var col = [s[c], s[c+4], s[c+8], s[c+12]];',
    '    mix(col);',
    '    s[c]=col[0]; s[c+4]=col[1]; s[c+8]=col[2]; s[c+12]=col[3];',
    '  }',
    '  return s;',
    '}',
  ]);
  return [fn + '(' + state + ')', Order.ATOMIC];
};

javascriptGenerator.forBlock['aes_add_round_key'] = function (block: Block): [string, number] {
  const state = javascriptGenerator.valueToCode(block, 'STATE', Order.ATOMIC) || '[]';
  const rk = javascriptGenerator.valueToCode(block, 'ROUND_KEY', Order.ATOMIC) || '[]';
  const fn = javascriptGenerator.provideFunction_('aesAddRoundKey', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(s, rk) {',
    '  for (var i = 0; i < 16; i++) s[i] ^= rk[i];',
    '  return s;',
    '}',
  ]);
  return [fn + '(' + state + ', ' + rk + ')', Order.ATOMIC];
};

// ─────────────────────────────────────────────
// AES 便利块生成器
// ─────────────────────────────────────────────

javascriptGenerator.forBlock['aes_round'] = function (block: Block): [string, number] {
  const state = javascriptGenerator.valueToCode(block, 'STATE', Order.ATOMIC) || '[]';
  const rk = javascriptGenerator.valueToCode(block, 'ROUND_KEY', Order.ATOMIC) || '[]';
  const sboxName = registerAesSbox();
  const fn = javascriptGenerator.provideFunction_('aesRound', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(s, rk) {',
    '  var t = s.slice();',
    '  var sbox = ' + sboxName + ';',
    '  // SubBytes',
    '  for (var i = 0; i < 16; i++) s[i] = sbox[t[i]];',
    '  // ShiftRows',
    '  t = s.slice();',
    '  s[1]=t[5]; s[5]=t[9]; s[9]=t[13]; s[13]=t[1];',
    '  s[2]=t[10]; s[6]=t[14]; s[10]=t[2]; s[14]=t[6];',
    '  s[3]=t[15]; s[7]=t[3]; s[11]=t[7]; s[15]=t[11];',
    '  // MixColumns',
    '  function xtime(x) { return ((x << 1) ^ (((x >> 7) & 1) * 0x1b)) & 0xFF; }',
    '  function mix(c) {',
    '    var tc = c.slice();',
    '    c[0] = xtime(tc[0]^tc[1]) ^ tc[1] ^ tc[2] ^ tc[3];',
    '    c[1] = xtime(tc[1]^tc[2]) ^ tc[2] ^ tc[3] ^ tc[0];',
    '    c[2] = xtime(tc[2]^tc[3]) ^ tc[3] ^ tc[0] ^ tc[1];',
    '    c[3] = xtime(tc[3]^tc[0]) ^ tc[0] ^ tc[1] ^ tc[2];',
    '  }',
    '  for (var c = 0; c < 4; c++) {',
    '    var col = [s[c], s[c+4], s[c+8], s[c+12]];',
    '    mix(col);',
    '    s[c]=col[0]; s[c+4]=col[1]; s[c+8]=col[2]; s[c+12]=col[3];',
    '  }',
    '  // AddRoundKey',
    '  for (var i = 0; i < 16; i++) s[i] ^= rk[i];',
    '  return s;',
    '}',
  ]);
  return [fn + '(' + state + ', ' + rk + ')', Order.ATOMIC];
};

javascriptGenerator.forBlock['aes_last_round'] = function (block: Block): [string, number] {
  const state = javascriptGenerator.valueToCode(block, 'STATE', Order.ATOMIC) || '[]';
  const rk = javascriptGenerator.valueToCode(block, 'ROUND_KEY', Order.ATOMIC) || '[]';
  const sboxName = registerAesSbox();
  const fn = javascriptGenerator.provideFunction_('aesLastRound', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(s, rk) {',
    '  var t = s.slice();',
    '  var sbox = ' + sboxName + ';',
    '  // SubBytes',
    '  for (var i = 0; i < 16; i++) s[i] = sbox[t[i]];',
    '  // ShiftRows',
    '  t = s.slice();',
    '  s[1]=t[5]; s[5]=t[9]; s[9]=t[13]; s[13]=t[1];',
    '  s[2]=t[10]; s[6]=t[14]; s[10]=t[2]; s[14]=t[6];',
    '  s[3]=t[15]; s[7]=t[3]; s[11]=t[7]; s[15]=t[11];',
    '  // AddRoundKey (skip MixColumns)',
    '  for (var i = 0; i < 16; i++) s[i] ^= rk[i];',
    '  return s;',
    '}',
  ]);
  return [fn + '(' + state + ', ' + rk + ')', Order.ATOMIC];
};

javascriptGenerator.forBlock['aes_key_schedule'] = function (block: Block): [string, number] {
  const key = javascriptGenerator.valueToCode(block, 'KEY', Order.ATOMIC) || '[]';
  const sboxName = registerAesSbox();
  const fn = javascriptGenerator.provideFunction_('aesKeySchedule', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(key) {',
    '  var sbox = ' + sboxName + ';',
    '  var nk = key.length / 4;',
    '  var nr = nk + 6;',
    '  var totalWords = 4 * (nr + 1);',
    '  var w = [];',
    '  for (var i = 0; i < nk; i++) {',
    '    w[i] = ((key[4*i] << 24) | (key[4*i+1] << 16) | (key[4*i+2] << 8) | key[4*i+3]) >>> 0;',
    '  }',
    '  var rcon = [0x01,0x02,0x04,0x08,0x10,0x20,0x40,0x80,0x1b,0x36];',
    '  for (var i = nk; i < totalWords; i++) {',
    '    var temp = w[i-1];',
    '    if (i % nk === 0) {',
    '      // RotWord',
    '      temp = ((temp << 8) | (temp >>> 24)) >>> 0;',
    '      // SubWord',
    '      var b0 = sbox[(temp >>> 24) & 0xFF];',
    '      var b1 = sbox[(temp >>> 16) & 0xFF];',
    '      var b2 = sbox[(temp >>> 8) & 0xFF];',
    '      var b3 = sbox[temp & 0xFF];',
    '      temp = ((b0 << 24) | (b1 << 16) | (b2 << 8) | b3) >>> 0;',
    '      // XOR Rcon',
    '      temp ^= rcon[(i/nk)-1];',
    '    } else if (nk > 6 && i % nk === 4) {',
    '      // AES-256 额外 SubWord',
    '      var b0 = sbox[(temp >>> 24) & 0xFF];',
    '      var b1 = sbox[(temp >>> 16) & 0xFF];',
    '      var b2 = sbox[(temp >>> 8) & 0xFF];',
    '      var b3 = sbox[temp & 0xFF];',
    '      temp = ((b0 << 24) | (b1 << 16) | (b2 << 8) | b3) >>> 0;',
    '    }',
    '    w[i] = (w[i-nk] ^ temp) >>> 0;',
    '  }',
    '  // 展平为字节数组',
    '  var result = [];',
    '  for (var i = 0; i < totalWords; i++) {',
    '    result.push((w[i] >>> 24) & 0xFF);',
    '    result.push((w[i] >>> 16) & 0xFF);',
    '    result.push((w[i] >>> 8) & 0xFF);',
    '    result.push(w[i] & 0xFF);',
    '  }',
    '  return result;',
    '}',
  ]);
  return [fn + '(' + key + ')', Order.ATOMIC];
};
