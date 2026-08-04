/**
 * 编码基数学块 JavaScript 生成器
 *
 * GF(2) 多项式（系数数组 index=幂次，低位在前）+ 二进制矩阵（展平 n×n）+ 汉明量。
 * 全部内嵌实现（一次 registerCodeBased 注册 8 个纯函数）。
 */
import { javascriptGenerator, Order } from 'blockly/javascript';
import type { Block } from 'blockly/core';

function registerCodeBased(): string {
  return javascriptGenerator.provideFunction_('codeBased', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '() {',
    '  function trim(p) { while (p.length > 1 && p[p.length - 1] === 0) p.pop(); return p; }',
    '  function polyMul(a, b) {',
    '    var out = new Array(a.length + b.length - 1).fill(0);',
    '    for (var i = 0; i < a.length; i++) if (a[i]) for (var j = 0; j < b.length; j++) if (b[j]) out[i + j] ^= 1;',
    '    return out;',
    '  }',
    '  function polyDivMod(a, b) {',
    '    a = trim(a.slice()); b = trim(b.slice());',
    '    if (b.length === 1 && b[0] === 0) return [[0], [0]];',
    '    var q = new Array(Math.max(a.length - b.length + 1, 0)).fill(0);',
    '    var r = a.slice();',
    '    while (r.length >= b.length) {',
    '      if (r[r.length - 1] === 1) {',
    '        var shift = r.length - b.length;',
    '        q[shift] ^= 1;',
    '        for (var i = 0; i < b.length; i++) r[shift + i] ^= b[i];',
    '      }',
    '      r.pop();',
    '    }',
    '    return [q, trim(r.length ? r : [0])];',
    '  }',
    '  function polyGcd(a, b) {',
    '    while (!(b.length === 1 && b[0] === 0)) { var t = polyDivMod(a, b)[1]; a = b; b = t; }',
    '    return a;',
    '  }',
    '  function matMul(a, b, n) {',
    '    var out = new Array(n * n).fill(0);',
    '    for (var i = 0; i < n; i++) for (var k = 0; k < n; k++) if (a[i * n + k]) for (var j = 0; j < n; j++) out[i * n + j] ^= b[k * n + j] & 1;',
    '    return out;',
    '  }',
    '  function matInv(a, n) {',
    '    var m = a.slice(); var inv = new Array(n * n).fill(0);',
    '    for (var i = 0; i < n; i++) inv[i * n + i] = 1;',
    '    for (var col = 0; col < n; col++) {',
    '      var piv = -1; for (var r = col; r < n; r++) if (m[r * n + col] === 1) { piv = r; break; }',
    '      if (piv < 0) return [];',
    '      if (piv !== col) { for (var j = 0; j < n; j++) { var t = m[col * n + j]; m[col * n + j] = m[piv * n + j]; m[piv * n + j] = t; t = inv[col * n + j]; inv[col * n + j] = inv[piv * n + j]; inv[piv * n + j] = t; } }',
    '      for (var r2 = 0; r2 < n; r2++) if (r2 !== col && m[r2 * n + col] === 1) { for (var j2 = 0; j2 < n; j2++) { m[r2 * n + j2] ^= m[col * n + j2]; inv[r2 * n + j2] ^= inv[col * n + j2]; } }',
    '    }',
    '    return inv;',
    '  }',
    '  function hamWeight(x) { var c = 0; for (var i = 0; i < x.length; i++) if (x[i] !== 0) c++; return c; }',
    '  function gfMul(a, b) { var p = 0; for (var i = 0; i < 8; i++) { if (b & 1) p ^= a; var hi = a & 0x80; a = (a << 1) & 0xFF; if (hi) a ^= 0x1B; b >>= 1; } return p; }',
    '  function goppaGenPoly(alpha) {',
    '    var g = [1];',
    '    for (var i = 0; i < alpha.length; i++) {',
    '      var next = new Array(g.length + 1).fill(0);',
    '      for (var j = 0; j < g.length; j++) { next[j] ^= gfMul(g[j], alpha[i]); next[j + 1] ^= g[j]; }',
    '      g = next;',
    '    }',
    '    return g;',
    '  }',
    '  function syndromeCalc(h, y, rows, cols) {',
    '    var s = new Array(rows).fill(0);',
    '    for (var i = 0; i < rows; i++) for (var j = 0; j < cols; j++) s[i] ^= (h[i * cols + j] & 1) * (y[j] & 1);',
    '    return s;',
    '  }',
    '  function hamDist(x, y) { var c = 0; for (var i = 0; i < x.length; i++) if (x[i] !== y[i]) c++; return c; }',
    '  return { polyMul: polyMul, polyDiv: function(a,b){return polyDivMod(a,b)[0];}, polyMod: function(a,b){return polyDivMod(a,b)[1];}, polyGcd: polyGcd, matMul: matMul, matInv: matInv, hamWeight: hamWeight, hamDist: hamDist, goppaGenPoly: goppaGenPoly, syndromeCalc: syndromeCalc };',
    '}',
  ]);
}

