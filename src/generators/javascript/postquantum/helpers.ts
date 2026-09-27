import { javascriptGenerator } from 'blockly/javascript';

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




export function registerMatVecMulQ(): string {
  return javascriptGenerator.provideFunction_('matVecMulQ', [
    'function ' +
      javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ +
      '(A, v, q) {',
    '  q = q || 3329;',
    '  let k = v.length;',
    '  let res = new Array(k).fill(0);',
    '  for (let i = 0; i < k; i++) {',
    '    for (let j = 0; j < k; j++) {',
    '      res[i] = (res[i] + A[i * k + j] * v[j]) % q;',
    '    }',
    '  }',
    '  return res;',
    '}',
  ]);
}
export function registerPolySubModQ(): string {
  return javascriptGenerator.provideFunction_('polySubModQ', [
    'function ' +
      javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ +
      '(a, b, q) {',
    '  q = q || 3329;',
    '  let len = Math.min(a.length, b.length);',
    '  let res = new Array(len);',
    '  for (let i = 0; i < len; i++) {',
    '    res[i] = ((a[i] - b[i]) % q + q) % q;',
    '  }',
    '  return res;',
    '}',
  ]);
}

export function registerNtt(): string {
  const powModName = registerPowMod();
  const bitRevName = registerBitRev();
  return javascriptGenerator.provideFunction_('ntt', [
    'function ' +
      javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ +
      '(a, q, n) {',
    '  q = q || 3329; n = n || 256;',
    '  if (q === 8380417) {',
    '    // ML-DSA (FIPS 204 §6.3.2): Cooley-Tukey 8 layers, ζ=1753 (2^32 mod q, 512th primitive root)',
    '    let zetas = new Array(256).fill(0);',
    '    for (let k = 1; k < 256; k++) zetas[k] = ' + powModName + '(1753, ' + bitRevName + '(k, 8), q);',
    '    let res = a.slice();',
    '    let m = 0;',
    '    let len = 128;',
    '    while (len >= 1) {',
    '      let start = 0;',
    '      while (start < 256) {',
    '        m += 1;',
    '        let z = zetas[m];',
    '        for (let j = start; j < start + len; j++) {',
    '          let t = (z * res[j + len]) % q;',
    '          res[j + len] = (((res[j] - t) % q) + q) % q;',
    '          res[j] = (res[j] + t) % q;',
    '        }',
    '        start += 2 * len;',
    '      }',
    '      len = Math.floor(len / 2);',
    '    }',
    '    return res;',
    '  }',
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
    '  while (stride >= 2) {',
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
  const bitRevName = registerBitRev();
  return javascriptGenerator.provideFunction_('intt', [
    'function ' +
      javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ +
      '(a, q, n) {',
    '  q = q || 3329; n = n || 256;',
    '  if (q === 8380417) {',
    '    // ML-DSA (FIPS 204 §6.3.3): Gentleman-Sande 8 layers, -zetas[m], final × 256⁻¹',
    '    let zetas = new Array(256).fill(0);',
    '    for (let k = 1; k < 256; k++) zetas[k] = ' + powModName + '(1753, ' + bitRevName + '(k, 8), q);',
    '    let res = a.slice();',
    '    let m = 256;',
    '    let len = 1;',
    '    while (len < 256) {',
    '      let start = 0;',
    '      while (start < 256) {',
    '        m -= 1;',
    '        let z = (q - zetas[m]) % q;',
    '        for (let j = start; j < start + len; j++) {',
    '          let t = res[j];',
    '          res[j] = (t + res[j + len]) % q;',
    '          res[j + len] = (t - res[j + len] + q) % q;',
    '          res[j + len] = (z * res[j + len]) % q;',
    '        }',
    '        start += 2 * len;',
    '      }',
    '      len *= 2;',
    '    }',
    '    let finv = 8347681; // 256⁻¹ mod 8380417',
    '    for (let j = 0; j < 256; j++) res[j] = (res[j] * finv) % q;',
    '    return res;',
    '  }',
    '  let gen = (q === 3329) ? 17 : 3;',
    '  let res = a.slice();',
    '  let len = res.length;',
    '  let brv = function(x, bits) {',
    '    let r = 0;',
    '    for (let i = 0; i < bits; i++) { r = (r << 1) | (x & 1); x >>= 1; }',
    '    return r;',
    '  };',
    '  let nbits = Math.log2(n);',
    '  let stride = 2;',
    '  let zz = len / 2;',
    '  while (stride <= len / 2) {',
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
    '  let base = len / 2;',
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

export function registerBitRev(): string {
  return javascriptGenerator.provideFunction_('bitRev8', [
    'function ' +
      javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ +
      '(x, bits) {',
    '  let r = 0;',
    '  for (let i = 0; i < bits; i++) { r = (r << 1) | (x & 1); x >>= 1; }',
    '  return r;',
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
    '  if (q === 8380417) {',
    '    // ML-DSA (FIPS 204 §6.3.4): pointwise multiplication of NTT-domain polynomials',
    '    let res = new Array(256);',
    '    for (let i = 0; i < 256; i++) res[i] = (a[i] * b[i]) % q;',
    '    return res;',
    '  }',
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
  // FIPS 203 Alg 8：SamplePolyCBD_η 直接消费 PRF 输出（64η 字节），不做二次哈希
  return javascriptGenerator.provideFunction_('sampleCbdEta' + eta, [
    'function ' +
      javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ +
      '(prfOut, q) {',
    '  q = q || 3329;',
    '  let eta = ' + eta + ';',
    '  if (typeof prfOut === "string") prfOut = new TextEncoder().encode(prfOut);',
    '  else if (Array.isArray(prfOut)) prfOut = Uint8Array.from(prfOut);',
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
