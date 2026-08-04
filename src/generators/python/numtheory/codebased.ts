/**
 * 编码基数学块 Python 生成器
 *
 * GF(2) 多项式（系数数组 index=幂次，低位在前）+ 二进制矩阵（展平 n×n）+ 汉明量。
 */
import { pythonGenerator, Order } from 'blockly/python';
import type { Block } from 'blockly/core';

function registerCodeBased(): string {
  return pythonGenerator.provideFunction_('code_based', [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '():',
    '    def trim(p):',
    '        p = list(p)',
    '        while len(p) > 1 and p[-1] == 0:',
    '            p.pop()',
    '        return p',
    '    def poly_mul(a, b):',
    '        out = [0] * (len(a) + len(b) - 1)',
    '        for i, ai in enumerate(a):',
    '            if ai:',
    '                for j, bj in enumerate(b):',
    '                    if bj:',
    '                        out[i + j] ^= 1',
    '        return out',
    '    def poly_divmod(a, b):',
    '        a = trim(a); b = trim(b)',
    '        if len(b) == 1 and b[0] == 0:',
    '            return [0], [0]',
    '        q = [0] * max(len(a) - len(b) + 1, 0)',
    '        r = a[:]',
    '        while len(r) >= len(b):',
    '            if r[-1] == 1:',
    '                shift = len(r) - len(b)',
    '                q[shift] ^= 1',
    '                for i in range(len(b)):',
    '                    r[shift + i] ^= b[i]',
    '            r.pop()',
    '        return q, trim(r if r else [0])',
    '    def poly_gcd(a, b):',
    '        while not (len(b) == 1 and b[0] == 0):',
    '            a, b = b, poly_divmod(a, b)[1]',
    '        return a',
    '    def mat_mul(a, b, n):',
    '        out = [0] * (n * n)',
    '        for i in range(n):',
    '            for k in range(n):',
    '                if a[i * n + k]:',
    '                    for j in range(n):',
    '                        out[i * n + j] ^= b[k * n + j] & 1',
    '        return out',
    '    def mat_inv(a, n):',
    '        m = list(a); inv = [0] * (n * n)',
    '        for i in range(n):',
    '            inv[i * n + i] = 1',
    '        for col in range(n):',
    '            piv = -1',
    '            for r in range(col, n):',
    '                if m[r * n + col] == 1:',
    '                    piv = r; break',
    '            if piv < 0:',
    '                return []',
    '            if piv != col:',
    '                for j in range(n):',
    '                    m[col * n + j], m[piv * n + j] = m[piv * n + j], m[col * n + j]',
    '                    inv[col * n + j], inv[piv * n + j] = inv[piv * n + j], inv[col * n + j]',
    '            for r2 in range(n):',
    '                if r2 != col and m[r2 * n + col] == 1:',
    '                    for j2 in range(n):',
    '                        m[r2 * n + j2] ^= m[col * n + j2]',
    '                        inv[r2 * n + j2] ^= inv[col * n + j2]',
    '        return inv',
    '    def ham_weight(x):',
    '        return sum(1 for v in x if v != 0)',
    '    def ham_dist(x, y):',
    '        return sum(1 for a, b in zip(x, y) if a != b)',
    '    def gf_mul(a, b):',
    '        p = 0',
    '        for _ in range(8):',
    '            if b & 1: p ^= a',
    '            hi = a & 0x80',
    '            a = (a << 1) & 0xFF',
    '            if hi: a ^= 0x1B',
    '            b >>= 1',
    '        return p',
    '    def goppa_gen_poly(alpha):',
    '        g = [1]',
    '        for al in alpha:',
    '            nxt = [0] * (len(g) + 1)',
    '            for j, gj in enumerate(g):',
    '                nxt[j] ^= gf_mul(gj, al)',
    '                nxt[j + 1] ^= gj',
    '            g = nxt',
    '        return g',
    '    def syndrome_calc(h, y, rows, cols):',
    '        return [sum((h[i * cols + j] & 1) * (y[j] & 1) for j in range(cols)) & 1 for i in range(rows)]',
    '    return {"poly_mul": poly_mul, "poly_div": lambda a, b: poly_divmod(a, b)[0], "poly_mod": lambda a, b: poly_divmod(a, b)[1], "poly_gcd": poly_gcd, "mat_mul": mat_mul, "mat_inv": mat_inv, "ham_weight": ham_weight, "ham_dist": ham_dist, "goppa_gen_poly": goppa_gen_poly, "syndrome_calc": syndrome_calc}',
    '',
  ]);
}

