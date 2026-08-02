/**
 * HKDF 原子块 Python 代码生成器
 * RFC 5869
 *
 * HMAC-SHA256 用 Python 标准库 hmac/hashlib（与 hash_hmac SHA-256 分支同款）。
 * 官方向量 RFC 5869 §A.1。
 */
import { pythonGenerator, Order } from 'blockly/python';
import type { Block } from 'blockly/core';

/** 完整 HKDF（HMAC-SHA256，返回派生密钥字节列表） */
function registerHkdf(): string {
  return pythonGenerator.provideFunction_('hkdf', [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(salt, ikm, info, key_len):',
    '    import hmac, hashlib',
    '    s = bytes(salt or [0] * 32)',
    '    prk = hmac.new(s, bytes(ikm), hashlib.sha256).digest()',
    '    t = b""',
    '    out = b""',
    '    i = 1',
    '    while len(out) < key_len:',
    '        t = hmac.new(prk, t + bytes(info) + bytes([i]), hashlib.sha256).digest()',
    '        out += t',
    '        i += 1',
    '    return list(out[:key_len])',
  ]);
}

pythonGenerator.forBlock['hkdf'] = function (block: Block): [string, number] {
  const salt = pythonGenerator.valueToCode(block, 'SALT', Order.ATOMIC) || '[]';
  const ikm = pythonGenerator.valueToCode(block, 'IKM', Order.ATOMIC) || '[]';
  const info = pythonGenerator.valueToCode(block, 'INFO', Order.ATOMIC) || '[]';
  const len = pythonGenerator.valueToCode(block, 'LEN', Order.ATOMIC) || '32';
  const fn = registerHkdf();
  return [fn + '(' + salt + ', ' + ikm + ', ' + info + ', ' + len + ')', Order.ATOMIC];
};
