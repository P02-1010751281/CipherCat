/**
 * ML-DSA 签名原语 Python 代码生成器（FIPS 204，ML-DSA-44 参数）
 *
 * 复用 registerMlDsaCore() 闭包内已验证的单系数原语（ml_dsa_power2round 等），
 * 在此包一层 poly 级（逐系数 256 元素循环）供 IntList 输入的原语块使用。
 * 参数固定 ML-DSA-44：D=13, γ2=95232, τ=39。
 */
import { pythonGenerator, Order } from 'blockly/python';
import type { Block } from 'blockly/core';
import { registerMlDsaCore } from './blocks';

/** 一次注册 5 个 poly 级原语包装（共享闭包实例） */
function registerMlDsaPrimitives(): string {
  const core = registerMlDsaCore();
  return pythonGenerator.provideFunction_('ml_dsa_primitives', [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '():',
    '    c = ' + core + '()',
    '    def power2round(r, part):',
    '        return [c["power2round"](x)[part] for x in r]',
    '    def decompose(r, part):',
    '        return [c["decompose"](x)[part] for x in r]',
    '    def make_hint(z, r):',
    '        return [c["make_hint"](zi, ri) for zi, ri in zip(z, r)]',
    '    def use_hint(h, r):',
    '        return [c["use_hint"](hi, ri) for hi, ri in zip(h, r)]',
    '    def sample_in_ball(seed):',
    '        return c["sample_in_ball"](seed)',
    '    return {"power2round": power2round, "decompose": decompose, "make_hint": make_hint, "use_hint": use_hint, "sample_in_ball": sample_in_ball}',
    '',
  ]);
}

// decompose/power2round 返回 [r1, r0]，part 0=r1(高位) 1=r0(低位)
const PART_INDEX: Record<string, number> = { r1: 0, r0: 1 };

pythonGenerator.forBlock['pq_power2round'] = function (block: Block): [string, number] {
  const r = pythonGenerator.valueToCode(block, 'INPUT', Order.ATOMIC) || '[]';
  const part = PART_INDEX[String(block.getFieldValue('PART'))] ?? 0;
  const fn = registerMlDsaPrimitives();
  return [fn + '()["power2round"](' + r + ', ' + part + ')', Order.ATOMIC];
};

pythonGenerator.forBlock['pq_decompose'] = function (block: Block): [string, number] {
  const r = pythonGenerator.valueToCode(block, 'INPUT', Order.ATOMIC) || '[]';
  const part = PART_INDEX[String(block.getFieldValue('PART'))] ?? 0;
  const fn = registerMlDsaPrimitives();
  return [fn + '()["decompose"](' + r + ', ' + part + ')', Order.ATOMIC];
};

pythonGenerator.forBlock['pq_make_hint'] = function (block: Block): [string, number] {
  const z = pythonGenerator.valueToCode(block, 'Z', Order.ATOMIC) || '[]';
  const r = pythonGenerator.valueToCode(block, 'R', Order.ATOMIC) || '[]';
  const fn = registerMlDsaPrimitives();
  return [fn + '()["make_hint"](' + z + ', ' + r + ')', Order.ATOMIC];
};

pythonGenerator.forBlock['pq_use_hint'] = function (block: Block): [string, number] {
  const h = pythonGenerator.valueToCode(block, 'H', Order.ATOMIC) || '[]';
  const r = pythonGenerator.valueToCode(block, 'R', Order.ATOMIC) || '[]';
  const fn = registerMlDsaPrimitives();
  return [fn + '()["use_hint"](' + h + ', ' + r + ')', Order.ATOMIC];
};

pythonGenerator.forBlock['pq_sample_in_ball'] = function (block: Block): [string, number] {
  const seed = pythonGenerator.valueToCode(block, 'SEED', Order.ATOMIC) || '[]';
  const fn = registerMlDsaPrimitives();
  return [fn + '()["sample_in_ball"](' + seed + ')', Order.ATOMIC];
};
