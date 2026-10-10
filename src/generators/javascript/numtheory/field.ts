import { javascriptGenerator, Order } from 'blockly/javascript';
import type { Block } from 'blockly/core';

javascriptGenerator.forBlock['nt_field_add'] = function(block: Block): [string, number] {
  const a = javascriptGenerator.valueToCode(block, 'A', Order.ATOMIC) || '0';
  const b = javascriptGenerator.valueToCode(block, 'B', Order.ATOMIC) || '0';
  const p = javascriptGenerator.valueToCode(block, 'P', Order.ATOMIC) || 'p';
  const op = block.getFieldValue('OP') || 'ADD';

  const fieldOperation = javascriptGenerator.provideFunction_('fieldOperation', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(a, b, p, operation) {',
    '  if (![a, b, p].every(Number.isSafeInteger) || p <= 0) {',
    '    throw new RangeError("field operands must be safe integers and modulus must be positive");',
    '  }',
    '  const left = BigInt(a), right = BigInt(b), modulus = BigInt(p);',
    '  const value = operation === "MUL" ? left * right : operation === "SUB" ? left - right : left + right;',
    '  return Number((value % modulus + modulus) % modulus);',
    '}',
  ]);

  return [`${fieldOperation}(${a}, ${b}, ${p}, ${JSON.stringify(op)})`, Order.ATOMIC];
};
