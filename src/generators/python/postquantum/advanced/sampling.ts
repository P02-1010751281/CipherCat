/**
 * ML-KEM 多项式采样 Python 代码生成器 — 后量子高级块
 *
 * 参考: FIPS 203 — https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.203.pdf
 */
import { pythonGenerator, Order } from 'blockly/python';
import type { Block } from 'blockly/core';
import { registerSampleCbdEta } from '../helpers';

// SampleNTT (Algorithm 7): 使用 XOF (SHAKE128) 采样 NTT 域多项式
// 注：SHAKE128 流式输出的系数本身就是 NTT 域表示，无需再调用 NTT()
pythonGenerator.forBlock['pq_sample_ntt'] = function (
  block: Block,
): [string, number] {
  const seed =
    pythonGenerator.valueToCode(block, 'SEED', Order.ATOMIC) || 'seed';
  const modulus = block.getFieldValue('MODULUS') || '3329';

  const funcName = pythonGenerator.provideFunction_('sample_ntt', [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(seed, q=3329):',
    '    import hashlib',
    '    if isinstance(seed, str):',
    '        seed = seed.encode("utf-8")',
    '    seed = bytes(seed)',
    '    out = hashlib.shake_128(seed).digest(768)',
    '    coeffs = []',
    '    for pos in range(0, len(out), 3):',
    '        if len(coeffs) >= 256:',
    '            break',
    '        d1 = (out[pos] | ((out[pos + 1] & 0x0F) << 8)) & 0xFFF',
    '        d2 = ((out[pos + 1] >> 4) | (out[pos + 2] << 4)) & 0xFFF',
    '        if d1 < q:',
    '            coeffs.append(d1)',
    '        if d2 < q and len(coeffs) < 256:',
    '            coeffs.append(d2)',
    '    return coeffs', // 无 NTT！SHAKE128 输出即 NTT 域
  ]);
  return [funcName + '(' + seed + ', q=' + modulus + ')', Order.ATOMIC];
};

// SamplePolyCBD_eta (Algorithm 8): 从 CBD_eta 分布采样多项式
pythonGenerator.forBlock['pq_sample_poly_cbd'] = function (
  block: Block,
): [string, number] {
  const seed =
    pythonGenerator.valueToCode(block, 'SEED', Order.ATOMIC) || 'seed';
  const eta = parseInt(block.getFieldValue('ETA') || '2');
  const modulus = block.getFieldValue('MODULUS') || '3329';

  const funcName = registerSampleCbdEta(eta);
  return [funcName + '(' + seed + ', q=' + modulus + ')', Order.ATOMIC];
};
