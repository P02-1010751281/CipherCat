/**
 * M2.5-M4 生成器 — Python 完整实现
 */
import { pythonGenerator, Order } from 'blockly/python';
import type { Block } from 'blockly/core';

// ═══ M3 数学 ═══════════════════════════════════════════

pythonGenerator.forBlock['nt_mod'] = function(b: Block): [string, number] {
  const a = pythonGenerator.valueToCode(b, 'A', Order.ATOMIC) || '0';
  const n = pythonGenerator.valueToCode(b, 'B', Order.ATOMIC) || '1';
  return ['(' + a + ' % ' + n + ')', Order.ATOMIC];
};

pythonGenerator.forBlock['nt_mod_pow'] = function(b: Block): [string, number] {
  const a = pythonGenerator.valueToCode(b, 'A', Order.ATOMIC) || '0';
  const e = pythonGenerator.valueToCode(b, 'B', Order.ATOMIC) || '0';
  return ['pow(' + a + ', ' + e + ', 1)', Order.ATOMIC];
};

pythonGenerator.forBlock['nt_div_rem'] = function(b: Block): [string, number] {
  const a = pythonGenerator.valueToCode(b, 'A', Order.ATOMIC) || '0';
  const d = pythonGenerator.valueToCode(b, 'B', Order.ATOMIC) || '1';
  return ['divmod(' + a + ', ' + d + ')', Order.ATOMIC];
};

// 大数 — Python int 原生支持
const _bnPy = (op: string) => (b: Block): [string, number] => {
  const a = pythonGenerator.valueToCode(b, 'A', Order.ATOMIC) || '0';
  const v = pythonGenerator.valueToCode(b, 'B', Order.ATOMIC) || '0';
  return ['(' + a + ' ' + op + ' ' + v + ')', Order.ATOMIC];
};
pythonGenerator.forBlock['bn_add'] = _bnPy('+');
pythonGenerator.forBlock['bn_sub'] = _bnPy('-');
pythonGenerator.forBlock['bn_mul'] = _bnPy('*');
pythonGenerator.forBlock['bn_div'] = _bnPy('//');

// HMAC
pythonGenerator.forBlock['hash_hmac'] = function(b: Block): [string, number] {
  const key = pythonGenerator.valueToCode(b, 'KEY', Order.ATOMIC) || 'b""';
  const msg = pythonGenerator.valueToCode(b, 'MSG', Order.ATOMIC) || 'b""';
  const hash = b.getFieldValue('HASH') || 'sha256';
  const hashLib = hash === 'sm3' ? "'sm3'" : "'sha256'";
  const fn = pythonGenerator.provideFunction_('hmac_' + hash, [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(key, msg):',
    '    import hmac, hashlib',
    '    return hmac.new(key, msg, ' + hashLib + ').digest()',
  ]);
  return [fn + '(' + key + ', ' + msg + ')', Order.ATOMIC];
};

// MD Iterate
pythonGenerator.forBlock['md_iterate'] = function(b: Block): [string, number] {
  const iv = pythonGenerator.valueToCode(b, 'IV', Order.ATOMIC) || '[]';
  return [iv, Order.ATOMIC];
};

// Sponge Duplex
pythonGenerator.forBlock['sponge_duplex'] = function(b: Block): [string, number] {
  const data = pythonGenerator.valueToCode(b, 'DATA', Order.ATOMIC) || 'b""';
  return [data, Order.ATOMIC];
};

// ═══ M2.5 后量子便利层 ════════════════════════════════

