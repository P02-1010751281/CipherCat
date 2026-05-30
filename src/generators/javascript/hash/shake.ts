/**
 * XOF/PRF JavaScript 代码生成器 — 后量子基础块
 */
import { javascriptGenerator, Order } from 'blockly/javascript';
import type { Block } from 'blockly/core';
import { registerKeccakF1600 } from './helpers';

// XOF: Extendable Output Function (SHAKE128/SHAKE256)
javascriptGenerator.forBlock['pq_xof'] = function(block: Block): [string, number] {
  const seed = javascriptGenerator.valueToCode(block, 'SEED', Order.ATOMIC) || '[]';
  const outLen = javascriptGenerator.valueToCode(block, 'OUTLEN', Order.ATOMIC) || '168';
  const algo = block.getFieldValue('ALGO') || 'SHAKE128';
  const rate = algo === 'SHAKE128' ? 168 : 136;

  const keccakFName = registerKeccakF1600();

  const shakeName = javascriptGenerator.provideFunction_('shakeXOF', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(inp, outBytes, rate) {',
    '  let state = new Array(25).fill(0n);',
    '  let padLen = rate - (inp.length % rate);',
    '  if (padLen === 1) padLen += rate;',
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
javascriptGenerator.forBlock['pq_prf'] = function(block: Block): [string, number] {
  const seed = javascriptGenerator.valueToCode(block, 'SEED', Order.ATOMIC) || '[]';
  const nonce = javascriptGenerator.valueToCode(block, 'NONCE', Order.ATOMIC) || '0';
  const outLen = javascriptGenerator.valueToCode(block, 'OUTLEN', Order.ATOMIC) || '128';
  const algo = block.getFieldValue('ALGO') || 'SHAKE256';
  const rate = algo === 'SHAKE128' ? 168 : 136;

  const keccakFName = registerKeccakF1600();

  const funcName = javascriptGenerator.provideFunction_('prf_shake', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(seed, nonce, outLen, rate) {',
    '  let data = new Uint8Array(seed.length + 1);',
    '  data.set(seed);',
    '  data[seed.length] = nonce & 0xFF;',
    '  let state = new Array(25).fill(0n);',
    '  let padLen = rate - (data.length % rate);',
    '  if (padLen === 1) padLen += rate;',
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

