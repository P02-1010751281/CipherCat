import { javascriptGenerator, Order } from 'blockly/javascript';
import type { Block } from 'blockly';
import { registerHexToBytes } from '../data/helpers';
import { registerKeccakF1600, registerSha3Pad } from './helpers';

/** SHA-3 padding — text input → returns padded bytes. */
javascriptGenerator.forBlock['hash_sha3_pad_text'] = function (
  block: Block,
): [string, number] {
  const input =
    javascriptGenerator.valueToCode(block, 'INPUT', Order.ATOMIC) || "''";
  const padFn = registerSha3Pad();
  return [padFn + '(' + input + ', 136, 0x06)', Order.ATOMIC];
};

/** SHA-3 padding — hex input → returns padded bytes. */
javascriptGenerator.forBlock['hash_sha3_pad_hex'] = function (
  block: Block,
): [string, number] {
  const input =
    javascriptGenerator.valueToCode(block, 'INPUT', Order.ATOMIC) || "''";
  const hexFn = registerHexToBytes();
  const padFn = registerSha3Pad();
  return [padFn + '(' + hexFn + '(' + input + '), 136, 0x06)', Order.ATOMIC];
};

/** SHA-3 padding — bytes input → returns padded bytes. */
javascriptGenerator.forBlock['hash_sha3_pad'] = function (
  block: Block,
): [string, number] {
  const input =
    javascriptGenerator.valueToCode(block, 'INPUT', Order.ATOMIC) || '[]';
  const rate = block.getFieldValue('RATE') || '136';
  const suffix = block.getFieldValue('SUFFIX') || '0x06';
  const padFn = registerSha3Pad();
  return [
    padFn + '(' + input + ', ' + rate + ', ' + suffix + ')',
    Order.ATOMIC,
  ];
};

/** Keccak-f[b] — state → returns permuted state. */
javascriptGenerator.forBlock['hash_sha3_keccak_f'] = function (
  block: Block,
): [string, number] {
  const state =
    javascriptGenerator.valueToCode(block, 'STATE', Order.ATOMIC) || '[]';
  const funcName = registerKeccakF1600();
  return [funcName + '(' + state + ')', Order.ATOMIC];
};

/** Absorb — (state, block) → returns new state. */
javascriptGenerator.forBlock['hash_sha3_absorb'] = function (
  block: Block,
): [string, number] {
  const state =
    javascriptGenerator.valueToCode(block, 'STATE', Order.ATOMIC) || 'state';
  const blockVal =
    javascriptGenerator.valueToCode(block, 'BLOCK', Order.ATOMIC) || 'data';
  const rateBits = parseInt(block.getFieldValue('RATE') || '1088');
  const rateBytes = Math.floor(rateBits / 8);

  const keccakName = registerKeccakF1600();
  const absorbName = javascriptGenerator.provideFunction_('sha3Absorb', [
    'function ' +
      javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ +
      '(state, block, rateBytes) {',
    '  let s = state.slice();',
    '  let lanes = rateBytes >> 3;',
    '  for (let offset = 0; offset < block.length; offset += rateBytes) {',
    '    let chunk = block.slice(offset, offset + rateBytes);',
    '    for (let i = 0; i < lanes; i++) {',
    '      let lane = 0n;',
    '      for (let j = 0; j < 8; j++) {',
    '        let idx = i * 8 + j;',
    '        if (idx < chunk.length) lane |= BigInt(chunk[idx]) << BigInt(j * 8);',
    '      }',
    '      s[i] ^= lane;',
    '    }',
    '    s = ' + keccakName + '(s);',
    '  }',
    '  return s;',
    '}',
  ]);
  return [
    absorbName + '(' + state + ', ' + blockVal + ', ' + rateBytes + ')',
    Order.ATOMIC,
  ];
};

/** Squeeze — (state, outLen) → returns bytes. */
javascriptGenerator.forBlock['hash_sha3_squeeze'] = function (
  block: Block,
): [string, number] {
  const state =
    javascriptGenerator.valueToCode(block, 'STATE', Order.ATOMIC) || 'state';
  const outLen =
    javascriptGenerator.valueToCode(block, 'OUTLEN', Order.ATOMIC) || '32';
  const rateBits = parseInt(block.getFieldValue('RATE') || '1088');
  const rateBytes = Math.floor(rateBits / 8);

  const keccakName = registerKeccakF1600();
  const squeezeName = javascriptGenerator.provideFunction_('sha3Squeeze', [
    'function ' +
      javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ +
      '(state, outLen, rateBytes) {',
    '  let s = state.slice();',
    '  let lanes = rateBytes >> 3;',
    '  let out = new Uint8Array(outLen);',
    '  let cursor = 0;',
    '  while (cursor < outLen) {',
    '    for (let i = 0; i < lanes && cursor < outLen; i++) {',
    '      for (let j = 0; j < 8 && cursor < outLen; j++) {',
    '        out[cursor++] = Number((s[i] >> BigInt(j * 8)) & 0xFFn);',
    '      }',
    '    }',
    '    if (cursor < outLen) s = ' + keccakName + '(s);',
    '  }',
    '  return out;',
    '}',
  ]);
  return [
    squeezeName + '(' + state + ', ' + outLen + ', ' + rateBytes + ')',
    Order.ATOMIC,
  ];
};

/** State initialization — returns new Array(25).fill(0n). */
javascriptGenerator.forBlock['hash_sha3_state_init'] = function (
  _block: Block,
): [string, number] {
  void _block;
  return ['new Array(25).fill(0n)', Order.ATOMIC];
};