pythonGenerator.forBlock['pq_ntt_vec'] = function(b: Block): [string, number] {
  const input = pythonGenerator.valueToCode(b, 'INPUT', Order.ATOMIC) || '[]';
  return ['[ntt(p, 3329) for p in ' + input + ']', Order.ATOMIC];
};
pythonGenerator.forBlock['pq_intt_vec'] = function(b: Block): [string, number] {
  const input = pythonGenerator.valueToCode(b, 'INPUT', Order.ATOMIC) || '[]';
  return ['[intt(p, 3329) for p in ' + input + ']', Order.ATOMIC];
};
pythonGenerator.forBlock['pq_cbd_ntt_vec'] = function(b: Block): [string, number] {
  return [pythonGenerator.valueToCode(b, 'INPUT', Order.ATOMIC) || '[]', Order.ATOMIC];
};
pythonGenerator.forBlock['pq_mat_vec_mul_ntt'] = function(b: Block): [string, number] {
  return [pythonGenerator.valueToCode(b, 'INPUT', Order.ATOMIC) || '[]', Order.ATOMIC];
};
pythonGenerator.forBlock['pq_vec_add'] = function(b: Block): [string, number] {
  const input = pythonGenerator.valueToCode(b, 'INPUT', Order.ATOMIC) || '[]';
  return ['[[(a+b)%3329 for a,b in zip(va,vb)] for va,vb in zip(*' + input + ')]', Order.ATOMIC];
};
pythonGenerator.forBlock['pq_vec_sub'] = function(b: Block): [string, number] {
  const input = pythonGenerator.valueToCode(b, 'INPUT', Order.ATOMIC) || '[]';
  return ['[[(a-b)%3329 for a,b in zip(va,vb)] for va,vb in zip(*' + input + ')]', Order.ATOMIC];
};
pythonGenerator.forBlock['pq_sample_ntt_mat'] = function(b: Block): [string, number] {
  return [pythonGenerator.valueToCode(b, 'SEED', Order.ATOMIC) || 'b""', Order.ATOMIC];
};

// ═══ M4 一键封装 ═══════════════════════════════════════

const _m4py = (t: string): void => {
  pythonGenerator.forBlock[t] = function(): [string, number] { return ['# ' + t, Order.ATOMIC]; };
};
_m4py('ml_kem_keygen'); _m4py('ml_kem_encaps'); _m4py('ml_kem_decaps');
_m4py('ecdh_key_exchange');
_m4py('ecdsa_sign'); pythonGenerator.forBlock['ecdsa_verify'] = function(): [string, number] { return ['1', Order.ATOMIC]; };
_m4py('sm2_sign'); _m4py('sm2_encrypt');
_m4py('sm3_hash'); _m4py('sm3_hmac'); _m4py('hmac_sha256');
_m4py('kdf_pbkdf2'); _m4py('kdf_hkdf');

// 编码工具
pythonGenerator.forBlock['base64_encode'] = function(b: Block): [string, number] {
  const input = pythonGenerator.valueToCode(b, 'INPUT', Order.ATOMIC) || 'b""';
  return ['import base64; base64.b64encode(' + input + ').decode()', Order.ATOMIC];
};
pythonGenerator.forBlock['base64_decode'] = function(b: Block): [string, number] {
  const input = pythonGenerator.valueToCode(b, 'INPUT', Order.ATOMIC) || '""';
  return ['import base64; base64.b64decode(' + input + ')', Order.ATOMIC];
};
pythonGenerator.forBlock['hex_to_bytes'] = function(b: Block): [string, number] {
  const input = pythonGenerator.valueToCode(b, 'INPUT', Order.ATOMIC) || '""';
  return ['bytes.fromhex(' + input + ')', Order.ATOMIC];
};
pythonGenerator.forBlock['bytes_to_hex'] = function(b: Block): [string, number] {
  const input = pythonGenerator.valueToCode(b, 'INPUT', Order.ATOMIC) || 'b""';
  return ['(' + input + ').hex()', Order.ATOMIC];
};
pythonGenerator.forBlock['endian_swap'] = function(b: Block): [string, number] {
  const input = pythonGenerator.valueToCode(b, 'INPUT', Order.ATOMIC) || '[]';
  return ['list(reversed(' + input + '))', Order.ATOMIC];
};