pythonGenerator.forBlock['gf2_poly_mul'] = function (block: Block): [string, number] {
  const a = pythonGenerator.valueToCode(block, 'A', Order.ATOMIC) || '[]';
  const b = pythonGenerator.valueToCode(block, 'B', Order.ATOMIC) || '[]';
  const fn = registerCodeBased();
  return [fn + '()["poly_mul"](' + a + ', ' + b + ')', Order.ATOMIC];
};

pythonGenerator.forBlock['gf2_poly_div'] = function (block: Block): [string, number] {
  const a = pythonGenerator.valueToCode(block, 'A', Order.ATOMIC) || '[]';
  const b = pythonGenerator.valueToCode(block, 'B', Order.ATOMIC) || '[]';
  const fn = registerCodeBased();
  return [fn + '()["poly_div"](' + a + ', ' + b + ')', Order.ATOMIC];
};

pythonGenerator.forBlock['gf2_poly_mod'] = function (block: Block): [string, number] {
  const a = pythonGenerator.valueToCode(block, 'A', Order.ATOMIC) || '[]';
  const b = pythonGenerator.valueToCode(block, 'B', Order.ATOMIC) || '[]';
  const fn = registerCodeBased();
  return [fn + '()["poly_mod"](' + a + ', ' + b + ')', Order.ATOMIC];
};

pythonGenerator.forBlock['gf2_poly_gcd'] = function (block: Block): [string, number] {
  const a = pythonGenerator.valueToCode(block, 'A', Order.ATOMIC) || '[]';
  const b = pythonGenerator.valueToCode(block, 'B', Order.ATOMIC) || '[]';
  const fn = registerCodeBased();
  return [fn + '()["poly_gcd"](' + a + ', ' + b + ')', Order.ATOMIC];
};

pythonGenerator.forBlock['bin_mat_mul'] = function (block: Block): [string, number] {
  const a = pythonGenerator.valueToCode(block, 'A', Order.ATOMIC) || '[]';
  const b = pythonGenerator.valueToCode(block, 'B', Order.ATOMIC) || '[]';
  const n = pythonGenerator.valueToCode(block, 'N', Order.ATOMIC) || '2';
  const fn = registerCodeBased();
  return [fn + '()["mat_mul"](' + a + ', ' + b + ', ' + n + ')', Order.ATOMIC];
};

pythonGenerator.forBlock['bin_mat_inv'] = function (block: Block): [string, number] {
  const a = pythonGenerator.valueToCode(block, 'A', Order.ATOMIC) || '[]';
  const n = pythonGenerator.valueToCode(block, 'N', Order.ATOMIC) || '2';
  const fn = registerCodeBased();
  return [fn + '()["mat_inv"](' + a + ', ' + n + ')', Order.ATOMIC];
};

pythonGenerator.forBlock['ham_weight'] = function (block: Block): [string, number] {
  const x = pythonGenerator.valueToCode(block, 'X', Order.ATOMIC) || '[]';
  const fn = registerCodeBased();
  return [fn + '()["ham_weight"](' + x + ')', Order.ATOMIC];
};

pythonGenerator.forBlock['ham_dist'] = function (block: Block): [string, number] {
  const x = pythonGenerator.valueToCode(block, 'X', Order.ATOMIC) || '[]';
  const y = pythonGenerator.valueToCode(block, 'Y', Order.ATOMIC) || '[]';
  const fn = registerCodeBased();
  return [fn + '()["ham_dist"](' + x + ', ' + y + ')', Order.ATOMIC];
};

pythonGenerator.forBlock['goppa_gen_poly'] = function (block: Block): [string, number] {
  const alpha = pythonGenerator.valueToCode(block, 'ALPHA', Order.ATOMIC) || '[]';
  const fn = registerCodeBased();
  return [fn + '()["goppa_gen_poly"](' + alpha + ')', Order.ATOMIC];
};

pythonGenerator.forBlock['syndrome_calc'] = function (block: Block): [string, number] {
  const h = pythonGenerator.valueToCode(block, 'H', Order.ATOMIC) || '[]';
  const y = pythonGenerator.valueToCode(block, 'Y', Order.ATOMIC) || '[]';
  const rows = pythonGenerator.valueToCode(block, 'ROWS', Order.ATOMIC) || '2';
  const cols = pythonGenerator.valueToCode(block, 'COLS', Order.ATOMIC) || '4';
  const fn = registerCodeBased();
  return [fn + '()["syndrome_calc"](' + h + ', ' + y + ', ' + rows + ', ' + cols + ')', Order.ATOMIC];
};
