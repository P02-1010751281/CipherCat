/**
 * SM2 公钥加密原子块 Python 代码生成器
 * GB/T 32918.4-2016（附录 A 示例 2，Fp-256 测试曲线）
 *
 * 内嵌全套（一次 provideFunction_ 注册去重）：
 *   sm3_hash  —— 与 sm2sig 生成器同体（GB/T 32905）
 *   sm2_params/sm2_to_big/sm2_big_to_bytes/sm2_mod_inverse/
 *   sm2_point_double/sm2_point_add/sm2_point_mul —— Fp-256 点运算
 *   sm2_kdf   —— GB/T 32918.3 SM3-KDF（ct 4 字节大端计数，从 1 起）
 *   sm2_encrypt —— C1 = 04‖x1‖y1，C2 = M⊕KDF(x2‖y2,klen)，C3 = SM3(x2‖M‖y2)，
 *                  输出 C1‖C3‖C2 hex 字符串
 *   sm2_decrypt —— [d]C1 还原 x2,y2，M' = C2⊕t，校验 C3 后输出明文字节
 * 原生 int + pow(a,-1,m) 模逆。官方向量（附录 A 示例 2）C1C3C2 精确匹配。
 */
import { pythonGenerator, Order } from 'blockly/python';
import type { Block } from 'blockly/core';

