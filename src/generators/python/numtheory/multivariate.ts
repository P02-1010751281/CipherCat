/**
 * 多变量与通用数学块生成器（Python）
 *
 * - gauss_elim: 浮点高斯消元解 Ax=b（增广矩阵展平 n×(n+1)）→ 解向量
 * - mv_quad_eval: 多元二次多项式求值（系数展平 = 二次上三角‖一次‖常数）
 * - comb: 组合数（迭代乘法）
 */
import { pythonGenerator, Order } from 'blockly/python';
import type { Block } from 'blockly/core';

function registerMultivariate(): string {
  return pythonGenerator.provideFunction_('multivariate', [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '():',
    '    def gauss_elim(aug, n):',
    '        m = [[float(aug[i * (n + 1) + j]) for j in range(n + 1)] for i in range(n)]',
    '        for col in range(n):',
    '            piv = col',
    '            while piv < n and m[piv][col] == 0:',
    '                piv += 1',
    '            if piv == n:',
    '                return []',
    '            if piv != col:',
    '                m[col], m[piv] = m[piv], m[col]',
    '            for r in range(n):',
    '                if r != col and m[r][col] != 0:',
    '                    f = m[r][col] / m[col][col]',
    '                    for j in range(n + 1):',
    '                        m[r][j] -= f * m[col][j]',
    '        return [m[i][n] / m[i][i] for i in range(n)]',
    '    def mv_quad_eval(coeffs, x):',
    '        n = len(x)',
    '        idx = 0; s = 0.0',
    '        for i in range(n):',
    '            for j in range(i, n):',
    '                s += coeffs[idx] * x[i] * x[j]',
    '                idx += 1',
    '        for i in range(n):',
    '            s += coeffs[idx] * x[i]',
    '            idx += 1',
    '        s += coeffs[idx]',
    '        return s',
    '    def comb(n, k):',
    '        if k < 0 or k > n:',
    '            return 0',
    '        k = min(k, n - k)',
    '        r = 1',
    '        for i in range(k):',
    '            r = r * (n - i) // (i + 1)',
    '        return r',
    '    def vec_dot(a, b):',
    '        return sum(x * y for x, y in zip(a, b))',
    '    def poly_scale(p, k):',
    '        return [x * k for x in p]',
    '    def lll_reduce(basis, rows, cols):',
    '        b = [list(map(float, basis[i * cols:(i + 1) * cols])) for i in range(rows)]',
    '        delta = 0.75',
    '        b_star = [b[0][:]] + [None] * (rows - 1)',
    '        mu = [[0.0] * rows for _ in range(rows)]',
    '        def dot(x, y):',
    '            return sum(x[j] * y[j] for j in range(cols))',
    '        k = 1',
    '        while k < rows:',
    '            for j in range(k):',
    '                mu[k][j] = dot(b[k], b_star[j]) / dot(b_star[j], b_star[j]) if dot(b_star[j], b_star[j]) else 0.0',
    '                q = round(mu[k][j])',
    '                if q != 0:',
    '                    for c in range(cols): b[k][c] -= q * b[j][c]',
    '            b_star[k] = b[k][:]',
    '            for j in range(k):',
    '                mjk = dot(b[k], b_star[j]) / dot(b_star[j], b_star[j]) if dot(b_star[j], b_star[j]) else 0.0',
    '                for c in range(cols): b_star[k][c] -= mjk * b_star[j][c]',
    '            mu_k = dot(b[k], b_star[k - 1]) / dot(b_star[k - 1], b_star[k - 1]) if dot(b_star[k - 1], b_star[k - 1]) else 0.0',
    '            ok = dot(b_star[k], b_star[k]) >= (delta - mu_k * mu_k) * dot(b_star[k - 1], b_star[k - 1])',
    '            if ok:',
    '                k += 1',
    '            else:',
    '                b[k], b[k - 1] = b[k - 1], b[k]',
    '                k = max(k - 1, 1)',
    '        return [round(b[i][j]) for i in range(rows) for j in range(cols)]',
    '    def gauss_pmf(x, sigma):',
    '        E = 2.718281828459045',
    '        rng = int(20 * sigma)',
    '        Z = sum(E ** (-i * i / (2 * sigma * sigma)) for i in range(-rng, rng + 1))',
    '        return E ** (-x * x / (2 * sigma * sigma)) / Z',
    '    return {"gauss_elim": gauss_elim, "mv_quad_eval": mv_quad_eval, "comb": comb, "vec_dot": vec_dot, "poly_scale": poly_scale, "lll_reduce": lll_reduce, "gauss_pmf": gauss_pmf}',
    '',
  ]);
}

