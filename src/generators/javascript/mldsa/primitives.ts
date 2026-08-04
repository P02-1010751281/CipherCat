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
    '  function power2round(r, part) { var o = new Array(r.length); for (var i = 0; i < r.length; i++) o[i] = c.power2round(r[i])[part]; return o; }',
    '  function decompose(r, part) { var o = new Array(r.length); for (var i = 0; i < r.length; i++) o[i] = c.decompose(r[i])[part]; return o; }',
    '  function makeHint(z, r) { var o = new Array(z.length); for (var i = 0; i < z.length; i++) o[i] = c.makeHint(z[i], r[i]); return o; }',
    '  function useHint(h, r) { var o = new Array(h.length); for (var i = 0; i < h.length; i++) o[i] = c.useHint(h[i], r[i]); return o; }',
    '  function sampleInBall(seed) { return c.sampleInBall(seed); }',
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
