/**
 * 密码学函数封装块 — JavaScript 代码生成器
 *
 * 处理 crypto_return 和 crypto_func_def 的 JavaScript 代码生成。
 * 参照 Mixly 的 procedures.js 生成器模式，适配 CipherCat 的密码学场景。
 */
import { javascriptGenerator, Order } from 'blockly/javascript';
import type { Block } from 'blockly/core';

// ─────────────────────────────────────────────────────────
// crypto_return — 返回语句块
// ─────────────────────────────────────────────────────────

javascriptGenerator.forBlock['crypto_return'] = function (
  block: Block,
): string {
  const value =
    javascriptGenerator.valueToCode(block, 'VALUE', Order.NONE) || 'undefined';
  return 'return ' + value + ';\n';
};

// ─────────────────────────────────────────────────────────
// crypto_func_def — 密码学函数模板
// ─────────────────────────────────────────────────────────

javascriptGenerator.forBlock['crypto_func_def'] = function (
  block: Block,
): string {
  const funcName = block.getFieldValue('FUNC_NAME') || 'myCipher';
  const count = parseInt(block.getFieldValue('PARAM_COUNT') as string || '1');

  const typeComment: Record<string, string> = {
    bytes: 'Uint8Array', int: 'number', int_list: 'number[]',
    poly: 'number[]', seed: 'Uint8Array', key: 'Uint8Array', message: 'Uint8Array',
  };

  const params: string[] = [];
  for (let i = 0; i < count; i++) {
    const pn = (block.getFieldValue('PARAM_NAME_' + i) as string) || 'arg' + i;
    const pt = (block.getFieldValue('PARAM_TYPE_' + i) as string) || 'bytes';
    const jsType = typeComment[pt] || pt;
    params.push(pn);
  }

  const body =
    javascriptGenerator.statementToCode(block, 'BODY') ||
    '  // TODO: 实现 ' + funcName + ' 算法\n';
  const returnValue =
    javascriptGenerator.valueToCode(block, 'RETURN', Order.NONE) ||
    params[0];

  const jsdocParams = params.map((p, i) => {
    const pt = (block.getFieldValue('PARAM_TYPE_' + i) as string) || 'bytes';
    return ' * @param {' + (typeComment[pt] || pt) + '} ' + p;
  }).join('\n');

  const firstType = typeComment[(block.getFieldValue('PARAM_TYPE_0') as string) || 'bytes'] || 'Uint8Array';

  const code = [
    '/**',
    ' * 密码学函数: ' + funcName,
    jsdocParams,
    ' * @returns {' + firstType + '} 算法输出',
    ' */',
    'function ' + funcName + '(' + params.join(', ') + ') {',
    body,
    '  return ' + returnValue + ';',
    '}',
    '',
  ].join('\n');

  return code;
};

// ─────────────────────────────────────────────────────────
// 预置模板块 — 复用 crypto_func_def 生成逻辑
// ─────────────────────────────────────────────────────────

function _generateCryptoFuncJS(block: Block): string {
  return (javascriptGenerator.forBlock['crypto_func_def'] as (b: Block) => string)(block);
}

javascriptGenerator.forBlock['crypto_encrypt_func'] = _generateCryptoFuncJS;
javascriptGenerator.forBlock['crypto_decrypt_func'] = _generateCryptoFuncJS;
javascriptGenerator.forBlock['crypto_hash_func'] = _generateCryptoFuncJS;
