/**
 * EdDSA (Ed25519, RFC 8032) 原子块 Python 代码生成器
 *
 * 内嵌完整实现（hashlib.sha512，int 原生大数）：
 *   - 曲线 edwards25519：p = 2^255-19, d = -121665/121666 mod p, L = 2^252+27742317777372353535851937790883648493
 *   - 扩展坐标点加/标量乘/编解码，sha512_modq = LE(sha512(x)) mod L
 *   - 签名 S = (r + h(R‖A‖msg)·a) mod L；验签 sB == R + h(R‖A‖msg)·A（含 s < L、解码失败检查）
 *
 * 共享常量经 eddsa_ctx() 单点提供，各 helper 解包使用（Python % 恒非负，无 JS 负余数坑）。
 * 官方向量（RFC 8032 §7.1 TEST 1-3）双语言全 PASS。
 */
import { pythonGenerator, Order } from 'blockly/python';
import type { Block } from 'blockly/core';

function registerSha512(): string {
  return pythonGenerator.provideFunction_('sha512_hash', [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(data):',
    '    import hashlib',
    '    return list(hashlib.sha512(bytes(data)).digest())',
  ]);
}

function registerCtx(): string {
  return pythonGenerator.provideFunction_('eddsa_ctx', [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '():',
    '    return (2 ** 255 - 19, 2 ** 252 + 27742317777372353535851937790883648493, 37095705934669439343138083508754565189542113879843219016388785533085940283555, 19681161376707505956807079304988542015446066515923890162744021073123829784752)',
  ]);
}

function registerRecoverX(): string {
  return pythonGenerator.provideFunction_('eddsa_recover_x', [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(y, sign):',
    '    P, Q, D, SQRT_M1 = eddsa_ctx()',
    '    if y >= P:',
    '        return None',
    '    x2 = (y * y - 1) * pow(D * y * y + 1, -1, P) % P',
    '    if x2 == 0:',
    '        return None if sign else 0',
    '    x = pow(x2, (P + 3) // 8, P)',
    '    if (x * x - x2) % P != 0:',
    '        x = x * SQRT_M1 % P',
    '    if (x * x - x2) % P != 0:',
    '        return None',
    '    if (x & 1) != sign:',
    '        x = P - x',
    '    return x',
  ]);
}

function registerPointAdd(): string {
  return pythonGenerator.provideFunction_('eddsa_point_add', [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(Pt, Qt):',
    '    P, Q, D, SQRT_M1 = eddsa_ctx()',
    '    A = (Pt[1] - Pt[0]) * (Qt[1] - Qt[0]) % P',
    '    B = (Pt[1] + Pt[0]) * (Qt[1] + Qt[0]) % P',
    '    C = 2 * Pt[3] * Qt[3] * D % P',
    '    Dd = 2 * Pt[2] * Qt[2] % P',
    '    E, F, G, H = B - A, Dd - C, Dd + C, B + A',
    '    return (E * F % P, G * H % P, F * G % P, E * H % P)',
  ]);
}

function registerPointMul(): string {
  return pythonGenerator.provideFunction_('eddsa_point_mul', [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(s, Pt):',
    '    P, Q, D, SQRT_M1 = eddsa_ctx()',
    '    Qr = (0, 1, 1, 0)  # 单位元',
    '    while s > 0:',
    '        if s & 1:',
    '            Qr = eddsa_point_add(Qr, Pt)',
    '        Pt = eddsa_point_add(Pt, Pt)',
    '        s >>= 1',
    '    return Qr',
  ]);
}

function registerPointCompress(): string {
  return pythonGenerator.provideFunction_('eddsa_point_compress', [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(Pt):',
    '    P, Q, D, SQRT_M1 = eddsa_ctx()',
    '    zinv = pow(Pt[2], -1, P)',
    '    x = Pt[0] * zinv % P',
    '    y = Pt[1] * zinv % P',
    '    return (y | ((x & 1) << 255)).to_bytes(32, "little")',
  ]);
}

function registerPointDecompress(): string {
  return pythonGenerator.provideFunction_('eddsa_point_decompress', [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(sb):',
    '    P, Q, D, SQRT_M1 = eddsa_ctx()',
    '    if len(sb) != 32:',
    '        return None',
    '    y = int.from_bytes(sb, "little")',
    '    sign = y >> 255',
    '    y &= (1 << 255) - 1',
    '    x = eddsa_recover_x(y, sign)',
    '    if x is None:',
    '        return None',
    '    return (x, y, 1, x * y % P)',
  ]);
}

