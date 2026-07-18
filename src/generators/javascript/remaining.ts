/**
 * M2.5-M4 批次生成器 — JS 占位实现
 * 完整密码逻辑后续完善，当前保证编译通过和基本结构
 */
import { javascriptGenerator, Order } from 'blockly/javascript';
import type { Block } from 'blockly/core';

// M2.5 后量子便利层
['pq_ntt_vec','pq_intt_vec','pq_cbd_ntt_vec','pq_mat_vec_mul_ntt','pq_vec_add','pq_vec_sub','pq_sample_ntt_mat'].forEach(t => {
  javascriptGenerator.forBlock[t] = function(b: Block): [string, number] {
    const input = javascriptGenerator.valueToCode(b, 'INPUT', Order.ATOMIC) || javascriptGenerator.valueToCode(b, 'SEED', Order.ATOMIC) || '[]';
    return ['/* ' + t + ' */ ' + input, Order.ATOMIC];
  };
});

// M3 数学
javascriptGenerator.forBlock['nt_mod'] = function(b: Block): [string, number] {
  const a = javascriptGenerator.valueToCode(b, 'A', Order.ATOMIC) || '0';
  const n = javascriptGenerator.valueToCode(b, 'B', Order.ATOMIC) || '1';
  return ['((' + a + ' % ' + n + ' + ' + n + ') % ' + n + ')', Order.ATOMIC];
};
javascriptGenerator.forBlock['nt_mod_pow'] = function(b: Block): [string, number] {
  const a = javascriptGenerator.valueToCode(b, 'A', Order.ATOMIC) || '0';
  const e = javascriptGenerator.valueToCode(b, 'B', Order.ATOMIC) || '0';
  return ['/* modPow(' + a + ', ' + e + ') */ ' + a, Order.ATOMIC];
};
javascriptGenerator.forBlock['nt_div_rem'] = function(b: Block): [string, number] {
  const a = javascriptGenerator.valueToCode(b, 'A', Order.ATOMIC) || '0';
  const d = javascriptGenerator.valueToCode(b, 'B', Order.ATOMIC) || '1';
  return ['[Math.floor(' + a + '/' + d + '), ' + a + '%' + d + ']', Order.ATOMIC];
};
['bn_add','bn_sub','bn_mul','bn_div'].forEach(t => {
  javascriptGenerator.forBlock[t] = function(b: Block): [string, number] {
    const a = javascriptGenerator.valueToCode(b, 'A', Order.ATOMIC) || '[]';
    const v = javascriptGenerator.valueToCode(b, 'B', Order.ATOMIC) || '[]';
    return ['/* ' + t + ' */ ' + a, Order.ATOMIC];
  };
});

// HMAC
javascriptGenerator.forBlock['hash_hmac'] = function(b: Block): [string, number] {
  const k = javascriptGenerator.valueToCode(b, 'KEY', Order.ATOMIC) || '[]';
  const m = javascriptGenerator.valueToCode(b, 'MSG', Order.ATOMIC) || '[]';
  return ['/* HMAC */ ' + m, Order.ATOMIC];
};
javascriptGenerator.forBlock['md_iterate'] = function(b: Block): [string, number] {
  return [javascriptGenerator.valueToCode(b, 'IV', Order.ATOMIC) || '[]', Order.ATOMIC];
};
javascriptGenerator.forBlock['sponge_duplex'] = function(b: Block): [string, number] {
  return [javascriptGenerator.valueToCode(b, 'DATA', Order.ATOMIC) || '[]', Order.ATOMIC];
};

// M4 一键封装
['ml_kem_keygen','ml_kem_encaps','ml_kem_decaps','ecdh_key_exchange','ecdsa_sign','ecdsa_verify','sm2_sign','sm2_encrypt','sm3_hash','sm3_hmac','hmac_sha256','kdf_pbkdf2','kdf_hkdf'].forEach(t => {
  javascriptGenerator.forBlock[t] = function(): [string, number] {
    return ['/* ' + t + ' */ []', Order.ATOMIC];
  };
});

javascriptGenerator.forBlock['base64_encode'] = function(b: Block): [string, number] {
  return ['/* base64 */ ""', Order.ATOMIC];
};
javascriptGenerator.forBlock['base64_decode'] = function(b: Block): [string, number] {
  return ['/* base64decode */ []', Order.ATOMIC];
};
javascriptGenerator.forBlock['hex_to_bytes'] = function(b: Block): [string, number] {
  return ['/* hex2bytes */ []', Order.ATOMIC];
};
javascriptGenerator.forBlock['bytes_to_hex'] = function(b: Block): [string, number] {
  return ['/* bytes2hex */ ""', Order.ATOMIC];
};
javascriptGenerator.forBlock['endian_swap'] = function(b: Block): [string, number] {
  return [javascriptGenerator.valueToCode(b, 'INPUT', Order.ATOMIC) || '[]', Order.ATOMIC];
};
