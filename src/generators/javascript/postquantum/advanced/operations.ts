/**
 * ML-KEM 高级操作 JavaScript 代码生成器 — 后量子高级块
 *
 * ⚠️ M0 清理：移除了 6 个不通用复合块的生成器。
 * 辅助函数（shake128once, sampleA 等）暂保留以供 M2.5 便利块复用。
 *
 * 参考: FIPS 203 — https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.203.pdf
 */
import { javascriptGenerator, Order } from 'blockly/javascript';
import type { Block } from 'blockly/core';
import { registerKeccakF1600 } from '../../hash/helpers';
import {
  registerSeedWithNonce,
  registerPolyAddModQ,
  registerNtt,
  registerIntt,
  registerNttMul,
  registerSampleCbdEta,
} from '../helpers';

// ── 辅助函数（M2.5 便利块将复用）──

/** SHAKE128 一次性输出（absorb + squeeze 一步完成） */
function registerShake128Once(): string {
  const keccakFName = registerKeccakF1600();
  return javascriptGenerator.provideFunction_('shake128once', [
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
    '      let w1 = state[j / 8];',
    '      for (let b = 0; b < 8 && cursor < outBytes; b++) {',
    '        out[cursor++] = Number((w1 >> BigInt(8 * b)) & 0xFFn);',
    '      }',
    '    }',
    '    if (cursor < outBytes) state = ' + keccakFName + '(state);',
    '  }',
    '  return out;',
    '}',
  ]);
}

/** XOF-based rejection sampling for NTT domain coefficients */
function registerSampleA(): string {
  const shakeName = registerShake128Once();
  return javascriptGenerator.provideFunction_('sampleA', [
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
    '  return coeffs;',
    '}',
  ]);
}

// ── 块生成器（当前空，M2.5 将在此注册便利块生成器）──
