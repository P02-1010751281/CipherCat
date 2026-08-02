/**
 * ZUC 原子块 JavaScript 代码生成器
 * GB/T 33133-2016
 *
 * S0/S1 S-box 数据与算法结构对照 luminousmen/ZUC 参考实现
 * （S0 与本仓库 docs/standards/gbt33133-ZUC/01-ZUC.md 附录 A.1 交叉验证一致）。
 */
import { javascriptGenerator, Order } from 'blockly/javascript';
import type { Block } from 'blockly/core';

/** ZUC S0 S-box (GB/T 33133 附录 A.1) */
const ZUC_S0 = [
  0x3e,0x72,0x5b,0x47,0xca,0xe0,0x00,0x33,0x04,0xd1,0x54,0x98,0x09,0xb9,0x6d,0xcb,
  0x7b,0x1b,0xf9,0x32,0xaf,0x9d,0x6a,0xa5,0xb8,0x2d,0xfc,0x1d,0x08,0x53,0x03,0x90,
  0x4d,0x4e,0x84,0x99,0xe4,0xce,0xd9,0x91,0xdd,0xb6,0x85,0x48,0x8b,0x29,0x6e,0xac,
  0xcd,0xc1,0xf8,0x1e,0x73,0x43,0x69,0xc6,0xb5,0xbd,0xfd,0x39,0x63,0x20,0xd4,0x38,
  0x76,0x7d,0xb2,0xa7,0xcf,0xed,0x57,0xc5,0xf3,0x2c,0xbb,0x14,0x21,0x06,0x55,0x9b,
  0xe3,0xef,0x5e,0x31,0x4f,0x7f,0x5a,0xa4,0x0d,0x82,0x51,0x49,0x5f,0xba,0x58,0x1c,
  0x4a,0x16,0xd5,0x17,0xa8,0x92,0x24,0x1f,0x8c,0xff,0xd8,0xae,0x2e,0x01,0xd3,0xad,
  0x3b,0x4b,0xda,0x46,0xeb,0xc9,0xde,0x9a,0x8f,0x87,0xd7,0x3a,0x80,0x6f,0x2f,0xc8,
  0xb1,0xb4,0x37,0xf7,0x0a,0x22,0x13,0x28,0x7c,0xcc,0x3c,0x89,0xc7,0xc3,0x96,0x56,
  0x07,0xbf,0x7e,0xf0,0x0b,0x2b,0x97,0x52,0x35,0x41,0x79,0x61,0xa6,0x4c,0x10,0xfe,
  0xbc,0x26,0x95,0x88,0x8a,0xb0,0xa3,0xfb,0xc0,0x18,0x94,0xf2,0xe1,0xe5,0xe9,0x5d,
  0xd0,0xdc,0x11,0x66,0x64,0x5c,0xec,0x59,0x42,0x75,0x12,0xf5,0x74,0x9c,0xaa,0x23,
  0x0e,0x86,0xab,0xbe,0x2a,0x02,0xe7,0x67,0xe6,0x44,0xa2,0x6c,0xc2,0x93,0x9f,0xf1,
  0xf6,0xfa,0x36,0xd2,0x50,0x68,0x9e,0x62,0x71,0x15,0x3d,0xd6,0x40,0xc4,0xe2,0x0f,
  0x8e,0x83,0x77,0x6b,0x25,0x05,0x3f,0x0c,0x30,0xea,0x70,0xb7,0xa1,0xe8,0xa9,0x65,
  0x8d,0x27,0x1a,0xdb,0x81,0xb3,0xa0,0xf4,0x45,0x7a,0x19,0xdf,0xee,0x78,0x34,0x60,
];

