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

/** Generate JS for crypto_defreturn (typed multi-param def). */
export function generateDefreturnJS(block: Block): string {
  const funcName = (block.getFieldValue('NAME') as string) || 'unnamed';
  const mutation = // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (block as any).mutationToDom?.() as Element | null;
  const argNodes = mutation ? Array.from(mutation.getElementsByTagName('arg')) : [];
  const params: string[] = [];
  const jsdoc: string[] = [];
  argNodes.forEach((arg, i) => {
    const name = arg.getAttribute('name') || 'arg' + i;
    const type = arg.getAttribute('type') || 'bytes';
    const jsType = TYPE_MAP_JS[type] || type;
    params.push(name);
    jsdoc.push(' * @param {' + jsType + '} ' + name + ' — ' + type + ' 类型参数');
  });
  const body = javascriptGenerator.statementToCode(block, 'STACK') ||
    '  // TODO: 实现 ' + funcName + ' 算法\\n';
  const returnValue =
    javascriptGenerator.valueToCode(block, 'RETURN', Order.NONE) || params[0] || 'undefined';
  const firstType = argNodes.length ? (TYPE_MAP_JS[argNodes[0].getAttribute('type') || 'bytes'] || 'Uint8Array') : 'Uint8Array';
  return [
    '/**',
    ' * 密码学函数: ' + funcName,
    jsdoc.join('\\n'),
    ' * @returns {' + firstType + '} 算法输出',
    ' */',
    'function ' + funcName + '(' + params.join(', ') + ') {',
    body,
    '  return ' + returnValue + ';',
    '}',
    '',
  ].join('\\n');
}

/** Generate JS for crypto_callreturn. */
function generateCallreturnJS(block: Block): string {
  const funcName = (block.getFieldValue('NAME') as string) || 'unnamed';
  const mutation = // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (block as any).mutationToDom?.() as Element | null;
  const argNodes = mutation ? Array.from(mutation.getElementsByTagName('arg')) : [];
  const args = argNodes.map((arg, i) =>
    javascriptGenerator.valueToCode(block, 'ARG' + i, Order.NONE) || 'undefined');
  return funcName + '(' + args.join(', ') + ')';
}

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
// 覆盖原生 procedures 生成器（类型增强）
javascriptGenerator.forBlock['procedures_defreturn'] = generateDefreturnJS;
javascriptGenerator.forBlock['procedures_defnoreturn'] = generateDefreturnJS;
javascriptGenerator.forBlock['procedures_callreturn'] = generateCallreturnJS;
javascriptGenerator.forBlock['procedures_callnoreturn'] = generateCallreturnJS;
