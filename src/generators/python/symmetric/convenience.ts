/**
 * M2 对称密码便利层 + 模式块 — Python 生成器
 * (当前占位实现，完整密码逻辑待 M3 完善)
 */
import { pythonGenerator, Order } from 'blockly/python';
import type { Block } from 'blockly/core';

pythonGenerator.forBlock['aes_round'] = function(block: Block): [string, number] {
  const s = pythonGenerator.valueToCode(block, 'STATE', Order.ATOMIC) || '[]';
  const rk = pythonGenerator.valueToCode(block, 'ROUND_KEY', Order.ATOMIC) || '[]';
  return ['aesRound(' + s + ', ' + rk + ')', Order.ATOMIC];
};
pythonGenerator.forBlock['aes_last_round'] = function(block: Block): [string, number] {
  const s = pythonGenerator.valueToCode(block, 'STATE', Order.ATOMIC) || '[]';
  const rk = pythonGenerator.valueToCode(block, 'ROUND_KEY', Order.ATOMIC) || '[]';
  return ['aesLastRound(' + s + ', ' + rk + ')', Order.ATOMIC];
};
pythonGenerator.forBlock['aes_key_schedule'] = function(block: Block): [string, number] {
  const key = pythonGenerator.valueToCode(block, 'KEY', Order.ATOMIC) || 'b""';
  const bits = block.getFieldValue('BITS') || '128';
  return ['aesKeySchedule(' + key + ', ' + bits + ')', Order.ATOMIC];
};
pythonGenerator.forBlock['sm4_round'] = function(block: Block): [string, number] {
  const s = pythonGenerator.valueToCode(block, 'STATE', Order.ATOMIC) || '[0,0,0,0]';
  const rk = pythonGenerator.valueToCode(block, 'ROUND_KEY', Order.ATOMIC) || '0';
  return ['sm4Round(' + s + ', ' + rk + ')', Order.ATOMIC];
};
pythonGenerator.forBlock['sm4_key_schedule'] = function(block: Block): [string, number] {
  const key = pythonGenerator.valueToCode(block, 'KEY', Order.ATOMIC) || 'b""';
  return ['sm4KeySchedule(' + key + ')', Order.ATOMIC];
};
pythonGenerator.forBlock['mode_ecb'] = function(block: Block): [string, number] {
  const d = pythonGenerator.valueToCode(block, 'DATA', Order.ATOMIC) || 'b""';
  return ['# ECB: ' + d, Order.ATOMIC];
};
pythonGenerator.forBlock['mode_cbc'] = function(block: Block): [string, number] {
  const d = pythonGenerator.valueToCode(block, 'DATA', Order.ATOMIC) || 'b""';
  return ['# CBC: ' + d, Order.ATOMIC];
};
pythonGenerator.forBlock['mode_ctr'] = function(block: Block): [string, number] {
  const d = pythonGenerator.valueToCode(block, 'DATA', Order.ATOMIC) || 'b""';
  return ['# CTR: ' + d, Order.ATOMIC];
};
pythonGenerator.forBlock['mode_gcm'] = function(block: Block): [string, number] {
  const d = pythonGenerator.valueToCode(block, 'DATA', Order.ATOMIC) || 'b""';
  return ['# GCM: ' + d, Order.ATOMIC];
};
