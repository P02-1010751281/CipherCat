import { pythonGenerator, Order } from 'blockly/python';
import type { Block } from 'blockly/core';
import { requireVariableName } from '@/generators/assignment-target';

pythonGenerator.forBlock['arr_partition_to_array'] = function(block: Block): string {
  const source = pythonGenerator.valueToCode(block, 'SRC', Order.ATOMIC) || '[]';
  const count = pythonGenerator.valueToCode(block, 'COUNT', Order.ATOMIC) || '0';
  const target = requireVariableName(
    pythonGenerator.valueToCode(block, 'TARGET', Order.ATOMIC),
    'python',
    block.type,
    'TARGET',
  );
  const mode = block.getFieldValue('MODE') || 'BYTES';
  if (mode !== 'BYTES' && mode !== 'WORDS32') throw new Error(`arr_partition_to_array: invalid mode ${mode}`);

  const partition = pythonGenerator.provideFunction_('crypto_partition_array', [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(source, count, mode):',
    '    if mode not in ("BYTES", "WORDS32"): raise ValueError("invalid partition mode")',
    '    if isinstance(source, (int, float)) and not isinstance(source, bool):',
    '        if not 0 <= source <= 0xFFFFFFFF or int(source) != source: raise ValueError("source number must be an unsigned 32-bit integer")',
    '        number = int(source)',
    '        if mode == "WORDS32":',
    '            data = number.to_bytes(4, "big")',
    '        else:',
    '            data = number.to_bytes(max(1, (number.bit_length() + 7) // 8), "big")',
    '    elif isinstance(source, (bytes, bytearray, memoryview)):',
    '        data = bytes(source)',
    '    elif isinstance(source, list) and all(type(value) in (int, float) and 0 <= value <= 255 and int(value) == value for value in source):',
    '        data = bytes(int(value) for value in source)',
    '    else:',
    '        raise TypeError("source must be bytes, a byte list, or an unsigned 32-bit integer")',
    '    if isinstance(count, bool) or not isinstance(count, (int, float)): raise TypeError("partition count must be a numeric value")',
    '    count_value = float(count)',
    '    if not count_value.is_integer() or count_value <= 0: raise ValueError("partition count must be a positive integer")',
    '    parts = int(count_value)',
    '    if parts > len(data): raise ValueError("partition count must not exceed the data length")',
    '    if len(data) % parts: raise ValueError("data length must be divisible by partition count")',
    '    size = len(data) // parts',
    '    if mode == "WORDS32" and size != 4: raise ValueError("each 32-bit word must contain exactly four bytes")',
    '    result = []',
    '    for index in range(parts):',
    '        chunk = data[index * size:(index + 1) * size]',
    '        result.append(int.from_bytes(chunk, "big") if mode == "WORDS32" else chunk)',
    '    return result',
    '',
  ]);

  return `${target} = ${partition}(${source}, ${count}, ${JSON.stringify(mode)})\n`;
};
