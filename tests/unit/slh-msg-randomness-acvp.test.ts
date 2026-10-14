// @vitest-environment jsdom
/**
 * pure SLH-DSA 消息随机数 R 对 ACVP sigGen 官方向量的回归。
 *
 * 数据源：docs/standards/fips205-SLH-DSA/vectors/ACVP-SLH-DSA-sigGen-FIPS205-SHAKE-f-subset.json
 * （ACVP SLH-DSA-sigGen 子集：SHAKE f 参数集、external、pure、deterministic）。
 * 确定性签名的 R 是签名串的前 n 字节，R = SHAKE256(SK.prf ‖ opt_rand ‖ M′, n)，
 * M′ = 0x00 ‖ |ctx| ‖ ctx ‖ M，opt_rand = PK.seed。文件缺失时跳过。
 *
 * 边界：只校验 R（签名第一步）与上下文编码；不覆盖 FORS、HT、完整签名或验证。
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
import '@/generators/javascript/hash/slh-xmss';
import '@/generators/python';
import '@/generators/python/hash/slh-xmss';

import { javascriptGenerator } from 'blockly/javascript';
import { pythonGenerator } from 'blockly/python';

setLocale(enMessages as unknown as Record<string, string>);

const pythonCommand = process.env.CIPHER_CAT_PYTHON ||
  (process.platform === 'win32' ? 'python' : 'python3');
const vectorPath = resolve(
  process.cwd(),
  'docs/standards/fips205-SLH-DSA/vectors/ACVP-SLH-DSA-sigGen-FIPS205-SHAKE-f-subset.json',
);

const N_BY_SET: Record<string, number> = {
  'SLH-DSA-SHAKE-128f': 16,
  'SLH-DSA-SHAKE-192f': 24,
  'SLH-DSA-SHAKE-256f': 32,
};

interface SigGenCase {
  tcId: number;
  sk: string;
  pk: string;
  message: string;
  context: string;
  signature: string;
}

function hexToBytes(hex: string): number[] {
  return hex.length === 0 ? [] : hex.match(/../g)!.map((pair) => parseInt(pair, 16));
}

function generate(
  language: 'javascript' | 'python',
  skPrf: number[],
  optRand: number[],
  message: number[],
  context: number[],
): string {
  const workspace = new Blockly.Workspace();
  try {
    const block = workspace.newBlock('slh_msg_randomness');
    const connect = (input: string, value: string) => {
      const source = workspace.newBlock('data_value');
      source.setFieldValue(value, 'NUM');
      block.getInput(input)!.connection!.connect(source.outputConnection!);
    };
    connect('SK_PRF', `[${skPrf.join(', ')}]`);
    connect('OPT_RAND', `[${optRand.join(', ')}]`);
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
  ].join('\n')], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 300000 }).trim();
}

function evaluatePython(program: string): string {
  const lines = program.trim().split('\n');
  const expression = lines.pop()!;
  return execFileSync(pythonCommand, ['-c', [
    ...lines,
    `result = ${expression}`,
    'print(bytes(result).hex())',
  ].join('\n')], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 300000 }).trim();
}

const vectorAvailable = existsSync(vectorPath);
const describeIfVectors = vectorAvailable ? describe : describe.skip;

describeIfVectors('SLH-DSA message randomness against ACVP sigGen vectors', () => {
  const data = vectorAvailable
    ? JSON.parse(readFileSync(vectorPath, 'utf8')) as {
        testGroups: Array<{ parameterSet: string; tests: SigGenCase[] }>;
      }
    : { testGroups: [] };

  for (const group of data.testGroups) {
    const n = N_BY_SET[group.parameterSet];
    if (!n) continue;

    it(`${group.parameterSet}: R 等于签名前 ${n} 字节（${group.tests.length} 例，双语言）`, () => {
      for (const testCase of group.tests) {
        const sk = hexToBytes(testCase.sk);
        const skPrf = sk.slice(n, 2 * n);
        const pkSeed = sk.slice(2 * n, 3 * n);
        expect(pkSeed).toEqual(hexToBytes(testCase.pk).slice(0, n));
        const expectedR = testCase.signature.slice(0, n * 2).toLowerCase();
        const message = hexToBytes(testCase.message);
        const context = hexToBytes(testCase.context);

        expect(evaluateJavaScript(generate('javascript', skPrf, pkSeed, message, context))).toBe(expectedR);
        expect(evaluatePython(generate('python', skPrf, pkSeed, message, context))).toBe(expectedR);
      }
    }, 600000);
  }

  it('拒绝超过 255 字节的 context 与长度不匹配的 opt_rand', () => {
    const skPrf = new Array(16).fill(3);
    const optRand = new Array(16).fill(4);
    const longCtx = new Array(256).fill(0);
    expect(() => evaluateJavaScript(generate('javascript', skPrf, optRand, [], longCtx))).toThrow();
    expect(() => evaluatePython(generate('python', skPrf, optRand, [], longCtx))).toThrow();
    expect(() => evaluateJavaScript(generate('javascript', skPrf, new Array(24).fill(4), [], []))).toThrow();
  });
});
