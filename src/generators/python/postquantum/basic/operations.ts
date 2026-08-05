import { pythonGenerator, Order } from 'blockly/python';
import type { Block } from 'blockly/core';
import { registerBytesConcat, registerBytesSlice } from '../../data/helpers';
import { registerSeedWithNonce } from '../helpers';

/** Concatenate two byte arrays. */
pythonGenerator.forBlock['pq_byte_concat'] = function (
  block: Block,
): [string, number] {
  const a = pythonGenerator.valueToCode(block, 'A', Order.ATOMIC) || 'b""';
  const b = pythonGenerator.valueToCode(block, 'B', Order.ATOMIC) || 'b""';

  const funcName = registerBytesConcat();
  return [funcName + '(' + a + ', ' + b + ')', Order.ATOMIC];
};

/** Slice bytes from [start, end) range. */
pythonGenerator.forBlock['pq_bytes_slice'] = function (
  block: Block,
): [string, number] {
  const input =
    pythonGenerator.valueToCode(block, 'INPUT', Order.ATOMIC) || 'b""';
  const start =
    pythonGenerator.valueToCode(block, 'START', Order.ATOMIC) || '0';
  const end = pythonGenerator.valueToCode(block, 'END', Order.ATOMIC) || 'None';

  const funcName = registerBytesSlice();
  return [
    funcName + '(' + input + ', ' + start + ', ' + end + ')',
    Order.ATOMIC,
  ];
};

/** Append nonce byte to seed for deterministic random number generation. */
pythonGenerator.forBlock['pq_seed_with_nonce'] = function (
  block: Block,
): [string, number] {
  const seed =
    pythonGenerator.valueToCode(block, 'SEED', Order.ATOMIC) || 'b""';
  const nonce =
    pythonGenerator.valueToCode(block, 'NONCE', Order.ATOMIC) || '0';

  const funcName = registerSeedWithNonce();
  return [funcName + '(' + seed + ', ' + nonce + ')', Order.ATOMIC];
};

/** 拒绝采样：X < BOUND 接受返回 X，否则 -1（内联，无需闭包） */
pythonGenerator.forBlock['pq_rej_sample'] = function (
  block: Block,
): [string, number] {
  const x = pythonGenerator.valueToCode(block, 'X', Order.ATOMIC) || '0';
  const bound = pythonGenerator.valueToCode(block, 'BOUND', Order.ATOMIC) || '0';
  return ['((' + x + ') if (' + x + ') < (' + bound + ') else -1)', Order.ATOMIC];
};
