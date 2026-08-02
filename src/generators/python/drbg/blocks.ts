/**
 * HMAC-DRBG 原子块 Python 代码生成器
 * NIST SP 800-90A Rev1 §10.1.2（HMAC-SHA-256）
 *
 * HMAC-SHA-256 用 Python 标准库 hmac/hashlib（与 hash_hmac SHA-256 分支同款）。
 * 内嵌状态函数（provideFunction_ 按名去重）：
 *   - drbg_instantiate(entropy, nonce, perso) → [K, V]（可变 list 状态）
 *   - drbg_update(st, provided)  （provided 为 None = 未提供，空列表 = 提供空数据）
 *   - drbg_reseed(st, entropy, additional)
 *   - drbg_generate(st, nbits, additional) → 字节列表（可变状态）
 *   - drbg_generate_all(entropy, nonce, perso, nbits) → 单次生成（块调用路径）
 * 官方向量：NIST CAVP drbgtestvectors（SHA-256 480 例全过）。
 */
import { pythonGenerator, Order } from 'blockly/python';
import type { Block } from 'blockly/core';

/** 完整状态化 HMAC-DRBG（HMAC-SHA-256，SP 800-90A §10.1.2） */
function registerDrbg(): string {
  pythonGenerator.provideFunction_('drbg_update', [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(st, provided):',
    '    import hmac, hashlib',
    '    k, v = st',
    '    # K = HMAC(K, V || 0x00 || provided)；V = HMAC(K, V)；provided 非 None 时再 K = HMAC(K, V || 0x01 || provided)；V = HMAC(K, V)',
    '    data0 = bytes(v) + b"\\x00" + (bytes(provided) if provided is not None else b"")',
    '    k = list(hmac.new(bytes(k), data0, hashlib.sha256).digest())',
    '    v = list(hmac.new(bytes(k), bytes(v), hashlib.sha256).digest())',
    '    if provided is not None:',
    '        data1 = bytes(v) + b"\\x01" + bytes(provided)',
    '        k = list(hmac.new(bytes(k), data1, hashlib.sha256).digest())',
    '        v = list(hmac.new(bytes(k), bytes(v), hashlib.sha256).digest())',
    '    st[0], st[1] = k, v',
  ]);
  pythonGenerator.provideFunction_('drbg_instantiate', [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(entropy, nonce, perso):',
    '    st = [[0] * 32, [1] * 32]',
    '    drbg_update(st, list(entropy or []) + list(nonce or []) + list(perso or []))',
    '    return st',
  ]);
  pythonGenerator.provideFunction_('drbg_reseed', [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(st, entropy, additional):',
    '    drbg_update(st, list(entropy or []) + list(additional or []))',
  ]);
  pythonGenerator.provideFunction_('drbg_generate', [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(st, nbits, additional=None):',
    '    import hmac, hashlib',
    '    if additional is not None:',
    '        drbg_update(st, additional)',
    '    outlen = (nbits + 7) // 8',
    '    temp = []',
    '    while len(temp) < outlen:',
    '        st[1] = list(hmac.new(bytes(st[0]), bytes(st[1]), hashlib.sha256).digest())',
    '        temp += st[1]',
    '    out = temp[:outlen]',
    '    drbg_update(st, additional)',
    '    return out',
  ]);
  return pythonGenerator.provideFunction_('drbg_generate_all', [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(entropy, nonce, perso, nbits):',
    '    return drbg_generate(drbg_instantiate(entropy, nonce, perso), nbits, None)',
  ]);
}

pythonGenerator.forBlock['drbg_generate'] = function (block: Block): [string, number] {
  const entropy = pythonGenerator.valueToCode(block, 'ENTROPY', Order.ATOMIC) || '[]';
  const nonce = pythonGenerator.valueToCode(block, 'NONCE', Order.ATOMIC) || '[]';
  const perso = pythonGenerator.valueToCode(block, 'PERSO', Order.ATOMIC) || '[]';
  const bits = pythonGenerator.valueToCode(block, 'BITS', Order.ATOMIC) || '256';
  const fn = registerDrbg();
  return [fn + '(' + entropy + ', ' + nonce + ', ' + perso + ', ' + bits + ')', Order.ATOMIC];
};
