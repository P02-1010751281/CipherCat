/**
 * FIPS 205 XMSS 树根 JavaScript 代码生成器（SHAKE 变体，simple thash）。
 *
 * 约定（已由 NIST ACVP SLH-DSA-keyGen-FIPS205 的 SHAKE 参数集核对）：
 *   - thash      = SHAKE256(PK.seed ‖ ADRS ‖ M, n)（simple，无 bitmask）
 *   - PRF        = SHAKE256(PK.seed ‖ ADRS ‖ SK.seed, n)，ADRS type 5（WOTS_PRF）
 *   - 链地址      = 0..w−2（w = 16），len = 2n + 3
 *   - 叶子压缩    = ADRS type 1（WOTS_PK），keypair = 叶索引
 *   - 节点合并    = ADRS type 2（TREE），treeHeight = h，treeIndex = 位置 >> 1
 *   - 顶层树      = layer = d − 1、tree = 0（其根即 PK.root）
 */
import { javascriptGenerator, Order } from 'blockly/javascript';
import type { Block } from 'blockly/core';
import { registerKeccakF1600 } from './helpers';

/** 与 hashbased.ts 同 key 同内容的 SHAKE256 XOF（provideFunction_ 幂等去重） */
export function registerSlhShake(): string {
  const keccakFName = registerKeccakF1600();
  return javascriptGenerator.provideFunction_('shakeXOF', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(inp, outBytes, rate) {',
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

function registerSlhXmssRoot(): string {
  const shake = registerSlhShake();
  return javascriptGenerator.provideFunction_('slhXmssRoot', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(skSeed, pkSeed, hPrime, layer, tree) {',
    '  var sk = Array.from(skSeed), pk = Array.from(pkSeed);',
    '  var n = sk.length;',
    '  if (n !== 16 && n !== 24 && n !== 32) throw new Error("SLH-DSA sk_seed must be 16, 24 or 32 bytes");',
    '  if (pk.length !== n) throw new Error("SLH-DSA pk_seed length must match sk_seed");',
    '  if (!Number.isSafeInteger(hPrime) || hPrime < 0 || hPrime > 20) throw new Error("SLH-DSA h_prime must be an integer from 0 to 20");',
    '  if (!Number.isSafeInteger(layer) || layer < 0 || layer > 4294967295) throw new Error("SLH-DSA layer address must be an integer from 0 to 2^32-1");',
    '  if (!Number.isSafeInteger(tree) || tree < 0 || tree > Number.MAX_SAFE_INTEGER) throw new Error("SLH-DSA tree address must be a non-negative safe integer");',
    '  var W = 16, LEN = 2 * n + 3;',
    '  function put32(x, off, val) { for (var i = 3; i >= 0; i--) { x[off + i] = val & 0xFF; val = Math.floor(val / 256); } }',
    '  function put96(x, val) { for (var i = 11; i >= 0; i--) { x[4 + i] = val % 256; val = Math.floor(val / 256); } }',
    '  function base(type) {',
    '    var x = new Array(32).fill(0);',
    '    put32(x, 0, layer); put96(x, tree); put32(x, 16, type);',
    '    return x;',
    '  }',
    '  function addrWots(type, kp, chain, hash) {',
    '    var x = base(type); put32(x, 20, kp); put32(x, 24, chain); put32(x, 28, hash); return x;',
    '  }',
    '  function addrPk(kp) { var x = base(1); put32(x, 20, kp); return x; }',
    '  function addrTree(height, index) { var x = base(2); put32(x, 24, height); put32(x, 28, index); return x; }',
    '  function th(adrs, msg) { return Array.from(' + shake + '(pk.concat(adrs, Array.from(msg)), n, 136)); }',
    '  function prf(adrs) { return Array.from(' + shake + '(pk.concat(adrs, sk), n, 136)); }',
    '  function wotsPk(kp) {',
    '    var i, j, chains = [], flat = [], key = [];',
    '    for (i = 0; i < LEN; i++) key.push(prf(addrWots(5, kp, i, 0)));',
    '    for (i = 0; i < LEN; i++) {',
    '      var v = key[i];',
    '      for (j = 0; j < W - 1; j++) v = th(addrWots(0, kp, i, j), v);',
    '      chains.push(v);',
    '    }',
    '    for (i = 0; i < LEN; i++) flat = flat.concat(chains[i]);',
    '    return th(addrPk(kp), flat);',
    '  }',
    '  var leaves = [], count = 1 << hPrime;',
    '  for (var i = 0; i < count; i++) leaves.push(wotsPk(i));',
    '  var height = 0;',
    '  while (leaves.length > 1) {',
    '    height += 1;',
    '    var next = [];',
    '    for (var k = 0; k < leaves.length; k += 2) next.push(th(addrTree(height, k >> 1), leaves[k].concat(leaves[k + 1])));',
    '    leaves = next;',
    '  }',
    '  return Array.from(leaves[0]);',
    '}',
  ]);
}

javascriptGenerator.forBlock['slh_xmss_root'] = function (block: Block): [string, number] {
  const skSeed = javascriptGenerator.valueToCode(block, 'SK_SEED', Order.ATOMIC) || '[]';
  const pkSeed = javascriptGenerator.valueToCode(block, 'PK_SEED', Order.ATOMIC) || '[]';
  const hPrime = javascriptGenerator.valueToCode(block, 'H_PRIME', Order.ATOMIC) || '0';
  const layer = javascriptGenerator.valueToCode(block, 'LAYER', Order.ATOMIC) || '0';
  const tree = javascriptGenerator.valueToCode(block, 'TREE', Order.ATOMIC) || '0';
  const fn = registerSlhXmssRoot();
  return ['Uint8Array.from(' + fn + '(' + skSeed + ', ' + pkSeed + ', ' + hPrime + ', ' + layer + ', ' + tree + '))', Order.ATOMIC];
};

/** FIPS 205 §10.1 + §11.1：pure SLH-DSA 的消息随机数 R（SHAKE 变体） */
export function registerSlhMsgRandomness(): string {
  const shake = registerSlhShake();
  return javascriptGenerator.provideFunction_('slhMsgRandomness', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(skPrf, optRand, msg, ctx) {',
    '  var sk = Array.from(skPrf), opt = Array.from(optRand);',
    '  var n = sk.length;',
    '  if (n !== 16 && n !== 24 && n !== 32) throw new Error("SLH-DSA sk_prf must be 16, 24 or 32 bytes");',
    '  if (opt.length !== n) throw new Error("SLH-DSA opt_rand length must match sk_prf");',
    '  var context = ctx == null ? [] : Array.from(ctx);',
    '  if (context.length > 255) throw new Error("SLH-DSA context must be at most 255 bytes");',
    '  var prefix = [0x00, context.length].concat(context, Array.from(msg));',
    '  return Array.from(' + shake + '(sk.concat(opt, prefix), n, 136));',
    '}',
  ]);
}

javascriptGenerator.forBlock['slh_msg_randomness'] = function (block: Block): [string, number] {
  const skPrf = javascriptGenerator.valueToCode(block, 'SK_PRF', Order.ATOMIC) || '[]';
  const optRand = javascriptGenerator.valueToCode(block, 'OPT_RAND', Order.ATOMIC) || '[]';
  const msg = javascriptGenerator.valueToCode(block, 'MESSAGE', Order.ATOMIC) || '[]';
  const ctx = javascriptGenerator.valueToCode(block, 'CONTEXT', Order.ATOMIC) || '[]';
  const fn = registerSlhMsgRandomness();
  return ['Uint8Array.from(' + fn + '(' + skPrf + ', ' + optRand + ', ' + msg + ', ' + ctx + '))', Order.ATOMIC];
};
