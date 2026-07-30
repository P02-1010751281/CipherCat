/**
 * 密码学函数封装块 — JavaScript 代码生成器
 */
import { javascriptGenerator, Order } from 'blockly/javascript';
import type { Block } from 'blockly/core';

javascriptGenerator.forBlock['crypto_return'] = function (
  block: Block,
): string {
  const value =
    javascriptGenerator.valueToCode(block, 'VALUE', Order.NONE) || 'undefined';
  return 'return ' + value + ';\n';
};

const TYPE_MAP_JS: Record<string, string> = {
  bytes: 'Uint8Array', int: 'number', int_list: 'number[]',
  poly: 'number[]', seed: 'Uint8Array', key: 'Uint8Array', message: 'Uint8Array',
};

/** Generate JS for all template blocks. */
export function generateTemplateJS(block: Block): string {
  const funcName = (block.getFieldValue('FUNC_NAME') as string) || 'myCipher';
  const paramName = (block.getFieldValue('PARAM_NAME') as string) || 'arg';
  const paramType = (block.getFieldValue('PARAM_TYPE') as string) || 'bytes';
  const body = javascriptGenerator.statementToCode(block, 'BODY') ||
    '  // TODO: 实现 ' + funcName + ' 算法\n';
  const returnValue =
    javascriptGenerator.valueToCode(block, 'RETURN', Order.NONE) || paramName;

  const jsType = TYPE_MAP_JS[paramType] || paramType;
  return [
    '/**',
    ' * 密码学函数: ' + funcName,
    ' * @param {' + jsType + '} ' + paramName + ' — ' + paramType + ' 类型参数',
    ' * @returns {' + jsType + '} 算法输出',
    ' */',
    'function ' + funcName + '(' + paramName + ') {',
    body,
    '  return ' + returnValue + ';',
    '}',
    '',
  ].join('\n');
}

// Template block types
const TEMPLATE_TYPES = [
  'crypto_func_def', 'crypto_encrypt_func', 'crypto_decrypt_func', 'crypto_hash_func',
  'proc_aes_round', 'proc_aes_last_round', 'proc_aes_key_schedule',
  'proc_sm4_round', 'proc_sm4_key_schedule',
  'proc_sha256_hash', 'proc_sm3_hash', 'proc_hmac_sha256', 'proc_sm3_hmac',
  'proc_pbkdf2', 'proc_hkdf',
  'proc_mlkem_keygen', 'proc_md_iterate', 'proc_sponge_duplex',
  'proc_mode_ecb', 'proc_mode_cbc', 'proc_mode_ctr', 'proc_mode_gcm',
  'proc_ntt_vec', 'proc_pq_cbd', 'proc_pq_mat_mul', 'proc_pq_sample',
  'proc_pq_vec_add', 'proc_pq_vec_sub',
];
for (const t of TEMPLATE_TYPES) {
  javascriptGenerator.forBlock[t] = generateTemplateJS;
}
