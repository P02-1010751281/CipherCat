/**
 * 哈希基后量子结构件 JavaScript 代码生成器
 *
 * 哈希函数 = SHAKE-256（FIPS 205 的 H），32 字节输出；复用 registerKeccakF1600
 * 与 shakeXOF（与 pq_xof 同 key 同内容，provideFunction_ 幂等去重）。
 */
import { javascriptGenerator, Order } from 'blockly/javascript';
import type { Block } from 'blockly/core';
import { registerKeccakF1600 } from './helpers';

/** SHAKE256 XOF（rate 136）——与 shake.ts 同 key 同内容（幂等） */
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

/** 一次注册全部哈希基结构件函数 */
function registerHashBased(): string {
  const shakeName = registerShakeXOF();
  return javascriptGenerator.provideFunction_('hashBased', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '() {',
    '  function toBytes(x) { if (typeof x === "string") return new TextEncoder().encode(x); if (Array.isArray(x)) return Uint8Array.from(x); return x; }',
    '  function h32(...parts) {',
    '    let len = 0; for (let p of parts) len += toBytes(p).length;',
    '    let data = new Uint8Array(len); let o = 0;',
    '    for (let p of parts) { let b = toBytes(p); data.set(b, o); o += b.length; }',
    '    return ' + shakeName + '(data, 32, 136);',
    '  }',
    '  function hashChain(inp, iters) { let x = toBytes(inp); for (let i = 0; i < iters; i++) x = h32(x); return x; }',
    '  function merkleLeaf(msg, adrs) { return h32(adrs, msg); }',
    '  function merkleNode(l, r, adrs) { return h32(adrs, l, r); }',
    '  function merkleRoot(leaves, leafLen, adrs) {',
    '    let b = toBytes(leaves);',
    '    let n = b.length / leafLen;',
    '    let level = [];',
    '    for (let i = 0; i < n; i++) level.push(b.slice(i * leafLen, (i + 1) * leafLen));',
    '    while (level.length > 1) {',
    '      let next = [];',
    '      for (let i = 0; i < level.length; i += 2) next.push(h32(adrs, level[i], level[i + 1]));',
    '      level = next;',
    '    }',
    '    return level[0];',
    '  }',
    '  function slhAddr(layer, tree, leaf, type) {',
    '    let a = new Uint8Array(32);',
    '    a[0] = layer & 0xFF;',
    '    for (let i = 0; i < 12; i++) a[12 - i] = Math.floor(tree / Math.pow(256, i)) & 0xFF;',
    '    a[13] = (type >> 24) & 0xFF; a[14] = (type >> 16) & 0xFF; a[15] = (type >> 8) & 0xFF; a[16] = type & 0xFF;',
    '    for (let i = 0; i < 4; i++) a[20 - i] = Math.floor(leaf / Math.pow(256, i)) & 0xFF;',
    '    return a;',
    '  }',
    '  function forsRoot(roots, adrs) { return h32(adrs, roots); }',
    '  return { hashChain: hashChain, merkleLeaf: merkleLeaf, merkleNode: merkleNode, merkleRoot: merkleRoot, slhAddr: slhAddr, forsRoot: forsRoot };',
    '}',
  ]);
}

javascriptGenerator.forBlock['hash_chain'] = function (block: Block): [string, number] {
  const inp = javascriptGenerator.valueToCode(block, 'INPUT', Order.ATOMIC) || '[]';
  const iters = javascriptGenerator.valueToCode(block, 'ITERATIONS', Order.ATOMIC) || '0';
  const fn = registerHashBased();
  return [fn + '().hashChain(' + inp + ', ' + iters + ')', Order.ATOMIC];
};

javascriptGenerator.forBlock['merkle_leaf'] = function (block: Block): [string, number] {
  const msg = javascriptGenerator.valueToCode(block, 'MSG', Order.ATOMIC) || '[]';
  const adrs = javascriptGenerator.valueToCode(block, 'ADRS', Order.ATOMIC) || '[]';
  const fn = registerHashBased();
  return [fn + '().merkleLeaf(' + msg + ', ' + adrs + ')', Order.ATOMIC];
};

javascriptGenerator.forBlock['merkle_node'] = function (block: Block): [string, number] {
  const l = javascriptGenerator.valueToCode(block, 'LEFT', Order.ATOMIC) || '[]';
  const r = javascriptGenerator.valueToCode(block, 'RIGHT', Order.ATOMIC) || '[]';
  const adrs = javascriptGenerator.valueToCode(block, 'ADRS', Order.ATOMIC) || '[]';
  const fn = registerHashBased();
  return [fn + '().merkleNode(' + l + ', ' + r + ', ' + adrs + ')', Order.ATOMIC];
};

javascriptGenerator.forBlock['merkle_root'] = function (block: Block): [string, number] {
  const leaves = javascriptGenerator.valueToCode(block, 'LEAVES', Order.ATOMIC) || '[]';
  const leafLen = javascriptGenerator.valueToCode(block, 'LEAF_LEN', Order.ATOMIC) || '32';
  const adrs = javascriptGenerator.valueToCode(block, 'ADRS', Order.ATOMIC) || '[]';
  const fn = registerHashBased();
  return [fn + '().merkleRoot(' + leaves + ', ' + leafLen + ', ' + adrs + ')', Order.ATOMIC];
};

javascriptGenerator.forBlock['slh_addr'] = function (block: Block): [string, number] {
  const layer = javascriptGenerator.valueToCode(block, 'LAYER', Order.ATOMIC) || '0';
  const tree = javascriptGenerator.valueToCode(block, 'TREE', Order.ATOMIC) || '0';
  const leaf = javascriptGenerator.valueToCode(block, 'LEAF', Order.ATOMIC) || '0';
  const type = block.getFieldValue('TYPE') || '0';
  const fn = registerHashBased();
  return [fn + '().slhAddr(' + layer + ', ' + tree + ', ' + leaf + ', ' + type + ')', Order.ATOMIC];
};

javascriptGenerator.forBlock['fors_root'] = function (block: Block): [string, number] {
  const roots = javascriptGenerator.valueToCode(block, 'ROOTS', Order.ATOMIC) || '[]';
  const adrs = javascriptGenerator.valueToCode(block, 'ADRS', Order.ATOMIC) || '[]';
  const fn = registerHashBased();
  return [fn + '().forsRoot(' + roots + ', ' + adrs + ')', Order.ATOMIC];
};
