/**
 * 后量子 NTT 域采样 JavaScript 代码生成器 — 后量子高级块
 */
import { javascriptGenerator, Order } from 'blockly/javascript';
import type { Block } from 'blockly/core';
import { registerKeccakF1600 } from '../../hash/helpers';
import { registerSampleCbdEta } from '../helpers';

/** Sample a polynomial from a seed using SHAKE128/NTT-domain rejection sampling. */
javascriptGenerator.forBlock['pq_sample_ntt'] = function (
  block: Block,
): [string, number] {
  const seed =
    javascriptGenerator.valueToCode(block, 'SEED', Order.ATOMIC) || '[]';
  const modulus = block.getFieldValue('MODULUS') || '3329';

  const keccakFName = registerKeccakF1600();

  const shakeName = javascriptGenerator.provideFunction_('shake128once', [
    'function ' +
      javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ +
      '(inp, outBytes) {',
    '  if (typeof inp === "string") inp = new TextEncoder().encode(inp);',
    '  else if (Array.isArray(inp)) inp = Uint8Array.from(inp);',
    '  let rate = 168;',
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

  const sampleNttFn = javascriptGenerator.provideFunction_('sampleNtt', [
    'function ' +
      javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ +
      '(seed, q) {',
    '  q = q || 3329;',
    '  if (typeof seed === "string") seed = new TextEncoder().encode(seed);',
    '  else if (Array.isArray(seed)) seed = Uint8Array.from(seed);',
    '  let buf = ' + shakeName + '(seed, 768);',
    '  let coeffs = [];',
    '  for (let pos = 0; pos + 3 <= buf.length && coeffs.length < 256; pos += 3) {',
    '    let d1 = (buf[pos] | ((buf[pos + 1] & 0x0F) << 8)) & 0xFFF;',
    '    let d2 = ((buf[pos + 1] >> 4) | (buf[pos + 2] << 4)) & 0xFFF;',
    '    if (d1 < q) coeffs.push(d1);',
    '    if (d2 < q && coeffs.length < 256) coeffs.push(d2);',
    '  }',
    '  return coeffs;', // 无 NTT！SHAKE128 输出即 NTT 域
    '}',
  ]);

  return [`${sampleNttFn}(${seed}, ${modulus})`, Order.ATOMIC];
};

/** Sample from CBD distribution using PRF/SHAKE256. */
javascriptGenerator.forBlock['pq_sample_poly_cbd'] = function (
  block: Block,
): [string, number] {
  const seed =
    javascriptGenerator.valueToCode(block, 'SEED', Order.ATOMIC) || '[]';
  const eta = parseInt(block.getFieldValue('ETA') || '2');
  const modulus = block.getFieldValue('MODULUS') || '3329';

  const cbdFn = registerSampleCbdEta(eta);
  return [`${cbdFn}(${seed}, ${modulus})`, Order.ATOMIC];
};
