/**
 * FORS 完整签名 JavaScript 代码生成器（FIPS 205 §8）
 *
 * 内嵌完整 FORS（forsCore 闭包）：SHAKE-256 作 PRF/H（复用 registerKeccakF1600 +
 * 与 hashbased.ts 同 key 同内容的 shakeXOF，provideFunction_ 幂等去重）；
 * ADRS 布局沿用项目 slh_addr 约定。教学参数 n=32 / k=4 / a=4（每树 16 叶）。
 * 验证用性质向量：确定性、签名-验证往返、篡改检测。
 */
import { javascriptGenerator, Order } from 'blockly/javascript';
import type { Block } from 'blockly/core';
import { registerKeccakF1600 } from './helpers';

/** SHAKE256 XOF（rate 136）——与 hashbased.ts 同 key 同内容（幂等） */
function registerShakeXOF(): string {
  const keccakFName = registerKeccakF1600();
  return javascriptGenerator.provideFunction_('shakeXOF', [
    'function ' +
      javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ +
      '(inp, outBytes, rate) {',
    '  if (typeof inp === "string") inp = new TextEncoder().encode(inp);',
    '  else if (Array.isArray(inp)) inp = Uint8Array.from(inp);',
    '  let state = new Array(25).fill(0n);',
    '  let padLen = rate - (inp.length % rate);',
    '  if (padLen === 1) padLen += rate;',
    '  let padded = new Uint8Array(inp.length + padLen);',
    '  padded.set(inp);',
    '  padded[inp.length] = 0x1F;',
    '  padded[padded.length - 1] ^= 0x80;',
    '  let absorb = 0;',
    '  while (absorb < padded.length) {',
    '    for (let j = 0; j < rate; j += 8) {',
    '      let w = 0n;',
    '      for (let b = 0; b < 8 && (absorb + j + b) < padded.length; b++) {',
    '        w |= BigInt(padded[absorb + j + b]) << BigInt(8 * b);',
    '      }',
    '      state[j / 8] ^= w;',
    '    }',
    '    state = ' + keccakFName + '(state);',
    '    absorb += rate;',
    '  }',
    '  let out = new Uint8Array(outBytes);',
    '  let cursor = 0;',
    '  while (cursor < outBytes) {',
    '    for (let j = 0; j < rate && cursor < outBytes; j += 8) {',
    '      let w = state[j / 8];',
    '      for (let b = 0; b < 8 && cursor < outBytes; b++) {',
    '        out[cursor++] = Number((w >> BigInt(8 * b)) & 0xFFn);',
    '      }',
    '    }',
    '    if (cursor < outBytes) state = ' + keccakFName + '(state);',
    '  }',
    '  return out;',
    '}',
  ]);
}

