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
  const paramName = block.getFieldValue('PARAM_NAME') || 'seed';
  const paramType = block.getFieldValue('PARAM_TYPE') || 'bytes';
  const body =
    pythonGenerator.statementToCode(block, 'BODY') ||
    '    # TODO: 实现 ' + funcName + ' 算法\n';
  const returnValue =
    pythonGenerator.valueToCode(block, 'RETURN', Order.NONE) ||
    paramName;

  // Python 类型提示映射
  const pyTypeHint: Record<string, string> = {
    bytes: 'bytes',
    int: 'int',
    int_list: 'list[int]',
    poly: 'list[int]',
    seed: 'bytes',
    key: 'bytes',
    message: 'bytes',
  };

  const typeHint = pyTypeHint[paramType] || paramType;
  const bodyIndented = pythonGenerator.prefixLines(body, '    ');

  const code = [
    '',
    'def ' + funcName + '(' + paramName + ': ' + typeHint + ') -> ' + typeHint + ':',
    '    """',
    '    密码学函数: ' + funcName,
    '    参数类型: ' + paramType,
    '    """',
    '    global data',
    '    data = ' + paramName,
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
