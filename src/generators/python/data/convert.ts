import { pythonGenerator, Order } from 'blockly/python';
import type { Block } from 'blockly/core';
import { requireVariableName } from '@/generators/assignment-target';

function registerConvertToInt(): string {
  return pythonGenerator.provideFunction_('crypto_convert_to_int', [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(value):',
    '    if isinstance(value, (bytes, bytearray)):',
    '        number = int.from_bytes(value, "big")',
    '    elif isinstance(value, str):',
    '        text = value.strip()',
    '        negative = text.startswith("-")',
    '        if text[:1] in ("-", "+"): text = text[1:]',
    '        if text[:2].lower() == "0x": text = text[2:]',
    '        if not text or any(c not in "0123456789abcdefABCDEF" for c in text):',
    '            raise ValueError("string must contain hexadecimal digits")',
    '        number = int(text, 16) * (-1 if negative else 1)',
    '    elif isinstance(value, bool):',
    '        raise TypeError("boolean is not an integer input")',
    '    elif isinstance(value, (int, float)):',
    '        number = int(value)',
    '    else:',
    '        raise TypeError("value must be bytes, a hexadecimal string, or a number")',
    '    if abs(number) > 9007199254740991:',
    '        raise OverflowError("integer exceeds JavaScript safe range")',
    '    return number',
    '',
  ]);
}

pythonGenerator.forBlock['data_convert_to_int'] = function(block: Block): string {
  const variable = requireVariableName(pythonGenerator.valueToCode(block, 'VAR', Order.ATOMIC), 'python', block.type, 'VAR');
  const convert = registerConvertToInt();
  return `${variable} = ${convert}(${variable})\n`;
};

pythonGenerator.forBlock['data_convert_bits_to_bytes'] = function(block: Block): string {
  const bytes = requireVariableName(pythonGenerator.valueToCode(block, 'BYTES', Order.ATOMIC), 'python', block.type, 'BYTES');
  const bits = pythonGenerator.valueToCode(block, 'BITS', Order.ATOMIC) || 'bits';
  const convert = pythonGenerator.provideFunction_('crypto_bits_to_bytes', [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(bits):',
    '    value = str(bits)',
    '    if any(bit not in "01" for bit in value):',
    '        raise ValueError("bit string may contain only 0 and 1")',
    '    return bytes(int(value[i:i + 8].rjust(8, "0"), 2) for i in range(0, len(value), 8))',
    '',
  ]);
  return `${bytes} = ${convert}(${bits})\n`;
};

pythonGenerator.forBlock['data_convert_bytes_to_bits'] = function(block: Block): string {
  const bits = requireVariableName(pythonGenerator.valueToCode(block, 'BITS', Order.ATOMIC), 'python', block.type, 'BITS');
  const bytes = pythonGenerator.valueToCode(block, 'BYTES', Order.ATOMIC) || 'bytes';
  const convert = pythonGenerator.provideFunction_('crypto_bytes_to_bits', [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(value):',
    '    if not isinstance(value, (bytes, bytearray, list)): raise TypeError("value must be a byte sequence")',
    '    if any(isinstance(byte, bool) or not isinstance(byte, (int, float)) or not 0 <= byte <= 255 or (isinstance(byte, float) and not byte.is_integer()) for byte in value):',
    '        raise ValueError("each byte must be an integer from 0 to 255")',
    '    return "".join(format(int(byte), "08b") for byte in value)',
    '',
  ]);
  return `${bits} = ${convert}(${bytes})\n`;
};
