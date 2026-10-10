/**
 * XOF/PRF JavaScript 代码生成器 — 后量子基础块
 */
import { javascriptGenerator, Order } from 'blockly/javascript';
import type { Block } from 'blockly/core';
import { registerKeccakF1600 } from './helpers';

function registerShakeInputBytes(): string {
  return javascriptGenerator.provideFunction_('shakeInputBytes', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(value) {',
    '  if (typeof value === "string") return new TextEncoder().encode(value);',
    '  if (value instanceof Uint8Array) return value;',
    '  if (!Array.isArray(value)) throw new TypeError("SHAKE input must be UTF-8 text or a byte array of integers from 0 to 255");',
    '  for (let i = 0; i < value.length; i++) { const byte = value[i]; if (typeof byte !== "number" || !Number.isInteger(byte) || byte < 0 || byte > 255) throw new TypeError("SHAKE input must be UTF-8 text or a byte array of integers from 0 to 255"); }',
    '  return Uint8Array.from(value);',
    '}',
  ]);
}

// XOF: Extendable Output Function (SHAKE128/SHAKE256)
javascriptGenerator.forBlock['pq_xof'] = function (
  block: Block,
): [string, number] {
  const seed =
    javascriptGenerator.valueToCode(block, 'SEED', Order.ATOMIC) || '[]';
  const outLen =
    javascriptGenerator.valueToCode(block, 'OUTLEN', Order.ATOMIC) || '168';
  const algo = block.getFieldValue('ALGO') || 'SHAKE128';
  const rate = algo === 'SHAKE128' ? 168 : 136;

  const inputBytesName = registerShakeInputBytes();
  const keccakFName = registerKeccakF1600();

  const shakeName = javascriptGenerator.provideFunction_('shakeXOF', [
    'function ' +
      javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ +
      '(inp, outBytes, rate) {',
    '  if (!Number.isSafeInteger(outBytes) || outBytes < 0) throw new RangeError("SHAKE output length must be a non-negative safe integer number of bytes");',
    '  inp = ' + inputBytesName + '(inp);',
    '  let state = new Array(25).fill(0n);',
    // Suffix and final padding bit share one byte at the rate-minus-one boundary.
    '  let padLen = rate - (inp.length % rate);',
    '  let padded = new Uint8Array(inp.length + padLen);',
    '  padded.set(inp);',
    '  padded[inp.length] = 0x1F;',
    '  padded[padded.length - 1] ^= 0x80;',
    '  let absorb = 0;',
    '  while (absorb < padded.length) {',
    '    for (let j = 0; j < rate; j += 8) {',
    '      let w = 0n;',
    '      for (let b = 0; b < 8 && (absorb + j + b) < padded.length; b++) {',
    '        w |= BigInt(padded[absorb + j + b]) << BigInt(8 * b);',
    '      }',
    '      state[j / 8] ^= w;',
    '    }',
    '    state = ' + keccakFName + '(state);',
    '    absorb += rate;',
    '  }',
    '  let out = new Uint8Array(outBytes);',
    '  let cursor = 0;',
    '  while (cursor < outBytes) {',
    '    for (let j = 0; j < rate && cursor < outBytes; j += 8) {',
    '      let w = state[j / 8];',
    '      for (let b = 0; b < 8 && cursor < outBytes; b++) {',
    '        out[cursor++] = Number((w >> BigInt(8 * b)) & 0xFFn);',
    '      }',
    '    }',
    '    if (cursor < outBytes) state = ' + keccakFName + '(state);',
    '  }',
    '  return out;',
    '}',
  ]);

  return [`${shakeName}(${seed}, ${outLen}, ${rate})`, Order.ATOMIC];
};

// PRF: Pseudo-Random Function (SHAKE128/SHAKE256)
javascriptGenerator.forBlock['pq_prf'] = function (
  block: Block,
): [string, number] {
  const seed =
    javascriptGenerator.valueToCode(block, 'SEED', Order.ATOMIC) || '[]';
  const nonce =
    javascriptGenerator.valueToCode(block, 'NONCE', Order.ATOMIC) || '0';
  const outLen =
    javascriptGenerator.valueToCode(block, 'OUTLEN', Order.ATOMIC) || '128';
  const algo = block.getFieldValue('ALGO') || 'SHAKE256';
  const rate = algo === 'SHAKE128' ? 168 : 136;

  const inputBytesName = registerShakeInputBytes();
  const keccakFName = registerKeccakF1600();

  const funcName = javascriptGenerator.provideFunction_('prf_shake', [
    'function ' +
      javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ +
      '(seed, nonce, outLen, rate) {',
    '  if (!Number.isSafeInteger(nonce) || nonce < 0 || nonce > 255) throw new RangeError("SHAKE PRF nonce must be an integer byte");',
    '  if (!Number.isSafeInteger(outLen) || outLen < 0) throw new RangeError("SHAKE output length must be a non-negative safe integer number of bytes");',
    '  seed = ' + inputBytesName + '(seed);',
    '  let data = new Uint8Array(seed.length + 1);',
    '  data.set(seed);',
    '  data[seed.length] = nonce & 0xFF;',
    '  let state = new Array(25).fill(0n);',
    // Suffix and final padding bit share one byte at the rate-minus-one boundary.
    '  let padLen = rate - (data.length % rate);',
    '  let padded = new Uint8Array(data.length + padLen);',
    '  padded.set(data);',
    '  padded[data.length] = 0x1F;',
    '  padded[padded.length - 1] ^= 0x80;',
    '  let absorb = 0;',
    '  while (absorb < padded.length) {',
    '    for (let j = 0; j < rate; j += 8) {',
    '      let w = 0n;',
    '      for (let b = 0; b < 8 && (absorb + j + b) < padded.length; b++) {',
    '        w |= BigInt(padded[absorb + j + b]) << BigInt(8 * b);',
    '      }',
    '      state[j / 8] ^= w;',
    '    }',
    '    state = ' + keccakFName + '(state);',
    '    absorb += rate;',
    '  }',
    '  let out = new Uint8Array(outLen);',
    '  let cursor = 0;',
    '  while (cursor < outLen) {',
    '    for (let j = 0; j < rate && cursor < outLen; j += 8) {',
    '      let w = state[j / 8];',
    '      for (let b = 0; b < 8 && cursor < outLen; b++) {',
    '        out[cursor++] = Number((w >> BigInt(8 * b)) & 0xFFn);',
    '      }',
    '    }',
    '    if (cursor < outLen) state = ' + keccakFName + '(state);',
    '  }',
    '  return out;',
    '}',
  ]);

  return [`${funcName}(${seed}, ${nonce}, ${outLen}, ${rate})`, Order.ATOMIC];
};
