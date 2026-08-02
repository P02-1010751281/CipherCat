/**
 * RSA 原子块 Python 代码生成器
 * FIPS 186-4 / RFC 8017（PKCS#1 v1.5）
 *
 * 内嵌（与 /tmp/vectors/rsa_ref.py 同构，cryptography 交叉验证全 PASS）：
 * - rsa_keygen：os.urandom + Miller-Rabin（小素数筛 + 20 轮随机基底）
 * - rsa_encrypt/rsa_decrypt：PKCS#1 v1.5（随机非零 PS）
 * - rsa_sign/rsa_verify：PKCS#1 v1.5 + SHA-256（hashlib.sha256 + DER DigestInfo 前缀）
 * - 模幂/模逆用 Python 原生 pow(a, e, m) / pow(e, -1, m)
 */
import { pythonGenerator, Order } from 'blockly/python';
import type { Block } from 'blockly/core';

/** Miller-Rabin 素性测试（小素数筛 + 20 轮随机基底） */
function registerRsaIsPrime(): string {
  return pythonGenerator.provideFunction_('rsa_is_prime', [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(n, rounds=20):',
    '    import os',
    '    if n < 2:',
    '        return False',
    '    small = [2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97,101,103,107,109,113,127,131,137,139,149,151,157,163,167,173,179,181,191,193,197,199,211,223,227,229,233,239,241,251]',
    '    for p in small:',
    '        if n == p:',
    '            return True',
    '        if n % p == 0:',
    '            return False',
    '    d = n - 1',
    '    r = 0',
    '    while d % 2 == 0:',
    '        d >>= 1',
    '        r += 1',
    '    for _ in range(rounds):',
    '        a = 2 + int.from_bytes(os.urandom((n.bit_length() + 7) // 8), "big") % (n - 3)',
    '        x = pow(a, d, n)',
    '        if x == 1 or x == n - 1:',
    '            continue',
    '        for _ in range(r - 1):',
    '            x = x * x % n',
    '            if x == n - 1:',
    '                break',
    '        else:',
    '            return False',
    '    return True',
  ]);
}

/** 随机 bits 位素数：顶两位 + 最低位置 1（FIPS 186-4） */
function registerRsaRandPrime(): string {
  return pythonGenerator.provideFunction_('rsa_rand_prime', [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(bits):',
    '    import os',
    '    nbytes = (bits + 7) // 8',
    '    while True:',
    '        v = int.from_bytes(os.urandom(nbytes), "big")',
    '        excess = nbytes * 8 - bits',
    '        if excess:',
    '            v >>= excess',
    '        v |= (1 << (bits - 1)) | (1 << (bits - 2)) | 1',
    '        if rsa_is_prime(v):',
    '            return v',
  ]);
}

/** RSA-KeyGen：key = n(k)‖e(4)‖d(k)‖p(k/2)‖q(k/2)，d = e⁻¹ mod λ(n) */
function registerRsaKeygen(): string {
  return pythonGenerator.provideFunction_('rsa_keygen', [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(bits):',
    '    import math',
    '    e = 65537',
    '    while True:',
    '        p = rsa_rand_prime(bits // 2)',
    '        q = rsa_rand_prime(bits // 2)',
    '        if p == q:',
    '            continue',
    '        if (p - 1) % e == 0 or (q - 1) % e == 0:',
    '            continue',
    '        n = p * q',
    '        lam = (p - 1) // math.gcd(p - 1, q - 1) * (q - 1)',
    '        d = pow(e, -1, lam)',
    '        k = bits // 8',
    "        return list(n.to_bytes(k, 'big') + e.to_bytes(4, 'big') + d.to_bytes(k, 'big')",
    "                    + p.to_bytes(bits // 16, 'big') + q.to_bytes(bits // 16, 'big'))",
  ]);
}

/** 解析 key 前缀 n/e/d（容忍尾部 p/q），k 由 key 长度反推 */
function registerRsaParseKey(): string {
  return pythonGenerator.provideFunction_('rsa_parse_key', [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(key):',
    '    key = bytes(key)',
    '    if (len(key) - 4) % 3 != 0:',
    "        raise ValueError('invalid RSA key length')",
    '    k = (len(key) - 4) // 3',
    "    n = int.from_bytes(key[:k], 'big')",
    "    e = int.from_bytes(key[k:k + 4], 'big')",
    "    d = int.from_bytes(key[k + 4:2 * k + 4], 'big')",
    '    return n, e, d, k',
  ]);
}

/** RSA-Encrypt：PKCS#1 v1.5 随机填充 + m^e mod n */
function registerRsaEncrypt(): string {
  return pythonGenerator.provideFunction_('rsa_encrypt', [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(key, msg):',
    '    import os',
    '    n, e, _d, k = rsa_parse_key(key)',
    '    if isinstance(msg, str):',
    "        msg = msg.encode('utf-8')",
    '    msg = bytes(msg)',
    '    if len(msg) > k - 11:',
    "        raise ValueError('RSA message too long')",
    '    ps = bytearray(os.urandom(k - 3 - len(msg)))',
    '    for i in range(len(ps)):',
    '        while ps[i] == 0:',
    '            ps[i] = os.urandom(1)[0]',
    "    em = b'\\x00\\x02' + bytes(ps) + b'\\x00' + msg",
    "    m = int.from_bytes(em, 'big')",
    '    c = pow(m, e, n)',
    "    return list(c.to_bytes(k, 'big'))",
  ]);
}

