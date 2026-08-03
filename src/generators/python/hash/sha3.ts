import { pythonGenerator, Order } from 'blockly/python';
import type { Block } from 'blockly/core';
import { registerSha3Pad, registerKeccakF1600, registerSha3Absorb, registerSha3Squeeze } from './helpers';

/** SHA-3 padding (pad10*1) — text input → returns padded bytes. */
pythonGenerator.forBlock['hash_sha3_pad_text'] = function (
  block: Block,
): [string, number] {
  const input =
    pythonGenerator.valueToCode(block, 'INPUT', Order.ATOMIC) || '\'\'';
  const padFn = registerSha3Pad();
  return [padFn + '(' + input + ', rate_bytes=136, suffix=0x06)', Order.ATOMIC];
};

/** SHA-3 padding (pad10*1) — hex input → returns padded bytes. */
pythonGenerator.forBlock['hash_sha3_pad_hex'] = function (
  block: Block,
): [string, number] {
  const input =
    pythonGenerator.valueToCode(block, 'INPUT', Order.ATOMIC) || '\'\'';
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
pythonGenerator.forBlock['sponge_pad'] = function (
  block: Block,
): [string, number] {
  const input =
    pythonGenerator.valueToCode(block, 'INPUT', Order.ATOMIC) || 'b\'\'';
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
pythonGenerator.forBlock['keccak_f'] = function (
  block: Block,
): [string, number] {
  const state =
    pythonGenerator.valueToCode(block, 'STATE', Order.ATOMIC) || 'state';
  const width = block.getFieldValue('WIDTH') || '1600';
  if (width !== '1600') {
    // 下拉已收窄为 1600；旧工作区可能残留其他宽度，诚实降级为 1600 位置换
    console.warn(`[sha3] keccak_f width ${width} not supported; generating 1600-bit permutation.`);
  }
  const funcName = registerKeccakF1600();
  return [funcName + '(' + state + ')', Order.ATOMIC];
};

/** Absorb — (state, block) → returns new state. */
pythonGenerator.forBlock['sponge_absorb'] = function (
  block: Block,
): [string, number] {
  const state =
    pythonGenerator.valueToCode(block, 'STATE', Order.ATOMIC) || 'state';
  const blockVal =
    pythonGenerator.valueToCode(block, 'BLOCK', Order.ATOMIC) || 'block';
  const rateBits = block.getFieldValue('RATE') || '1088';
  const rateBytes = Math.floor(parseInt(rateBits) / 8);

  const absorbName = registerSha3Absorb();
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
pythonGenerator.forBlock['sponge_squeeze'] = function (
  block: Block,
): [string, number] {
  const state =
    pythonGenerator.valueToCode(block, 'STATE', Order.ATOMIC) || 'state';
  const outlen =
    pythonGenerator.valueToCode(block, 'OUTLEN', Order.ATOMIC) || '32';
  const rateBits = block.getFieldValue('RATE') || '1088';
  const rateBytes = Math.floor(parseInt(rateBits) / 8);

  const squeezeName = registerSha3Squeeze();
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
pythonGenerator.forBlock['keccak_state_init'] = function (
  _block: Block,
): [string, number] {
  void _block;
  return ['[0] * 25', Order.ATOMIC];
};

/** 独立 SHA3-224/256/384/512 封装（FIPS 202）——组合 pad(0x06)/absorb/squeeze */
pythonGenerator.forBlock['sha3_hash'] = function (
  block: Block,
): [string, number] {
  const msg =
    pythonGenerator.valueToCode(block, 'MSG', Order.ATOMIC) || "''";
  const size = block.getFieldValue('SIZE') || '256';
  const sizeBits = parseInt(size, 10);
  // FIPS 202 Table 3: r = 1152/1088/832/576（224/256/384/512）
  const rateBits = sizeBits === 224 ? 1152 : sizeBits === 256 ? 1088 : sizeBits === 384 ? 832 : 576;
  const rateBytes = Math.floor(rateBits / 8);

  const padFn = registerSha3Pad();
  const absorbName = registerSha3Absorb();
  const squeezeName = registerSha3Squeeze();
  const hashName = pythonGenerator.provideFunction_('sha3_hash', [
    'def ' +
      pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ +
      '(msg, size_bits, rate_bytes):',
    '    data = ' + padFn + '(msg, rate_bytes=rate_bytes, suffix=0x06)',
    '    st = ' + absorbName + '([0] * 25, data, rate_bytes=rate_bytes)',
    '    return ' + squeezeName + '(st, size_bits // 8, rate_bytes=rate_bytes)',
  ]);
  return [
    hashName + '(' + msg + ', ' + size + ', ' + rateBytes + ')',
    Order.ATOMIC,
  ];
};
