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

export function registerNtt(): string {
  return pythonGenerator.provideFunction_('ntt', [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(a, q=3329, n=256):',
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
    '    while stride >= 1:',
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
    '    stride = 1',
    '    zz = ln // 2',
    '    while stride < ln:',
    '        for start in range(0, ln, stride * 2):',
    '            zz -= 1',
    '            zp = pow(gen, _brv(zz, nbits - 1), q)',
    '            for i in range(start, start + stride):',
    '                a_val = res[i]',
    '                b_val = res[i + stride]',
    '                res[i] = (a_val + b_val) % q',
    '                res[i + stride] = (zp * (b_val - a_val + q)) % q',
    '        stride <<= 1',
    '    n_inv = pow(ln, q - 2, q)',
    '    res = [(v * n_inv) % q for v in res]',
    '    return res',
  ]);
}

export function registerNttMul(): string {
  return pythonGenerator.provideFunction_('ntt_mul', [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(a, b, q=3329):',
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
  return pythonGenerator.provideFunction_('sample_poly_cbd_eta' + eta, [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(seed, q=3329):',
    '    import hashlib',
    '    eta = ' + eta,
    '    if isinstance(seed, str):',
    '        seed = seed.encode("utf-8")',
    '    buf = hashlib.shake_256(bytes(seed)).digest(64 * eta)',
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
