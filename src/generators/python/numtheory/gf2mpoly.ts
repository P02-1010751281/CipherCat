/**
 * GF(2^m) 系数多项式 Python 生成器（McEliece/Goppa 编码基）
 *
 * 内嵌完整闭包（gf2m_poly）：GF(2^8) AES 域（0x11B，与 codebased 的 gf_mul 同域同实现），
 * 系数数组低位在前。gf_inv 用 Fermat 快速幂 a^254（群阶 255）；poly_divmod 除数归一化为
 * 首一；xgcd 输出 [len_u, u…, len_v, v…, g…] 展平（g 首一）。
 */
import { pythonGenerator, Order } from 'blockly/python';
import type { Block } from 'blockly/core';

function registerGf2mPoly(): string {
  return pythonGenerator.provideFunction_('gf2m_poly', [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '():',
    '    def trim(p):',
    '        p = list(p)',
    '        while len(p) > 1 and p[-1] == 0:',
    '            p.pop()',
    '        return p',
    '    def gf_mul(a, b):',
    '        p = 0',
    '        for _ in range(8):',
    '            if b & 1: p ^= a',
    '            hi = a & 0x80',
    '            a = (a << 1) & 0xFF',
    '            if hi: a ^= 0x1B',
    '            b >>= 1',
    '        return p',
    '    def gf_inv(a):',
    '        # Fermat: a^-1 = a^254（GF(2^8)* 群阶 255）',
    '        if a == 0: return 0',
    '        r = 1',
    '        for bit in bin(254)[2:]:',
    '            r = gf_mul(r, r)',
    '            if bit == "1": r = gf_mul(r, a)',
    '        return r',
    '    def poly_add(a, b):',
    '        out = [0] * max(len(a), len(b))',
    '        for i in range(len(a)): out[i] ^= a[i]',
    '        for i in range(len(b)): out[i] ^= b[i]',
    '        return trim(out)',
    '    def poly_mul(a, b):',
    '        out = [0] * (len(a) + len(b) - 1)',
    '        for i, ai in enumerate(a):',
    '            if ai:',
    '                for j, bj in enumerate(b):',
    '                    if bj:',
    '                        out[i + j] ^= gf_mul(ai, bj)',
    '        return trim(out)',
    '    def poly_divmod(a, b):',
    '        a = trim(a); b = trim(b)',
    '        if len(b) == 1 and b[0] == 0:',
    '            return [0], [0]',
    '        lc_inv = gf_inv(b[-1])',
    '        q = [0] * max(len(a) - len(b) + 1, 0)',
    '        r = a[:]',
    '        while len(r) >= len(b):',
    '            qc = gf_mul(r[-1], lc_inv)',
    '            if qc:',
    '                shift = len(r) - len(b)',
    '                q[shift] = qc',
    '                for i in range(len(b)):',
    '                    r[shift + i] ^= gf_mul(qc, b[i])',
    '            r.pop()',
    '        return trim(q), trim(r if r else [0])',
    '    def poly_xgcd(a, b):',
    '        r0, r1 = trim(a), trim(b)',
    '        s0, s1 = [1], [0]',
    '        t0, t1 = [0], [1]',
    '        while not (len(r1) == 1 and r1[0] == 0):',
    '            q, r = poly_divmod(r0, r1)',
    '            r0, r1 = r1, r',
    '            s0, s1 = s1, poly_add(s0, poly_mul(q, s1))',
    '            t0, t1 = t1, poly_add(t0, poly_mul(q, t1))',
    '        lc = r0[-1]',
    '        if lc != 1:',
    '            inv = gf_inv(lc)',
    '            r0 = [gf_mul(c, inv) for c in r0]',
    '            s0 = [gf_mul(c, inv) for c in s0]',
    '            t0 = [gf_mul(c, inv) for c in t0]',
    '        return [len(s0)] + s0 + [len(t0)] + t0 + r0',
    '    def poly_eval(p, x):',
    '        r = 0',
    '        for c in reversed(trim(p)):',
    '            r = gf_mul(r, x) ^ c',
    '        return r',
    '    return {"poly_add": poly_add, "poly_mul": poly_mul, "poly_mod": lambda a, b: poly_divmod(a, b)[1], "poly_xgcd": poly_xgcd, "poly_eval": poly_eval}',
    '',
  ]);
}

pythonGenerator.forBlock['gf2m_poly_add'] = function (block: Block): [string, number] {
  const a = pythonGenerator.valueToCode(block, 'A', Order.ATOMIC) || '[]';
  const b = pythonGenerator.valueToCode(block, 'B', Order.ATOMIC) || '[]';
  const fn = registerGf2mPoly();
  return [fn + '()["poly_add"](' + a + ', ' + b + ')', Order.ATOMIC];
};

pythonGenerator.forBlock['gf2m_poly_mul'] = function (block: Block): [string, number] {
  const a = pythonGenerator.valueToCode(block, 'A', Order.ATOMIC) || '[]';
  const b = pythonGenerator.valueToCode(block, 'B', Order.ATOMIC) || '[]';
  const fn = registerGf2mPoly();
  return [fn + '()["poly_mul"](' + a + ', ' + b + ')', Order.ATOMIC];
};

pythonGenerator.forBlock['gf2m_poly_mod'] = function (block: Block): [string, number] {
  const a = pythonGenerator.valueToCode(block, 'A', Order.ATOMIC) || '[]';
  const b = pythonGenerator.valueToCode(block, 'B', Order.ATOMIC) || '[]';
  const fn = registerGf2mPoly();
  return [fn + '()["poly_mod"](' + a + ', ' + b + ')', Order.ATOMIC];
};

pythonGenerator.forBlock['gf2m_poly_xgcd'] = function (block: Block): [string, number] {
  const a = pythonGenerator.valueToCode(block, 'A', Order.ATOMIC) || '[]';
  const b = pythonGenerator.valueToCode(block, 'B', Order.ATOMIC) || '[]';
  const fn = registerGf2mPoly();
  return [fn + '()["poly_xgcd"](' + a + ', ' + b + ')', Order.ATOMIC];
};

pythonGenerator.forBlock['gf2m_poly_eval'] = function (block: Block): [string, number] {
  const p = pythonGenerator.valueToCode(block, 'P', Order.ATOMIC) || '[]';
  const x = pythonGenerator.valueToCode(block, 'X', Order.ATOMIC) || '0';
  const fn = registerGf2mPoly();
  return [fn + '()["poly_eval"](' + p + ', ' + x + ')', Order.ATOMIC];
};
