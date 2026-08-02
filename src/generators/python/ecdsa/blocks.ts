/**
 * ECDSA 原子块 Python 代码生成器
 * FIPS 186-5 / RFC 6979（P-256 + SHA-256）
 *
 * 内嵌（与 JS 生成器同构，官方向量 RFC 6979 A.2.5 sample/test 全 PASS）：
 * - P-256 参数 + Weierstrass 点加/点乘（pow(x, -1, m) 模逆）
 * - RFC 6979 §3.2 确定性 k；z = bits2int(SHA-256(msg))；bits2octets = (z mod n)
 * - hmac_sha256 与 remaining.ts 同体注册（provideFunction_ 按名去重）
 */
import { pythonGenerator, Order } from 'blockly/python';
import type { Block } from 'blockly/core';

/** HMAC-SHA256（与 remaining.ts hash_hmac SHA-256 分支同体，按名去重） */
function registerHmacSha256(): string {
  return pythonGenerator.provideFunction_('hmac_sha256', [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(key, msg):',
    '    import hmac, hashlib',
    "    return hmac.new(key, msg, 'sha256').digest()",
  ]);
}

/** Weierstrass 点加（仿射，模逆除法）；无穷远点用 None 表示 */
function registerEcdsaPointAdd(): string {
  return pythonGenerator.provideFunction_('ecdsa_point_add', [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(P1, P2, p, a):',
    '    if P1 is None:',
    '        return P2',
    '    if P2 is None:',
    '        return P1',
    '    x1, y1 = P1',
    '    x2, y2 = P2',
    '    if x1 == x2 and (y1 + y2) % p == 0:',
    '        return None',
    '    if x1 == x2 and y1 == y2:',
    '        lam = (3 * x1 * x1 + a) * pow(2 * y1, -1, p) % p',
    '    else:',
    '        lam = (y2 - y1) * pow(x2 - x1, -1, p) % p',
    '    x3 = (lam * lam - x1 - x2) % p',
    '    y3 = (lam * (x1 - x3) - y1) % p',
    '    return (x3, y3)',
  ]);
}

/** 标量倍点（double-and-add） */
function registerEcdsaPointMul(): string {
  return pythonGenerator.provideFunction_('ecdsa_point_mul', [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(k, G, p, a):',
    '    R = None',
    '    Q = G',
    '    while k > 0:',
    '        if k & 1:',
    '            R = ecdsa_point_add(R, Q, p, a)',
    '        Q = ecdsa_point_add(Q, Q, p, a)',
    '        k >>= 1',
    '    return R',
  ]);
}

/** ECDSA 确定性签名：返回 r‖s 64 字节列表 */
function registerEcdsaSign(): string {
  return pythonGenerator.provideFunction_('ecdsa_sign', [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(priv, msg):',
    '    import hashlib',
    '    P = 0xffffffff00000001000000000000000000000000ffffffffffffffffffffffff',
    '    A = 0xffffffff00000001000000000000000000000000fffffffffffffffffffffffc',
    '    N = 0xffffffff00000000ffffffffffffffffbce6faada7179e84f3b9cac2fc632551',
    '    GX = 0x6b17d1f2e12c4247f8bce6e563a440f277037d812deb33a0f4a13945d898c296',
    '    GY = 0x4fe342e2fe1a7f9b8ee7eb4a7c0f9e162bce33576b315ececbb6406837bf51f5',
    "    if len(priv) != 32:",
    "        raise ValueError('ECDSA private key must be 32 bytes')",
    '    if isinstance(msg, str):',
    "        msg = msg.encode('utf-8')",
    '    h1 = hashlib.sha256(bytes(msg)).digest()',
    "    z = int.from_bytes(h1, 'big')        # bits2int(h1)：blen == qlen == 256 全量",
    "    x = int.from_bytes(bytes(priv), 'big')",
    "    b2i = (z % N).to_bytes(32, 'big')    # bits2octets(h1) = bits2int(h1) mod n",
    '    xb = bytes(priv)',
    '    # RFC 6979 §3.2 确定性 k',
    '    V = bytes([1]) * 32',
    '    K = bytes([0]) * 32',
    "    K = hmac_sha256(K, V + b'\\x00' + xb + b2i)",
    '    V = hmac_sha256(K, V)',
    "    K = hmac_sha256(K, V + b'\\x01' + xb + b2i)",
    '    V = hmac_sha256(K, V)',
    '    while True:',
    "        T = b''",
    '        while len(T) < 32:',
    '            V = hmac_sha256(K, V)',
    '            T += V',
    "        k = int.from_bytes(T[:32], 'big')",
    '        if 1 <= k < N:',
    '            break',
    "        K = hmac_sha256(K, V + b'\\x00')",
    '        V = hmac_sha256(K, V)',
    '    R = ecdsa_point_mul(k, (GX, GY), P, A)',
    '    r = R[0] % N',
    '    s = pow(k, -1, N) * (z + r * x) % N',
    "    return list(r.to_bytes(32, 'big') + s.to_bytes(32, 'big'))",
  ]);
}

