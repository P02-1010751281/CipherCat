import { javascriptGenerator, Order } from 'blockly/javascript';
import type { Block } from 'blockly/core';
import { requireVariableName } from '@/generators/assignment-target';

javascriptGenerator.forBlock['arr_partition_to_array'] = function(block: Block): string {
  const source = javascriptGenerator.valueToCode(block, 'SRC', Order.ATOMIC) || '[]';
  const count = javascriptGenerator.valueToCode(block, 'COUNT', Order.ATOMIC) || '0';
  const target = requireVariableName(
    javascriptGenerator.valueToCode(block, 'TARGET', Order.ATOMIC),
    'javascript',
    block.type,
    'TARGET',
  );
  const mode = block.getFieldValue('MODE') || 'BYTES';
  if (mode !== 'BYTES' && mode !== 'WORDS32') throw new Error(`arr_partition_to_array: invalid mode ${mode}`);

  const partition = javascriptGenerator.provideFunction_('cryptoPartitionArray', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(source, count, mode) {',
    '  var data, number, encoded, byte;',
    '  if (mode !== "BYTES" && mode !== "WORDS32") throw new TypeError("invalid partition mode");',
    '  if (typeof source === "number") {',
    '    if (!Number.isInteger(source) || source < 0 || source > 0xFFFFFFFF) throw new RangeError("source number must be an unsigned 32-bit integer");',
    '    number = source >>> 0;',
    '    if (mode === "WORDS32") {',
    '      data = new Uint8Array([number >>> 24, (number >>> 16) & 255, (number >>> 8) & 255, number & 255]);',
    '    } else {',
    '      encoded = [];',
    '      do { byte = number & 255; encoded.unshift(byte); number = Math.floor(number / 256); } while (number > 0);',
    '      data = new Uint8Array(encoded);',
    '    }',
    '  } else if (source instanceof Uint8Array) {',
    '    data = source;',
    '  } else if (source instanceof ArrayBuffer) {',
    '    data = new Uint8Array(source);',
    '  } else if (Array.isArray(source)) {',
    '    for (var byteIndex = 0; byteIndex < source.length; byteIndex++) {',
    '      if (!Object.prototype.hasOwnProperty.call(source, byteIndex) || !Number.isInteger(source[byteIndex]) || source[byteIndex] < 0 || source[byteIndex] > 255) throw new TypeError("source array must contain bytes");',
    '    }',
    '    data = new Uint8Array(source);',
    '  } else {',
    '    throw new TypeError("source must be bytes, a byte array, or an unsigned 32-bit integer");',
    '  }',
    '  if (typeof count !== "number" && typeof count !== "bigint") throw new TypeError("partition count must be a numeric value");',
    '  var parts = Number(count);',
    '  if (!Number.isSafeInteger(parts) || parts <= 0 || parts > data.length) throw new RangeError("partition count must be a positive integer not exceeding the data length");',
    '  if (data.length % parts !== 0) throw new RangeError("data length must be divisible by partition count");',
    '  var size = data.length / parts;',
    '  if (mode === "WORDS32" && size !== 4) throw new RangeError("each 32-bit word must contain exactly four bytes");',
    '  var result = [];',
    '  for (var i = 0; i < parts; i++) {',
    '    var offset = i * size;',
    '    result.push(mode === "BYTES" ? data.slice(offset, offset + size) : (data[offset] * 0x1000000 + data[offset + 1] * 0x10000 + data[offset + 2] * 256 + data[offset + 3]) >>> 0);',
    '  }',
    '  return result;',
    '}',
  ]);

  return `${target} = ${partition}(${source}, ${count}, ${JSON.stringify(mode)});\n`;
};