/** FORS 完整实现（闭包，返回 {forsSign, forsVerify, forsPk}） */
function registerForsCore(): string {
  const shakeName = registerShakeXOF();
  return javascriptGenerator.provideFunction_('forsCore', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '() {',
    '  function toBytes(x) { if (typeof x === "string") return new TextEncoder().encode(x); if (Array.isArray(x)) return Uint8Array.from(x); return x; }',
    '  function h32(...parts) {',
    '    let len = 0; for (let p of parts) len += toBytes(p).length;',
    '    let data = new Uint8Array(len); let o = 0;',
    '    for (let p of parts) { let b = toBytes(p); data.set(b, o); o += b.length; }',
    '    return ' + shakeName + '(data, 32, 136);',
    '  }',
    '  function adrs(kp, typ, height, idx) {',
    '    let a = new Uint8Array(32);',
    '    a[13] = (typ >> 24) & 0xFF; a[14] = (typ >> 16) & 0xFF; a[15] = (typ >> 8) & 0xFF; a[16] = typ & 0xFF;',
    '    for (let i = 0; i < 4; i++) a[20 - i] = Math.floor(kp / Math.pow(256, i)) & 0xFF;',
    '    if (typ === 3) {',
    '      for (let i = 0; i < 4; i++) a[24 - i] = Math.floor(height / Math.pow(256, i)) & 0xFF;',
    '      for (let i = 0; i < 4; i++) a[28 - i] = Math.floor(idx / Math.pow(256, i)) & 0xFF;',
    '    }',
    '    return a;',
    '  }',
    '  function forsSk(skSeed, treeI, leafJ) { return h32(skSeed, adrs(treeI, 3, 0, leafJ)); }',
    '  function forsTree(skSeed, treeI, idx) {',
    '    let level = []; for (let j = 0; j < 16; j++) level.push(forsSk(skSeed, treeI, j));',
    '    let auth = []; let h = 1;',
    '    while (level.length > 1) {',
    '      auth.push(level[(idx >> (h - 1)) ^ 1]);',
    '      let nxt = [];',
    '      for (let j = 0; j < level.length; j += 2) nxt.push(h32(adrs(treeI, 3, h, j / 2 | 0), level[j], level[j + 1]));',
    '      level = nxt; h++;',
    '    }',
    '    return [level[0], auth];',
    '  }',
    '  function forsSign(skSeed, m) {',
    '    m = toBytes(m);',
    '    if (m.length !== 2) throw new Error("FORS M must be 2 bytes (k*a = 16 bits)");',
    '    let mv = (m[0] << 8) | m[1];',
    '    let idxs = []; for (let i = 0; i < 4; i++) idxs.push((mv >> (12 - 4 * i)) & 0xF);',
    '    let sig = new Uint8Array(0);',
    '    for (let i = 0; i < 4; i++) {',
    '      let r = forsTree(skSeed, i, idxs[i]);',
    '      let parts = [forsSk(skSeed, i, idxs[i])].concat(r[1]);',
    '      let total = 0; for (let p of parts) total += p.length;',
    '      let cur = new Uint8Array(total); let o = 0;',
    '      for (let p of parts) { cur.set(p, o); o += p.length; }',
    '      let ns = new Uint8Array(sig.length + cur.length); ns.set(sig); ns.set(cur, sig.length); sig = ns;',
    '    }',
    '    return sig;',
    '  }',
    '  function forsPk(skSeed) {',
    '    let roots = []; for (let i = 0; i < 4; i++) roots.push(forsTree(skSeed, i, 0)[0]);',
    '    let total = 0; for (let r of roots) total += r.length;',
    '    let data = new Uint8Array(total); let o = 0;',
    '    for (let r of roots) { data.set(r, o); o += r.length; }',
    '    return h32(adrs(0, 4, 0, 0), data);',
    '  }',
    '  function forsVerify(pk, m, sig) {',
    '    m = toBytes(m); sig = toBytes(sig);',
    '    let mv = (m[0] << 8) | m[1];',
    '    let idxs = []; for (let i = 0; i < 4; i++) idxs.push((mv >> (12 - 4 * i)) & 0xF);',
    '    let roots = []; let off = 0;',
    '    for (let i = 0; i < 4; i++) {',
    '      let idx = idxs[i];',
    '      let node = sig.slice(off, off + 32); off += 32;',
    '      for (let h = 0; h < 4; h++) {',
    '        let sibling = sig.slice(off, off + 32); off += 32;',
    '        let jj = (idx >> (h + 1)) | 0;',
    '        if (((idx >> h) & 1) === 1) node = h32(adrs(i, 3, h + 1, jj), sibling, node);',
    '        else node = h32(adrs(i, 3, h + 1, jj), node, sibling);',
    '      }',
    '      roots.push(node);',
    '    }',
    '    let total = 0; for (let r of roots) total += r.length;',
    '    let data = new Uint8Array(total); let o = 0;',
    '    for (let r of roots) { data.set(r, o); o += r.length; }',
    '    let pk2 = h32(adrs(0, 4, 0, 0), data);',
    '    let ref = toBytes(pk);',
    '    if (pk2.length !== ref.length) return false;',
    '    for (let i = 0; i < pk2.length; i++) if (pk2[i] !== ref[i]) return false;',
    '    return true;',
    '  }',
    '  return { forsSign: forsSign, forsVerify: forsVerify, forsPk: forsPk };',
    '}',
  ]);
}

javascriptGenerator.forBlock['fors_sign'] = function (block: Block): [string, number] {
  const skSeed = javascriptGenerator.valueToCode(block, 'SK_SEED', Order.ATOMIC) || '[]';
  const m = javascriptGenerator.valueToCode(block, 'MESSAGE', Order.ATOMIC) || '[]';
  const fn = registerForsCore();
  return [fn + '().forsSign(' + skSeed + ', ' + m + ')', Order.ATOMIC];
};

javascriptGenerator.forBlock['fors_verify'] = function (block: Block): [string, number] {
  const pk = javascriptGenerator.valueToCode(block, 'PUBLIC_KEY', Order.ATOMIC) || '[]';
  const m = javascriptGenerator.valueToCode(block, 'MESSAGE', Order.ATOMIC) || '[]';
  const sig = javascriptGenerator.valueToCode(block, 'SIGNATURE', Order.ATOMIC) || '[]';
  const fn = registerForsCore();
  return [fn + '().forsVerify(' + pk + ', ' + m + ', ' + sig + ')', Order.ATOMIC];
};

javascriptGenerator.forBlock['fors_pk_from_sk'] = function (block: Block): [string, number] {
  const skSeed = javascriptGenerator.valueToCode(block, 'SK_SEED', Order.ATOMIC) || '[]';
  const fn = registerForsCore();
  return [fn + '().forsPk(' + skSeed + ')', Order.ATOMIC];
};
