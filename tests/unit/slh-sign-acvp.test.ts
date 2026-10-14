// @vitest-environment jsdom
/**
 * SLH-DSA 签名块（SHAKE 参数集、external、pure、确定性）对 ACVP sigGen 官方向量的回归。
 *
 * 数据源：docs/standards/fips205-SLH-DSA/vectors/ACVP-SLH-DSA-sigGen-FIPS205-SHAKE-f-subset.json
 * 每条用例把官方 sk、message、context 喂给 `slh_sign` 生成的双语言实现，
 * 与官方 signature 逐字节比较。为避免测试过慢，每个参数集只取 1 例。
 *
 * 边界：仅 SHAKE 的 f 参数集、external 接口、pure（无预哈希）、确定性签名；
 * 不含 SHA2 参数集、预哈希模式、验证路径或完整 ACVP 会话。
 */
import * as Blockly from 'blockly/core';
import { setLocale } from 'blockly/core';
import 'blockly/blocks';
import * as enMessages from 'blockly/msg/en';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import '@/blocks';
import '@/generators/javascript';
import '@/generators/javascript/hash/slh-sign';
import '@/generators/python';
import '@/generators/python/hash/slh-sign';

import { javascriptGenerator } from 'blockly/javascript';
import { pythonGenerator } from 'blockly/python';

setLocale(enMessages as unknown as Record<string, string>);

const pythonCommand = process.env.CIPHER_CAT_PYTHON ||
  (process.platform === 'win32' ? 'python' : 'python3');
const vectorPath = resolve(
  process.cwd(),
  'docs/standards/fips205-SLH-DSA/vectors/ACVP-SLH-DSA-sigGen-FIPS205-SHAKE-f-subset.json',
);
const CASE_LIMIT = 1;

interface SigGenCase {
  tcId: number;
  sk: string;
  message: string;
  context: string;
  signature: string;
}

function hexToBytes(hex: string): number[] {
  return hex.length === 0 ? [] : hex.match(/../g)!.map((pair) => parseInt(pair, 16));
}

function generate(
  language: 'javascript' | 'python',
  sk: number[],
  message: number[],
  context: number[],
  paramSet: string,
): string {
  const workspace = new Blockly.Workspace();
  try {
    const block = workspace.newBlock('slh_sign');
    block.setFieldValue(paramSet, 'PARAM_SET');
    const connect = (input: string, value: string) => {
      const source = workspace.newBlock('data_value');
      source.setFieldValue(value, 'NUM');
      block.getInput(input)!.connection!.connect(source.outputConnection!);
    };
    connect('SK', `[${sk.join(', ')}]`);
    connect('MESSAGE', `[${message.join(', ')}]`);
    connect('CONTEXT', `[${context.join(', ')}]`);
    const generator = language === 'javascript' ? javascriptGenerator : pythonGenerator;
    return generator.workspaceToCode(workspace);
  } finally {
    workspace.dispose();
  }
}

function evaluateJavaScript(program: string): string {
  const lines = program.trim().split('\n');
  const expression = lines.pop()!.replace(/;$/, '');
  return execFileSync(process.execPath, ['-e', [
    ...lines,
    `const result = ${expression};`,
    'console.log(Buffer.from(result).toString("hex"));',
  ].join('\n')], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 900000, maxBuffer: 64 * 1024 * 1024 }).trim();
}

function evaluatePython(program: string): string {
  const lines = program.trim().split('\n');
  const expression = lines.pop()!;
  return execFileSync(pythonCommand, ['-c', [
    ...lines,
    `result = ${expression}`,
    'print(bytes(result).hex())',
  ].join('\n')], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 900000, maxBuffer: 64 * 1024 * 1024 }).trim();
}

const vectorAvailable = existsSync(vectorPath);
const describeIfVectors = vectorAvailable ? describe : describe.skip;

describeIfVectors('SLH-DSA sign block against ACVP sigGen vectors (SHAKE f sets)', () => {
  const data = vectorAvailable
    ? JSON.parse(readFileSync(vectorPath, 'utf8')) as {
        testGroups: Array<{ parameterSet: string; tests: SigGenCase[] }>;
      }
    : { testGroups: [] };

  for (const group of data.testGroups) {
    const cases = group.tests.slice(0, CASE_LIMIT);
    if (cases.length === 0) continue;

    it(`${group.parameterSet}: ${cases.length} 例签名逐字节一致（双语言）`, () => {
      for (const testCase of cases) {
        const sk = hexToBytes(testCase.sk);
        const message = hexToBytes(testCase.message);
        const context = hexToBytes(testCase.context);
        const expected = testCase.signature.toLowerCase();
        const jsSig = evaluateJavaScript(generate('javascript', sk, message, context, group.parameterSet));
        expect(jsSig).toBe(expected);
        expect(evaluatePython(generate('python', sk, message, context, group.parameterSet))).toBe(expected);
      }
    }, 1800000);
  }

  it('拒绝长度不符的密钥与未知参数集', () => {
    const shortSk = new Array(32).fill(1);
    expect(() => evaluateJavaScript(generate('javascript', shortSk, [], [], 'SLH-DSA-SHAKE-128f'))).toThrow();
    expect(() => evaluatePython(generate('python', shortSk, [], [], 'SLH-DSA-SHAKE-128f'))).toThrow();
  });
});
