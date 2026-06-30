/**
 * XOF/PRF Python 代码生成器 — 后量子基础块
 */
import { pythonGenerator, Order } from 'blockly/python';
import type { Block } from 'blockly/core';

// XOF: Extendable Output Function (SHAKE128/SHAKE256)
pythonGenerator.forBlock['pq_xof'] = function (block: Block): [string, number] {
  const seed =
    pythonGenerator.valueToCode(block, 'SEED', Order.ATOMIC) || 'b\'\'';
  const outLen =
    pythonGenerator.valueToCode(block, 'OUTLEN', Order.ATOMIC) || '168';
  const algo = block.getFieldValue('ALGO') || 'SHAKE128';
  const suffix = algo === 'SHAKE128' ? '128' : '256';

  const funcName = pythonGenerator.provideFunction_('xof_shake' + suffix, [
    'def ' +
      pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ +
      '(seed, out_len=168):',
    '    import hashlib',
    '    if isinstance(seed, str):',
    '        seed = seed.encode("utf-8")',
    '    seed = bytes(seed)',
    '    return hashlib.shake_' + suffix + '(seed).digest(out_len)',
  ]);
  return [funcName + '(' + seed + ', out_len=' + outLen + ')', Order.ATOMIC];
};

// PRF: Pseudo-Random Function (SHAKE128/SHAKE256)
pythonGenerator.forBlock['pq_prf'] = function (block: Block): [string, number] {
  const seed =
    pythonGenerator.valueToCode(block, 'SEED', Order.ATOMIC) || 'b\'\'';
  const nonce =
    pythonGenerator.valueToCode(block, 'NONCE', Order.ATOMIC) || '0';
  const outLen =
    pythonGenerator.valueToCode(block, 'OUTLEN', Order.ATOMIC) || '128';
  const algo = block.getFieldValue('ALGO') || 'SHAKE256';
  const suffix = algo === 'SHAKE128' ? '128' : '256';

  const funcName = pythonGenerator.provideFunction_('prf_shake' + suffix, [
    'def ' +
      pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ +
      '(seed, nonce, out_len=128):',
    '    import hashlib',
    '    if isinstance(seed, str):',
    '        seed = seed.encode("utf-8")',
    '    data = bytes(seed) + bytes([nonce & 0xFF])',
    '    return hashlib.shake_' + suffix + '(data).digest(out_len)',
  ]);
  return [
    funcName + '(' + seed + ', ' + nonce + ', out_len=' + outLen + ')',
    Order.ATOMIC,
  ];
};