/** SM2 加密全套内嵌函数（sm2_encrypt/sm2_decrypt 均在模块作用域，driver 可直接调用） */
function registerSm2Enc(): string {
  return pythonGenerator.provideFunction_('sm2_encrypt', [
    'def sm3_hash(input):',
    '    if isinstance(input, str):',
    '        input = input.encode("utf-8")',
    '    m = list(input)',
    '    m_len_bits = len(m) * 8',
    '    kk = (448 - m_len_bits - 1) % 512',
    '    if kk < 0:',
    '        kk += 512',
    '    m = m + [0x80] + [0] * (kk // 8) + [0] * 8',
    '    for i in range(4):',
    '        m[-1 - i] = (m_len_bits >> (8 * i)) & 0xFF',
    '    def rotl(x, n):',
    '        return ((x << n) | (x >> (32 - n))) & 0xFFFFFFFF',
    '    def p0(x):',
    '        return x ^ rotl(x, 9) ^ rotl(x, 17)',
    '    def p1(x):',
    '        return x ^ rotl(x, 15) ^ rotl(x, 23)',
    '    IV = [0x7380166F, 0x4914B2B9, 0x172442D7, 0xDA8A0600, 0xA96F30BC, 0x163138AA, 0xE38DEE4D, 0xB0FB0E4E]',
    '    v = list(IV)',
    '    for off in range(0, len(m), 64):',
    '        b = m[off:off + 64]',
    '        w = [0] * 68',
    '        for j in range(16):',
    '            w[j] = (b[j * 4] << 24) | (b[j * 4 + 1] << 16) | (b[j * 4 + 2] << 8) | b[j * 4 + 3]',
    '        for j in range(16, 68):',
    '            w[j] = (p1(w[j - 16] ^ w[j - 9] ^ rotl(w[j - 3], 15)) ^ rotl(w[j - 13], 7) ^ w[j - 6]) & 0xFFFFFFFF',
    '        a, b2, c, d, e, f, g, h = v',
    '        for j in range(64):',
    '            if j < 16:',
    '                ff = a ^ b2 ^ c',
    '                gg = e ^ f ^ g',
    '                t = 0x79CC4519',
    '            else:',
    '                ff = (a & b2) | (a & c) | (b2 & c)',
    '                gg = (e & f) | ((~e) & g)',
    '                t = 0x7A879D8A',
    '            ss1 = rotl((rotl(a, 12) + e + rotl(t, j % 32)) & 0xFFFFFFFF, 7)',
    '            ss2 = ss1 ^ rotl(a, 12)',
    '            tt1 = (ff + d + ss2 + (w[j] ^ w[j + 4])) & 0xFFFFFFFF',
    '            tt2 = (gg + h + ss1 + w[j]) & 0xFFFFFFFF',
    '            d = c',
    '            c = rotl(b2, 9)',
    '            b2 = a',
    '            a = tt1',
    '            h = g',
    '            g = rotl(f, 19)',
    '            f = e',
    '            e = p0(tt2)',
    '        v = [(x ^ y) & 0xFFFFFFFF for x, y in zip(v, [a, b2, c, d, e, f, g, h])]',
    '    out = []',
    '    for x in v:',
    '        out += [(x >> 24) & 0xFF, (x >> 16) & 0xFF, (x >> 8) & 0xFF, x & 0xFF]',
    '    return out',
    '',
    'def sm2_params():',
    '    return {',
    '        "p": 0x8542D69E4C044F18E8B92435BF6FF7DE457283915C45517D722EDB8B08F1DFC3,',
    '        "a": 0x787968B4FA32C3FD2417842E73BBFEFF2F3C848B6831D7E0EC65228B3937E498,',
    '        "b": 0x63E4C6D3B23B0C849CF84241484BFE48F61D59A5B16BA06E6E12D1DA27C5249A,',
    '        "n": 0x8542D69E4C044F18E8B92435BF6FF7DD297720630485628D5AE74EE7C32E79B7,',
    '        "gx": 0x421DEBD61B62EAB6746434EBC3CC315E32220B3BADD50BDC4C4E6C147FEDD43D,',
    '        "gy": 0x0680512BCBB42C07D47349D2153B70C4E5D7FDFCBFA36EA1A85841B9E46E09A2,',
    '    }',
    '',
    'def sm2_to_big(v):',
    '    if isinstance(v, int):',
    '        return v',
    '    if isinstance(v, str):',
    '        return int(v, 16)',
    '    return int.from_bytes(bytes(v), "big")',
    '',
    'def sm2_big_to_bytes(x, length):',
    '    return [(x >> (8 * (length - 1 - i))) & 0xFF for i in range(length)]',
    '',
    'def sm2_mod_inverse(a, m):',
    '    return pow(a % m, -1, m)',
    '',
    'def sm2_point_double(P):',
    '    C = sm2_params()',
    '    if P is None or P[1] == 0:',
    '        return None',
    '    lam = ((3 * P[0] * P[0] + C["a"]) * sm2_mod_inverse(2 * P[1], C["p"])) % C["p"]',
    '    x3 = (lam * lam - 2 * P[0]) % C["p"]',
    '    y3 = (lam * (P[0] - x3) - P[1]) % C["p"]',
    '    return (x3, y3)',
    '',
    'def sm2_point_add(P, Q):',
    '    C = sm2_params()',
    '    if P is None:',
    '        return Q',
    '    if Q is None:',
    '        return P',
    '    if P[0] == Q[0]:',
    '        if (P[1] + Q[1]) % C["p"] == 0:',
    '            return None',
    '        return sm2_point_double(P)',
    '    lam = ((Q[1] - P[1]) * sm2_mod_inverse((Q[0] - P[0]) % C["p"], C["p"])) % C["p"]',
    '    x3 = (lam * lam - P[0] - Q[0]) % C["p"]',
    '    y3 = (lam * (P[0] - x3) - P[1]) % C["p"]',
    '    return (x3, y3)',
    '',
    'def sm2_point_mul(k, P):',
    '    R = None',
    '    Q = P',
    '    while k > 0:',
    '        if k & 1:',
    '            R = sm2_point_add(R, Q)',
    '        Q = sm2_point_double(Q)',
    '        k >>= 1',
    '    return R',
    '',
    'def sm2_kdf(z, klen):',
    '    out = []',
    '    ct = 1',
    '    while len(out) * 8 < klen:',
    '        out += sm3_hash(list(z) + [(ct >> 24) & 0xFF, (ct >> 16) & 0xFF, (ct >> 8) & 0xFF, ct & 0xFF])',
    '        ct += 1',
    '    nbytes = (klen + 7) // 8',
    '    out = out[:nbytes]',
    '    if klen % 8:',
    '        out[-1] &= (0xFF << (8 - klen % 8)) & 0xFF',
    '    return out',
    '',
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(msg, px, py, k):',
    '    C = sm2_params()',
    '    kk = sm2_to_big(k)',
    '    if kk <= 0 or kk >= C["n"]:',
    '        raise ValueError("SM2: k out of range [1, n-1]")',
    '    if isinstance(msg, str):',
    '        msg = msg.encode("utf-8")',
    '    M = list(msg)',
    '    klen = len(M) * 8',
    '    x1, y1 = sm2_point_mul(kk, (C["gx"], C["gy"]))',
    '    c1 = [0x04] + sm2_big_to_bytes(x1, 32) + sm2_big_to_bytes(y1, 32)',
    '    x2, y2 = sm2_point_mul(kk, (sm2_to_big(px), sm2_to_big(py)))',
    '    x2b = sm2_big_to_bytes(x2, 32)',
    '    y2b = sm2_big_to_bytes(y2, 32)',
    '    t = sm2_kdf(x2b + y2b, klen)',
    '    if all(tt == 0 for tt in t):',
    '        raise ValueError("SM2: KDF output all-zero, retry with new k")',
    '    c2 = [m ^ tt for m, tt in zip(M, t)]',
    '    c3 = sm3_hash(x2b + M + y2b)',
    '    ct = c1 + c3 + c2',
    '    return "".join("%02x" % b for b in ct)',
    '',
    'def sm2_decrypt(ct, d):',
    '    C = sm2_params()',
    '    dd = sm2_to_big(d)',
    '    if dd <= 0 or dd >= C["n"]:',
    '        raise ValueError("SM2: invalid private key")',
    '    if isinstance(ct, str):',
    '        ct = bytes.fromhex(ct)',
    '    ct = list(ct)',
    '    if len(ct) < 98:',
    '        raise ValueError("SM2: ciphertext too short")',
    '    c1 = ct[:65]',
    '    c3 = ct[65:97]',
    '    c2 = ct[97:]',
    '    if c1[0] != 0x04:',
    '        raise ValueError("SM2: unsupported C1 encoding")',
    '    x1 = sm2_to_big(c1[1:33])',
    '    y1 = sm2_to_big(c1[33:65])',
    '    x2, y2 = sm2_point_mul(dd, (x1, y1))',
    '    x2b = sm2_big_to_bytes(x2, 32)',
    '    y2b = sm2_big_to_bytes(y2, 32)',
    '    t = sm2_kdf(x2b + y2b, len(c2) * 8)',
    '    m2 = [c ^ tt for c, tt in zip(c2, t)]',
    '    u = sm3_hash(x2b + m2 + y2b)',
    '    if u != c3:',
    '        raise ValueError("SM2: C3 mismatch (ciphertext tampered)")',
    '    return m2',
    '',
    'def sm2_key_exchange(dB, rB, pax, pay, RA, RBP, ZA, ZB, klen):',
    '    # GB/T 32918.3-2016 §6.2 B 侧（B1-B9）',
    '    C = sm2_params()',
    '    db = sm2_to_big(dB)',
    '    rb = sm2_to_big(rB)',
    '    RA_bytes = bytes.fromhex(RA)',
    '    RBP_bytes = bytes.fromhex(RBP)',
    '    RAp = (sm2_to_big(RA_bytes[1:33]), sm2_to_big(RA_bytes[33:65]))',
    '    Rbp = (sm2_to_big(RBP_bytes[1:33]), sm2_to_big(RBP_bytes[33:65]))',
    '    PA = (sm2_to_big(pax), sm2_to_big(pay))',
    '    # w = ceil(ceil(log2 n)/2) - 1；x̄ = 2^w + (x & (2^w - 1))',
    '    w = ((C["n"].bit_length() - 1) + 1) // 2 - 1',
    '    xb1 = (1 << w) + (RAp[0] & ((1 << w) - 1))',
    '    xb2 = (1 << w) + (Rbp[0] & ((1 << w) - 1))',
    '    tb = (db + xb2 * rb) % C["n"]',
    '    S = sm2_point_add(PA, sm2_point_mul(xb1, RAp))',
    '    V = sm2_point_mul(tb, S)',
    '    if V == (0, 0):',
    '        raise ValueError("SM2-KEX: V at infinity")',
    '    xVb = sm2_big_to_bytes(V[0], 32)',
    '    yVb = sm2_big_to_bytes(V[1], 32)',
    '    ZAb = list(bytes.fromhex(ZA))',
    '    ZBb = list(bytes.fromhex(ZB))',
    '    K = sm2_kdf(xVb + yVb + ZAb + ZBb, klen)',
    '    return "".join("%02x" % b for b in K)',
    '',
  ]);
}

