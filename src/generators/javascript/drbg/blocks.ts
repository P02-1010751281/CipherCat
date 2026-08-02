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
 * 官方向量：NIST CAVP drbgtestvectors（SHA-256 480 例全过）。
 */
import { javascriptGenerator, Order } from 'blockly/javascript';
import type { Block } from 'blockly/core';
import { registerHmacSha256 } from '../hash/hmac-sha256';

/** 完整状态化 HMAC-DRBG（HMAC-SHA-256，SP 800-90A §10.1.2） */
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
    '  if (additional !== null && additional !== undefined) drbgUpdate(st, additional);',
    '  var outlen = Math.ceil(nbits / 8), temp = [];',
    '  while (temp.length < outlen) {',
    '    st.V = hmacSha256(st.K, st.V);',
    '    for (var j = 0; j < st.V.length; j++) temp.push(st.V[j]);',
    '  }',
    '  var out = temp.slice(0, outlen);',
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
  return [fn + '(' + entropy + ', ' + nonce + ', ' + perso + ', ' + bits + ')', Order.ATOMIC];
};
