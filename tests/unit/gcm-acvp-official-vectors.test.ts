// @vitest-environment jsdom
/**
 * AES-GCM 官方 ACVP 向量回归（ITEM-2）。
 *
 * 数据源：docs/standards/sp800-38d-gcm/vectors/ACVP-AES-GCM-internalProjection.json
 * （NIST usnistgov/ACVP-Server gen-val 数据集）。取 tagLen=128 且 direction=encrypt 的测试组，
 * 把官方 (key, iv, aad, pt) 喂给 `gcm_encrypt` 块生成的双语言代码，与官方 `ct‖tag` 比较。
 *
 * 背景说明：SP 800-38D 正文与附录不含测试用例表（本地 PDF 39 页、附录 A–E 已核对），
 * 因此 GCM 的“TC 编号”类用例属 GCM 规范（McGrew & Viega）编号体系；本测试改用 NIST ACVP
 * 官方用例作为可离线追溯的来源，并记录 tgId/tcId。
 *
 * 边界：只覆盖 tagLen=128、96-bit IV 的 encrypt 组（15 例），不是完整 ACVP 会话；
 * 其它 tag 长度、120-bit IV 组合与解密方向见对应文件与后续工作。
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
const vectorPath = resolve(process.cwd(), 'docs/standards/sp800-38d-gcm/vectors/ACVP-AES-GCM-internalProjection.json');

interface AcvpGcmCase {
  tcId: number | string;
  key: string;
  iv: string;
  aad: string;
  pt: string;
  ct: string;
  tag: string;
}

function loadEncrypt128Cases(): { tgId: number; cases: AcvpGcmCase[] } | null {
  if (!existsSync(vectorPath)) return null;
  const data = JSON.parse(readFileSync(vectorPath, 'utf8')) as {
    testGroups: Array<{ tgId: number; direction?: string; tagLen?: number; tests: AcvpGcmCase[] }>;
  };
  const group = data.testGroups.find((entry) => entry.direction === 'encrypt' && entry.tagLen === 128);
  return group ? { tgId: group.tgId, cases: group.tests } : null;
}

function generateGcm(keyHex: string, ivHex: string, aadHex: string, msgHex: string): { javascript: string; python: string } {
  const workspace = new Blockly.Workspace();
  const gcm = workspace.newBlock('gcm_encrypt');
  const attach = (inputName: string, hex: string) => {
    const value = workspace.newBlock('data_value');
    const bytes = Array.from({ length: hex.length / 2 }, (_, index) => `0x${hex.slice(index * 2, index * 2 + 2)}`);
    value.setFieldValue(`[${bytes.join(',')}]`, 'NUM');
    gcm.getInput(inputName)!.connection!.connect(value.outputConnection!);
  };
  attach('KEY', keyHex);
  attach('IV', ivHex);
  attach('AAD', aadHex);
  attach('MSG', msgHex);
  const javascript = javascriptGenerator.workspaceToCode(workspace);
  const python = pythonGenerator.workspaceToCode(workspace);
  workspace.dispose();
  return { javascript, python };
}

describe('AES-GCM official ACVP vectors', () => {
  const loaded = loadEncrypt128Cases();

  it.skipIf(!loaded)('encrypts official ACVP cases identically in JavaScript and Python', () => {
    const { tgId, cases } = loaded!;
    for (const testCase of cases) {
      const expected = `${testCase.ct}${testCase.tag}`.toLowerCase();
      const { javascript, python } = generateGcm(testCase.key, testCase.iv, testCase.aad, testCase.pt);
      const jsDriver = `console.log(Array.from(${javascript.trim().split('\n').pop()!.replace(/;$/, '')}).map((b) => b.toString(16).padStart(2, '0')).join(''));`;
      const jsOutput = execFileSync(process.execPath, ['-e', `${javascript}\n${jsDriver}`], { encoding: 'utf8' }).trim();
      expect(jsOutput, `ACVP tgId=${tgId} tcId=${testCase.tcId} (JS)`).toBe(expected);

      const pyDriver = `print(bytes(${python.trim().split('\n').pop()!.replace(/;$/, '')}).hex())`;
      const pyOutput = execFileSync(pythonCommand, ['-c', `${python}\n${pyDriver}`], { encoding: 'utf8' }).trim();
      expect(pyOutput, `ACVP tgId=${tgId} tcId=${testCase.tcId} (Python)`).toBe(expected);
    }
  });
});
