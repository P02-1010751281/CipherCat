import { pythonGenerator } from 'blockly/python';

export function registerBytesConcat(): string {
  return pythonGenerator.provideFunction_('bytes_concat', [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(a, b):',
    '    if isinstance(a, str):',
    '        a = a.encode("utf-8")',
    '    if isinstance(b, str):',
    '        b = b.encode("utf-8")',
    '    return bytes(a) + bytes(b)',
  ]);
}

export function registerBytesSlice(): string {
  return pythonGenerator.provideFunction_('bytes_slice', [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(data, start, end):',
    '    if isinstance(data, str):',
    '        data = data.encode("utf-8")',
    '    return bytes(data)[start:end]',
  ]);
}