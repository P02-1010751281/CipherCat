/**
 * ML-KEM 多项式采样 Python 代码生成器 — 后量子高级块
 *
 * 参考: FIPS 203 — https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.203.pdf
 */
import { pythonGenerator, Order } from 'blockly/python';
import type { Block } from 'blockly/core';

// SampleNTT (Algorithm 7): 使用 XOF (SHAKE128) 采样 NTT 域多项式
pythonGenerator.forBlock['pq_sample_ntt'] = function(block: Block): [string, number] {
  const seed = pythonGenerator.valueToCode(block, 'SEED', Order.ATOMIC) || 'seed';
  const modulus = block.getFieldValue('MODULUS') || '3329';

  const funcName = pythonGenerator.provideFunction_('sample_ntt', [
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
  return [funcName + '(' + seed + ', q=' + modulus + ')', Order.ATOMIC];
};

// SamplePolyCBD_eta (Algorithm 8): 从 CBD_eta 分布采样多项式
pythonGenerator.forBlock['pq_sample_poly_cbd'] = function(block: Block): [string, number] {
  const seed = pythonGenerator.valueToCode(block, 'SEED', Order.ATOMIC) || 'seed';
  const eta = parseInt(block.getFieldValue('ETA') || '2');
  const modulus = block.getFieldValue('MODULUS') || '3329';

  const prfName = pythonGenerator.provideFunction_('PRF', [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(eta, s, b):',
    '    from Crypto.Hash import SHAKE256',
    '    return SHAKE256.new(s + bytes([b])).read(64 * eta)',
  ]);

  const funcName = pythonGenerator.provideFunction_('sample_poly_cbd_eta' + eta, [
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
  return [funcName + '(' + seed + ', q=' + modulus + ')', Order.ATOMIC];
};
