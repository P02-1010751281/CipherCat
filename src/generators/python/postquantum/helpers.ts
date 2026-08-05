import { pythonGenerator } from 'blockly/python';

export function registerSeedWithNonce(): string {
  return pythonGenerator.provideFunction_('seed_with_nonce', [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(seed, nonce):',
    '    if isinstance(seed, str):',
    '        seed = seed.encode("utf-8")',
    '    return bytes(seed) + bytes([nonce & 0xFF])',
  ]);
}

export function registerPolyAddMod(): string {
  return pythonGenerator.provideFunction_('poly_add_mod', [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(a, b, q=3329):',
    '    return [(x + y) % q for x, y in zip(a, b)]',
  ]);
}




export function registerMatVecMul(): string {
  return pythonGenerator.provideFunction_('mat_vec_mul', [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(A, v, q=3329):',
    '    k = len(v)',
    '    return [sum(A[i * k + j] * v[j] for j in range(k)) % q for i in range(k)]',
  ]);
}
export function registerPolySubMod(): string {
  return pythonGenerator.provideFunction_('poly_sub_mod', [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(a, b, q=3329):',
    '    return [(x - y) % q for x, y in zip(a, b)]',
  ]);
}

export function registerNtt(): string {
  return pythonGenerator.provideFunction_('ntt', [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(a, q=3329, n=256):',
    '    if q == 8380417:',
    '        # ML-DSA (FIPS 204 §6.3.2): Cooley-Tukey 8 layers, ζ=1753 (2^32 mod q, 512th primitive root)',
    '        def _brv8(x):',
    '            r = 0',
    '            for _ in range(8):',
    '                r = (r << 1) | (x & 1)',
    '                x >>= 1',
    '            return r',
    '        zetas = [0] * 256',
    '        for k in range(1, 256):',
    '            zetas[k] = pow(1753, _brv8(k), q)',
    '        res = list(a)',
    '        m = 0',
    '        ln = 128',
    '        while ln >= 1:',
    '            start = 0',
    '            while start < 256:',
    '                m += 1',
    '                z = zetas[m]',
    '                for j in range(start, start + ln):',
    '                    t = (z * res[j + ln]) % q',
    '                    res[j + ln] = (res[j] - t) % q',
    '                    res[j] = (res[j] + t) % q',
    '                start += 2 * ln',
    '            ln //= 2',
    '        return res',
    '    gen = 17 if q == 3329 else 3',
    '    res = list(a)',
    '    ln = len(res)',
    '    def _brv(x, bits):',
    '        r = 0',
    '        for _ in range(bits):',
    '            r = (r << 1) | (x & 1)',
    '            x >>= 1',
    '        return r',
    '    nbits = n.bit_length() - 1',
    '    stride = ln // 2',
    '    zz = 0',
    '    while stride >= 2:  # log2(n)-1 layers; stride=1 not used in NTT domain',
    '        for start in range(0, ln, stride * 2):',
    '            zz += 1',
    '            zp = pow(gen, _brv(zz, nbits - 1), q)',
    '            for i in range(start, start + stride):',
    '                u = res[i]',
    '                t = (zp * res[i + stride]) % q',
    '                res[i] = (u + t) % q',
    '                res[i + stride] = (u - t + q) % q',
    '        stride >>= 1',
    '    return res',
  ]);
}

