/**
 * ML-KEM 辅助运算 JavaScript 代码生成器 — 后量子高级块
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

function registerSampleNtt(): string {
  const shakeName = registerShake128Once();
  const nttFn = registerNtt();
  return javascriptGenerator.provideFunction_('sampleNtt', [
    'function ' +
      javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ +
      '(seed, q) {',
    '  q = q || 3329;',
    '  let outBytes = 672;',
    '  while (true) {',
    '    let coeffs = [];',
    '    let buf = ' + shakeName + '(seed, outBytes);',
    '    for (let pos = 0; coeffs.length < 256 && pos + 3 <= buf.length; pos += 3) {',
    '      let d1 = (buf[pos] | ((buf[pos + 1] & 0x0F) << 8)) & 0xFFF;',
    '      let d2 = ((buf[pos + 1] >> 4) | (buf[pos + 2] << 4)) & 0xFFF;',
    '      if (d1 < q) coeffs.push(d1);',
    '      if (d2 < q && coeffs.length < 256) coeffs.push(d2);',
    '    }',
    '    if (coeffs.length >= 256) return ' + nttFn + '(coeffs, q);',
    '    outBytes *= 2;',
    '  }',
    '}',
  ]);
}

/** Generate k×k NTT matrix A from a seed using XOF-based rejection sampling. */
javascriptGenerator.forBlock['pq_sample_ntt_mat'] = function (
  block: Block,
): [string, number] {
  const seed =
    javascriptGenerator.valueToCode(block, 'SEED', Order.ATOMIC) || '[]';
  const k = block.getFieldValue('K') || '3';
  const modulus = block.getFieldValue('MODULUS') || '3329';

  const seedWithNonceFn = registerSeedWithNonce();
  const sampleNttFn = registerSampleNtt();
  const funcName = javascriptGenerator.provideFunction_('sampleNttMat', [
    'function ' +
      javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ +
      '(seed, k, q) {',
    '  let A = [];',
    '  for (let i = 0; i < k; i++) {',
    '    A[i] = [];',
    '    for (let j = 0; j < k; j++) {',
    '      A[i][j] = ' +
      sampleNttFn +
      '(' +
      seedWithNonceFn +
      '(' +
      seedWithNonceFn +
      '(seed, j), i), q);',
    '    }',
    '  }',
    '  return A;',
    '}',
  ]);

  return [`${funcName}(${seed}, ${k}, ${modulus})`, Order.ATOMIC];
};

javascriptGenerator.forBlock['pq_build_vec3'] = function (
  block: Block,
): [string, number] {
  const a = javascriptGenerator.valueToCode(block, 'A', Order.ATOMIC) || 'null';
  const b = javascriptGenerator.valueToCode(block, 'B', Order.ATOMIC) || 'null';
  const c = javascriptGenerator.valueToCode(block, 'C', Order.ATOMIC) || 'null';
  return ['[' + a + ', ' + b + ', ' + c + ']', Order.ATOMIC];
};

javascriptGenerator.forBlock['pq_vec_compress_encode'] = function (
  block: Block,
): [string, number] {
  const u = javascriptGenerator.valueToCode(block, 'U', Order.ATOMIC) || '[]';
  const d = block.getFieldValue('BITS') || '10';
  const modulus = block.getFieldValue('MODULUS') || '3329';

  const compressFn = javascriptGenerator.provideFunction_('pqCompress', [
    'function ' +
      javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ +
      '(x, d, q) {',
    '  let pow2d = 1 << d;',
    '  let half = q >> 1;',
    '  let mask = pow2d - 1;',
    '  if (Array.isArray(x)) {',
    '    return x.map(function(xi) { return ((xi * pow2d + half) / q | 0) & mask; });',
    '  }',
    '  return ((x * pow2d + half) / q | 0) & mask;',
    '}',
  ]);

  const encodeFn = javascriptGenerator.provideFunction_('pqByteEncode', [
    'function ' +
      javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ +
      '(poly, d) {',
    '  let bits = [];',
    '  for (let i = 0; i < poly.length; i++) {',
    '    for (let bit = 0; bit < d; bit++) {',
    '      bits.push((poly[i] >> bit) & 1);',
    '    }',
    '  }',
    '  let numBytes = Math.ceil(bits.length / 8);',
    '  let result = new Uint8Array(numBytes);',
    '  for (let i = 0; i < numBytes; i++) {',
    '    let val = 0;',
    '    for (let bit = 0; bit < 8; bit++) {',
    '      let idx = i * 8 + bit;',
    '      if (idx < bits.length && bits[idx]) val |= (1 << bit);',
    '    }',
    '    result[i] = val;',
    '  }',
    '  return result;',
    '}',
  ]);

  const funcName = javascriptGenerator.provideFunction_('vecCompressEncode', [
    'function ' +
      javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ +
      '(u, d, q) {',
    '  let out = new Uint8Array(0);',
    '  for (let i = 0; i < u.length; i++) {',
    '    let comp = ' + compressFn + '(u[i], d, q);',
    '    let enc = ' + encodeFn + '(comp, d);',
    '    let tmp = new Uint8Array(out.length + enc.length);',
    '    tmp.set(out, 0);',
    '    tmp.set(enc, out.length);',
    '    out = tmp;',
    '  }',
    '  return out;',
    '}',
  ]);

  return [`${funcName}(${u}, ${d}, ${modulus})`, Order.ATOMIC];
};