/** RSA-Decrypt：m = C^d mod n，去填充返回明文 */
function registerRsaDecrypt(): string {
  return pythonGenerator.provideFunction_('rsa_decrypt', [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(key, ct):',
    '    n, _e, d, k = rsa_parse_key(key)',
    '    ct = bytes(ct)',
    '    if len(ct) != k:',
    "        raise ValueError('RSA ciphertext length mismatch')",
    "    m = pow(int.from_bytes(ct, 'big'), d, n)",
    "    em = m.to_bytes(k, 'big')",
    '    if em[0] != 0 or em[1] != 2:',
    "        raise ValueError('RSA bad padding (type)')",
    '    sep = em.find(b"\\x00", 2)',
    '    if sep < 10 or sep >= k:',
    "        raise ValueError('RSA bad padding (separator)')",
    '    return list(em[sep + 1:])',
  ]);
}

/** RSA-Sign：DigestInfo(SHA-256) + 0x00‖0x01‖FF‖0x00‖T，m^d mod n */
function registerRsaSign(): string {
  return pythonGenerator.provideFunction_('rsa_sign', [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(key, msg):',
    '    import hashlib',
    '    n, _e, d, k = rsa_parse_key(key)',
    '    if isinstance(msg, str):',
    "        msg = msg.encode('utf-8')",
    '    msg = bytes(msg)',
    "    t = bytes.fromhex('3031300d060960864801650304020105000420') + hashlib.sha256(msg).digest()",
    '    ff = k - len(t) - 3',
    '    if ff < 8:',
    "        raise ValueError('RSA key too small for SHA-256 signature')",
    "    em = b'\\x00\\x01' + b'\\xff' * ff + b'\\x00' + t",
    "    m = int.from_bytes(em, 'big')",
    '    s = pow(m, d, n)',
    "    return list(s.to_bytes(k, 'big'))",
  ]);
}

/** RSA-Verify：m = S^e mod n，校验 EM 结构与 DigestInfo */
function registerRsaVerify(): string {
  return pythonGenerator.provideFunction_('rsa_verify', [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(key, msg, sig):',
    '    import hashlib',
    '    n, e, _d, k = rsa_parse_key(key)',
    '    if isinstance(msg, str):',
    "        msg = msg.encode('utf-8')",
    '    msg = bytes(msg)',
    "    t = bytes.fromhex('3031300d060960864801650304020105000420') + hashlib.sha256(msg).digest()",
    '    sig = bytes(sig)',
    '    if len(sig) != k:',
    '        return False',
    "    s = int.from_bytes(sig, 'big')",
    '    if s >= n:',
    '        return False',
    "    em = pow(s, e, n).to_bytes(k, 'big')",
    '    if em[0] != 0 or em[1] != 1:',
    '        return False',
    '    i = 2',
    '    while i < k and em[i] == 0xff:',
    '        i += 1',
    '    if i >= k or em[i] != 0:',
    '        return False',
    '    return em[i + 1:] == t',
  ]);
}

pythonGenerator.forBlock['rsa_keygen'] = function (block: Block): [string, number] {
  const bits = block.getFieldValue('BITS') || '512';
  registerRsaIsPrime();
  registerRsaRandPrime();
  const fn = registerRsaKeygen();
  return [fn + '(' + bits + ')', Order.ATOMIC];
};

pythonGenerator.forBlock['rsa_encrypt'] = function (block: Block): [string, number] {
  const key = pythonGenerator.valueToCode(block, 'KEY', Order.ATOMIC) || '[]';
  const msg = pythonGenerator.valueToCode(block, 'MSG', Order.ATOMIC) || '""';
  registerRsaParseKey();
  const fn = registerRsaEncrypt();
  return [fn + '(' + key + ', ' + msg + ')', Order.ATOMIC];
};

pythonGenerator.forBlock['rsa_decrypt'] = function (block: Block): [string, number] {
  const key = pythonGenerator.valueToCode(block, 'KEY', Order.ATOMIC) || '[]';
  const ct = pythonGenerator.valueToCode(block, 'CT', Order.ATOMIC) || '[]';
  registerRsaParseKey();
  const fn = registerRsaDecrypt();
  return [fn + '(' + key + ', ' + ct + ')', Order.ATOMIC];
};

pythonGenerator.forBlock['rsa_sign'] = function (block: Block): [string, number] {
  const key = pythonGenerator.valueToCode(block, 'KEY', Order.ATOMIC) || '[]';
  const msg = pythonGenerator.valueToCode(block, 'MSG', Order.ATOMIC) || '""';
  registerRsaParseKey();
  const fn = registerRsaSign();
  return [fn + '(' + key + ', ' + msg + ')', Order.ATOMIC];
};

pythonGenerator.forBlock['rsa_verify'] = function (block: Block): [string, number] {
  const key = pythonGenerator.valueToCode(block, 'KEY', Order.ATOMIC) || '[]';
  const msg = pythonGenerator.valueToCode(block, 'MSG', Order.ATOMIC) || '""';
  const sig = pythonGenerator.valueToCode(block, 'SIG', Order.ATOMIC) || '[]';
  registerRsaParseKey();
  const fn = registerRsaVerify();
  return [fn + '(' + key + ', ' + msg + ', ' + sig + ')', Order.ATOMIC];
};