/** ZUC S1 S-box (GB/T 33133 附录 A.2，数据对照 ETSI TS 135 222 参考实现) */
const ZUC_S1 = [
  0x55,0xc2,0x63,0x71,0x3b,0xc8,0x47,0x86,0x9f,0x3c,0xda,0x5b,0x29,0xaa,0xfd,0x77,
  0x8c,0xc5,0x94,0x0c,0xa6,0x1a,0x13,0x00,0xe3,0xa8,0x16,0x72,0x40,0xf9,0xf8,0x42,
  0x44,0x26,0x68,0x96,0x81,0xd9,0x45,0x3e,0x10,0x76,0xc6,0xa7,0x8b,0x39,0x43,0xe1,
  0x3a,0xb5,0x56,0x2a,0xc0,0x6d,0xb3,0x05,0x22,0x66,0xbf,0xdc,0x0b,0xfa,0x62,0x48,
  0xdd,0x20,0x11,0x06,0x36,0xc9,0xc1,0xcf,0xf6,0x27,0x52,0xbb,0x69,0xf5,0xd4,0x87,
  0x7f,0x84,0x4c,0xd2,0x9c,0x57,0xa4,0xbc,0x4f,0x9a,0xdf,0xfe,0xd6,0x8d,0x7a,0xeb,
  0x2b,0x53,0xd8,0x5c,0xa1,0x14,0x17,0xfb,0x23,0xd5,0x7d,0x30,0x67,0x73,0x08,0x09,
  0xee,0xb7,0x70,0x3f,0x61,0xb2,0x19,0x8e,0x4e,0xe5,0x4b,0x93,0x8f,0x5d,0xdb,0xa9,
  0xad,0xf1,0xae,0x2e,0xcb,0x0d,0xfc,0xf4,0x2d,0x46,0x6e,0x1d,0x97,0xe8,0xd1,0xe9,
  0x4d,0x37,0xa5,0x75,0x5e,0x83,0x9e,0xab,0x82,0x9d,0xb9,0x1c,0xe0,0xcd,0x49,0x89,
  0x01,0xb6,0xbd,0x58,0x24,0xa2,0x5f,0x38,0x78,0x99,0x15,0x90,0x50,0xb8,0x95,0xe4,
  0xd0,0x91,0xc7,0xce,0xed,0x0f,0xb4,0x6f,0xa0,0xcc,0xf0,0x02,0x4a,0x79,0xc3,0xde,
  0xa3,0xef,0xea,0x51,0xe6,0x6b,0x18,0xec,0x1b,0x2c,0x80,0xf7,0x74,0xe7,0xff,0x21,
  0x5a,0x6a,0x54,0x1e,0x41,0x31,0x92,0x35,0xc4,0x33,0x07,0x0a,0xba,0x7e,0x0e,0x34,
  0x88,0xb1,0x98,0x7c,0xf3,0x3d,0x60,0x6c,0x7b,0xca,0xd3,0x1f,0x32,0x65,0x04,0x28,
  0x64,0xbe,0x85,0x9b,0x2f,0x59,0x8a,0xd7,0xb0,0x25,0xac,0xaf,0x12,0x03,0xe2,0xf2,
];

function registerZucS0(): string {
  return javascriptGenerator.provideFunction_('zuc_s0', [
    'var ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + ' = ' + JSON.stringify(ZUC_S0) + ';',
  ]);
}

function registerZucS0Lookup(): string {
  return javascriptGenerator.provideFunction_('zucS0Lookup', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(x) {',
    '  return ' + registerZucS0() + '[x & 0xFF];',
    '}',
  ]);
}

function registerZucS1(): string {
  return javascriptGenerator.provideFunction_('zuc_s1', [
    'var ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + ' = ' + JSON.stringify(ZUC_S1) + ';',
  ]);
}

function registerZucS1Lookup(): string {
  return javascriptGenerator.provideFunction_('zucS1Lookup', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(x) {',
    '  return ' + registerZucS1() + '[x & 0xFF];',
    '}',
  ]);
}

/** 32-bit 循环左移 */
function registerZucRotl(): string {
  return javascriptGenerator.provideFunction_('zucRotl', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(x, k) {',
    '  x = x >>> 0;',
    '  return ((x << k) | (x >>> (32 - k))) >>> 0;',
    '}',
  ]);
}

/** 32-bit S-box 交织：S(x) = S0(x>>24) ‖ S1(x>>16) ‖ S0(x>>8) ‖ S1(x) */
function registerZucS32(): string {
  return javascriptGenerator.provideFunction_('zucS32', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(x) {',
    '  x = x >>> 0;',
    '  return (((' + registerZucS0Lookup() + '(x >>> 24) << 8 | ' + registerZucS1Lookup() + '((x >>> 16) & 0xFF)) << 8 | ' + registerZucS0Lookup() + '((x >>> 8) & 0xFF)) << 8 | ' + registerZucS1Lookup() + '(x & 0xFF)) >>> 0;',
    '}',
  ]);
}

javascriptGenerator.forBlock['zuc_s0'] = function (block: Block): [string, number] {
  const input = javascriptGenerator.valueToCode(block, 'INPUT', Order.ATOMIC) || '0';
  const fn = registerZucS0Lookup();
  return [fn + '(' + input + ')', Order.ATOMIC];
};

