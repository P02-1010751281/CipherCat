import { javascriptGenerator, Order } from 'blockly/javascript';
import type { Block } from 'blockly';
import { registerHexToBytes } from '../data/helpers';
import { registerKeccakF1600, registerSha3Pad, registerSha3Absorb, registerSha3Squeeze } from './helpers';

/** SHA-3 padding — text input → returns padded bytes. */
javascriptGenerator.forBlock['hash_sha3_pad_text'] = function (
  block: Block,
): [string, number] {
  const input =
    javascriptGenerator.valueToCode(block, 'INPUT', Order.ATOMIC) || '\'\'';
  const padFn = registerSha3Pad();
  return [padFn + '(' + input + ', 136, 0x06)', Order.ATOMIC];
};

/** SHA-3 padding — hex input → returns padded bytes. */
javascriptGenerator.forBlock['hash_sha3_pad_hex'] = function (
  block: Block,
): [string, number] {
  const input =
    javascriptGenerator.valueToCode(block, 'INPUT', Order.ATOMIC) || '\'\'';
  const hexFn = registerHexToBytes();
  const padFn = registerSha3Pad();
  return [padFn + '(' + hexFn + '(' + input + '), 136, 0x06)', Order.ATOMIC];
};

/** SHA-3 padding — bytes input → returns padded bytes. */
javascriptGenerator.forBlock['sponge_pad'] = function (
  block: Block,
): [string, number] {
  const input =
    javascriptGenerator.valueToCode(block, 'INPUT', Order.ATOMIC) || '[]';
  const rateBits = parseInt(block.getFieldValue('RATE') || '1088');
  // 下拉值是比特（1088/576/1152...），pad 需要字节（/8）——与 absorb/squeeze 一致
  const rateBytes = Math.floor(rateBits / 8);
  const suffix = block.getFieldValue('SUFFIX') || '0x06';
  const padFn = registerSha3Pad();
  return [
    padFn + '(' + input + ', ' + rateBytes + ', ' + suffix + ')',
    Order.ATOMIC,
  ];
};

/** Keccak-f[b] — state → returns permuted state. */
javascriptGenerator.forBlock['keccak_f'] = function (
  block: Block,
): [string, number] {
  const state =
    javascriptGenerator.valueToCode(block, 'STATE', Order.ATOMIC) || '[]';
  const width = block.getFieldValue('WIDTH') || '1600';
  if (width !== '1600') {
    // 下拉已收窄为 1600；旧工作区可能残留其他宽度，诚实降级为 1600 位置换
    console.warn(`[sha3] keccak_f width ${width} not supported; generating 1600-bit permutation.`);
  }
  const funcName = registerKeccakF1600();
  return [funcName + '(' + state + ')', Order.ATOMIC];
};

/** Absorb — (state, block) → returns new state. */
javascriptGenerator.forBlock['sponge_absorb'] = function (
  block: Block,
): [string, number] {
  const state =
    javascriptGenerator.valueToCode(block, 'STATE', Order.ATOMIC) || 'state';
  const blockVal =
    javascriptGenerator.valueToCode(block, 'BLOCK', Order.ATOMIC) || 'data';
  const rateBits = parseInt(block.getFieldValue('RATE') || '1088');
  const rateBytes = Math.floor(rateBits / 8);

  const absorbName = registerSha3Absorb();
  return [
    absorbName + '(' + state + ', ' + blockVal + ', ' + rateBytes + ')',
    Order.ATOMIC,
  ];
};

/** Squeeze — (state, outLen) → returns bytes. */
javascriptGenerator.forBlock['sponge_squeeze'] = function (
  block: Block,
): [string, number] {
  const state =
    javascriptGenerator.valueToCode(block, 'STATE', Order.ATOMIC) || 'state';
  const outLen =
    javascriptGenerator.valueToCode(block, 'OUTLEN', Order.ATOMIC) || '32';
  const rateBits = parseInt(block.getFieldValue('RATE') || '1088');
  const rateBytes = Math.floor(rateBits / 8);

  const squeezeName = registerSha3Squeeze();
  return [
    squeezeName + '(' + state + ', ' + outLen + ', ' + rateBytes + ')',
    Order.ATOMIC,
  ];
};

/** State initialization — returns new Array(25).fill(0n). */
javascriptGenerator.forBlock['keccak_state_init'] = function (
  _block: Block,
): [string, number] {
  void _block;
  return ['new Array(25).fill(0n)', Order.ATOMIC];
};

/** 独立 SHA3-224/256/384/512 封装（FIPS 202）——组合 pad(0x06)/absorb/squeeze */
javascriptGenerator.forBlock['sha3_hash'] = function (
  block: Block,
): [string, number] {
  const msg =
    javascriptGenerator.valueToCode(block, 'MSG', Order.ATOMIC) || "''";
  const size = block.getFieldValue('SIZE') || '256';
  const sizeBits = parseInt(size, 10);
  const rateBits = sizeBits === 224 ? 1152 : sizeBits === 256 ? 1088 : sizeBits === 384 ? 832 : 576;
  const rateBytes = Math.floor(rateBits / 8);

  const padFn = registerSha3Pad();
  const absorbName = registerSha3Absorb();
  const squeezeName = registerSha3Squeeze();
  const hashName = javascriptGenerator.provideFunction_('sha3Hash', [
    'function ' +
      javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ +
      '(msg, sizeBits, rateBytes) {',
    '  let data = ' + padFn + '(msg, rateBytes, 0x06);',
    '  let st = ' + absorbName + '(new Array(25).fill(0n), data, rateBytes);',
    '  return ' + squeezeName + '(st, sizeBits >> 3, rateBytes);',
    '}',
  ]);
  return [
    hashName + '(' + msg + ', ' + size + ', ' + rateBytes + ')',
    Order.ATOMIC,
  ];
};
