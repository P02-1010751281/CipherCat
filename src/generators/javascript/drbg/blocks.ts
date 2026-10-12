/**
 * HMAC-DRBG 原子块 JavaScript 代码生成器
 * NIST SP 800-90A Rev1 §10.1.2（HMAC-SHA-256）
 *
 * HMAC-SHA-256 复用 hash/hmac-sha256 共享模块（同步 sha256Hash/hmacSha256）。
 * 内嵌状态函数（provideFunction_ 按名去重）：
 *   - drbgInstantiate(entropy, nonce, perso) → {K, V}
 *   - drbgUpdate(st, provided)   （provided 为 null = 未提供，空数组 = 提供空数据）
 *   - drbgReseed(st, entropy, additional)
 *   - drbgGenerate(st, nbits, additional) → 字节数组（可变状态）
 *   - drbgGenerateAll(entropy, nonce, perso, nbits) → 单次生成（块调用路径）
 * 项目 Demo 仅含少量固定回归输出，未运行完整 NIST CAVP 向量集。
 */
import { javascriptGenerator, Order } from 'blockly/javascript';
import type { Block } from 'blockly/core';
import { registerHmacSha256 } from '../hash/hmac-sha256';

/** 教学块与 Demo 共用的内部 HMAC-DRBG 状态 helper；不实现完整生命周期。 */
function registerDrbg(): string {
  registerHmacSha256();
  javascriptGenerator.provideFunction_('drbgInstantiate', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(entropy, nonce, perso) {',
    '  var st = { K: new Array(32).fill(0), V: new Array(32).fill(1) };',
    '  drbgUpdate(st, Array.from(entropy || []).concat(Array.from(nonce || [])).concat(Array.from(perso || [])));',
    '  return st;',
    '}',
  ]);
  javascriptGenerator.provideFunction_('drbgUpdate', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(st, provided) {',
    '  // K = HMAC(K, V || 0x00 || provided)；V = HMAC(K, V)；provided 非空时再 K = HMAC(K, V || 0x01 || provided)；V = HMAC(K, V)',
    '  var data = Array.from(provided || []);',
    '  st.K = hmacSha256(st.K, st.V.concat([0]).concat(data));',
    '  st.V = hmacSha256(st.K, st.V);',
    '  if (provided !== null && provided !== undefined) {',
    '    st.K = hmacSha256(st.K, st.V.concat([1]).concat(data));',
    '    st.V = hmacSha256(st.K, st.V);',
    '  }',
    '}',
  ]);
  javascriptGenerator.provideFunction_('drbgReseed', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(st, entropy, additional) {',
    '  drbgUpdate(st, Array.from(entropy || []).concat(Array.from(additional || [])));',
    '}',
  ]);
  javascriptGenerator.provideFunction_('drbgGenerate', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(st, nbits, additional) {',
    '  if (!Number.isSafeInteger(nbits) || nbits < 0 || nbits > 524288) throw new RangeError("requested_bits must be a safe integer from 0 to 524288");',
    '  if (additional !== null && additional !== undefined) drbgUpdate(st, additional);',
    '  var outlen = Math.ceil(nbits / 8), temp = [];',
    '  while (temp.length < outlen) {',
    '    st.V = hmacSha256(st.K, st.V);',
    '    for (var j = 0; j < st.V.length; j++) temp.push(st.V[j]);',
    '  }',
    '  var out = temp.slice(0, outlen);',
    '  var unusedBits = (8 - (nbits % 8)) % 8;',
    '  if (unusedBits && out.length) out[out.length - 1] &= (0xff << unusedBits) & 0xff;',
    '  drbgUpdate(st, additional);',
    '  return out;',
    '}',
  ]);
  return javascriptGenerator.provideFunction_('drbgGenerateAll', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(entropy, nonce, perso, nbits) {',
    '  return drbgGenerate(drbgInstantiate(entropy, nonce, perso), nbits, null);',
    '}',
  ]);
}

javascriptGenerator.forBlock['drbg_generate'] = function (block: Block): [string, number] {
  const entropy = javascriptGenerator.valueToCode(block, 'ENTROPY', Order.ATOMIC) || '[]';
  const nonce = javascriptGenerator.valueToCode(block, 'NONCE', Order.ATOMIC) || '[]';
  const perso = javascriptGenerator.valueToCode(block, 'PERSO', Order.ATOMIC) || '[]';
  const bits = javascriptGenerator.valueToCode(block, 'BITS', Order.ATOMIC) || '256';
  const fn = registerDrbg();
  return ['Uint8Array.from(' + fn + '(' + entropy + ', ' + nonce + ', ' + perso + ', ' + bits + '))', Order.ATOMIC];
};

/** K‖V ↔ {K, V} 的纯函数包装：跑一次 HMAC_DRBG Update 并返回新的 K‖V */
function registerDrbgUpdatePure(): string {
  registerHmacSha256();
  javascriptGenerator.provideFunction_('drbgUpdateRaw', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(kv, provided) {',
    '  if (kv.length !== 64) throw new Error("HMAC_DRBG state must be 64 bytes (K||V)");',
    '  var st = { K: kv.slice(0, 32), V: kv.slice(32, 64) };',
    '  var data = Array.from(provided || []);',
    '  st.K = hmacSha256(st.K, st.V.concat([0]).concat(data));',
    '  st.V = hmacSha256(st.K, st.V);',
    '  st.K = hmacSha256(st.K, st.V.concat([1]).concat(data));',
    '  st.V = hmacSha256(st.K, st.V);',
    '  return st.K.concat(st.V);',
    '}',
  ]);
  return 'drbgUpdateRaw';
}

javascriptGenerator.forBlock['drbg_update'] = function (block: Block): [string, number] {
  const state = javascriptGenerator.valueToCode(block, 'STATE', Order.ATOMIC) || '[]';
  const provided = javascriptGenerator.valueToCode(block, 'PROVIDED', Order.ATOMIC) || '[]';
  const fn = registerDrbgUpdatePure();
  return ['Uint8Array.from(' + fn + '(' + state + ', ' + provided + '))', Order.ATOMIC];
};
