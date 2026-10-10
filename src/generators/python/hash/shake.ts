/**
 * XOF/PRF Python 代码生成器 — 后量子基础块
 */
import { pythonGenerator, Order } from 'blockly/python';
import type { Block } from 'blockly/core';

function registerShakeInputBytes(): string {
  return pythonGenerator.provideFunction_('shake_input_bytes', [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(value):',
    '    if isinstance(value, str): return value.encode("utf-8")',
    '    if isinstance(value, (bytes, bytearray)): return bytes(value)',
    '    if not isinstance(value, (list, tuple)) or any(isinstance(byte, bool) or not isinstance(byte, (int, float)) or not 0 <= byte <= 255 or int(byte) != byte for byte in value): raise ValueError("SHAKE input must be UTF-8 text or a byte array of integers from 0 to 255")',
    '    return bytes(int(byte) for byte in value)',
  ]);
}

// XOF: Extendable Output Function (SHAKE128/SHAKE256)
pythonGenerator.forBlock['pq_xof'] = function (block: Block): [string, number] {
  const seed =
    pythonGenerator.valueToCode(block, 'SEED', Order.ATOMIC) || 'b\'\'';
  const outLen =
    pythonGenerator.valueToCode(block, 'OUTLEN', Order.ATOMIC) || '168';
  const algo = block.getFieldValue('ALGO') || 'SHAKE128';
  const suffix = algo === 'SHAKE128' ? '128' : '256';

  const inputBytesName = registerShakeInputBytes();
  const funcName = pythonGenerator.provideFunction_('xof_shake' + suffix, [
    'def ' +
      pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ +
      '(seed, out_len=168):',
    '    if isinstance(out_len, bool) or not isinstance(out_len, (int, float)) or not 0 <= out_len <= 9007199254740991 or int(out_len) != out_len: raise ValueError("SHAKE output length must be a non-negative safe integer number of bytes")',
    '    out_len = int(out_len)',
    '    import hashlib',
    '    seed = ' + inputBytesName + '(seed)',
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

  const inputBytesName = registerShakeInputBytes();
  const funcName = pythonGenerator.provideFunction_('prf_shake' + suffix, [
    'def ' +
      pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ +
      '(seed, nonce, out_len=128):',
    '    if isinstance(nonce, bool) or not isinstance(nonce, (int, float)) or not 0 <= nonce <= 255 or int(nonce) != nonce: raise ValueError("SHAKE PRF nonce must be an integer byte")',
    '    if isinstance(out_len, bool) or not isinstance(out_len, (int, float)) or not 0 <= out_len <= 9007199254740991 or int(out_len) != out_len: raise ValueError("SHAKE output length must be a non-negative safe integer number of bytes")',
    '    nonce = int(nonce)',
    '    out_len = int(out_len)',
    '    import hashlib',
    '    seed = ' + inputBytesName + '(seed)',
    '    data = bytes(seed) + bytes([nonce & 0xFF])',
    '    return hashlib.shake_' + suffix + '(data).digest(out_len)',
  ]);
  return [
    funcName + '(' + seed + ', ' + nonce + ', out_len=' + outLen + ')',
    Order.ATOMIC,
  ];
};
