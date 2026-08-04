/**
 * GF(2^m) 系数多项式 JavaScript 生成器（McEliece/Goppa 编码基）
 *
 * 内嵌完整闭包（gf2mPoly）：GF(2^8) AES 域（0x11B，与 codebased 同域同实现），
 * 系数数组低位在前。gfInv 用 Fermat 快速幂 a^254；polyDivmod 除数归一化为首一；
 * xgcd 输出 [lenU, u…, lenV, v…, g…] 展平（g 首一）。
 */
import { javascriptGenerator, Order } from 'blockly/javascript';
import type { Block } from 'blockly/core';

function registerGf2mPoly(): string {
  return javascriptGenerator.provideFunction_('gf2mPoly', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '() {',
    '  function trim(p) {',
    '    p = p.slice();',
    '    while (p.length > 1 && p[p.length - 1] === 0) p.pop();',
    '    return p;',
    '  }',
    '  function gfMul(a, b) {',
    '    let p = 0;',
    '    for (let i = 0; i < 8; i++) {',
    '      if (b & 1) p ^= a;',
    '      let hi = a & 0x80;',
    '      a = (a << 1) & 0xFF;',
    '      if (hi) a ^= 0x1B;',
    '      b >>= 1;',
    '    }',
    '    return p;',
    '  }',
    '  function gfInv(a) {',
    '    if (a === 0) return 0;',
    '    let r = 1;',
    '    for (let bit of (254).toString(2)) {',
    '      r = gfMul(r, r);',
    '      if (bit === "1") r = gfMul(r, a);',
    '    }',
    '    return r;',
    '  }',
    '  function polyAdd(a, b) {',
    '    let out = new Array(Math.max(a.length, b.length)).fill(0);',
    '    for (let i = 0; i < a.length; i++) out[i] ^= a[i];',
    '    for (let i = 0; i < b.length; i++) out[i] ^= b[i];',
    '    return trim(out);',
    '  }',
    '  function polyMul(a, b) {',
    '    let out = new Array(a.length + b.length - 1).fill(0);',
    '    for (let i = 0; i < a.length; i++) {',
    '      if (!a[i]) continue;',
    '      for (let j = 0; j < b.length; j++) {',
    '        if (b[j]) out[i + j] ^= gfMul(a[i], b[j]);',
    '      }',
    '    }',
    '    return trim(out);',
    '  }',
    '  function polyDivmod(a, b) {',
    '    a = trim(a); b = trim(b);',
    '    if (b.length === 1 && b[0] === 0) return [[0], [0]];',
    '    let lcInv = gfInv(b[b.length - 1]);',
    '    let q = new Array(Math.max(a.length - b.length + 1, 0)).fill(0);',
    '    let r = a.slice();',
    '    while (r.length >= b.length) {',
    '      let qc = gfMul(r[r.length - 1], lcInv);',
    '      if (qc) {',
    '        let shift = r.length - b.length;',
    '        q[shift] = qc;',
    '        for (let i = 0; i < b.length; i++) r[shift + i] ^= gfMul(qc, b[i]);',
    '      }',
    '      r.pop();',
    '    }',
    '    return [trim(q), trim(r.length ? r : [0])];',
    '  }',
    '  function polyXgcd(a, b) {',
    '    let r0 = trim(a), r1 = trim(b);',
    '    let s0 = [1], s1 = [0];',
    '    let t0 = [0], t1 = [1];',
    '    while (!(r1.length === 1 && r1[0] === 0)) {',
    '      let dm = polyDivmod(r0, r1);',
    '      let q = dm[0], r = dm[1];',
    '      r0 = r1; r1 = r;',
    '      let ns = polyAdd(s0, polyMul(q, s1)); s0 = s1; s1 = ns;',
    '      let nt = polyAdd(t0, polyMul(q, t1)); t0 = t1; t1 = nt;',
    '    }',
    '    let lc = r0[r0.length - 1];',
    '    if (lc !== 1) {',
    '      let inv = gfInv(lc);',
    '      r0 = r0.map((c) => gfMul(c, inv));',
    '      s0 = s0.map((c) => gfMul(c, inv));',
    '      t0 = t0.map((c) => gfMul(c, inv));',
    '    }',
    '    return [s0.length].concat(s0, [t0.length], t0, r0);',
    '  }',
    '  function polyEval(p, x) {',
    '    let r = 0;',
    '    p = trim(p);',
    '    for (let i = p.length - 1; i >= 0; i--) r = gfMul(r, x) ^ p[i];',
    '    return r;',
    '  }',
    '  return { polyAdd: polyAdd, polyMul: polyMul, polyMod: (a, b) => polyDivmod(a, b)[1], polyXgcd: polyXgcd, polyEval: polyEval };',
    '}',
  ]);
}

javascriptGenerator.forBlock['gf2m_poly_add'] = function (block: Block): [string, number] {
  const a = javascriptGenerator.valueToCode(block, 'A', Order.ATOMIC) || '[]';
  const b = javascriptGenerator.valueToCode(block, 'B', Order.ATOMIC) || '[]';
  const fn = registerGf2mPoly();
  return [fn + '().polyAdd(' + a + ', ' + b + ')', Order.ATOMIC];
};

javascriptGenerator.forBlock['gf2m_poly_mul'] = function (block: Block): [string, number] {
  const a = javascriptGenerator.valueToCode(block, 'A', Order.ATOMIC) || '[]';
  const b = javascriptGenerator.valueToCode(block, 'B', Order.ATOMIC) || '[]';
  const fn = registerGf2mPoly();
  return [fn + '().polyMul(' + a + ', ' + b + ')', Order.ATOMIC];
};

javascriptGenerator.forBlock['gf2m_poly_mod'] = function (block: Block): [string, number] {
  const a = javascriptGenerator.valueToCode(block, 'A', Order.ATOMIC) || '[]';
  const b = javascriptGenerator.valueToCode(block, 'B', Order.ATOMIC) || '[]';
  const fn = registerGf2mPoly();
  return [fn + '().polyMod(' + a + ', ' + b + ')', Order.ATOMIC];
};

javascriptGenerator.forBlock['gf2m_poly_xgcd'] = function (block: Block): [string, number] {
  const a = javascriptGenerator.valueToCode(block, 'A', Order.ATOMIC) || '[]';
  const b = javascriptGenerator.valueToCode(block, 'B', Order.ATOMIC) || '[]';
  const fn = registerGf2mPoly();
  return [fn + '().polyXgcd(' + a + ', ' + b + ')', Order.ATOMIC];
};

javascriptGenerator.forBlock['gf2m_poly_eval'] = function (block: Block): [string, number] {
  const p = javascriptGenerator.valueToCode(block, 'P', Order.ATOMIC) || '[]';
  const x = javascriptGenerator.valueToCode(block, 'X', Order.ATOMIC) || '0';
  const fn = registerGf2mPoly();
  return [fn + '().polyEval(' + p + ', ' + x + ')', Order.ATOMIC];
};
