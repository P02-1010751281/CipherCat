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
    '  if (a.length !== 256 || b.length !== 256) throw new RangeError("R_q polynomial addition requires 256 coefficients");',
    '  let res = new Array(256);',
    '  for (let i = 0; i < 256; i++) {',
    '    if (!Number.isSafeInteger(a[i]) || !Number.isSafeInteger(b[i])) throw new TypeError("polynomial coefficients must be safe integers");',
    '    const left = ((a[i] % q) + q) % q;',
    '    const right = ((b[i] % q) + q) % q;',
    '    res[i] = (left + right) % q;',
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
    '  q = q === undefined ? 3329 : q;',
    '  if (!Array.isArray(A) || !Array.isArray(v)) throw new TypeError("matrix and vector must be arrays");',
    '  if (q !== 3329 && q !== 8380417) throw new RangeError("unsupported matrix-vector modulus");',
    '  let k = v.length;',
    '  if (A.length !== k * k) throw new RangeError("matrix must contain k squared entries");',
    '  for (let i = 0; i < A.length; i++) if (!Number.isSafeInteger(A[i])) throw new TypeError("matrix entries must be safe integers");',
    '  for (let i = 0; i < v.length; i++) if (!Number.isSafeInteger(v[i])) throw new TypeError("vector entries must be safe integers");',
    '  let res = new Array(k).fill(0);',
    '  for (let i = 0; i < k; i++) {',
    '    for (let j = 0; j < k; j++) {',
    '      const matrixEntry = ((A[i * k + j] % q) + q) % q;',
    '      const vectorEntry = ((v[j] % q) + q) % q;',
    '      res[i] = (res[i] + matrixEntry * vectorEntry) % q;',
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
    '  if (a.length !== 256 || b.length !== 256) throw new RangeError("R_q polynomial subtraction requires 256 coefficients");',
    '  let res = new Array(256);',
    '  for (let i = 0; i < 256; i++) {',
    '    if (!Number.isSafeInteger(a[i]) || !Number.isSafeInteger(b[i])) throw new TypeError("polynomial coefficients must be safe integers");',
    '    const left = ((a[i] % q) + q) % q;',
    '    const right = ((b[i] % q) + q) % q;',
    '    res[i] = (left - right + q) % q;',
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
    '  if (n !== 256 || a.length !== 256) throw new RangeError("NTT requires n=256 and 256 coefficients");',
    '  if (Array.from(a).some(value => !Number.isSafeInteger(value))) throw new TypeError("NTT input coefficients must be safe integers");',
    '  a = Array.from(a, value => ((value % q) + q) % q);',
    '  if (q === 12289) {',
    '    var root = ' + powModName + '(11, 48, q), teaching = a.slice(), j = 0;',
    '    for (var i = 1; i < 256; i++) { var bit = 128; while (j & bit) { j ^= bit; bit >>= 1; } j ^= bit; if (i < j) { var swap = teaching[i]; teaching[i] = teaching[j]; teaching[j] = swap; } }',
    '    for (var size = 2; size <= 256; size *= 2) {',
    '      var rootStep = ' + powModName + '(root, 256 / size, q), half = size / 2;',
    '      for (var start = 0; start < 256; start += size) {',
    '        var w = 1;',
    '        for (var offset = 0; offset < half; offset++) { var u = teaching[start + offset], t = w * teaching[start + offset + half] % q; teaching[start + offset] = (u + t) % q; teaching[start + offset + half] = (u - t + q) % q; w = w * rootStep % q; }',
    '      }',
    '    }',
    '    return teaching;',
    '  }',
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
    '  if (n !== 256 || a.length !== 256) throw new RangeError("INTT requires n=256 and 256 coefficients");',
    '  if (Array.from(a).some(value => !Number.isSafeInteger(value))) throw new TypeError("NTT input coefficients must be safe integers");',
    '  a = Array.from(a, value => ((value % q) + q) % q);',
    '  if (q === 12289) {',
    '    var root = ' + powModName + '(11, 48, q), inverseRoot = ' + powModName + '(root, q - 2, q), teaching = a.slice(), j = 0;',
    '    for (var i = 1; i < 256; i++) { var bit = 128; while (j & bit) { j ^= bit; bit >>= 1; } j ^= bit; if (i < j) { var swap = teaching[i]; teaching[i] = teaching[j]; teaching[j] = swap; } }',
    '    for (var size = 2; size <= 256; size *= 2) {',
    '      var rootStep = ' + powModName + '(inverseRoot, 256 / size, q), half = size / 2;',
    '      for (var start = 0; start < 256; start += size) {',
    '        var w = 1;',
    '        for (var offset = 0; offset < half; offset++) { var u = teaching[start + offset], t = w * teaching[start + offset + half] % q; teaching[start + offset] = (u + t) % q; teaching[start + offset + half] = (u - t + q) % q; w = w * rootStep % q; }',
    '      }',
    '    }',
    '    var inverseLength = ' + powModName + '(256, q - 2, q);',
    '    return teaching.map(function (value) { return value * inverseLength % q; });',
    '  }',
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
    '  if (a.length !== 256 || b.length !== 256) throw new RangeError("NTT multiplication requires 256 coefficients");',
    '  const normalize = values => Array.from(values, value => {',
    '    if (!Number.isSafeInteger(value)) throw new TypeError("NTT multiplication coefficients must be safe integers");',
    '    return ((value % q) + q) % q;',
    '  });',
    '  a = normalize(a); b = normalize(b);',
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
