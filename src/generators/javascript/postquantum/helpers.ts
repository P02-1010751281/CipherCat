import { javascriptGenerator } from 'blockly/javascript';
import { registerKeccakF1600 } from '../hash/helpers';

export function registerSeedWithNonce(): string {
  return javascriptGenerator.provideFunction_('seedWithNonce', [
    'function ' +
      javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ +
      '(seed, nonce) {',
    '  if (typeof seed === "string") seed = new TextEncoder().encode(seed);',
    '  let result = new Uint8Array(seed.length + 1);',
    '  result.set(seed, 0);',
    '  result[seed.length] = nonce & 0xFF;',
    '  return result;',
    '}',
  ]);
}

export function registerPolyAddModQ(): string {
  return javascriptGenerator.provideFunction_('polyAddModQ', [
    'function ' +
      javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ +
      '(a, b, q) {',
    '  q = q || 3329;',
    '  let len = Math.min(a.length, b.length);',
    '  let res = new Array(len);',
    '  for (let i = 0; i < len; i++) {',
    '    res[i] = (a[i] + b[i]) % q;',
    '  }',
    '  return res;',
    '}',
  ]);
}

export function registerNtt(): string {
  const powModName = registerPowMod();
  return javascriptGenerator.provideFunction_('ntt', [
    'function ' +
      javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ +
      '(a, q, n) {',
    '  q = q || 3329; n = n || 256;',
    '  let gen = (q === 3329) ? 17 : 3;',
    '  let res = a.slice();',
    '  let len = res.length;',
    '  let brv = function(x, bits) {',
    '    let r = 0;',
    '    for (let i = 0; i < bits; i++) { r = (r << 1) | (x & 1); x >>= 1; }',
    '    return r;',
    '  };',
    '  let nbits = Math.log2(n);',
    '  let stride = len / 2;',
    '  let zz = 0;',
    '  while (stride >= 1) {',
    '    for (let start = 0; start < len; start += stride * 2) {',
    '      zz++;',
    '      let zp = ' + powModName + '(gen, brv(zz, nbits - 1), q);',
    '      for (let i = start; i < start + stride; i++) {',
    '        let u = res[i];',
    '        let t = (zp * res[i + stride]) % q;',
    '        res[i] = (u + t) % q;',
    '        res[i + stride] = (u - t + q) % q;',
    '      }',
    '    }',
    '    stride >>= 1;',
    '  }',
    '  return res;',
    '}',
  ]);
}

export function registerIntt(): string {
  const powModName = registerPowMod();
  return javascriptGenerator.provideFunction_('intt', [
    'function ' +
      javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ +
      '(a, q, n) {',
    '  q = q || 3329; n = n || 256;',
    '  let gen = (q === 3329) ? 17 : 3;',
    '  let res = a.slice();',
    '  let len = res.length;',
    '  let brv = function(x, bits) {',
    '    let r = 0;',
    '    for (let i = 0; i < bits; i++) { r = (r << 1) | (x & 1); x >>= 1; }',
    '    return r;',
    '  };',
    '  let nbits = Math.log2(n);',
    '  let stride = 1;',
    '  let zz = len / 2;',
    '  while (stride < len) {',
    '    for (let start = 0; start < len; start += stride * 2) {',
    '      zz--;',
    '      let zp = ' + powModName + '(gen, brv(zz, nbits - 1), q);',
    '      for (let i = start; i < start + stride; i++) {',
    '        let a_val = res[i];',
    '        let b_val = res[i + stride];',
    '        res[i] = (a_val + b_val) % q;',
    '        res[i + stride] = (zp * (b_val - a_val + q)) % q;',
    '      }',
    '    }',
    '    stride <<= 1;',
    '  }',
    '  let n_inv = 1;',
    '  let exp = q - 2;',
    '  let base = len;',
    '  while (exp > 0) {',
    '    if (exp & 1) n_inv = (n_inv * base) % q;',
    '    base = (base * base) % q;',
    '    exp >>= 1;',
    '  }',
    '  for (let i = 0; i < len; i++) res[i] = (res[i] * n_inv) % q;',
    '  return res;',
    '}',
  ]);
}

export function registerPowMod(): string {
  return javascriptGenerator.provideFunction_('powMod', [
    'function ' +
      javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ +
      '(base, exp, mod) {',
    '  let result = 1;',
    '  base = ((base % mod) + mod) % mod;',
    '  while (exp > 0) {',
    '    if (exp & 1) result = (result * base) % mod;',
    '    base = (base * base) % mod;',
    '    exp >>= 1;',
    '  }',
    '  return result;',
    '}',
  ]);
}

export function registerNttMul(): string {
  const powModName = registerPowMod();
  return javascriptGenerator.provideFunction_('nttMul', [
    'function ' +
      javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ +
      '(a, b, q) {',
    '  q = q || 3329;',
    '  let gen = (q === 3329) ? 17 : 3;',
    '  let len = Math.min(a.length, b.length);',
    '  let res = new Array(len);',
    '  let bits = Math.max(1, Math.floor(Math.log2(len)) - 1);',
    '  let brv = function(x, bits) {',
    '    let r = 0;',
    '    for (let i = 0; i < bits; i++) { r = (r << 1) | (x & 1); x >>= 1; }',
    '    return r;',
    '  };',
    '  let i = 0;',
    '  for (; i + 1 < len; i += 2) {',
    '    let z = ' + powModName + '(gen, 2 * brv(i >> 1, bits) + 1, q);',
    '    res[i] = (a[i] * b[i] + z * a[i + 1] * b[i + 1]) % q;',
    '    res[i + 1] = (a[i + 1] * b[i] + a[i] * b[i + 1]) % q;',
    '  }',
    '  if (i < len) res[i] = (a[i] * b[i]) % q;',
    '  return res;',
    '}',
  ]);
}

export function registerSampleCbdEta(eta: number): string {
  const keccakFName = registerKeccakF1600();

  const shake256Name = javascriptGenerator.provideFunction_('shake256once', [
    'function ' +
      javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ +
      '(inp, outBytes) {',
    '  if (typeof inp === "string") inp = new TextEncoder().encode(inp);',
    '  else if (Array.isArray(inp)) inp = Uint8Array.from(inp);',
    '  let rate = 136;',
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

  return javascriptGenerator.provideFunction_('sampleCbdEta' + eta, [
    'function ' +
      javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ +
      '(seed, q) {',
    '  q = q || 3329;',
    '  let eta = ' + eta + ';',
    '  let prfOut = ' + shake256Name + '(seed, 64 * eta);',
    '  let bit = function(pos) { return (prfOut[pos >> 3] >> (pos & 7)) & 1; };',
    '  let coeffs = new Array(256);',
    '  for (let i = 0; i < 256; i++) {',
    '    let a = 0;',
    '    let b = 0;',
    '    let base = 2 * i * eta;',
    '    for (let j = 0; j < eta; j++) {',
    '      a += bit(base + j);',
    '      b += bit(base + eta + j);',
    '    }',
    '    coeffs[i] = ((a - b) % q + q) % q;',
    '  }',
    '  return coeffs;',
    '}',
  ]);
}
