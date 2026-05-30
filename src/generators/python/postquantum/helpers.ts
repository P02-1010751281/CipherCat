import { pythonGenerator } from 'blockly/python';

export function registerSeedWithNonce(): string {
  return pythonGenerator.provideFunction_('seed_with_nonce', [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(seed, nonce):',
    '    if isinstance(seed, str):',
    '        seed = seed.encode("utf-8")',
    '    return bytes(seed) + bytes([nonce])',
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
    '                t = (zp * res[i + stride]) % q',
    '                res[i] = (res[i] + t) % q',
    '                res[i + stride] = (res[i] - t + q) % q',
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

export function registerSampleCbdEta(eta: number): string {
  const prfName = pythonGenerator.provideFunction_('PRF', [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(eta, s, b):',
    '    from Crypto.Hash import SHAKE256',
    '    return SHAKE256.new(s + bytes([b])).read(64 * eta)',
  ]);

  return pythonGenerator.provideFunction_('sample_poly_cbd_eta' + eta, [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(seed, q=3329):',
    '    eta = ' + eta,
    '    coeffs = [0] * 256',
    '    for nonce in range(256):',
    '        prf_out = ' + prfName + '(eta, seed, nonce)',
    '        c = 0',
    '        for k in range(eta):',
    '            a = prf_out[2 * k]',
    '            b = prf_out[2 * k + 1]',
    '            a_bits = bin(a).count("1")',
    '            b_bits = bin(b).count("1")',
    '            c += a_bits - b_bits',
    '        coeffs[nonce] = c % q',
    '    return coeffs',
  ]);
}