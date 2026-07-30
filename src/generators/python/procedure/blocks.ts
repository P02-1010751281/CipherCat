/**
 * 密码学函数封装块 — Python 代码生成器
 */
import { pythonGenerator, Order } from 'blockly/python';
import type { Block } from 'blockly/core';

pythonGenerator.forBlock['crypto_return'] = function (
  block: Block,
): string {
  const value =
    pythonGenerator.valueToCode(block, 'VALUE', Order.NONE) || 'None';
  return 'return ' + value + '\n';
};

const TYPE_MAP_PY: Record<string, string> = {
  bytes: 'bytes', int: 'int', int_list: 'list[int]',
  poly: 'list[int]', seed: 'bytes', key: 'bytes', message: 'bytes',
};

/** Shared generator for all template blocks. */
export function generateTemplatePy(block: Block): string {
  const funcName = (block.getFieldValue('FUNC_NAME') as string) || 'my_cipher';
  const paramName = (block.getFieldValue('PARAM_NAME') as string) || 'arg';
  const paramType = (block.getFieldValue('PARAM_TYPE') as string) || 'bytes';
  const body = pythonGenerator.statementToCode(block, 'BODY') ||
    '    # TODO: 实现 ' + funcName + ' 算法\n';
  const returnValue =
    pythonGenerator.valueToCode(block, 'RETURN', Order.NONE) || paramName;

  const typeHint = TYPE_MAP_PY[paramType] || paramType;
  const bodyIndented = pythonGenerator.prefixLines(body, '    ');

  return [
    '',
    'def ' + funcName + '(' + paramName + ': ' + typeHint + ') -> ' + typeHint + ':',
    '    """',
    '    密码学函数: ' + funcName,
    '    """',
    '    global data',
    bodyIndented,
    '    return ' + returnValue,
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
  pythonGenerator.forBlock[t] = generateTemplatePy;
}