export function registerIntt(): string {
  return pythonGenerator.provideFunction_('intt', [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(a, q=3329, n=256):',
    '    if q == 8380417:',
    '        # ML-DSA (FIPS 204 §6.3.3): Gentleman-Sande 8 layers, -zetas[m], final × 256⁻¹',
    '        def _brv8(x):',
    '            r = 0',
    '            for _ in range(8):',
    '                r = (r << 1) | (x & 1)',
    '                x >>= 1',
    '            return r',
    '        zetas = [0] * 256',
    '        for k in range(1, 256):',
    '            zetas[k] = pow(1753, _brv8(k), q)',
    '        res = list(a)',
    '        m = 256',
    '        ln = 1',
    '        while ln < 256:',
    '            start = 0',
    '            while start < 256:',
    '                m -= 1',
    '                z = (-zetas[m]) % q',
    '                for j in range(start, start + ln):',
    '                    t = res[j]',
    '                    res[j] = (t + res[j + ln]) % q',
    '                    res[j + ln] = (t - res[j + ln]) % q',
    '                    res[j + ln] = (z * res[j + ln]) % q',
    '                start += 2 * ln',
    '            ln *= 2',
    '        res = [(v * 8347681) % q for v in res]  # 256⁻¹ mod 8380417',
    '        return res',
    '    gen = 17 if q == 3329 else 3',
    '    res = list(a)',
    '    ln = len(res)',
    '    def _brv(x, bits):',
    '        r = 0',
    '        for _ in range(bits):',
    '            r = (r << 1) | (x & 1)',
    '            x >>= 1',
    '        return r',
    '    nbits = n.bit_length() - 1',
    '    stride = 2',
    '    zz = ln // 2',
    '    while stride <= ln // 2:',
    '        for start in range(0, ln, stride * 2):',
    '            zz -= 1',
    '            zp = pow(gen, _brv(zz, nbits - 1), q)',
    '            for i in range(start, start + stride):',
    '                a_val = res[i]',
    '                b_val = res[i + stride]',
    '                res[i] = (a_val + b_val) % q',
    '                res[i + stride] = (zp * (b_val - a_val + q)) % q',
    '        stride <<= 1',
    '    n_inv = pow(ln // 2, q - 2, q)',
    '    res = [(v * n_inv) % q for v in res]',
    '    return res',
  ]);
}

export function registerNttMul(): string {
  return pythonGenerator.provideFunction_('ntt_mul', [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(a, b, q=3329):',
    '    if q == 8380417:',
    '        # ML-DSA (FIPS 204 §6.3.4): pointwise multiplication of NTT-domain polynomials',
    '        return [(a[i] * b[i]) % q for i in range(256)]',
    '    gen = 17 if q == 3329 else 3',
    '    n = min(len(a), len(b))',
    '    res = [0] * n',
    '    def _brv(x, bits):',
    '        r = 0',
    '        for _ in range(bits):',
    '            r = (r << 1) | (x & 1)',
    '            x >>= 1',
    '        return r',
    '    bits = max(1, n.bit_length() - 2)',
    '    i = 0',
    '    while i + 1 < n:',
    '        z = pow(gen, 2 * _brv(i // 2, bits) + 1, q)',
    '        res[i] = (a[i] * b[i] + z * a[i + 1] * b[i + 1]) % q',
    '        res[i + 1] = (a[i + 1] * b[i] + a[i] * b[i + 1]) % q',
    '        i += 2',
    '    if i < n:',
    '        res[i] = (a[i] * b[i]) % q',
    '    return res',
  ]);
}

export function registerSampleCbdEta(eta: number): string {
  // FIPS 203 Alg 8：SamplePolyCBD_η 直接消费 PRF 输出（64η 字节），不做二次哈希
  return pythonGenerator.provideFunction_('sample_poly_cbd_eta' + eta, [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(prf_out, q=3329):',
    '    eta = ' + eta,
    '    if isinstance(prf_out, str):',
    '        prf_out = prf_out.encode("utf-8")',
    '    buf = bytes(prf_out)',
    '    def _bit(pos):',
    '        return (buf[pos // 8] >> (pos % 8)) & 1',
    '    coeffs = [0] * 256',
    '    for i in range(256):',
    '        base = 2 * i * eta',
    '        a = sum(_bit(base + j) for j in range(eta))',
    '        b = sum(_bit(base + eta + j) for j in range(eta))',
    '        coeffs[i] = (a - b) % q',
    '    return coeffs',
  ]);
}
