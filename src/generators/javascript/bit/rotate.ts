import { javascriptGenerator, Order } from 'blockly/javascript';
import type { Block } from 'blockly/core';
import { requireVariableName } from '@/generators/assignment-target';

javascriptGenerator.forBlock['bit_rotate_left'] = function(block: Block): string {
  const input = javascriptGenerator.valueToCode(block, 'Input', Order.ATOMIC) || '0';
  const bits = block.getFieldValue('bit') || '0';
  const output = requireVariableName(javascriptGenerator.valueToCode(block, 'Output', Order.ATOMIC), 'javascript', block.type, 'Output');

  return `${output} = ((${input} << ${bits}) | (${input} >>> (32 - ${bits}))) >>> 0;\n`;
};

javascriptGenerator.forBlock['bit_rotate_right'] = function(block: Block): string {
  const input = javascriptGenerator.valueToCode(block, 'Input', Order.ATOMIC) || '0';
  const bits = block.getFieldValue('bit') || '0';
  const output = requireVariableName(javascriptGenerator.valueToCode(block, 'Output', Order.ATOMIC), 'javascript', block.type, 'Output');

  return `${output} = ((${input} >>> ${bits}) | (${input} << (32 - ${bits}))) >>> 0;\n`;
};

javascriptGenerator.forBlock['bit_rotate_left_op'] = function(block: Block): string {
  const input = javascriptGenerator.valueToCode(block, 'Input', Order.ATOMIC) || '0';
  const option = block.getFieldValue('option') || 'ROL32_XOR';
  const bits = block.getFieldValue('bit') || '0';
  const output = requireVariableName(javascriptGenerator.valueToCode(block, 'Output', Order.ATOMIC), 'javascript', block.type, 'Output');

  const operations: Record<string, string> = {
    'ROL32_XOR': '^',
    'ROL32_AND': '&',
    'ROL32_OR': '|',
    'ROL32_ADD': '+'
  };
  const operation = operations[option] || '^';

  return `${output} = (${input} ${operation} ((${input} << ${bits}) | (${input} >>> (32 - ${bits})))) >>> 0;\n`;
};

javascriptGenerator.forBlock['bit_rotate_right_op'] = function(block: Block): string {
  const input = javascriptGenerator.valueToCode(block, 'Input', Order.ATOMIC) || '0';
  const option = block.getFieldValue('option') || 'ROR32_XOR';
  const bits = block.getFieldValue('bit') || '0';
  const output = requireVariableName(javascriptGenerator.valueToCode(block, 'Output', Order.ATOMIC), 'javascript', block.type, 'Output');

  const operations: Record<string, string> = {
    'ROR32_XOR': '^',
    'ROR32_AND': '&',
    'ROR32_OR': '|',
    'ROR32_ADD': '+'
  };
  const operation = operations[option] || '^';

  return `${output} = (${input} ${operation} ((${input} >>> ${bits}) | (${input} << (32 - ${bits})))) >>> 0;\n`;
};