/** ECDSA 验签：返回布尔 */
function registerEcdsaVerify(): string {
  return pythonGenerator.provideFunction_('ecdsa_verify', [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(msg, pub, sig):',
    '    import hashlib',
    '    P = 0xffffffff00000001000000000000000000000000ffffffffffffffffffffffff',
    '    A = 0xffffffff00000001000000000000000000000000fffffffffffffffffffffffc',
    '    N = 0xffffffff00000000ffffffffffffffffbce6faada7179e84f3b9cac2fc632551',
    '    GX = 0x6b17d1f2e12c4247f8bce6e563a440f277037d812deb33a0f4a13945d898c296',
    '    GY = 0x4fe342e2fe1a7f9b8ee7eb4a7c0f9e162bce33576b315ececbb6406837bf51f5',
    '    if len(pub) != 64 or len(sig) != 64:',
    "        raise ValueError('ECDSA pub/sig must be 64 bytes')",
    "    Q = (int.from_bytes(bytes(pub[:32]), 'big'), int.from_bytes(bytes(pub[32:]), 'big'))",
    "    r = int.from_bytes(bytes(sig[:32]), 'big')",
    "    s = int.from_bytes(bytes(sig[32:]), 'big')",
    '    if not (1 <= r < N and 1 <= s < N):',
    '        return False',
    '    if isinstance(msg, str):',
    "        msg = msg.encode('utf-8')",
    '    h1 = hashlib.sha256(bytes(msg)).digest()',
    "    z = int.from_bytes(h1, 'big')",
    '    w = pow(s, -1, N)',
    '    u1 = z * w % N',
    '    u2 = r * w % N',
    '    P1 = ecdsa_point_mul(u1, (GX, GY), P, A)',
    '    P2 = ecdsa_point_mul(u2, Q, P, A)',
    '    Pt = ecdsa_point_add(P1, P2, P, A)',
    '    if Pt is None:',
    '        return False',
    '    return Pt[0] % N == r',
  ]);
}

pythonGenerator.forBlock['ecdsa_sign'] = function (block: Block): [string, number] {
  const priv = pythonGenerator.valueToCode(block, 'PRIV', Order.ATOMIC) || '[]';
  const msg = pythonGenerator.valueToCode(block, 'MSG', Order.ATOMIC) || '""';
  registerHmacSha256();
  registerEcdsaPointAdd();
  registerEcdsaPointMul();
  const fn = registerEcdsaSign();
  return [fn + '(' + priv + ', ' + msg + ')', Order.ATOMIC];
};

pythonGenerator.forBlock['ecdsa_verify'] = function (block: Block): [string, number] {
  const msg = pythonGenerator.valueToCode(block, 'MSG', Order.ATOMIC) || '""';
  const pub = pythonGenerator.valueToCode(block, 'PUB', Order.ATOMIC) || '[]';
  const sig = pythonGenerator.valueToCode(block, 'SIG', Order.ATOMIC) || '[]';
  registerHmacSha256();
  registerEcdsaPointAdd();
  registerEcdsaPointMul();
  const fn = registerEcdsaVerify();
  return [fn + '(' + msg + ', ' + pub + ', ' + sig + ')', Order.ATOMIC];
};
