/**
 * HKDF 原子块 JavaScript 代码生成器
 * RFC 5869
 *
 * HMAC-SHA256 复用 hash/hmac-sha256 共享模块的同步实现（WebCrypto 异步不适合内嵌）。
 * 官方向量 RFC 5869 §A.1。
 */
import { javascriptGenerator, Order } from 'blockly/javascript';
import type { Block } from 'blockly/core';
import { registerHmacSha256, registerSha256Hash } from '../hash/hmac-sha256';

/** HKDF-Extract（RFC 5869 §2.2）：PRK = HMAC-SHA256(salt, IKM) */
function registerHkdfExtract(): string {
  registerHmacSha256();
  return javascriptGenerator.provideFunction_('hkdfExtract', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(salt, ikm) {',
    '  var s = Array.from(salt || []);',
    '  if (s.length === 0) { s = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]; }',
    '  return hmacSha256(s, ikm);',
    '}',
  ]);
}

/** HKDF-Expand（RFC 5869 §2.3）：T(i) = HMAC-SHA256(PRK, T(i-1)‖info‖i) */
function registerHkdfExpand(): string {
  registerHmacSha256();
  return javascriptGenerator.provideFunction_('hkdfExpand', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(prk, info, len) {',
    '  if (!Number.isSafeInteger(len) || len < 0 || len > 8160) throw new Error("HKDF output length must be an integer from 0 to 8160 bytes");',
    '  var T = [], out = [], i = 1;',
    '  while (out.length < len) {',
    '    T = hmacSha256(prk, T.concat(Array.from(info)).concat([i]));',
    '    for (var j = 0; j < T.length && out.length < len; j++) out.push(T[j]);',
    '    i++;',
    '  }',
    '  return out;',
    '}',
  ]);
}

/** 完整同步 HKDF（HMAC-SHA256，返回派生密钥字节数组） */
function registerHkdf(): string {
  const extract = registerHkdfExtract();
  const expand = registerHkdfExpand();
  return javascriptGenerator.provideFunction_('hkdf', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(salt, ikm, info, len) {',
    '  return ' + expand + '(' + extract + '(salt, ikm), info, len);',
    '}',
  ]);
}

javascriptGenerator.forBlock['hkdf'] = function (block: Block): [string, number] {
  const salt = javascriptGenerator.valueToCode(block, 'SALT', Order.ATOMIC) || '[]';
  const ikm = javascriptGenerator.valueToCode(block, 'IKM', Order.ATOMIC) || '[]';
  const info = javascriptGenerator.valueToCode(block, 'INFO', Order.ATOMIC) || '[]';
  const len = javascriptGenerator.valueToCode(block, 'LEN', Order.ATOMIC) || '32';
  registerSha256Hash();
  const fn = registerHkdf();
  return ['Uint8Array.from(' + fn + '(' + salt + ', ' + ikm + ', ' + info + ', ' + len + '))', Order.ATOMIC];
};

javascriptGenerator.forBlock['hkdf_extract'] = function (block: Block): [string, number] {
  const salt = javascriptGenerator.valueToCode(block, 'SALT', Order.ATOMIC) || '[]';
  const ikm = javascriptGenerator.valueToCode(block, 'IKM', Order.ATOMIC) || '[]';
  registerSha256Hash();
  const fn = registerHkdfExtract();
  return ['Uint8Array.from(' + fn + '(' + salt + ', ' + ikm + '))', Order.ATOMIC];
};

javascriptGenerator.forBlock['hkdf_expand'] = function (block: Block): [string, number] {
  const prk = javascriptGenerator.valueToCode(block, 'PRK', Order.ATOMIC) || '[]';
  const info = javascriptGenerator.valueToCode(block, 'INFO', Order.ATOMIC) || '[]';
  const len = javascriptGenerator.valueToCode(block, 'LEN', Order.ATOMIC) || '32';
  registerSha256Hash();
  const fn = registerHkdfExpand();
  return ['Uint8Array.from(' + fn + '(' + prk + ', ' + info + ', ' + len + '))', Order.ATOMIC];
};