function registerPointEqual(): string {
  return pythonGenerator.provideFunction_('eddsa_point_equal', [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(Pt, Qt):',
    '    P, Q, D, SQRT_M1 = eddsa_ctx()',
    '    return (Pt[0] * Qt[2] - Qt[0] * Pt[2]) % P == 0 and (Pt[1] * Qt[2] - Qt[1] * Pt[2]) % P == 0',
  ]);
}

function registerSha512Modq(): string {
  return pythonGenerator.provideFunction_('eddsa_sha512_modq', [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(data):',
    '    P, Q, D, SQRT_M1 = eddsa_ctx()',
    '    return int.from_bytes(bytes(sha512_hash(data)), "little") % Q',
  ]);
}

function registerBasePoint(): string {
  return pythonGenerator.provideFunction_('eddsa_base_point', [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '():',
    '    P, Q, D, SQRT_M1 = eddsa_ctx()',
    '    gy = 4 * pow(5, -1, P) % P  # 基点 G：y = 4/5 mod p, x = recover_x(y, 0)',
    '    gx = eddsa_recover_x(gy, 0)',
    '    return (gx, gy, 1, gx * gy % P)',
  ]);
}

/** 注册全部共享 helper（provideFunction_ 按名去重，sign/verify 共用一份） */
function registerShared(): void {
  registerSha512();
  registerCtx();
  registerRecoverX();
  registerPointAdd();
  registerPointMul();
  registerPointCompress();
  registerPointDecompress();
  registerPointEqual();
  registerSha512Modq();
  registerBasePoint();
}

function registerSign(): string {
  return pythonGenerator.provideFunction_('eddsa_sign', [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(secret, msg):',
    '    P, Q, D, SQRT_M1 = eddsa_ctx()',
    '    if len(secret) != 32:',
    '        raise ValueError("Ed25519 secret key must be 32 bytes")',
    '    msg = bytes(msg)',
    '    h = sha512_hash(secret)',
    '    a = int.from_bytes(bytes(h[:32]), "little")',
    '    a &= (1 << 254) - 8  # clamp：位 0-2 清 0',
    '    a |= 1 << 254        # 位 254 置 1',
    '    prefix = bytes(h[32:])',
    '    A = eddsa_point_compress(eddsa_point_mul(a, eddsa_base_point()))',
    '    r = eddsa_sha512_modq(prefix + msg)',
    '    R = eddsa_point_compress(eddsa_point_mul(r, eddsa_base_point()))',
    '    hh = eddsa_sha512_modq(R + A + msg)',
    '    s = (r + hh * a) % Q',
    '    return list(R) + list(s.to_bytes(32, "little"))',
  ]);
}

function registerVerify(): string {
  return pythonGenerator.provideFunction_('eddsa_verify', [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(public_key, msg, signature):',
    '    P, Q, D, SQRT_M1 = eddsa_ctx()',
    '    if len(public_key) != 32 or len(signature) != 64:',
    '        return False',
    '    public_key = bytes(public_key)',
    '    msg = bytes(msg)',
    '    signature = bytes(signature)',
    '    A = eddsa_point_decompress(public_key)',
    '    if A is None:',
    '        return False',
    '    R = eddsa_point_decompress(signature[:32])',
    '    if R is None:',
    '        return False',
    '    s = int.from_bytes(signature[32:], "little")',
    '    if s >= Q:',
    '        return False',
    '    hh = eddsa_sha512_modq(signature[:32] + public_key + msg)',
    '    sB = eddsa_point_mul(s, eddsa_base_point())',
    '    hA = eddsa_point_mul(hh, A)',
    '    return eddsa_point_equal(sB, eddsa_point_add(R, hA))',
  ]);
}

pythonGenerator.forBlock['eddsa_sign'] = function (block: Block): [string, number] {
  const secret = pythonGenerator.valueToCode(block, 'SECRET', Order.ATOMIC) || '[]';
  const msg = pythonGenerator.valueToCode(block, 'MSG', Order.ATOMIC) || '[]';
  registerShared();
  const fn = registerSign();
  return [fn + '(' + secret + ', ' + msg + ')', Order.ATOMIC];
};

pythonGenerator.forBlock['eddsa_verify'] = function (block: Block): [string, number] {
  const publicKey = pythonGenerator.valueToCode(block, 'PUBLIC', Order.ATOMIC) || '[]';
  const msg = pythonGenerator.valueToCode(block, 'MSG', Order.ATOMIC) || '[]';
  const signature = pythonGenerator.valueToCode(block, 'SIGNATURE', Order.ATOMIC) || '[]';
  registerShared();
  const fn = registerVerify();
  return [fn + '(' + publicKey + ', ' + msg + ', ' + signature + ')', Order.ATOMIC];
};
