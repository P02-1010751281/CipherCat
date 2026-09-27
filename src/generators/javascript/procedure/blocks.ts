/**
 * 密码学函数封装块 — JavaScript 代码生成器
 */
import { javascriptGenerator, Order } from 'blockly/javascript';
import type { Block } from 'blockly/core';
import { TYPE_MAP } from '@/constants/block-types';
import { TEMPLATE_TYPES } from '@/blocks/procedure/blocks';

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
  const hasReturn = block.type === 'procedures_defreturn';
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
  const stackBody = (block.getInput('STACK') && block.getInputTargetBlock('STACK')
    ? javascriptGenerator.statementToCode(block, 'STACK')
    : '');
  const returnValue =
    (hasReturn && block.getInput('RETURN')
      ? javascriptGenerator.valueToCode(block, 'RETURN', Order.NONE)
      : '');
  const returnTarget = hasReturn && returnValue ? block.getInputTargetBlock('RETURN') : null;
  const returnChecks = returnTarget?.outputConnection?.getCheck();
  const returnType = returnChecks?.length === 1 ? TYPE_MAP[returnChecks[0]]?.javascript : undefined;
  const body = stackBody || (returnValue
    ? ''
    : '  // TODO: implement ' + funcName + ' algorithm\n');
  const lines = [
    '/**',
    ' * Crypto function: ' + funcName,
    jsdoc.join('\n'),
    hasReturn
      ? ' * @returns {' + (returnValue ? (returnType || '*') : 'undefined') + '} 算法输出'
      : ' * @returns {void} 算法输出',
    ' */',
    'function ' + funcName + '(' + params.join(', ') + ') {',
    body,
  ];
  if (hasReturn) lines.push('  return ' + (returnValue || 'undefined') + ';');
  lines.push('}', '');
  return lines.join('\n');
}

/** Generate JS for crypto_callreturn. */
function generateCallreturnJS(block: Block): string | [string, Order] {
  const funcName = (block.getFieldValue('NAME') as string) || 'unnamed';
  const mutation = // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (block as any).mutationToDom?.() as Element | null;
  const argNodes = mutation ? Array.from(mutation.getElementsByTagName('arg')) : [];
  const args = argNodes.map((arg, i) =>
    javascriptGenerator.valueToCode(block, 'ARG' + i, Order.NONE) || 'undefined');
  const call = funcName + '(' + args.join(', ') + ')';
  return block.type === 'procedures_callreturn'
    ? [call, Order.FUNCTION_CALL]
    : call + ';\n';
}

/** Generate JS for all template blocks. */
export function generateTemplateJS(block: Block): string {
  const funcName = (block.getFieldValue('FUNC_NAME') as string) || 'myCipher';
  const body = javascriptGenerator.statementToCode(block, 'BODY') ||
    '  // TODO: implement ' + funcName + ' algorithm\n';
  const returnValue = javascriptGenerator.valueToCode(block, 'RETURN', Order.NONE) ||
    ((block.getFieldValue('PARAM_NAME') as string) || 'arg');

  // 多参数模板：探测 PARAM_NAME_i（PARAM_NAME_0 存在即多参数，如 ML-KEM-Encaps 的 ek/m）
  if (block.getField('PARAM_NAME_0') !== null) {
    const params: string[] = [];
    const docs: string[] = [];
    for (let i = 0; ; i++) {
      const n = block.getFieldValue('PARAM_NAME_' + i);
      if (n === null || n === undefined) break;
      const t = (block.getFieldValue('PARAM_TYPE_' + i) as string) || 'bytes';
      params.push(n as string);
      docs.push(' * @param {' + (TYPE_MAP_JS[t] || t) + '} ' + n + ' — ' + t + ' 类型参数');
    }
    const retType = (block.getFieldValue('PARAM_TYPE_0') as string) || 'bytes';
    return [
      '/**',
      ' * Crypto function: ' + funcName,
      ...docs,
      ' * @returns {' + (TYPE_MAP_JS[retType] || retType) + '} 算法输出',
      ' */',
      'function ' + funcName + '(' + params.join(', ') + ') {',
      body,
      '  return ' + returnValue + ';',
      '}',
      '',
    ].join('\n');
  }

  const paramName = (block.getFieldValue('PARAM_NAME') as string) || 'arg';
  const paramType = (block.getFieldValue('PARAM_TYPE') as string) || 'bytes';
  const jsType = TYPE_MAP_JS[paramType] || paramType;
  return [
    '/**',
    ' * Crypto function: ' + funcName,
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

// Template block types（单一数据源：派生自 blocks 注册表）
for (const t of TEMPLATE_TYPES) {
  javascriptGenerator.forBlock[t] = generateTemplateJS;
}
// 覆盖原生 procedures 生成器（类型增强）
javascriptGenerator.forBlock['procedures_defreturn'] = generateDefreturnJS;
javascriptGenerator.forBlock['procedures_defnoreturn'] = generateDefreturnJS;
javascriptGenerator.forBlock['procedures_callreturn'] = generateCallreturnJS;
javascriptGenerator.forBlock['procedures_callnoreturn'] = generateCallreturnJS;