javascriptGenerator.forBlock['gf2_poly_mul'] = function (block: Block): [string, number] {
  const a = javascriptGenerator.valueToCode(block, 'A', Order.ATOMIC) || '[]';
  const b = javascriptGenerator.valueToCode(block, 'B', Order.ATOMIC) || '[]';
  const fn = registerCodeBased();
  return [fn + '().polyMul(' + a + ', ' + b + ')', Order.ATOMIC];
};

javascriptGenerator.forBlock['gf2_poly_div'] = function (block: Block): [string, number] {
  const a = javascriptGenerator.valueToCode(block, 'A', Order.ATOMIC) || '[]';
  const b = javascriptGenerator.valueToCode(block, 'B', Order.ATOMIC) || '[]';
  const fn = registerCodeBased();
  return [fn + '().polyDiv(' + a + ', ' + b + ')', Order.ATOMIC];
};

javascriptGenerator.forBlock['gf2_poly_mod'] = function (block: Block): [string, number] {
  const a = javascriptGenerator.valueToCode(block, 'A', Order.ATOMIC) || '[]';
  const b = javascriptGenerator.valueToCode(block, 'B', Order.ATOMIC) || '[]';
  const fn = registerCodeBased();
  return [fn + '().polyMod(' + a + ', ' + b + ')', Order.ATOMIC];
};

javascriptGenerator.forBlock['gf2_poly_gcd'] = function (block: Block): [string, number] {
  const a = javascriptGenerator.valueToCode(block, 'A', Order.ATOMIC) || '[]';
  const b = javascriptGenerator.valueToCode(block, 'B', Order.ATOMIC) || '[]';
  const fn = registerCodeBased();
  return [fn + '().polyGcd(' + a + ', ' + b + ')', Order.ATOMIC];
};

javascriptGenerator.forBlock['bin_mat_mul'] = function (block: Block): [string, number] {
  const a = javascriptGenerator.valueToCode(block, 'A', Order.ATOMIC) || '[]';
  const b = javascriptGenerator.valueToCode(block, 'B', Order.ATOMIC) || '[]';
  const n = javascriptGenerator.valueToCode(block, 'N', Order.ATOMIC) || '2';
  const fn = registerCodeBased();
  return [fn + '().matMul(' + a + ', ' + b + ', ' + n + ')', Order.ATOMIC];
};

javascriptGenerator.forBlock['bin_mat_inv'] = function (block: Block): [string, number] {
  const a = javascriptGenerator.valueToCode(block, 'A', Order.ATOMIC) || '[]';
  const n = javascriptGenerator.valueToCode(block, 'N', Order.ATOMIC) || '2';
  const fn = registerCodeBased();
  return [fn + '().matInv(' + a + ', ' + n + ')', Order.ATOMIC];
};

javascriptGenerator.forBlock['ham_weight'] = function (block: Block): [string, number] {
  const x = javascriptGenerator.valueToCode(block, 'X', Order.ATOMIC) || '[]';
  const fn = registerCodeBased();
  return [fn + '().hamWeight(' + x + ')', Order.ATOMIC];
};

javascriptGenerator.forBlock['ham_dist'] = function (block: Block): [string, number] {
  const x = javascriptGenerator.valueToCode(block, 'X', Order.ATOMIC) || '[]';
  const y = javascriptGenerator.valueToCode(block, 'Y', Order.ATOMIC) || '[]';
  const fn = registerCodeBased();
  return [fn + '().hamDist(' + x + ', ' + y + ')', Order.ATOMIC];
};

javascriptGenerator.forBlock['goppa_gen_poly'] = function (block: Block): [string, number] {
  const alpha = javascriptGenerator.valueToCode(block, 'ALPHA', Order.ATOMIC) || '[]';
  const fn = registerCodeBased();
  return [fn + '().goppaGenPoly(' + alpha + ')', Order.ATOMIC];
};

javascriptGenerator.forBlock['syndrome_calc'] = function (block: Block): [string, number] {
  const h = javascriptGenerator.valueToCode(block, 'H', Order.ATOMIC) || '[]';
  const y = javascriptGenerator.valueToCode(block, 'Y', Order.ATOMIC) || '[]';
  const rows = javascriptGenerator.valueToCode(block, 'ROWS', Order.ATOMIC) || '2';
  const cols = javascriptGenerator.valueToCode(block, 'COLS', Order.ATOMIC) || '4';
  const fn = registerCodeBased();
  return [fn + '().syndromeCalc(' + h + ', ' + y + ', ' + rows + ', ' + cols + ')', Order.ATOMIC];
};
