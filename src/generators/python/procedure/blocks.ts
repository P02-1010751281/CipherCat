/**
 * 密码学函数封装块 — Python 代码生成器
 */
import { pythonGenerator, Order } from 'blockly/python';
import type { Block } from 'blockly/core';
import { TEMPLATE_TYPES } from '@/blocks/procedure/blocks';

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

/** Generate Python for crypto_defreturn. */
export function generateDefreturnPy(block: Block): string {
  const funcName = (block.getFieldValue('NAME') as string) || 'unnamed';
  const mutation = // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (block as any).mutationToDom?.() as Element | null;
  const argNodes = mutation ? Array.from(mutation.getElementsByTagName('arg')) : [];
  const params: string[] = [];
  argNodes.forEach((arg, i) => {
    const name = arg.getAttribute('name') || 'arg' + i;
    const type = arg.getAttribute('type') || 'bytes';
    const pyType = TYPE_MAP_PY[type] || type;
    params.push(name + ': ' + pyType);
  });
  // statementToCode 已按 generator.INDENT（Blockly 12 = 2 空格）缩进；
  // 函数体需 4 空格，故再补一层 INDENT（不能硬编码 '    '，否则 2+4=6 缩进错乱）
  const body = (block.getInput('STACK') && block.getInputTargetBlock('STACK')
    ? pythonGenerator.prefixLines(pythonGenerator.statementToCode(block, 'STACK'), pythonGenerator.INDENT)
    : '') ||
    '    # TODO: implement ' + funcName + ' algorithm\n';
  const returnValue =
    pythonGenerator.valueToCode(block, 'RETURN', Order.NONE) || (params[0]?.split(':')[0] || 'None');
  const firstType = argNodes.length ? (TYPE_MAP_PY[argNodes[0].getAttribute('type') || 'bytes'] || 'bytes') : 'bytes';
  const bodyIndented = body;
  return [
    '',
    'def ' + funcName + '(' + params.join(', ') + ') -> ' + firstType + ':',
    '    """',
    '    Crypto function: ' + funcName,
    '    """',
    bodyIndented,
    '    return ' + returnValue,
    '',
  ].join('\n');
}

/** Generate Python for crypto_callreturn. */
function generateCallreturnPy(block: Block): string {
  const funcName = (block.getFieldValue('NAME') as string) || 'unnamed';
  const mutation = // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (block as any).mutationToDom?.() as Element | null;
  const argNodes = mutation ? Array.from(mutation.getElementsByTagName('arg')) : [];
  const args = argNodes.map((arg, i) =>
    pythonGenerator.valueToCode(block, 'ARG' + i, Order.NONE) || 'None');
  return funcName + '(' + args.join(', ') + ')';
}

/** Generate Python for all template blocks. */
export function generateTemplatePy(block: Block): string {
  const funcName = (block.getFieldValue('FUNC_NAME') as string) || 'my_cipher';
  const paramName = (block.getFieldValue('PARAM_NAME') as string) || 'arg';
  const paramType = (block.getFieldValue('PARAM_TYPE') as string) || 'bytes';
  const body = pythonGenerator.statementToCode(block, 'BODY') ||
    '# TODO: implement ' + funcName + ' algorithm\n';
  const returnValue =
    pythonGenerator.valueToCode(block, 'RETURN', Order.NONE) || paramName;

  const typeHint = TYPE_MAP_PY[paramType] || paramType;
  const bodyIndented = pythonGenerator.prefixLines(body, '    ');

  return [
    '',
    'def ' + funcName + '(' + paramName + ': ' + typeHint + ') -> ' + typeHint + ':',
    '    """',
    '    Crypto function: ' + funcName,
    '    """',
    bodyIndented,
    '    return ' + returnValue,
    '',
  ].join('\n');
}

// Template block types（单一数据源：派生自 blocks 注册表）
for (const t of TEMPLATE_TYPES) {
  pythonGenerator.forBlock[t] = generateTemplatePy;
}
// 覆盖原生 procedures 生成器（类型增强）
pythonGenerator.forBlock['procedures_defreturn'] = generateDefreturnPy;
pythonGenerator.forBlock['procedures_defnoreturn'] = generateDefreturnPy;
pythonGenerator.forBlock['procedures_callreturn'] = generateCallreturnPy;
pythonGenerator.forBlock['procedures_callnoreturn'] = generateCallreturnPy;
