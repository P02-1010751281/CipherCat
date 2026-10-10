import { javascriptGenerator, Order } from 'blockly/javascript';
import type { Block } from 'blockly/core';
import { requireVariableName } from '@/generators/assignment-target';

function registerConvertToInt(): string {
  return javascriptGenerator.provideFunction_('cryptoConvertToInt', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(value) {',
    '  var number, integer;',
    '  if (value instanceof ArrayBuffer) value = new Uint8Array(value);',
    '  if (value instanceof Uint8Array) {',
    '    integer = 0n;',
    '    for (var i = 0; i < value.length; i++) integer = (integer << 8n) | BigInt(value[i]);',
    '    if (integer > BigInt(Number.MAX_SAFE_INTEGER)) throw new RangeError("integer exceeds JavaScript safe range");',
    '    return Number(integer);',
    '  }',
    '  if (typeof value === "string") {',
    '    var hex = value.trim(), negative = hex.charAt(0) === "-";',
    '    if (negative || hex.charAt(0) === "+") hex = hex.slice(1);',
    '    hex = hex.replace(/^0x/i, "");',
    '    if (!/^[0-9a-f]+$/i.test(hex)) throw new TypeError("string must contain hexadecimal digits");',
    '    integer = BigInt("0x" + hex) * (negative ? -1n : 1n);',
    '    if (integer > BigInt(Number.MAX_SAFE_INTEGER) || integer < -BigInt(Number.MAX_SAFE_INTEGER)) throw new RangeError("integer exceeds JavaScript safe range");',
    '    return Number(integer);',
    '  }',
    '  if (typeof value === "number") {',
    '    if (!Number.isFinite(value)) throw new TypeError("value must be finite");',
    '    number = Math.trunc(value);',
    '  } else if (typeof value === "bigint") {',
    '    if (value > BigInt(Number.MAX_SAFE_INTEGER) || value < -BigInt(Number.MAX_SAFE_INTEGER)) throw new RangeError("integer exceeds JavaScript safe range");',
    '    return Number(value);',
    '  } else {',
    '    throw new TypeError("value must be bytes, a hexadecimal string, or a number");',
    '  }',
    '  if (!Number.isSafeInteger(number)) throw new RangeError("integer exceeds JavaScript safe range");',
    '  return number;',
    '}',
  ]);
}

javascriptGenerator.forBlock['data_convert_to_int'] = function(block: Block): string {
  const variable = requireVariableName(javascriptGenerator.valueToCode(block, 'VAR', Order.ATOMIC), 'javascript', block.type, 'VAR');
  const convert = registerConvertToInt();
  return `${variable} = ${convert}(${variable});\n`;
};

javascriptGenerator.forBlock['data_convert_bits_to_bytes'] = function(block: Block): string {
  const bytes = requireVariableName(javascriptGenerator.valueToCode(block, 'BYTES', Order.ATOMIC), 'javascript', block.type, 'BYTES');
  const bits = javascriptGenerator.valueToCode(block, 'BITS', Order.ATOMIC) || 'bits';
  const convert = javascriptGenerator.provideFunction_('cryptoBitsToBytes', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(bits) {',
    '  var value = String(bits);',
    '  if (!/^[01]*$/.test(value)) throw new TypeError("bit string may contain only 0 and 1");',
    '  var output = new Uint8Array(Math.ceil(value.length / 8));',
    '  for (var i = 0; i < output.length; i++) output[i] = parseInt(value.slice(i * 8, (i + 1) * 8).padStart(8, "0"), 2);',
    '  return output;',
    '}',
  ]);
  return `${bytes} = ${convert}(${bits});\n`;
};

javascriptGenerator.forBlock['data_convert_bytes_to_bits'] = function(block: Block): string {
  const bits = requireVariableName(javascriptGenerator.valueToCode(block, 'BITS', Order.ATOMIC), 'javascript', block.type, 'BITS');
  const bytes = javascriptGenerator.valueToCode(block, 'BYTES', Order.ATOMIC) || 'bytes';
  const convert = javascriptGenerator.provideFunction_('cryptoBytesToBits', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(value) {',
    '  var bytes = value instanceof ArrayBuffer ? new Uint8Array(value) : value;',
    '  if (!(bytes instanceof Uint8Array) && !Array.isArray(bytes)) throw new TypeError("value must be a byte sequence");',
    '  return Array.from(bytes, function(byte) {',
    '    if (!Number.isInteger(byte) || byte < 0 || byte > 255) throw new RangeError("byte must be an integer from 0 to 255");',
    '    return byte.toString(2).padStart(8, "0");',
    '  }).join("");',
    '}',
  ]);
  return `${bits} = ${convert}(${bytes});\n`;
};
