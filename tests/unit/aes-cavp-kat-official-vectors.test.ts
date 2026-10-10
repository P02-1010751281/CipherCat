// @vitest-environment jsdom
/**
 * AES-128 ECB 官方 CAVP KAT 向量回归（ITEM-2 / ITEM-3）。
 *
 * 数据源：docs/standards/fips197-AES/vectors/CAVP-KAT-AES.zip
 * （NIST CAVP 的 AESVS KAT 数据，CAVS 11.1）。取 128-bit 密钥的四个 ECB KAT 文件
 * （GFSbox / KeySbox / VarKey / VarTxt）的 [ENCRYPT] 段，把官方 KEY/PLAINTEXT 批量喂给
 * `mode_ecb_encrypt` 生成的双语言代码，与官方 CIPHERTEXT 逐字节比较。
 *
 * 边界：只覆盖 AES-128 ECB 的单块加密方向与这四个 KAT 文件；不覆盖 192/256 位密钥、
 * CBC/CFB/OFB 文件、解密方向或 CTR 计数器语义，也不构成完整 CAVP 会话或认证。
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
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
const zipPath = resolve(process.cwd(), 'docs/standards/fips197-AES/vectors/CAVP-KAT-AES.zip');
const KAT_FILES = ['ECBGFSbox128.rsp', 'ECBKeySbox128.rsp', 'ECBVarKey128.rsp', 'ECBVarTxt128.rsp'];

interface KatCase { count: number; key: string; plaintext: string; ciphertext: string }

function loadKatCases(): { file: string; cases: KatCase[] }[] | null {
  if (!existsSync(zipPath)) return null;
  let extractedDir: string | null = null;
  try {
    extractedDir = mkdtempSync(join(tmpdir(), 'aes-kat-'));
    execFileSync('unzip', ['-o', '-q', zipPath, '-d', extractedDir]);
    return KAT_FILES.map((file) => {
      const text = readFileSync(join(extractedDir!, file), 'utf8');
      const encryptSection = text.split('[ENCRYPT]')[1]?.split('[DECRYPT]')[0] ?? '';
      const cases: KatCase[] = [];
      for (const block of encryptSection.split(/\n\s*\n/)) {
        const count = block.match(/COUNT\s*=\s*(\d+)/)?.[1];
        const key = block.match(/KEY\s*=\s*([0-9a-fA-F]+)/)?.[1];
        const plaintext = block.match(/PLAINTEXT\s*=\s*([0-9a-fA-F]+)/)?.[1];
        const ciphertext = block.match(/CIPHERTEXT\s*=\s*([0-9a-fA-F]+)/)?.[1];
        if (count && key && plaintext && ciphertext) {
          cases.push({ count: Number(count), key, plaintext, ciphertext });
        }
      }
      return { file, cases };
    });
  } catch {
    return null; // 缺少 unzip 或压缩包损坏时跳过
  } finally {
    if (extractedDir) rmSync(extractedDir, { recursive: true, force: true });
  }
}

function generateEcb(): { javascript: string; python: string } {
  const workspace = new Blockly.Workspace();
  const ecb = workspace.newBlock('mode_ecb_encrypt');
  // 数据与密钥由 driver 注入的变量提供，避免把成百上千组向量写进工作区。
  // 注意：必须先在工作区里创建变量，否则 variables_get 的字段会回退成默认变量名。
  const dataVariable = workspace.getVariableMap().createVariable('katData');
  const keyVariable = workspace.getVariableMap().createVariable('katKey');
  const dataVar = workspace.newBlock('variables_get');
  dataVar.setFieldValue(dataVariable.getId(), 'VAR');
  ecb.getInput('DATA')!.connection!.connect(dataVar.outputConnection!);
  const keyVar = workspace.newBlock('variables_get');
  keyVar.setFieldValue(keyVariable.getId(), 'VAR');
  ecb.getInput('KEY')!.connection!.connect(keyVar.outputConnection!);
  const javascript = javascriptGenerator.workspaceToCode(workspace);
  const python = pythonGenerator.workspaceToCode(workspace);
  workspace.dispose();
  return { javascript, python };
}

describe('AES-128 ECB official CAVP KAT vectors', () => {
  const loaded = loadKatCases();

  it.skipIf(!loaded)('matches every 128-bit ECB KAT case in JavaScript and Python', () => {
    const files = loaded!;
    expect(files).toHaveLength(KAT_FILES.length);
    const { javascript, python } = generateEcb();
    const expressionJs = javascript.trim().split('\n').pop()!.replace(/;$/, '');
    const expressionPy = python.trim().split('\n').pop()!.replace(/;$/, '');
    const jsHelpers = javascript.trim().split('\n').slice(0, -1).join('\n');
    const pyHelpers = python.trim().split('\n').slice(0, -1).join('\n');

    for (const { file, cases } of files) {
      const expected = cases.map((entry) => entry.ciphertext.toLowerCase());
      const vectors = cases.map((entry) => ({
        key: Array.from({ length: entry.key.length / 2 }, (_, index) => Number.parseInt(entry.key.slice(index * 2, index * 2 + 2), 16)),
        data: Array.from({ length: entry.plaintext.length / 2 }, (_, index) => Number.parseInt(entry.plaintext.slice(index * 2, index * 2 + 2), 16)),
      }));

      const jsProgram = `${jsHelpers}\nconst vectors = ${JSON.stringify(vectors)};\n`
        + 'for (const { key, data } of vectors) { const katKey = key, katData = data; '
        + `console.log(Array.from(${expressionJs}).map((b) => b.toString(16).padStart(2, '0')).join('')); }`;
      const jsOutput = execFileSync(process.execPath, ['-e', jsProgram], { encoding: 'utf8', maxBuffer: 1 << 26 })
        .trim().split('\n');
      expect(jsOutput, `${file} (JS)`).toEqual(expected);

      const pyProgram = `${pyHelpers}\nimport json\nvectors = json.loads(r'''${JSON.stringify(vectors)}''')\n`
        + `for vector in vectors:\n    katKey = vector["key"]\n    katData = vector["data"]\n    print(bytes(${expressionPy}).hex())`;
      const pyOutput = execFileSync(pythonCommand, ['-c', pyProgram], { encoding: 'utf8', maxBuffer: 1 << 26 })
        .trim().split('\n');
      expect(pyOutput, `${file} (Python)`).toEqual(expected);
    }
  });
});
