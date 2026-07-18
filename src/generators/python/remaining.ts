/**
 * M2.5-M4 批次生成器 — Python 占位实现
 */
import { pythonGenerator, Order } from 'blockly/python';
import type { Block } from 'blockly/core';

const _pq = ['pq_ntt_vec','pq_intt_vec','pq_cbd_ntt_vec','pq_mat_vec_mul_ntt','pq_vec_add','pq_vec_sub','pq_sample_ntt_mat'];
_pq.forEach(t => { pythonGenerator.forBlock[t] = function(): [string, number] { return ['# ' + t + ' []', Order.ATOMIC]; }; });

pythonGenerator.forBlock['nt_mod'] = function(b: Block): [string, number] {
  const a = pythonGenerator.valueToCode(b, 'A', Order.ATOMIC) || '0';
  const n = pythonGenerator.valueToCode(b, 'B', Order.ATOMIC) || '1';
  return ['(' + a + ' % ' + n + ')', Order.ATOMIC];
};
pythonGenerator.forBlock['nt_mod_pow'] = function(): [string, number] { return ['# modPow', Order.ATOMIC]; };
pythonGenerator.forBlock['nt_div_rem'] = function(): [string, number] { return ['# divRem', Order.ATOMIC]; };
['bn_add','bn_sub','bn_mul','bn_div'].forEach(t => { pythonGenerator.forBlock[t] = function(): [string, number] { return ['# ' + t + ' []', Order.ATOMIC]; }; });
pythonGenerator.forBlock['hash_hmac'] = function(): [string, number] { return ['# HMAC b""', Order.ATOMIC]; };
pythonGenerator.forBlock['md_iterate'] = function(): [string, number] { return ['# md_iterate []', Order.ATOMIC]; };
pythonGenerator.forBlock['sponge_duplex'] = function(): [string, number] { return ['# sponge_duplex b""', Order.ATOMIC]; };
const _m4 = ['ml_kem_keygen','ml_kem_encaps','ml_kem_decaps','ecdh_key_exchange','ecdsa_sign','ecdsa_verify','sm2_sign','sm2_encrypt','sm3_hash','sm3_hmac','hmac_sha256','kdf_pbkdf2','kdf_hkdf'];
_m4.forEach(t => { pythonGenerator.forBlock[t] = function(): [string, number] { return ['# ' + t + ' b""', Order.ATOMIC]; }; });
pythonGenerator.forBlock['base64_encode'] = function(): [string, number] { return ['""', Order.ATOMIC]; };
pythonGenerator.forBlock['base64_decode'] = function(): [string, number] { return ['b""', Order.ATOMIC]; };
pythonGenerator.forBlock['hex_to_bytes'] = function(): [string, number] { return ['b""', Order.ATOMIC]; };
pythonGenerator.forBlock['bytes_to_hex'] = function(): [string, number] { return ['""', Order.ATOMIC]; };
pythonGenerator.forBlock['endian_swap'] = function(): [string, number] { return ['[]', Order.ATOMIC]; };
