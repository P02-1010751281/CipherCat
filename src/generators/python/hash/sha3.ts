import { pythonGenerator, Order } from 'blockly/python';
import type { Block } from 'blockly/core';
import { registerSha3Pad, registerKeccakF1600 } from './helpers';

/** SHA-3 padding (pad10*1) — text input → returns padded bytes. */
pythonGenerator.forBlock['hash_sha3_pad_text'] = function (
  block: Block,
): [string, number] {
  const input =
    pythonGenerator.valueToCode(block, 'INPUT', Order.ATOMIC) || "''";
  const padFn = registerSha3Pad();
  return [padFn + '(' + input + ', rate_bytes=136, suffix=0x06)', Order.ATOMIC];
};

/** SHA-3 padding (pad10*1) — hex input → returns padded bytes. */
pythonGenerator.forBlock['hash_sha3_pad_hex'] = function (
  block: Block,
): [string, number] {
  const input =
    pythonGenerator.valueToCode(block, 'INPUT', Order.ATOMIC) || "''";
  const padFn = registerSha3Pad();
  return [
    padFn +
      '(bytes.fromhex(' +
      input +
      ') if isinstance(' +
      input +
      ', str) else ' +
      input +
      ', rate_bytes=136, suffix=0x06)',
    Order.ATOMIC,
  ];
};

/** SHA-3 padding — bytes input → returns padded bytes. */
pythonGenerator.forBlock['hash_sha3_pad'] = function (
  block: Block,
): [string, number] {
  const input =
    pythonGenerator.valueToCode(block, 'INPUT', Order.ATOMIC) || "b''";
  const rateBits = block.getFieldValue('RATE') || '1088';
  const suffix = block.getFieldValue('SUFFIX') || '0x06';
  const rateBytes = Math.floor(parseInt(rateBits) / 8);
  const padFn = registerSha3Pad();
  return [
    padFn +
      '(' +
      input +
      ', rate_bytes=' +
      rateBytes +
      ', suffix=' +
      suffix +
      ')',
    Order.ATOMIC,
  ];
};

/** Keccak-f[b] — state → returns permuted state. */
pythonGenerator.forBlock['hash_sha3_keccak_f'] = function (
  block: Block,
): [string, number] {
  const state =
    pythonGenerator.valueToCode(block, 'STATE', Order.ATOMIC) || 'state';
  const width = block.getFieldValue('WIDTH') || '1600';
  if (width !== '1600') {
    return ['keccak_f' + width + '(' + state + ')', Order.ATOMIC];
  }
  const funcName = registerKeccakF1600();
  return [funcName + '(' + state + ')', Order.ATOMIC];
};

/** Absorb — (state, block) → returns new state. */
pythonGenerator.forBlock['hash_sha3_absorb'] = function (
  block: Block,
): [string, number] {
  const state =
    pythonGenerator.valueToCode(block, 'STATE', Order.ATOMIC) || 'state';
  const blockVal =
    pythonGenerator.valueToCode(block, 'BLOCK', Order.ATOMIC) || 'block';
  const rateBits = block.getFieldValue('RATE') || '1088';
  const rateBytes = Math.floor(parseInt(rateBits) / 8);

  const keccakName = registerKeccakF1600();
  const absorbName = pythonGenerator.provideFunction_('sha3_absorb', [
    'def ' +
      pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ +
      '(state, block, rate_bytes=136):',
    '    rate_lanes = rate_bytes // 8',
    '    s = list(state)',
    '    for i in range(rate_lanes):',
    '        lane = 0',
    '        for j in range(8):',
    '            lane |= (block[i*8+j] if i*8+j < len(block) else 0) << (j*8)',
    '        s[i] ^= lane',
    '    return ' + keccakName + '(s)',
  ]);
  return [
    absorbName +
      '(' +
      state +
      ', ' +
      blockVal +
      ', rate_bytes=' +
      rateBytes +
      ')',
    Order.ATOMIC,
  ];
};

/** Squeeze — (state, outLen) → returns bytes. */
pythonGenerator.forBlock['hash_sha3_squeeze'] = function (
  block: Block,
): [string, number] {
  const state =
    pythonGenerator.valueToCode(block, 'STATE', Order.ATOMIC) || 'state';
  const outlen =
    pythonGenerator.valueToCode(block, 'OUTLEN', Order.ATOMIC) || '32';
  const rateBits = block.getFieldValue('RATE') || '1088';
  const rateBytes = Math.floor(parseInt(rateBits) / 8);

  const keccakName = registerKeccakF1600();
  const squeezeName = pythonGenerator.provideFunction_('sha3_squeeze', [
    'def ' +
      pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ +
      '(state, out_len, rate_bytes=136):',
    '    rate_lanes = rate_bytes // 8',
    '    s = list(state)',
    '    output = bytearray()',
    '    while len(output) < out_len:',
    '        for i in range(rate_lanes):',
    '            for j in range(8):',
    '                if len(output) >= out_len:',
    '                    break',
    '                output.append((s[i] >> (j*8)) & 0xFF)',
    '            if len(output) >= out_len:',
    '                break',
    '        if len(output) < out_len:',
    '            s = ' + keccakName + '(s)',
    '    return bytes(output[:out_len])',
  ]);
  return [
    squeezeName +
      '(' +
      state +
      ', ' +
      outlen +
      ', rate_bytes=' +
      rateBytes +
      ')',
    Order.ATOMIC,
  ];
};

/** State initialization — returns [0]*25. */
pythonGenerator.forBlock['hash_sha3_state_init'] = function (
  _block: Block,
): [string, number] {
  void _block;
  return ['[0] * 25', Order.ATOMIC];
};
