// @vitest-environment jsdom
/**
 * FIPS 205 XMSS 树根块对 NIST ACVP SLH-DSA-keyGen 官方向量的回归。
 *
 * 数据源：docs/standards/fips205-SLH-DSA/vectors/ACVP-SLH-DSA-keyGen-FIPS205.json
 * （NIST usnistgov/ACVP-Server 的 gen-val 数据集）。keyGen 出口的 pk = pkSeed ‖ PK.root，
 * 其中 PK.root 就是顶层 XMSS 树（layer = d−1、tree = 0）的树根，因此可直接校验
 * `slh_xmss_root`。只取 SHAKE 的 f 参数集（h′ = 3/3/4）以控制测试耗时；文件缺失时跳过。
 *
 * 边界：覆盖 ACVP keyGen 的树根字段，不覆盖 FORS、签名/验签、SHA2 参数集或完整 ACVP 会话。
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
  'docs/standards/fips205-SLH-DSA/vectors/ACVP-SLH-DSA-keyGen-FIPS205.json',
);

/** SHAKE 的 f 参数集：n（字节）= h′ 的高度与总层数 d（顶层 layer = d−1） */
const SHAKE_F_SETS: Record<string, { n: number; hPrime: number; d: number }> = {
  'SLH-DSA-SHAKE-128f': { n: 16, hPrime: 3, d: 22 },
  'SLH-DSA-SHAKE-192f': { n: 24, hPrime: 3, d: 22 },
  'SLH-DSA-SHAKE-256f': { n: 32, hPrime: 4, d: 17 },
};
const CASE_LIMIT = 2;

interface AcvpCase {
  tcId: number;
  skSeed: string;
  pkSeed: string;
  pk: string;
}

function generate(
  language: 'javascript' | 'python',
  skSeed: number[],
  pkSeed: number[],
  hPrime: number,
  layer: number,
): string {
  const workspace = new Blockly.Workspace();
  try {
    const block = workspace.newBlock('slh_xmss_root');
    const connect = (input: string, value: string) => {
      const source = workspace.newBlock('data_value');
      source.setFieldValue(value, 'NUM');
      block.getInput(input)!.connection!.connect(source.outputConnection!);
    };
    connect('SK_SEED', `[${skSeed.join(', ')}]`);
    connect('PK_SEED', `[${pkSeed.join(', ')}]`);
    connect('H_PRIME', String(hPrime));
    connect('LAYER', String(layer));
    connect('TREE', '0');
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
  ].join('\n')], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 600000 }).trim();
}

function evaluatePython(program: string): string {
  const lines = program.trim().split('\n');
  const expression = lines.pop()!;
  return execFileSync(pythonCommand, ['-c', [
    ...lines,
    `result = ${expression}`,
    'print(bytes(result).hex())',
  ].join('\n')], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 600000 }).trim();
}

function hexToBytes(hex: string): number[] {
  return hex.match(/../g)!.map((pair) => parseInt(pair, 16));
}

const vectorAvailable = existsSync(vectorPath);
const describeIfVectors = vectorAvailable ? describe : describe.skip;

describeIfVectors('SLH-DSA XMSS root block against ACVP keyGen vectors (SHAKE f sets)', () => {
  const data = vectorAvailable
    ? JSON.parse(readFileSync(vectorPath, 'utf8')) as { testGroups: Array<{ parameterSet: string; tests: AcvpCase[] }> }
    : { testGroups: [] };

  for (const [parameterSet, meta] of Object.entries(SHAKE_F_SETS)) {
    const group = data.testGroups.find((entry) => entry.parameterSet === parameterSet);
    const cases = (group?.tests ?? []).slice(0, CASE_LIMIT);

    it(`${parameterSet}: PK.root 与官方 pk 一致（${cases.length} 例，双语言）`, () => {
      expect(cases.length).toBeGreaterThan(0);
      for (const testCase of cases) {
        const skSeed = hexToBytes(testCase.skSeed);
        const pkSeed = hexToBytes(testCase.pkSeed);
        const expected = testCase.pk.slice(meta.n * 2).toLowerCase();
        expect(evaluateJavaScript(generate('javascript', skSeed, pkSeed, meta.hPrime, meta.d - 1))).toBe(expected);
        expect(evaluatePython(generate('python', skSeed, pkSeed, meta.hPrime, meta.d - 1))).toBe(expected);
      }
    }, 900000);
  }

  it('拒绝不支持的种子长度与越界树高', () => {
    const shortSeed = new Array(8).fill(0);
    expect(() => evaluateJavaScript(generate('javascript', shortSeed, shortSeed, 1, 0))).toThrow();
    expect(() => evaluatePython(generate('python', shortSeed, shortSeed, 1, 0))).toThrow();

    const seed16 = new Array(16).fill(7);
    expect(() => evaluateJavaScript(generate('javascript', seed16, seed16, 21, 0))).toThrow();
    expect(() => evaluatePython(generate('python', seed16, seed16, 21, 0))).toThrow();
    expect(() => evaluateJavaScript(generate('javascript', seed16, new Array(24).fill(7), 1, 0))).toThrow();
  });
});
