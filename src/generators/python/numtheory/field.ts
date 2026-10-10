import { pythonGenerator, Order } from 'blockly/python';
import type { Block } from 'blockly/core';

pythonGenerator.forBlock['nt_field_add'] = function(block: Block): [string, number] {
  const a = pythonGenerator.valueToCode(block, 'A', Order.ATOMIC) || '0';
  const b = pythonGenerator.valueToCode(block, 'B', Order.ATOMIC) || '0';
  const p = pythonGenerator.valueToCode(block, 'P', Order.ATOMIC) || 'p';
  const op = block.getFieldValue('OP') || 'ADD';

  const fieldOperation = pythonGenerator.provideFunction_('field_operation', [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(a, b, p, operation):',
    '    values = (a, b, p)',
    '    if any(isinstance(value, bool) or not isinstance(value, (int, float)) or not -9007199254740991 <= value <= 9007199254740991 or int(value) != value for value in values):',
    '        raise ValueError("field operands must be safe integers and modulus must be positive")',
    '    a, b, p = (int(value) for value in values)',
    '    if p <= 0:',
    '        raise ValueError("field operands must be safe integers and modulus must be positive")',
    '    if operation == "MUL":',
    '        value = a * b',
    '    elif operation == "SUB":',
    '        value = a - b',
    '    else:',
    '        value = a + b',
    '    return value % p',
  ]);

  return [`${fieldOperation}(${a}, ${b}, ${p}, ${JSON.stringify(op)})`, Order.ATOMIC];
};
