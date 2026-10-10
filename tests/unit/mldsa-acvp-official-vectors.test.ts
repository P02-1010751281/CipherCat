// @vitest-environment jsdom
/**
 * ML-DSA-44 官方 ACVP 向量回归（ITEM-2）。
 *
 * 数据源：docs/standards/fips204-ML-DSA/vectors/ACVP-ML-DSA-internalProjection.json
 * （NIST usnistgov/ACVP-Server 的 gen-val 数据集，FIPS 204 修订版）。
 * 取 `hashAlg: none` 且空 context 的 ML-DSA-44 用例（即纯确定性 ML-DSA，对应项目块的
 * rnd=0 / 空 ctx），把官方 sk/message 喂给 `demos/procedures/ML-DSA-Sign.json` 生成的双语言实现，
 * 并把签名与官方 signature 逐字节比较。
 *
 * 边界：只覆盖已登记的用例子集（当前 2 例（tgId=1 的 tcId 5、8），含 tcId 记录），不是完整 ACVP 会话（完整集含
 * pre-hash/context 变体与内部接口用例），也不构成算法验证或认证；文件缺失时跳过。
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import * as Blockly from 'blockly/core';
import { setLocale } from 'blockly/core';
import * as enMessages from 'blockly/msg/en';
import { describe, expect, it } from 'vitest';

import '@/blocks';
import '@/generators/javascript';
import '@/generators/python';
import { javascriptGenerator } from 'blockly/javascript';
import { pythonGenerator } from 'blockly/python';

setLocale(enMessages as unknown as Record<string, string>);

const pythonCommand = process.env.CIPHER_CAT_PYTHON || (process.platform === 'win32' ? 'python' : 'python3');
const vectorPath = resolve(process.cwd(), 'docs/standards/fips204-ML-DSA/vectors/ACVP-ML-DSA-internalProjection.json');
const CASE_LIMIT = 3;

interface AcvpCase {
  tcId: number | string;
  sk: string;
  pk: string;
  message: string;
  signature: string;
  context?: string;
  hashAlg?: string;
}

function loadMlDsa44DeterministicCases(): { tgId: number; cases: AcvpCase[] } | null {
  if (!existsSync(vectorPath)) return null;
  const data = JSON.parse(readFileSync(vectorPath, 'utf8')) as {
    testGroups: Array<{ tgId: number; parameterSet?: string; tests: AcvpCase[] }>;
  };
  for (const group of data.testGroups) {
    if (group.parameterSet !== 'ML-DSA-44') continue;
    const cases = group.tests.filter(
      (testCase) => (testCase.hashAlg ?? 'none') === 'none' && (testCase.context ?? '') === '',
    );
    if (cases.length) return { tgId: group.tgId, cases: cases.slice(0, CASE_LIMIT) };
  }
  return null;
}

/**
 * Demo 的 `MLDSA_Sign()` 是无参黑盒（sk/message 内嵌在工作区里），无法注入官方输入；
 * 因此这里直接搭一个最小工作区：`mldsa_sign(SECRET_KEY=data_i, MESSAGE=data_i)` 后再生成代码。
 */
function generateSign(secretKeyHex: string, messageHex: string): { javascript: string; python: string } {
  const workspace = new Blockly.Workspace();
  const sign = workspace.newBlock('mldsa_sign');
  const attach = (inputName: string, hex: string) => {
    const value = workspace.newBlock('data_value');
    value.setFieldValue(`[${Array.from({ length: hex.length / 2 }, (_, index) =>
      `0x${hex.slice(index * 2, index * 2 + 2)}`).join(',')}]`, 'NUM');
    sign.getInput(inputName)!.connection!.connect(value.outputConnection!);
  };
  attach('SECRET_KEY', secretKeyHex);
  attach('MESSAGE', messageHex);
  const javascript = javascriptGenerator.workspaceToCode(workspace);
  const python = pythonGenerator.workspaceToCode(workspace);
  workspace.dispose();
  return { javascript, python };
}

describe('ML-DSA-44 official ACVP vectors', () => {
  const loaded = loadMlDsa44DeterministicCases();

  it.skipIf(!loaded)('signs official ACVP deterministic cases identically in JavaScript and Python', () => {
    const { tgId, cases } = loaded!;
    for (const testCase of cases) {
      const expected = testCase.signature.toLowerCase();
      const { javascript, python } = generateSign(testCase.sk, testCase.message);
      // 末尾表达式即签名块本身，直接打印其值。
      const jsDriver = 'console.log(Array.from(RESULT).map((b) => b.toString(16).padStart(2, \'0\')).join(\'\'));'
        .replace('RESULT', javascript.trim().split('\n').pop()!.replace(/;$/, ''));
      const jsOutput = execFileSync(process.execPath, ['-e', `${javascript}\n${jsDriver}`], { encoding: 'utf8' }).trim();
      expect(jsOutput, `ACVP tgId=${tgId} tcId=${testCase.tcId} (JS)`).toBe(expected);

      const pyDriver = `print(bytes(${python.trim().split('\n').pop()!.replace(/;$/, '')}).hex())`;
      const pyOutput = execFileSync(pythonCommand, ['-c', `${python}\n${pyDriver}`], { encoding: 'utf8' }).trim();
      expect(pyOutput, `ACVP tgId=${tgId} tcId=${testCase.tcId} (Python)`).toBe(expected);
    }
  });
});
