/**
 * P-256 (secp256r1) ECDH 共享密钥原子块 Python 代码生成器
 * RFC 5903 / NIST SP 800-56A（secp256r1）
 *
 * 内嵌（原生 int + pow(x, -1, m) 模逆，provideFunction_ 按名去重）：
 *   ecdh_point_add / ecdh_point_mul —— Weierstrass 点加/倍点（仿射）
 *   ecdh_shared_secret —— S = [d]Q 的 x 坐标 32 字节大端 hex（64 字符）
 * 官方向量：RFC 5903 §8.1 + cryptography 确定性派生 2 组，与 python3 cryptography ECDH 逐字节一致。
 */
import { pythonGenerator, Order } from 'blockly/python';
import type { Block } from 'blockly/core';

/** Weierstrass 点加（仿射，模逆除法）；无穷远点用 None 表示 */
function registerEcdhPointAdd(): string {
  return pythonGenerator.provideFunction_('ecdh_point_add', [
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
function registerEcdhPointMul(): string {
  return pythonGenerator.provideFunction_('ecdh_point_mul', [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(k, G, p, a):',
    '    R = None',
    '    Q = G',
    '    while k > 0:',
    '        if k & 1:',
    '            R = ecdh_point_add(R, Q, p, a)',
    '        Q = ecdh_point_add(Q, Q, p, a)',
    '        k >>= 1',
    '    return R',
  ]);
}

/** ECDH 共享密钥：S = [d]Q 的 x 坐标 32 字节大端 hex（64 字符） */
function registerEcdhSharedSecret(): string {
  return pythonGenerator.provideFunction_('ecdh_shared_secret', [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(d_hex, qx_hex, qy_hex):',
    '    P = 0xffffffff00000001000000000000000000000000ffffffffffffffffffffffff',
    '    A = 0xffffffff00000001000000000000000000000000fffffffffffffffffffffffc',
    '    B = 0x5ac635d8aa3a93e7b3ebbd55769886bc651d06b0cc53b0f63bce3c3e27d2604b',
    '    N = 0xffffffff00000000ffffffffffffffffbce6faada7179e84f3b9cac2fc632551',
    '    d = int(d_hex, 16) % N',
    '    if d == 0:',
    "        raise ValueError('ECDH: private key out of [1, n-1]')",
    '    qx = int(qx_hex, 16)',
    '    qy = int(qy_hex, 16)',
    '    if not (0 <= qx < P and 0 <= qy < P):',
    "        raise ValueError('ECDH: public key out of range')",
    '    if (qy * qy - (qx * qx * qx + A * qx + B)) % P != 0:',
    "        raise ValueError('ECDH: public key not on curve')",
    '    S = ecdh_point_mul(d, (qx, qy), P, A)',
    '    if S is None:',
    "        raise ValueError('ECDH: shared point is identity')",
    "    return f'{S[0]:064x}'",
  ]);
}

pythonGenerator.forBlock['ecdh_shared_secret'] = function (block: Block): [string, number] {
  const d = pythonGenerator.valueToCode(block, 'D', Order.ATOMIC) || '""';
  const qx = pythonGenerator.valueToCode(block, 'QX', Order.ATOMIC) || '""';
  const qy = pythonGenerator.valueToCode(block, 'QY', Order.ATOMIC) || '""';
  registerEcdhPointAdd();
  registerEcdhPointMul();
  const fn = registerEcdhSharedSecret();
  return [fn + '(' + d + ', ' + qx + ', ' + qy + ')', Order.ATOMIC];
};