javascriptGenerator.forBlock['zuc_s1'] = function (block: Block): [string, number] {
  const input = javascriptGenerator.valueToCode(block, 'INPUT', Order.ATOMIC) || '0';
  const fn = registerZucS1Lookup();
  return [fn + '(' + input + ')', Order.ATOMIC];
};

javascriptGenerator.forBlock['zuc_l1'] = function (block: Block): [string, number] {
  const input = javascriptGenerator.valueToCode(block, 'INPUT', Order.ATOMIC) || '0';
  const rotl = registerZucRotl();
  return [
    '((' + input + ' ^ ' + rotl + '(' + input + ', 2) ^ ' + rotl + '(' + input + ', 10) ^ ' + rotl + '(' + input + ', 18) ^ ' + rotl + '(' + input + ', 24)) >>> 0)',
    Order.ATOMIC,
  ];
};

javascriptGenerator.forBlock['zuc_l2'] = function (block: Block): [string, number] {
  const input = javascriptGenerator.valueToCode(block, 'INPUT', Order.ATOMIC) || '0';
  const rotl = registerZucRotl();
  return [
    '((' + input + ' ^ ' + rotl + '(' + input + ', 8) ^ ' + rotl + '(' + input + ', 14) ^ ' + rotl + '(' + input + ', 22) ^ ' + rotl + '(' + input + ', 30)) >>> 0)',
    Order.ATOMIC,
  ];
};

/**
 * ZUC 非线性函数 F：纯函数版本（不含记忆单元状态持久化）。
 *
 * W = (X0 ⊕ R1) ⊞ R2
 * W1 = R1 ⊞ X1 ; W2 = R2 ⊕ X2
 * u = L1(W1 ‖ W2) ; v = L2(W2 ‖ W1)
 * R1' = S32(u) ; R2' = S32(v)
 *
 * 返回 { W, R1, R2 }：完整 ZUC 密钥流循环中 R1'/R2' 需写回记忆单元——
 * 教学拼接时取返回值字段（r.W / r.R1 / r.R2）。
 */
javascriptGenerator.forBlock['zuc_f'] = function (block: Block): [string, number] {
  const x0 = javascriptGenerator.valueToCode(block, 'X0', Order.ATOMIC) || '0';
  const x1 = javascriptGenerator.valueToCode(block, 'X1', Order.ATOMIC) || '0';
  const x2 = javascriptGenerator.valueToCode(block, 'X2', Order.ATOMIC) || '0';
  const r1 = javascriptGenerator.valueToCode(block, 'R1', Order.ATOMIC) || '0';
  const r2 = javascriptGenerator.valueToCode(block, 'R2', Order.ATOMIC) || '0';
  const rotl = registerZucRotl();
  const s32 = registerZucS32();

  const fn = javascriptGenerator.provideFunction_('zucF', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(X0, X1, X2, R1, R2) {',
    '  var rotl = ' + rotl + ';',
    '  var S = ' + s32 + ';',
    '  var L1 = function (x) { x = x >>> 0; return (x ^ rotl(x, 2) ^ rotl(x, 10) ^ rotl(x, 18) ^ rotl(x, 24)) >>> 0; };',
    '  var L2 = function (x) { x = x >>> 0; return (x ^ rotl(x, 8) ^ rotl(x, 14) ^ rotl(x, 22) ^ rotl(x, 30)) >>> 0; };',
    '  // W/W1 为普通 32-bit 加法（截断），非模 2^31-1；W2 为异或',
    '  var W = ((X0 ^ R1) + R2) >>> 0;',
    '  var W1 = (R1 + X1) >>> 0;',
    '  var W2 = (R2 ^ X2) >>> 0;',
    '  var u = L1(((W1 << 16) | (W2 >>> 16)) >>> 0);',
    '  var v = L2(((W2 << 16) | (W1 >>> 16)) >>> 0);',
    '  var R1n = S(u);',
    '  var R2n = S(v);',
    '  return { W: W >>> 0, R1: R1n >>> 0, R2: R2n >>> 0 };',
    '}',
  ]);

  return [
    fn + '(' + x0 + ', ' + x1 + ', ' + x2 + ', ' + r1 + ', ' + r2 + ').W',
    Order.ATOMIC,
  ];
};

/**
 * ZUC 完整密钥流生成 (GB/T 33133 §5.6)。
 *
 * 实现：16 字 LFSR（31-bit，模 2^31-1 加法）+ 比特重组 BR + 非线性函数 F。
 * 流程：密钥装入 → 32 轮初始化（LFSRWithInitialisationMode）→ 丢弃一轮 → 工作模式逐字输出。
 */
