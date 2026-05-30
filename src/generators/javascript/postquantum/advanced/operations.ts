/**
 * ML-KEM 辅助运算 JavaScript 代码生成器 — 后量子高级块
 *
 * 参考: FIPS 203 — https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.203.pdf
 */
import { javascriptGenerator, Order } from 'blockly/javascript';
import type { Block } from 'blockly/core';
import { registerBytesConcat, registerBytesSlice } from '../../data/helpers';
import { registerKeccakF1600 } from '../../hash/helpers';
import { registerSeedWithNonce, registerPolyAddModQ, registerNtt, registerIntt, registerSampleCbdEta } from '../helpers';

/**
 * Generate k×k NTT matrix A from a seed using XOF-based rejection sampling.
 */
javascriptGenerator.forBlock['pq_sample_ntt_mat'] = function(block: Block): [string, number] {
  const seed = javascriptGenerator.valueToCode(block, 'SEED', Order.ATOMIC) || '[]';
  const k = block.getFieldValue('K') || '3';
  const modulus = block.getFieldValue('MODULUS') || '3329';
  const outVar = javascriptGenerator.nameDB_?.getName(block.type, 'VARIABLE') || 'ntt_mat';

  const seedWithNonceFn = registerSeedWithNonce();

  const keccakFName = registerKeccakF1600();

  const shakeName = javascriptGenerator.provideFunction_('shake128once', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(inp, outBytes) {',
    '  let rate = 168;',
    '  let capacity = 32;',
    '  let width = rate + capacity;',
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

  const sampleNttFn = javascriptGenerator.provideFunction_('sampleNtt', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(seed, q) {',
    '  q = q || 3329;',
    '  let coeffs = [];',
    '  let buf = ' + shakeName + '(seed, 1200);',
    '  let pos = 0;',
    '  while (coeffs.length < 256 && pos + 3 <= buf.length) {',
    '    let d1 = buf[pos] | 0;',
    '    let d2 = buf[pos + 1] | 0;',
    '    let c = (d1 | ((d2 & 0x0F) << 8)) & 0xFFF;',
    '    pos += 3;',
    '    if (c < q) coeffs.push(c);',
    '  }',
    '  return coeffs;',
    '}',
  ]);

  const code = [];
  code.push(`let ${outVar} = [];`);
  code.push(`for (let _i = 0; _i < ${k}; _i++) {`);
  code.push(`  ${outVar}[_i] = [];`);
  code.push(`  for (let _j = 0; _j < ${k}; _j++) {`);
  code.push(`    ${outVar}[_i][_j] = ${sampleNttFn}(${seedWithNonceFn}(${seedWithNonceFn}(${seed}, _i), _j), ${modulus});`);
  code.push('  }');
  code.push('}');
  code.push('');

  return [code.join('\n'), Order.NONE];
};

javascriptGenerator.forBlock['pq_build_vec3'] = function(block: Block): [string, number] {
  const a = javascriptGenerator.valueToCode(block, 'A', Order.ATOMIC) || 'null';
  const b = javascriptGenerator.valueToCode(block, 'B', Order.ATOMIC) || 'null';
  const c = javascriptGenerator.valueToCode(block, 'C', Order.ATOMIC) || 'null';
  return ['[' + a + ', ' + b + ', ' + c + ']', Order.ATOMIC];
};

javascriptGenerator.forBlock['pq_vec_compress_encode'] = function(block: Block): [string, number] {
  const u = javascriptGenerator.valueToCode(block, 'U', Order.ATOMIC) || '[]';
  const d = block.getFieldValue('BITS') || '10';
  const modulus = block.getFieldValue('MODULUS') || '3329';
  const outVar = javascriptGenerator.nameDB_?.getName(block.type, 'VARIABLE') || 'c1_bytes';

  const compressFn = javascriptGenerator.provideFunction_('pqCompress', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(x, d, q) {',
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
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(poly, d) {',
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

  const code = [];
  code.push(`let ${outVar} = new Uint8Array(0);`);
  code.push(`for (let _i = 0; _i < ${u}.length; _i++) {`);
  code.push(`  let comp = ${compressFn}(${u}[_i], ${d}, ${modulus});`);
  code.push(`  let enc = ${encodeFn}(comp, ${d});`);
  code.push(`  let tmp = new Uint8Array(${outVar}.length + enc.length);`);
  code.push(`  tmp.set(${outVar}, 0);`);
  code.push(`  tmp.set(enc, ${outVar}.length);`);
  code.push(`  ${outVar} = tmp;`);
  code.push('}');
  code.push('');

  return [code.join('\n'), Order.NONE];
};

/**
 * CBD-eta sampling followed by forward NTT, producing a length-k vector.
 */
javascriptGenerator.forBlock['pq_cbd_ntt_vec'] = function(block: Block): [string, number] {
  const seed = javascriptGenerator.valueToCode(block, 'SEED', Order.ATOMIC) || '[]';
  const k = block.getFieldValue('K') || '3';
  const eta = parseInt(block.getFieldValue('ETA') || '2');
  const modulus = block.getFieldValue('MODULUS') || '3329';
  const outVar = javascriptGenerator.nameDB_?.getName(block.type, 'VARIABLE') || 'cbd_ntt_vec';

  const seedWithNonceFn = registerSeedWithNonce();
  const cbdFn = registerSampleCbdEta(eta);
  const nttFn = registerNtt();

  const code = [];
  code.push(`let ${outVar} = [];`);
  code.push(`for (let _i = 0; _i < ${k}; _i++) {`);
  code.push(`  ${outVar}[_i] = ${nttFn}(${cbdFn}(${seedWithNonceFn}(${seed}, _i), ${modulus}), ${modulus});`);
  code.push('}');
  code.push('');

  return [code.join('\n'), Order.NONE];
};

/**
 * Compute A^T * r̂, then perform INTT, add e1.
 * Part of ML-KEM encapsulation.
 */
javascriptGenerator.forBlock['pq_atr_intt_add_e1'] = function(block: Block): [string, number] {
  const a = javascriptGenerator.valueToCode(block, 'A', Order.ATOMIC) || '[]';
  const rhat = javascriptGenerator.valueToCode(block, 'RHAT', Order.ATOMIC) || '[]';
  const rseed = javascriptGenerator.valueToCode(block, 'RSEED', Order.ATOMIC) || '[]';
  const k = block.getFieldValue('K') || '3';
  const eta = parseInt(block.getFieldValue('ETA') || '2');
  const modulus = block.getFieldValue('MODULUS') || '3329';
  const outVar = javascriptGenerator.nameDB_?.getName(block.type, 'VARIABLE') || 'atr_result';

  const seedWithNonceFn = registerSeedWithNonce();
  const cbdFn = registerSampleCbdEta(eta);
  const inttFn = registerIntt();
  const polyAddFn = registerPolyAddModQ();

  const code = [];
  code.push(`let ${outVar} = [];`);
  code.push(`for (let _i = 0; _i < ${k}; _i++) {`);
  code.push('  let row = [];');
  code.push(`  for (let _j = 0; _j < ${k}; _j++) {`);
  code.push(`    row[_j] = ${a}[_i][_j];`);
  code.push('  }');
  code.push(`  let e1 = ${cbdFn}(${seedWithNonceFn}(${seedWithNonceFn}(${rseed}, _i), 0), ${modulus});`);
  code.push(`  let rH = ${rhat}[_i];`);
  code.push(`  let rHintt = ${inttFn}(rH, ${modulus});`);
  code.push(`  ${outVar}[_i] = ${polyAddFn}(row, ${polyAddFn}(e1, rHintt, ${modulus}), ${modulus});`);
  code.push('}');
  code.push('');

  return [code.join('\n'), Order.NONE];
};

/**
 * Compute T̂^T * r̂, then perform INTT, add e2 and μ.
 * Final step of ML-KEM encapsulation.
 */
javascriptGenerator.forBlock['pq_tr_intt_add_e2_mu'] = function(block: Block): [string, number] {
  const that = javascriptGenerator.valueToCode(block, 'THAT', Order.ATOMIC) || '[]';
  const rH = javascriptGenerator.valueToCode(block, 'RHAT', Order.ATOMIC) || '[]';
  const rseed = javascriptGenerator.valueToCode(block, 'RSEED', Order.ATOMIC) || '[]';
  const k = block.getFieldValue('K') || '3';
  const eta = parseInt(block.getFieldValue('ETA') || '2');
  const modulus = block.getFieldValue('MODULUS') || '3329';
  const outVar = javascriptGenerator.nameDB_?.getName(block.type, 'VARIABLE') || 'tr_result';

  const seedWithNonceFn = registerSeedWithNonce();
  const cbdFn = registerSampleCbdEta(eta);
  const inttFn = registerIntt();
  const polyAddFn = registerPolyAddModQ();

  const code = [];
  code.push(`let ${outVar} = [];`);
  code.push(`for (let _i = 0; _i < ${k}; _i++) {`);
  code.push('  let row = [];');
  code.push(`  for (let _j = 0; _j < ${k}; _j++) {`);
  code.push(`    row[_j] = ${that}[_j][_i];`);
  code.push('  }');
  code.push(`  let e2 = ${cbdFn}(${seedWithNonceFn}(${seedWithNonceFn}(${rseed}, _i), 1), ${modulus});`);
  code.push(`  let rHintt = ${inttFn}(${rH}[_i], ${modulus});`);
  code.push(`  ${outVar}[_i] = ${polyAddFn}(row, ${polyAddFn}(e2, rHintt, ${modulus}), ${modulus});`);
  code.push('}');
  code.push('');

  return [code.join('\n'), Order.NONE];
};