pythonGenerator.forBlock['gauss_elim'] = function (block: Block): [string, number] {
  const aug = pythonGenerator.valueToCode(block, 'AUG', Order.ATOMIC) || '[]';
  const n = pythonGenerator.valueToCode(block, 'N', Order.ATOMIC) || '3';
  const fn = registerMultivariate();
  return [fn + '()["gauss_elim"](' + aug + ', ' + n + ')', Order.ATOMIC];
};

pythonGenerator.forBlock['mv_quad_eval'] = function (block: Block): [string, number] {
  const c = pythonGenerator.valueToCode(block, 'COEFFS', Order.ATOMIC) || '[]';
  const x = pythonGenerator.valueToCode(block, 'X', Order.ATOMIC) || '[]';
  const fn = registerMultivariate();
  return [fn + '()["mv_quad_eval"](' + c + ', ' + x + ')', Order.ATOMIC];
};

pythonGenerator.forBlock['comb'] = function (block: Block): [string, number] {
  const n = pythonGenerator.valueToCode(block, 'N', Order.ATOMIC) || '0';
  const k = pythonGenerator.valueToCode(block, 'K', Order.ATOMIC) || '0';
  const fn = registerMultivariate();
  return [fn + '()["comb"](' + n + ', ' + k + ')', Order.ATOMIC];
};

pythonGenerator.forBlock['vec_dot'] = function (block: Block): [string, number] {
  const a = pythonGenerator.valueToCode(block, 'A', Order.ATOMIC) || '[]';
  const b = pythonGenerator.valueToCode(block, 'B', Order.ATOMIC) || '[]';
  const fn = registerMultivariate();
  return [fn + '()["vec_dot"](' + a + ', ' + b + ')', Order.ATOMIC];
};

pythonGenerator.forBlock['poly_scale'] = function (block: Block): [string, number] {
  const p = pythonGenerator.valueToCode(block, 'P', Order.ATOMIC) || '[]';
  const k = pythonGenerator.valueToCode(block, 'K', Order.ATOMIC) || '1';
  const fn = registerMultivariate();
  return [fn + '()["poly_scale"](' + p + ', ' + k + ')', Order.ATOMIC];
};

pythonGenerator.forBlock['lll_reduce'] = function (block: Block): [string, number] {
  const basis = pythonGenerator.valueToCode(block, 'BASIS', Order.ATOMIC) || '[]';
  const rows = pythonGenerator.valueToCode(block, 'ROWS', Order.ATOMIC) || '2';
  const cols = pythonGenerator.valueToCode(block, 'COLS', Order.ATOMIC) || '2';
  const fn = registerMultivariate();
  return [fn + '()["lll_reduce"](' + basis + ', ' + rows + ', ' + cols + ')', Order.ATOMIC];
};

pythonGenerator.forBlock['gauss_pmf'] = function (block: Block): [string, number] {
  const x = pythonGenerator.valueToCode(block, 'X', Order.ATOMIC) || '0';
  const sigma = pythonGenerator.valueToCode(block, 'SIGMA', Order.ATOMIC) || '2';
  const fn = registerMultivariate();
  return [fn + '()["gauss_pmf"](' + x + ', ' + sigma + ')', Order.ATOMIC];
};
