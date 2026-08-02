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

/** 完整同步 HKDF（HMAC-SHA256，返回派生密钥字节数组） */
function registerHkdf(): string {
  registerHmacSha256();
  return javascriptGenerator.provideFunction_('hkdf', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(salt, ikm, info, len) {',
    '  var s = Array.from(salt || []);',
    '  if (s.length === 0) { s = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]; }',
    '  var PRK = hmacSha256(s, ikm);',
    '  var T = [], out = [], i = 1;',
    '  while (out.length < len) {',
    '    T = hmacSha256(PRK, T.concat(Array.from(info)).concat([i]));',
    '    for (var j = 0; j < T.length && out.length < len; j++) out.push(T[j]);',
    '    i++;',
    '  }',
    '  return out;',
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
  return [fn + '(' + salt + ', ' + ikm + ', ' + info + ', ' + len + ')', Order.ATOMIC];
};
