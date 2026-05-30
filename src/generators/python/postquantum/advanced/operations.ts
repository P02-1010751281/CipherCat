import { pythonGenerator, Order } from 'blockly/python';
import type { Block } from 'blockly/core';
import { registerBytesConcat, registerBytesSlice } from '../../data/helpers';
import { registerSeedWithNonce, registerPolyAddMod, registerNtt, registerIntt, registerSampleCbdEta } from '../helpers';

/** Generate k×k NTT matrix A from a seed using XOF-based rejection sampling. */
pythonGenerator.forBlock['pq_sample_ntt_mat'] = function(block: Block): [string, number] {
  const seed = pythonGenerator.valueToCode(block, 'SEED', Order.ATOMIC) || 'b""';
  const k = block.getFieldValue('K') || '3';
  const modulus = block.getFieldValue('MODULUS') || '3329';

  const sampleNttFn = pythonGenerator.provideFunction_('sample_ntt', [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(seed, q=3329):',
    '    from Crypto.Hash import SHAKE128',
    '    coeffs = []',
    '    xof = SHAKE128.new(seed)',
    '    while len(coeffs) < 256:',
    '        buf = xof.read(3)',
    '        d1 = buf[0]',
    '        d2 = buf[1]',
    '        c = (d1 | ((d2 & 0x0F) << 8)) & 0xFFF',
    '        if c < q:',
    '            coeffs.append(c)',
    '    return coeffs',
  ]);

  const funcName = pythonGenerator.provideFunction_('sample_ntt_mat', [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(seed, k, q=3329):',
    '    A = [[None] * k for _ in range(k)]',
    '    for i in range(k):',
    '        for j in range(k):',
    '            A[i][j] = ' + sampleNttFn + '(seed + bytes([i]) + bytes([j]), q)',
    '    return A',
  ]);

  return [funcName + '(' + seed + ', ' + k + ', q=' + modulus + ')', Order.ATOMIC];
};

/** CBD-eta sampling followed by forward NTT, producing a length-k vector. */
pythonGenerator.forBlock['pq_cbd_ntt_vec'] = function(block: Block): [string, number] {
  const seed = pythonGenerator.valueToCode(block, 'SEED', Order.ATOMIC) || 'b""';
  const k = block.getFieldValue('K') || '3';
  const eta = parseInt(block.getFieldValue('ETA') || '2');
  const modulus = block.getFieldValue('MODULUS') || '3329';

  const seedWithNonceFn = registerSeedWithNonce();
  const cbdFn = registerSampleCbdEta(eta);
  const nttFn = registerNtt();

  const funcName = pythonGenerator.provideFunction_('cbd_ntt_vec', [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(seed, k, eta, q=3329):',
    '    vec = [None] * k',
    '    for i in range(k):',
    '        f = ' + cbdFn + '(' + seedWithNonceFn + '(seed, i), q)',
    '        vec[i] = ' + nttFn + '(f, q)',
    '    return vec',
  ]);

  return [funcName + '(' + seed + ', ' + k + ', ' + eta + ', q=' + modulus + ')', Order.ATOMIC];
};

/** Compute A^T * r̂, then perform INTT, add e1 (ML-KEM encapsulation). */
pythonGenerator.forBlock['pq_atr_intt_add_e1'] = function(block: Block): [string, number] {
  const a = pythonGenerator.valueToCode(block, 'A', Order.ATOMIC) || '[]';
  const rhat = pythonGenerator.valueToCode(block, 'RHAT', Order.ATOMIC) || '[]';
  const rseed = pythonGenerator.valueToCode(block, 'RSEED', Order.ATOMIC) || 'b""';
  const k = block.getFieldValue('K') || '3';
  const eta = parseInt(block.getFieldValue('ETA') || '2');
  const modulus = block.getFieldValue('MODULUS') || '3329';

  const seedWithNonceFn = registerSeedWithNonce();
  const cbdFn = registerSampleCbdEta(eta);
  const inttFn = registerIntt();
  const polyAddFn = registerPolyAddMod();

  const funcName = pythonGenerator.provideFunction_('atr_intt_add_e1', [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(A, rhat, r_seed, k, eta, q=3329):',
    '    u = [None] * k',
    '    for i in range(k):',
    '        acc = [0] * 256',
    '        for j in range(k):',
    '            for idx in range(256):',
    '                acc[idx] = (acc[idx] + A[j][i][idx] * rhat[j][idx]) % q',
    '        e1 = ' + cbdFn + '(' + seedWithNonceFn + '(r_seed, k + i), q)',
    '        u[i] = ' + polyAddFn + '(' + inttFn + '(acc, q), e1, q)',
    '    return u',
  ]);

  return [funcName + '(' + a + ', ' + rhat + ', ' + rseed + ', ' + k + ', ' + eta + ', q=' + modulus + ')', Order.ATOMIC];
};

