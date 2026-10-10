import { pythonGenerator, Order } from 'blockly/python';
import type { Block } from 'blockly/core';
import { requireVariableName } from '@/generators/assignment-target';
import { uint32Expression } from './uint32';

pythonGenerator.forBlock['bit_rotate_left'] = function(block: Block): string {
  const input = pythonGenerator.valueToCode(block, 'Input', Order.ATOMIC) || '0';
  const bits = block.getFieldValue('bit') || '0';
  const output = requireVariableName(pythonGenerator.valueToCode(block, 'Output', Order.ATOMIC), 'python', block.type, 'Output');
  const input32 = uint32Expression(input);

  return `${output} = ((${input32} << ${bits}) | (${input32} >> (32 - ${bits}))) & 0xFFFFFFFF\n`;
};

pythonGenerator.forBlock['bit_rotate_right'] = function(block: Block): string {
  const input = pythonGenerator.valueToCode(block, 'Input', Order.ATOMIC) || '0';
  const bits = block.getFieldValue('bit') || '0';
  const output = requireVariableName(pythonGenerator.valueToCode(block, 'Output', Order.ATOMIC), 'python', block.type, 'Output');
  const input32 = uint32Expression(input);

  return `${output} = ((${input32} >> ${bits}) | (${input32} << (32 - ${bits}))) & 0xFFFFFFFF\n`;
};

pythonGenerator.forBlock['bit_rotate_left_op'] = function(block: Block): string {
  const input = pythonGenerator.valueToCode(block, 'Input', Order.ATOMIC) || '0';
  const option = block.getFieldValue('option') || 'ROL32_XOR';
  const bits = block.getFieldValue('bit') || '0';
  const output = requireVariableName(pythonGenerator.valueToCode(block, 'Output', Order.ATOMIC), 'python', block.type, 'Output');
  const input32 = uint32Expression(input);

  let operation = '';
  if (option === 'ROL32_XOR') {
    operation = '^';
  } else if (option === 'ROL32_AND') {
    operation = '&';
  } else if (option === 'ROL32_OR') {
    operation = '|';
  } else if (option === 'ROL32_ADD') {
    operation = '+';
  }

  return `${output} = (${input32} ${operation} ((${input32} << ${bits}) | (${input32} >> (32 - ${bits})))) & 0xFFFFFFFF\n`;
};

pythonGenerator.forBlock['bit_rotate_right_op'] = function(block: Block): string {
  const input = pythonGenerator.valueToCode(block, 'Input', Order.ATOMIC) || '0';
  const option = block.getFieldValue('option') || 'ROR32_XOR';
  const bits = block.getFieldValue('bit') || '0';
  const output = requireVariableName(pythonGenerator.valueToCode(block, 'Output', Order.ATOMIC), 'python', block.type, 'Output');
  const input32 = uint32Expression(input);

  let operation = '';
  if (option === 'ROR32_XOR') {
    operation = '^';
  } else if (option === 'ROR32_AND') {
    operation = '&';
  } else if (option === 'ROR32_OR') {
    operation = '|';
  } else if (option === 'ROR32_ADD') {
    operation = '+';
  }

  return `${output} = (${input32} ${operation} ((${input32} >> ${bits}) | (${input32} << (32 - ${bits})))) & 0xFFFFFFFF\n`;
};
