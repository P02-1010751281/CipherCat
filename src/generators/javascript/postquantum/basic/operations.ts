import { javascriptGenerator, Order } from 'blockly/javascript';
import type { Block } from 'blockly/core';
import { registerBytesConcat, registerBytesSlice } from '../../data/helpers';
import { registerSeedWithNonce } from '../helpers';

/**
 * Concatenate two byte arrays.
 */
javascriptGenerator.forBlock['pq_byte_concat'] = function(block: Block): [string, number] {
  const a = javascriptGenerator.valueToCode(block, 'A', Order.ATOMIC) || '[]';
  const b = javascriptGenerator.valueToCode(block, 'B', Order.ATOMIC) || '[]';

  const funcName = registerBytesConcat();
  return [`${funcName}(${a}, ${b})`, Order.ATOMIC];
};

/**
 * Slice bytes from [start, end) range.
 */
javascriptGenerator.forBlock['pq_bytes_slice'] = function(block: Block): [string, number] {
  const input = javascriptGenerator.valueToCode(block, 'INPUT', Order.ATOMIC) || '[]';
  const start = javascriptGenerator.valueToCode(block, 'START', Order.ATOMIC) || '0';
  const end = javascriptGenerator.valueToCode(block, 'END', Order.ATOMIC) || 'undefined';

  const funcName = registerBytesSlice();
  return [`${funcName}(${input}, ${start}, ${end})`, Order.ATOMIC];
};

/**
 * Append nonce byte to seed for deterministic random number generation.
 */
javascriptGenerator.forBlock['pq_seed_with_nonce'] = function(block: Block): [string, number] {
  const seed = javascriptGenerator.valueToCode(block, 'SEED', Order.ATOMIC) || '[]';
  const nonce = javascriptGenerator.valueToCode(block, 'NONCE', Order.ATOMIC) || '0';

  const funcName = registerSeedWithNonce();
  return [`${funcName}(${seed}, ${nonce})`, Order.ATOMIC];
};
