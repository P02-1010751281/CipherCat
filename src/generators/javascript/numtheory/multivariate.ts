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
    '  function vecDot(a, b) { var s = 0; for (var i = 0; i < a.length; i++) s += a[i] * b[i]; return s; }',
    '  function polyScale(p, k) { return p.map(function (x) { return x * k; }); }',
    '  function lllReduce(basis, rows, cols) {',
    '    var b = []; for (var i = 0; i < rows; i++) b.push(basis.slice(i * cols, (i + 1) * cols).map(Number));',
    '    var delta = 0.75;',
    '    var bStar = [b[0].slice()], mu = [];',
    '    var dot = function (x, y) { var s = 0; for (var j = 0; j < cols; j++) s += x[j] * y[j]; return s; };',
    '    var sub = function (x, y) { var r = []; for (var j = 0; j < cols; j++) r.push(x[j] - y[j]); return r; };',
    '    var k = 1;',
    '    while (k < rows) {',
    '      for (var j = 0; j < k; j++) {',
    '        mu[j] = dot(b[k], bStar[j]) / dot(bStar[j], bStar[j]);',
    '        var q = Math.round(mu[j]);',
    '        if (q !== 0) { for (var c = 0; c < cols; c++) b[k][c] -= q * b[j][c]; }',
    '      }',
    '      for (var j2 = 0; j2 <= k; j2++) {',
    '        if (j2 === k) { bStar[k] = b[k].slice(); for (var j3 = 0; j3 < k; j3++) { var mjk = dot(b[k], bStar[j3]) / dot(bStar[j3], bStar[j3]); for (var c2 = 0; c2 < cols; c2++) bStar[k][c2] -= mjk * bStar[j3][c2]; } }',
    '      }',
    '      var muK = k > 0 ? dot(b[k], bStar[k - 1]) / dot(bStar[k - 1], bStar[k - 1]) : 0;',
    '      var ok = dot(bStar[k], bStar[k]) >= (delta - muK * muK) * dot(bStar[k - 1], bStar[k - 1]);',
    '      if (ok) k++;',
    '      else { var tmp = b[k]; b[k] = b[k - 1]; b[k - 1] = tmp; k = Math.max(k - 1, 1); }',
    '    }',
    '    var out = []; for (var i2 = 0; i2 < rows; i2++) for (var j4 = 0; j4 < cols; j4++) out.push(b[i2][j4]);',
    '    return out;',
    '  }',
    '  function gaussPmf(x, sigma) {',
    '    var range = Math.ceil(20 * sigma), Z = 0;',
    '    for (var i = -range; i <= range; i++) Z += Math.exp(-i * i / (2 * sigma * sigma));',
    '    return Math.exp(-x * x / (2 * sigma * sigma)) / Z;',
    '  }',
    '  return { gaussElim: gaussElim, mvQuadEval: mvQuadEval, comb: comb, vecDot: vecDot, polyScale: polyScale, lllReduce: lllReduce, gaussPmf: gaussPmf };',
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

javascriptGenerator.forBlock['vec_dot'] = function (block: Block): [string, number] {
  const a = javascriptGenerator.valueToCode(block, 'A', Order.ATOMIC) || '[]';
  const b = javascriptGenerator.valueToCode(block, 'B', Order.ATOMIC) || '[]';
  const fn = registerMultivariate();
  return [fn + '().vecDot(' + a + ', ' + b + ')', Order.ATOMIC];
};

javascriptGenerator.forBlock['poly_scale'] = function (block: Block): [string, number] {
  const p = javascriptGenerator.valueToCode(block, 'P', Order.ATOMIC) || '[]';
  const k = javascriptGenerator.valueToCode(block, 'K', Order.ATOMIC) || '1';
  const fn = registerMultivariate();
  return [fn + '().polyScale(' + p + ', ' + k + ')', Order.ATOMIC];
};

javascriptGenerator.forBlock['lll_reduce'] = function (block: Block): [string, number] {
  const basis = javascriptGenerator.valueToCode(block, 'BASIS', Order.ATOMIC) || '[]';
  const rows = javascriptGenerator.valueToCode(block, 'ROWS', Order.ATOMIC) || '2';
  const cols = javascriptGenerator.valueToCode(block, 'COLS', Order.ATOMIC) || '2';
  const fn = registerMultivariate();
  return [fn + '().lllReduce(' + basis + ', ' + rows + ', ' + cols + ')', Order.ATOMIC];
};

javascriptGenerator.forBlock['gauss_pmf'] = function (block: Block): [string, number] {
  const x = javascriptGenerator.valueToCode(block, 'X', Order.ATOMIC) || '0';
  const sigma = javascriptGenerator.valueToCode(block, 'SIGMA', Order.ATOMIC) || '2';
  const fn = registerMultivariate();
  return [fn + '().gaussPmf(' + x + ', ' + sigma + ')', Order.ATOMIC];
};