pythonGenerator.forBlock['sm2_encrypt'] = function (block: Block): [string, number] {
  const msg = pythonGenerator.valueToCode(block, 'MSG', Order.ATOMIC) || '[]';
  const px = pythonGenerator.valueToCode(block, 'PX', Order.ATOMIC) || '""';
  const py = pythonGenerator.valueToCode(block, 'PY', Order.ATOMIC) || '""';
  const k = pythonGenerator.valueToCode(block, 'K', Order.ATOMIC) || '""';
  registerSm2Enc();
  return ['sm2_encrypt(' + msg + ', ' + px + ', ' + py + ', ' + k + ')', Order.ATOMIC];
};

pythonGenerator.forBlock['sm2_decrypt'] = function (block: Block): [string, number] {
  const ct = pythonGenerator.valueToCode(block, 'CT', Order.ATOMIC) || '""';
  const da = pythonGenerator.valueToCode(block, 'DA', Order.ATOMIC) || '""';
  registerSm2Enc();
  return ['sm2_decrypt(' + ct + ', ' + da + ')', Order.ATOMIC];
};

pythonGenerator.forBlock['sm2_key_exchange'] = function (block: Block): [string, number] {
  const db = pythonGenerator.valueToCode(block, 'DB', Order.ATOMIC) || '""';
  const rb = pythonGenerator.valueToCode(block, 'RBVAL', Order.ATOMIC) || '""';
  const pax = pythonGenerator.valueToCode(block, 'PAX', Order.ATOMIC) || '""';
  const pay = pythonGenerator.valueToCode(block, 'PAY', Order.ATOMIC) || '""';
  const ra = pythonGenerator.valueToCode(block, 'RA', Order.ATOMIC) || '""';
  const rbp = pythonGenerator.valueToCode(block, 'RBP', Order.ATOMIC) || '""';
  const za = pythonGenerator.valueToCode(block, 'ZA', Order.ATOMIC) || '""';
  const zb = pythonGenerator.valueToCode(block, 'ZB', Order.ATOMIC) || '""';
  const wlen = pythonGenerator.valueToCode(block, 'WLEN', Order.ATOMIC) || '128';
  registerSm2Enc();
  return [
    'sm2_key_exchange(' + db + ', ' + rb + ', ' + pax + ', ' + pay + ', ' + ra + ', ' + rbp + ', ' + za + ', ' + zb + ', ' + wlen + ')',
    Order.ATOMIC,
  ];
};
