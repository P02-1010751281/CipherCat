/**
 * HKDF 原子块 Python 代码生成器
 * RFC 5869
 *
 * HMAC-SHA256 用 Python 标准库 hmac/hashlib（与 hash_hmac SHA-256 分支同款）。
 * 官方向量 RFC 5869 §A.1。
 */
import { pythonGenerator, Order } from 'blockly/python';
import type { Block } from 'blockly/core';

/** HKDF-Extract（RFC 5869 §2.2）：PRK = HMAC-SHA256(salt, IKM) */
function registerHkdfExtract(): string {
  return pythonGenerator.provideFunction_('hkdf_extract', [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(salt, ikm):',
    '    import hmac, hashlib',
    '    s = bytes(salt or [0] * 32)',
    '    return list(hmac.new(s, bytes(ikm), hashlib.sha256).digest())',
  ]);
}

/** HKDF-Expand（RFC 5869 §2.3）：T(i) = HMAC-SHA256(PRK, T(i-1)‖info‖i) */
function registerHkdfExpand(): string {
  return pythonGenerator.provideFunction_('hkdf_expand', [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(prk, info, key_len):',
    '    if isinstance(key_len, bool) or not isinstance(key_len, (int, float)) or (isinstance(key_len, float) and not key_len.is_integer()): raise ValueError("HKDF output length must be an integer from 0 to 8160 bytes")',
    '    key_len = int(key_len)',
    '    if not 0 <= key_len <= 8160: raise ValueError("HKDF output length must be an integer from 0 to 8160 bytes")',
    '    import hmac, hashlib',
    '    t = b""',
    '    out = b""',
    '    i = 1',
    '    while len(out) < key_len:',
    '        t = hmac.new(bytes(prk), t + bytes(info) + bytes([i]), hashlib.sha256).digest()',
    '        out += t',
    '        i += 1',
    '    return list(out[:key_len])',
  ]);
}

/** 完整 HKDF（HMAC-SHA256，返回派生密钥字节列表） */
function registerHkdf(): string {
  const extract = registerHkdfExtract();
  const expand = registerHkdfExpand();
  return pythonGenerator.provideFunction_('hkdf', [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(salt, ikm, info, key_len):',
    '    return ' + expand + '(' + extract + '(salt, ikm), info, key_len)',
  ]);
}

pythonGenerator.forBlock['hkdf'] = function (block: Block): [string, number] {
  const salt = pythonGenerator.valueToCode(block, 'SALT', Order.ATOMIC) || '[]';
  const ikm = pythonGenerator.valueToCode(block, 'IKM', Order.ATOMIC) || '[]';
  const info = pythonGenerator.valueToCode(block, 'INFO', Order.ATOMIC) || '[]';
  const len = pythonGenerator.valueToCode(block, 'LEN', Order.ATOMIC) || '32';
  const fn = registerHkdf();
  return ['bytes(' + fn + '(' + salt + ', ' + ikm + ', ' + info + ', ' + len + '))', Order.ATOMIC];
};

pythonGenerator.forBlock['hkdf_extract'] = function (block: Block): [string, number] {
  const salt = pythonGenerator.valueToCode(block, 'SALT', Order.ATOMIC) || '[]';
  const ikm = pythonGenerator.valueToCode(block, 'IKM', Order.ATOMIC) || '[]';
  const fn = registerHkdfExtract();
  return ['bytes(' + fn + '(' + salt + ', ' + ikm + '))', Order.ATOMIC];
};

pythonGenerator.forBlock['hkdf_expand'] = function (block: Block): [string, number] {
  const prk = pythonGenerator.valueToCode(block, 'PRK', Order.ATOMIC) || '[]';
  const info = pythonGenerator.valueToCode(block, 'INFO', Order.ATOMIC) || '[]';
  const len = pythonGenerator.valueToCode(block, 'LEN', Order.ATOMIC) || '32';
  const fn = registerHkdfExpand();
  return ['bytes(' + fn + '(' + prk + ', ' + info + ', ' + len + '))', Order.ATOMIC];
};
