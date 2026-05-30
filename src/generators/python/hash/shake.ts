/**
 * XOF/PRF Python 代码生成器 — 后量子基础块
 */
import { pythonGenerator, Order } from 'blockly/python';
import type { Block } from 'blockly/core';

// XOF: Extendable Output Function (SHAKE128/SHAKE256)
pythonGenerator.forBlock['pq_xof'] = function(block: Block): [string, number] {
  const seed = pythonGenerator.valueToCode(block, 'SEED', Order.ATOMIC) || 'b\'\'';
  const outLen = pythonGenerator.valueToCode(block, 'OUTLEN', Order.ATOMIC) || '168';
  const algo = block.getFieldValue('ALGO') || 'SHAKE128';
  const is128 = algo === 'SHAKE128';
  const modName = is128 ? 'SHAKE128' : 'SHAKE256';
  const suffix = is128 ? '128' : '256';

  const funcName = pythonGenerator.provideFunction_('xof_shake' + suffix, [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(seed, out_len=168):',
    '    from Crypto.Hash import ' + modName,
    '    xof = ' + modName + '.new(seed)',
    '    return xof.read(out_len)',
  ]);
  return [funcName + '(' + seed + ', out_len=' + outLen + ')', Order.ATOMIC];
};

// PRF: Pseudo-Random Function (SHAKE128/SHAKE256)
pythonGenerator.forBlock['pq_prf'] = function(block: Block): [string, number] {
  const seed = pythonGenerator.valueToCode(block, 'SEED', Order.ATOMIC) || 'b\'\'';
  const nonce = pythonGenerator.valueToCode(block, 'NONCE', Order.ATOMIC) || '0';
  const outLen = pythonGenerator.valueToCode(block, 'OUTLEN', Order.ATOMIC) || '128';
  const algo = block.getFieldValue('ALGO') || 'SHAKE256';
  const modName = algo === 'SHAKE128' ? 'SHAKE128' : 'SHAKE256';
  const suffix = algo === 'SHAKE128' ? '128' : '256';

  const funcName = pythonGenerator.provideFunction_('prf_shake' + suffix, [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(seed, nonce, out_len=128):',
    '    from Crypto.Hash import ' + modName,
    '    return ' + modName + '.new(seed + bytes([nonce & 0xFF])).read(out_len)',
  ]);
  return [funcName + '(' + seed + ', ' + nonce + ', out_len=' + outLen + ')', Order.ATOMIC];
};
