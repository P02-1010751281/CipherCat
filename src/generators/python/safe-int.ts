import { pythonGenerator } from 'blockly/python';

/**
 * JS 安全整数上限。生成的 Python 必须用同一上界，才能与 JavaScript 端行为一致。
 * 这里保持为字符串，便于直接内联进生成代码。
 */
export const PY_MAX_SAFE_INTEGER = '9007199254740991';

/**
 * 注册共用的安全整数校验函数，返回函数名。
 *
 * 生成的 Python 会逐个检查集合里的每个元素：必须是 int/float（排除 bool）、
 * 绝对值不超过 JS 安全整数、且浮点数必须是整数值；否则抛 TypeError。
 */
export function registerSafeIntegers(): string {
  return pythonGenerator.provideFunction_('require_safe_integers', [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(message, *collections):',
    `    if any(type(value) not in (int, float) or abs(value) > ${PY_MAX_SAFE_INTEGER} or (type(value) is float and not value.is_integer()) for collection in collections for value in collection):`,
    '        raise TypeError(message)',
  ]);
}