/** CBD-eta sampling followed by forward NTT, producing a length-k vector. */
javascriptGenerator.forBlock['pq_cbd_ntt_vec'] = function (
  block: Block,
): [string, number] {
  const seed =
    javascriptGenerator.valueToCode(block, 'SEED', Order.ATOMIC) || '[]';
  const k = block.getFieldValue('K') || '3';
  const eta = parseInt(block.getFieldValue('ETA') || '2');
  const modulus = block.getFieldValue('MODULUS') || '3329';

  const seedWithNonceFn = registerSeedWithNonce();
  const cbdFn = registerSampleCbdEta(eta);
  const nttFn = registerNtt();
  const funcName = javascriptGenerator.provideFunction_('cbdNttVecEta' + eta, [
    'function ' +
      javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ +
      '(seed, k, q) {',
    '  let vec = [];',
    '  for (let i = 0; i < k; i++) {',
    '    vec[i] = ' +
      nttFn +
      '(' +
      cbdFn +
      '(' +
      seedWithNonceFn +
      '(seed, i), q), q);',
    '  }',
    '  return vec;',
    '}',
  ]);

  return [`${funcName}(${seed}, ${k}, ${modulus})`, Order.ATOMIC];
};

/** Compute A^T * r̂, then perform INTT, add e1. */
javascriptGenerator.forBlock['pq_atr_intt_add_e1'] = function (
  block: Block,
): [string, number] {
  const a = javascriptGenerator.valueToCode(block, 'A', Order.ATOMIC) || '[]';
  const rhat =
    javascriptGenerator.valueToCode(block, 'RHAT', Order.ATOMIC) || '[]';
  const rseed =
    javascriptGenerator.valueToCode(block, 'RSEED', Order.ATOMIC) || '[]';
  const k = block.getFieldValue('K') || '3';
  const eta = parseInt(block.getFieldValue('ETA') || '2');
  const modulus = block.getFieldValue('MODULUS') || '3329';

  const seedWithNonceFn = registerSeedWithNonce();
  const cbdFn = registerSampleCbdEta(eta);
  const inttFn = registerIntt();
  const nttMulFn = registerNttMul();
  const polyAddFn = registerPolyAddModQ();
  const funcName = javascriptGenerator.provideFunction_(
    'atrInttAddE1Eta' + eta,
    [
      'function ' +
        javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ +
        '(A, rhat, rSeed, k, q) {',
      '  let u = [];',
      '  for (let i = 0; i < k; i++) {',
      '    let acc = new Array(256).fill(0);',
      '    for (let j = 0; j < k; j++) {',
      '      let prod = ' + nttMulFn + '(A[j][i], rhat[j], q);',
      '      for (let idx = 0; idx < prod.length; idx++) {',
      '        acc[idx] = (acc[idx] + prod[idx]) % q;',
      '      }',
      '    }',
      '    let e1 = ' + cbdFn + '(' + seedWithNonceFn + '(rSeed, k + i), q);',
      '    u[i] = ' + polyAddFn + '(' + inttFn + '(acc, q), e1, q);',
      '  }',
      '  return u;',
      '}',
    ],
  );

  return [
    `${funcName}(${a}, ${rhat}, ${rseed}, ${k}, ${modulus})`,
    Order.ATOMIC,
  ];
};

/** Compute T̂^T * r̂, then perform INTT, add e2 and μ. */
javascriptGenerator.forBlock['pq_tr_intt_add_e2_mu'] = function (
  block: Block,
): [string, number] {
  const that =
    javascriptGenerator.valueToCode(block, 'THAT', Order.ATOMIC) || '[]';
  const rhat =
    javascriptGenerator.valueToCode(block, 'RHAT', Order.ATOMIC) || '[]';
  const rseed =
    javascriptGenerator.valueToCode(block, 'RSEED', Order.ATOMIC) || '[]';
  const mu = javascriptGenerator.valueToCode(block, 'MU', Order.ATOMIC) || '[]';
  const k = block.getFieldValue('K') || '3';
  const eta = parseInt(block.getFieldValue('ETA') || '2');
  const modulus = block.getFieldValue('MODULUS') || '3329';

  const seedWithNonceFn = registerSeedWithNonce();
  const cbdFn = registerSampleCbdEta(eta);
  const inttFn = registerIntt();
  const nttMulFn = registerNttMul();
  const polyAddFn = registerPolyAddModQ();
  const funcName = javascriptGenerator.provideFunction_(
    'trInttAddE2MuEta' + eta,
    [
      'function ' +
        javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ +
        '(that, rhat, rSeed, mu, k, q) {',
      '  let acc = new Array(256).fill(0);',
      '  for (let j = 0; j < k; j++) {',
      '    let prod = ' + nttMulFn + '(that[j], rhat[j], q);',
      '    for (let idx = 0; idx < prod.length; idx++) {',
      '      acc[idx] = (acc[idx] + prod[idx]) % q;',
      '    }',
      '  }',
      '  let e2 = ' + cbdFn + '(' + seedWithNonceFn + '(rSeed, 2 * k), q);',
      '  let v = ' + inttFn + '(acc, q);',
      '  v = ' + polyAddFn + '(v, e2, q);',
      '  v = ' + polyAddFn + '(v, mu, q);',
      '  return v;',
      '}',
    ],
  );

  return [
    `${funcName}(${that}, ${rhat}, ${rseed}, ${mu}, ${k}, ${modulus})`,
    Order.ATOMIC,
  ];
};
