/**
 * 多变量与通用数学块生成器（JS）
 *
 * - gaussElim: 浮点高斯消元解 Ax=b（增广矩阵展平 n×(n+1)）→ 解向量
 * - mvQuadEval: 多元二次多项式求值（系数展平 = 二次上三角‖一次‖常数）
 * - comb: 组合数（迭代乘法避免阶乘溢出）
 */
import { javascriptGenerator, Order } from 'blockly/javascript';
import type { Block } from 'blockly/core';

function registerMultivariate(): string {
  return javascriptGenerator.provideFunction_('multivariate', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '() {',
    '  function gaussElim(aug, n) {',
    '    var m = aug.map(Number);',
    '    for (var col = 0; col < n; col++) {',
    '      var piv = col;',
    '      while (piv < n && m[piv * (n + 1) + col] === 0) piv++;',
    '      if (piv === n) return [];',
    '      if (piv !== col) { for (var j = 0; j <= n; j++) { var t = m[col * (n + 1) + j]; m[col * (n + 1) + j] = m[piv * (n + 1) + j]; m[piv * (n + 1) + j] = t; } }',
    '      for (var r = 0; r < n; r++) {',
    '        if (r !== col && m[r * (n + 1) + col] !== 0) {',
    '          var f = m[r * (n + 1) + col] / m[col * (n + 1) + col];',
    '          for (var j2 = 0; j2 <= n; j2++) m[r * (n + 1) + j2] -= f * m[col * (n + 1) + j2];',
    '        }',
    '      }',
    '    }',
    '    var sol = new Array(n);',
    '    for (var i = 0; i < n; i++) sol[i] = m[i * (n + 1) + n] / m[i * (n + 1) + i];',
    '    return sol;',
    '  }',
    '  function mvQuadEval(coeffs, x) {',
    '    var n = x.length;',
    '    var idx = 0, sum = 0;',
    '    for (var i = 0; i < n; i++) for (var j = i; j < n; j++) { sum += coeffs[idx] * x[i] * x[j]; idx++; }',
    '    for (var i = 0; i < n; i++) { sum += coeffs[idx] * x[i]; idx++; }',
    '    sum += coeffs[idx];',
    '    return sum;',
    '  }',
    '  function comb(n, k) {',
    '    if (k < 0 || k > n) return 0;',
    '    if (k > n - k) k = n - k;',
    '    var r = 1;',
    '    for (var i = 0; i < k; i++) r = r * (n - i) / (i + 1);',
    '    return Math.round(r);',
    '  }',
    '  return { gaussElim: gaussElim, mvQuadEval: mvQuadEval, comb: comb };',
    '}',
  ]);
}

javascriptGenerator.forBlock['gauss_elim'] = function (block: Block): [string, number] {
  const aug = javascriptGenerator.valueToCode(block, 'AUG', Order.ATOMIC) || '[]';
  const n = javascriptGenerator.valueToCode(block, 'N', Order.ATOMIC) || '3';
  const fn = registerMultivariate();
  return [fn + '().gaussElim(' + aug + ', ' + n + ')', Order.ATOMIC];
};

javascriptGenerator.forBlock['mv_quad_eval'] = function (block: Block): [string, number] {
  const c = javascriptGenerator.valueToCode(block, 'COEFFS', Order.ATOMIC) || '[]';
  const x = javascriptGenerator.valueToCode(block, 'X', Order.ATOMIC) || '[]';
  const fn = registerMultivariate();
  return [fn + '().mvQuadEval(' + c + ', ' + x + ')', Order.ATOMIC];
};

javascriptGenerator.forBlock['comb'] = function (block: Block): [string, number] {
  const n = javascriptGenerator.valueToCode(block, 'N', Order.ATOMIC) || '0';
  const k = javascriptGenerator.valueToCode(block, 'K', Order.ATOMIC) || '0';
  const fn = registerMultivariate();
  return [fn + '().comb(' + n + ', ' + k + ')', Order.ATOMIC];
};
