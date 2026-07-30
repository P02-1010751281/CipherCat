/**
 * 密码学函数封装块 — Python 代码生成器
 *
 * 处理 crypto_return 和 crypto_func_def 的 Python 代码生成。
 * 参照 Mixly 的 procedures.js 生成器模式，适配 CipherCat 的密码学场景。
 */
import { pythonGenerator, Order } from 'blockly/python';
import type { Block } from 'blockly/core';

// ─────────────────────────────────────────────────────────
// crypto_return — 返回语句块
// ─────────────────────────────────────────────────────────

pythonGenerator.forBlock['crypto_return'] = function (
  block: Block,
): string {
  const value =
    pythonGenerator.valueToCode(block, 'VALUE', Order.NONE) || 'None';
  return 'return ' + value + '\n';
};

// ─────────────────────────────────────────────────────────
// crypto_func_def — 密码学函数模板
// ─────────────────────────────────────────────────────────

pythonGenerator.forBlock['crypto_func_def'] = function (
  block: Block,
): string {
  const funcName = block.getFieldValue('FUNC_NAME') || 'my_cipher';
  const count = parseInt(block.getFieldValue('PARAM_COUNT') as string || '1');

  const pyTypeHint: Record<string, string> = {
    bytes: 'bytes', int: 'int', int_list: 'list[int]',
    poly: 'list[int]', seed: 'bytes', key: 'bytes', message: 'bytes',
  };

  const params: string[] = [];
  for (let i = 0; i < count; i++) {
    const pn = (block.getFieldValue('PARAM_NAME_' + i) as string) || 'arg' + i;
    const pt = (block.getFieldValue('PARAM_TYPE_' + i) as string) || 'bytes';
    params.push(pn + ': ' + (pyTypeHint[pt] || pt));
  }

  const body =
    pythonGenerator.statementToCode(block, 'BODY') ||
    '    # TODO: 实现 ' + funcName + ' 算法\n';
  const returnValue =
    pythonGenerator.valueToCode(block, 'RETURN', Order.NONE) ||
    params[0].split(':')[0];

  const firstType = pyTypeHint[(block.getFieldValue('PARAM_TYPE_0') as string) || 'bytes'] || 'bytes';
  const bodyIndented = pythonGenerator.prefixLines(body, '    ');

  const code = [
    '',
    'def ' + funcName + '(' + params.join(', ') + ') -> ' + firstType + ':',
    '    """',
    '    密码学函数: ' + funcName,
    '    """',
    '    global data',
    bodyIndented,
    '    return ' + returnValue,
    '',
  ].join('\n');

  return code;
};

// ─────────────────────────────────────────────────────────
// 预置模板块 — 复用 crypto_func_def 生成逻辑
// ─────────────────────────────────────────────────────────

function _generateCryptoFuncPy(block: Block): string {
  return (pythonGenerator.forBlock['crypto_func_def'] as (b: Block) => string)(block);
}

pythonGenerator.forBlock['crypto_encrypt_func'] = _generateCryptoFuncPy;
pythonGenerator.forBlock['crypto_decrypt_func'] = _generateCryptoFuncPy;
pythonGenerator.forBlock['crypto_hash_func'] = _generateCryptoFuncPy;