/** Compute T̂^T * r̂, then perform INTT, add e2 and mu (final ML-KEM encapsulation step). */
pythonGenerator.forBlock['pq_tr_intt_add_e2_mu'] = function(block: Block): [string, number] {
  const that = pythonGenerator.valueToCode(block, 'THAT', Order.ATOMIC) || '[]';
  const rhat = pythonGenerator.valueToCode(block, 'RHAT', Order.ATOMIC) || '[]';
  const rseed = pythonGenerator.valueToCode(block, 'RSEED', Order.ATOMIC) || 'b""';
  const mu = pythonGenerator.valueToCode(block, 'MU', Order.ATOMIC) || '[]';
  const k = block.getFieldValue('K') || '3';
  const eta = parseInt(block.getFieldValue('ETA') || '2');
  const modulus = block.getFieldValue('MODULUS') || '3329';

  const seedWithNonceFn = registerSeedWithNonce();
  const cbdFn = registerSampleCbdEta(eta);
  const inttFn = registerIntt();
  const polyAddFn = registerPolyAddMod();

  const funcName = pythonGenerator.provideFunction_('tr_intt_add_e2_mu', [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(that, rhat, r_seed, mu, k, eta, q=3329):',
    '    acc = [0] * 256',
    '    for j in range(k):',
    '        for idx in range(256):',
    '            acc[idx] = (acc[idx] + that[j][idx] * rhat[j][idx]) % q',
    '    e2 = ' + cbdFn + '(' + seedWithNonceFn + '(r_seed, 2 * k), q)',
    '    v = ' + inttFn + '(acc, q)',
    '    v = ' + polyAddFn + '(v, e2, q)',
    '    v = ' + polyAddFn + '(v, mu, q)',
    '    return v',
  ]);

  return [funcName + '(' + that + ', ' + rhat + ', ' + rseed + ', ' + mu + ', ' + k + ', ' + eta + ', q=' + modulus + ')', Order.ATOMIC];
};

pythonGenerator.forBlock['pq_build_vec3'] = function(block: Block): [string, number] {
  const a = pythonGenerator.valueToCode(block, 'A', Order.ATOMIC) || 'None';
  const b = pythonGenerator.valueToCode(block, 'B', Order.ATOMIC) || 'None';
  const c = pythonGenerator.valueToCode(block, 'C', Order.ATOMIC) || 'None';
  return ['[' + a + ', ' + b + ', ' + c + ']', Order.ATOMIC];
};

pythonGenerator.forBlock['pq_vec_compress_encode'] = function(block: Block): [string, number] {
  const u = pythonGenerator.valueToCode(block, 'U', Order.ATOMIC) || '[]';
  const d = parseInt(block.getFieldValue('BITS') || '10');
  const modulus = block.getFieldValue('MODULUS') || '3329';

  const compressFn = pythonGenerator.provideFunction_('compress_d' + d, [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(x, q=3329):',
    '    d = ' + d,
    '    pow2d = 1 << d',
    '    mask = pow2d - 1',
    '    if isinstance(x, (list, tuple)):',
    '        return [((xi * pow2d + q // 2) // q) & mask for xi in x]',
    '    return ((x * pow2d + q // 2) // q) & mask',
  ]);

  const encodeFn = pythonGenerator.provideFunction_('byte_encode_d' + d, [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(poly, q=3329):',
    '    d = ' + d,
    '    bits = []',
    '    for coeff in poly:',
    '        for bit in range(d):',
    '            bits.append((coeff >> bit) & 1)',
    '    num_bytes = (len(bits) + 7) // 8',
    '    result = bytearray(num_bytes)',
    '    for i in range(num_bytes):',
    '        val = 0',
    '        for bit in range(8):',
    '            idx = i * 8 + bit',
    '            if idx < len(bits) and bits[idx]:',
    '                val |= (1 << bit)',
    '        result[i] = val',
    '    return bytes(result)',
  ]);

  const funcName = pythonGenerator.provideFunction_('vec_compress_encode', [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(u, d, q=3329):',
    '    parts = []',
    '    for ui in u:',
    '        comp = ' + compressFn + '(ui, q)',
    '        parts.append(' + encodeFn + '(comp))',
    '    return b"".join(parts)',
  ]);

  return [funcName + '(' + u + ', ' + d + ', q=' + modulus + ')', Order.ATOMIC];
};