javascriptGenerator.forBlock['zuc_keystream'] = function (block: Block): [string, number] {
  const key = javascriptGenerator.valueToCode(block, 'KEY', Order.ATOMIC) || '[]';
  const iv = javascriptGenerator.valueToCode(block, 'IV', Order.ATOMIC) || '[]';
  const len = javascriptGenerator.valueToCode(block, 'LEN', Order.ATOMIC) || '1';
  const zucF = javascriptGenerator.provideFunction_('zucF', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(X0, X1, X2, R1, R2) {',
    '  var rotl = ' + registerZucRotl() + ';',
    '  var S = ' + registerZucS32() + ';',
    '  var L1 = function (x) { x = x >>> 0; return (x ^ rotl(x, 2) ^ rotl(x, 10) ^ rotl(x, 18) ^ rotl(x, 24)) >>> 0; };',
    '  var L2 = function (x) { x = x >>> 0; return (x ^ rotl(x, 8) ^ rotl(x, 14) ^ rotl(x, 22) ^ rotl(x, 30)) >>> 0; };',
    '  var W = ((X0 ^ R1) + R2) >>> 0;',
    '  var W1 = (R1 + X1) >>> 0;',
    '  var W2 = (R2 ^ X2) >>> 0;',
    '  var u = L1(((W1 << 16) | (W2 >>> 16)) >>> 0);',
    '  var v = L2(((W2 << 16) | (W1 >>> 16)) >>> 0);',
    '  var R1n = S(u);',
    '  var R2n = S(v);',
    '  return { W: W >>> 0, R1: R1n >>> 0, R2: R2n >>> 0 };',
    '}',
  ]);
  const D = '[' + [0x44D7,0x26BC,0x626B,0x135E,0x5789,0x35E2,0x7135,0x09AF,0x4D78,0x2F13,0x6BC4,0x1AF1,0x5E26,0x3C4D,0x789A,0x47AC].join(',') + ']';
  const fn = javascriptGenerator.provideFunction_('zucKeystream', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(key, iv, len) {',
    '  var M = 0x7FFFFFFF;',
    '  var addm = function (a, b) { var c = (a >>> 0) + (b >>> 0); return ((c & M) + (c >>> 31)) >>> 0; };',
    '  var mulByPow2 = function (x, k) { x = x >>> 0; return ((x << k) | (x >>> (31 - k))) & M; };',
    '  var D = ' + D + ';',
    '  var S = [];',
    '  for (var i = 0; i < 16; i++) S[i] = ((key[i] << 23) | (D[i] << 8) | iv[i]) >>> 0;',
    '  var R1 = 0, R2 = 0, X = [0, 0, 0, 0];',
    '  var br = function () {',
    '    X[0] = ((((S[15] & 0x7FFF8000) >>> 0) << 1) | (S[14] & 0xFFFF)) >>> 0;',
    '    X[1] = ((((S[11] & 0xFFFF) >>> 0) << 16) | (S[9] >>> 15)) >>> 0;',
    '    X[2] = ((((S[7] & 0xFFFF) >>> 0) << 16) | (S[5] >>> 15)) >>> 0;',
    '    X[3] = ((((S[2] & 0xFFFF) >>> 0) << 16) | (S[0] >>> 15)) >>> 0;',
    '  };',
    '  var f = function () {',
    '    var r = ' + zucF + '(X[0], X[1], X[2], R1, R2);',
    '    R1 = r.R1; R2 = r.R2;',
    '    return r.W;',
    '  };',
    '  var lfsr = function (u) {',
    '    var fv = S[0];',
    '    var pairs = [[0,8],[4,20],[10,21],[13,17],[15,15]];',
    '    for (var j = 0; j < 5; j++) fv = addm(fv, mulByPow2(S[pairs[j][0]], pairs[j][1]));',
    '    fv = addm(fv, u);',
    '    var next = []; for (var k = 1; k < 16; k++) next.push(S[k]); next.push(fv);',
    '    S = next;',
    '  };',
    '  for (var t = 0; t < 32; t++) { br(); var w = f(); lfsr(w >>> 1); }',
    '  br(); f(); lfsr(0);',
    '  var out = [];',
    '  for (var u2 = 0; u2 < len; u2++) { br(); out.push((f() ^ X[3]) >>> 0); lfsr(0); }',
    '  return out;',
    '}',
  ]);
  return [fn + '(' + key + ', ' + iv + ', ' + len + ')', Order.ATOMIC];
};
