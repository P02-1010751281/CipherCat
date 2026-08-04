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
    '    return {"gauss_elim": gauss_elim, "mv_quad_eval": mv_quad_eval, "comb": comb, "vec_dot": vec_dot, "poly_scale": poly_scale}',
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
