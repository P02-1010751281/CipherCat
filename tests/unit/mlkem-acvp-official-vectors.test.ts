// @vitest-environment jsdom
/**
 * ML-KEM-512 官方 ACVP 向量回归（ITEM-2）。
 *
 * 数据源：docs/standards/fips203-ML-KEM/vectors/ACVP-ML-KEM-internalProjection.json
 * （NIST usnistgov/ACVP-Server 的 gen-val 数据集，FIPS 203 修订版）。
 * 本测试把官方 encapsulation 用例的 (ek, m) 输入真实喂给
 * `demos/procedures/ML-KEM-Encaps.json` 生成的双语言 ML-KEM-512 实现，
 * 并把输出与官方 `c‖k` 逐字节比较。
 *
 * 边界：只覆盖已登记的用例子集（当前取 ML-KEM-512 encapsulation 前 3 例，含 tcId 记录），
 * 不是完整 ACVP 会话，也不构成算法验证或认证；文件缺失时跳过。
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
const vectorPath = resolve(process.cwd(), 'docs/standards/fips203-ML-KEM/vectors/ACVP-ML-KEM-internalProjection.json');
const CASE_LIMIT = 3;

interface AcvpCase {
  tcId: number | string;
  ek: string;
  m: string;
  c: string;
  k: string;
}

function loadMlKem512Cases(): { tgId: number; cases: AcvpCase[] } | null {
  if (!existsSync(vectorPath)) return null;
  const data = JSON.parse(readFileSync(vectorPath, 'utf8')) as {
    testGroups: Array<{ tgId: number; parameterSet?: string; function?: string; tests: AcvpCase[] }>;
  };
  const group = data.testGroups.find(
    (entry) => entry.parameterSet === 'ML-KEM-512' && entry.function === 'encapsulation',
  );
  if (!group) return null;
  return { tgId: group.tgId, cases: group.tests.slice(0, CASE_LIMIT) };
}

function generateEncaps(): { javascript: string; python: string } {
  const demo = JSON.parse(readFileSync(resolve(process.cwd(), 'demos/procedures/ML-KEM-Encaps.json'), 'utf8'));
  const workspace = new Blockly.Workspace();
  Blockly.serialization.workspaces.load(demo, workspace);
  const javascript = javascriptGenerator.workspaceToCode(workspace);
  const python = pythonGenerator.workspaceToCode(workspace);
  workspace.dispose();
  return { javascript, python };
}

const hexToArray = (hex: string): string =>
  JSON.stringify(Array.from({ length: hex.length / 2 }, (_, index) => Number.parseInt(hex.slice(index * 2, index * 2 + 2), 16)));

describe('ML-KEM-512 official ACVP vectors', () => {
  const loaded = loadMlKem512Cases();

  it.skipIf(!loaded)('encapsulates official ACVP cases identically in JavaScript and Python', () => {
    const { tgId, cases } = loaded!;
    const { javascript, python } = generateEncaps();
    for (const testCase of cases) {
      const expected = `${testCase.c}${testCase.k}`.toLowerCase();
      const jsDriver = `const result = ML_KEM_Encaps(new Uint8Array(${hexToArray(testCase.ek)}), new Uint8Array(${hexToArray(testCase.m)}));\n`
        + "console.log(Array.from(result).map((b) => b.toString(16).padStart(2, '0')).join(''));";
      const jsOutput = execFileSync(process.execPath, ['-e', `${javascript}\n${jsDriver}`], { encoding: 'utf8' }).trim();
      expect(jsOutput, `ACVP tgId=${tgId} tcId=${testCase.tcId} (JS)`).toBe(expected);

      const pyDriver = `result = ML_KEM_Encaps(bytes(${hexToArray(testCase.ek)}), bytes(${hexToArray(testCase.m)}))\nprint(bytes(result).hex())`;
      const pyOutput = execFileSync(pythonCommand, ['-c', `${python}\n${pyDriver}`], { encoding: 'utf8' }).trim();
      expect(pyOutput, `ACVP tgId=${tgId} tcId=${testCase.tcId} (Python)`).toBe(expected);
    }
  });
});
