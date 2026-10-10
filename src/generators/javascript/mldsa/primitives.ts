/**
 * ML-DSA 签名原语 JavaScript 代码生成器（FIPS 204，ML-DSA-44 参数）
 *
 * 复用 registerMlDsaCore() 闭包内已验证的单系数原语（power2round/decompose/
 * makeHint/useHint/sampleInBall），在此包一层 poly 级（逐系数 256 元素循环）
 * 供 IntList 输入的原语块使用。参数固定 ML-DSA-44：D=13, γ2=95232, τ=39。
 */
import { javascriptGenerator, Order } from 'blockly/javascript';
import type { Block } from 'blockly/core';
import { registerMlDsaCore } from './blocks';

/** 一次注册 5 个 poly 级原语包装（共享闭包实例） */
function registerMlDsaPrimitives(): string {
  const core = registerMlDsaCore();
  return javascriptGenerator.provideFunction_('mlDsaPrimitives', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '() {',
    '  var c = ' + core + '();',
    '  function requirePolynomial(values, name) {',
    '    if (!Array.isArray(values) || values.length !== 256) throw new RangeError(name + " must contain 256 coefficients");',
    '    for (var i = 0; i < 256; i++) if (!Number.isInteger(values[i]) || values[i] < 0 || values[i] >= 8380417) throw new RangeError(name + " coefficients must be integers in [0, 8380417)");',
    '  }',
    '  function power2round(r, part) { requirePolynomial(r, "r"); var o = new Array(256); for (var i = 0; i < 256; i++) o[i] = c.power2round(r[i])[part]; return o; }',
    '  function decompose(r, part) { requirePolynomial(r, "r"); var o = new Array(256); for (var i = 0; i < 256; i++) o[i] = c.decompose(r[i])[part]; return o; }',
    '  function makeHint(z, r) { requirePolynomial(z, "z"); requirePolynomial(r, "r"); var o = new Array(256); for (var i = 0; i < 256; i++) o[i] = c.makeHint(z[i], r[i]); return o; }',
    '  function useHint(h, r) {',
    '    if (!Array.isArray(h) || h.length !== 256) throw new RangeError("h must contain 256 hint bits");',
    '    for (var i = 0; i < 256; i++) if (h[i] !== 0 && h[i] !== 1) throw new RangeError("h must contain only 0 and 1");',
    '    requirePolynomial(r, "r");',
    '    var o = new Array(256); for (var i = 0; i < 256; i++) o[i] = c.useHint(h[i], r[i]); return o;',
    '  }',
    '  function sampleInBall(seed) {',
    '    if (!(seed instanceof Uint8Array) && !Array.isArray(seed)) throw new TypeError("seed must be a byte array");',
    '    if (seed.length !== 32) throw new RangeError("seed must contain 32 bytes");',
    '    for (var i = 0; i < 32; i++) if (!Number.isInteger(seed[i]) || seed[i] < 0 || seed[i] > 255) throw new RangeError("seed must contain byte values");',
    '    return c.sampleInBall(seed);',
    '  }',
    '  return { power2round: power2round, decompose: decompose, makeHint: makeHint, useHint: useHint, sampleInBall: sampleInBall };',
    '}',
  ]);
}

// decompose/power2round 返回 [r1, r0]，part 0=r1(高位) 1=r0(低位)
const PART_INDEX: Record<string, number> = { r1: 0, r0: 1 };

javascriptGenerator.forBlock['pq_power2round'] = function (block: Block): [string, number] {
  const r = javascriptGenerator.valueToCode(block, 'INPUT', Order.ATOMIC) || '[]';
  const part = PART_INDEX[String(block.getFieldValue('PART'))] ?? 0;
  const fn = registerMlDsaPrimitives();
  return [fn + '().power2round(' + r + ', ' + part + ')', Order.ATOMIC];
};

javascriptGenerator.forBlock['pq_decompose'] = function (block: Block): [string, number] {
  const r = javascriptGenerator.valueToCode(block, 'INPUT', Order.ATOMIC) || '[]';
  const part = PART_INDEX[String(block.getFieldValue('PART'))] ?? 0;
  const fn = registerMlDsaPrimitives();
  return [fn + '().decompose(' + r + ', ' + part + ')', Order.ATOMIC];
};

javascriptGenerator.forBlock['pq_make_hint'] = function (block: Block): [string, number] {
  const z = javascriptGenerator.valueToCode(block, 'Z', Order.ATOMIC) || '[]';
  const r = javascriptGenerator.valueToCode(block, 'R', Order.ATOMIC) || '[]';
  const fn = registerMlDsaPrimitives();
  return [fn + '().makeHint(' + z + ', ' + r + ')', Order.ATOMIC];
};

javascriptGenerator.forBlock['pq_use_hint'] = function (block: Block): [string, number] {
  const h = javascriptGenerator.valueToCode(block, 'H', Order.ATOMIC) || '[]';
  const r = javascriptGenerator.valueToCode(block, 'R', Order.ATOMIC) || '[]';
  const fn = registerMlDsaPrimitives();
  return [fn + '().useHint(' + h + ', ' + r + ')', Order.ATOMIC];
};

javascriptGenerator.forBlock['pq_sample_in_ball'] = function (block: Block): [string, number] {
  const seed = javascriptGenerator.valueToCode(block, 'SEED', Order.ATOMIC) || '[]';
  const fn = registerMlDsaPrimitives();
  return [fn + '().sampleInBall(' + seed + ')', Order.ATOMIC];
};
