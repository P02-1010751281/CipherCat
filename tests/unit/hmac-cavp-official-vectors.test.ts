// @vitest-environment jsdom
/**
 * HMAC-SHA-256 官方 CAVP 向量回归（ITEM-2 / ITEM-3）。
 *
 * 数据源：docs/standards/fips198-1-hmac/vectors/hmactestvectors.zip
 * （NIST CAVP HMAC 测试向量，CAVS 11.0）。取 `[L=32]` 段（HMAC-SHA-256）全部用例，
 * 用官方 Key/Msg 驱动 `hash_hmac`（HASH=SHA-256）的双语言代码，与官方 Mac 比较。
 *
 * 边界：只覆盖 L=32（SHA-256）段；[L=20]/[L=28]/[L=48]/[L=64] 段属 SHA-1/SHA-224/SHA-384/SHA-512 组合，
 * 与本仓库当前下拉选项（SHA-256/SM3）不匹配，不在本测试内；也不构成完整 CAVP 会话或认证。
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
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
const zipPath = resolve(process.cwd(), 'docs/standards/fips198-1-hmac/vectors/hmactestvectors.zip');

interface HmacCase { count: number; key: string; msg: string; mac: string; tlen: number }

function loadSha256Cases(): HmacCase[] | null {
  if (!existsSync(zipPath)) return null;
  let extractedDir: string | null = null;
  try {
    extractedDir = mkdtempSync(join(tmpdir(), 'hmac-cavp-'));
    execFileSync('unzip', ['-o', '-q', zipPath, '-d', extractedDir]);
    const text = readFileSync(join(extractedDir, 'HMAC.rsp'), 'utf8');
    const section = text.split('[L=32]')[1]?.split('[L=')[0] ?? '';
    const cases: HmacCase[] = [];
    for (const match of section.matchAll(
      /Count\s*=\s*(\d+)\s*\nKlen\s*=\s*(\d+)\s*\nTlen\s*=\s*(\d+)\s*\nKey\s*=\s*([0-9a-fA-F]+)\s*\nMsg\s*=\s*([0-9a-fA-F]+)\s*\nMac\s*=\s*([0-9a-fA-F]+)/g,
    )) {
      cases.push({ count: Number(match[1]), key: match[4], msg: match[5], mac: match[6].toLowerCase(), tlen: Number(match[3]) });
    }
    return cases;
  } catch {
    return null;
  } finally {
    if (extractedDir) rmSync(extractedDir, { recursive: true, force: true });
  }
}

function generateHmac() {
  const workspace = new Blockly.Workspace();
  const hmac = workspace.newBlock('hash_hmac');
  hmac.setFieldValue('SHA-256', 'HASH');
  const names: Record<string, string> = {};
  for (const inputName of ['KEY', 'MSG']) {
    const variable = workspace.getVariableMap().createVariable(`kat_${inputName.toLowerCase()}`);
    const getter = workspace.newBlock('variables_get');
    getter.setFieldValue(variable.getId(), 'VAR');
    hmac.getInput(inputName)!.connection!.connect(getter.outputConnection!);
    names[inputName] = variable.getName();
  }
  const javascript = javascriptGenerator.workspaceToCode(workspace);
  const python = pythonGenerator.workspaceToCode(workspace);
  workspace.dispose();
  return { javascript, python, names };
}

describe('HMAC-SHA-256 official CAVP vectors', () => {
  const cases = loadSha256Cases();

  it.skipIf(!cases)('matches every [L=32] HMAC CAVP case in JavaScript and Python', () => {
    const all = cases!;
    expect(all.length).toBeGreaterThan(100);
    const dataDir = mkdtempSync(join(tmpdir(), 'hmac-cases-'));
    const dataPath = join(dataDir, 'cases.json');
    writeFileSync(dataPath, JSON.stringify(all.map((entry) => ({ k: entry.key, m: entry.msg }))));
    const program = generateHmac();

    const jsExpression = program.javascript.trim().split('\n').pop()!.replace(/;$/, '');
    const jsHelpers = program.javascript.trim().split('\n').slice(0, -1).join('\n');
    const jsBody = [
      `const kat = JSON.parse(require('fs').readFileSync(${JSON.stringify(dataPath)}, 'utf8'));`,
      'for (const entry of kat) {',
      `  ${program.names.KEY} = Uint8Array.from(Buffer.from(entry.k, 'hex'));`,
      `  ${program.names.MSG} = Uint8Array.from(Buffer.from(entry.m, 'hex'));`,
      `  console.log(Array.from(${jsExpression}).map((b) => b.toString(16).padStart(2, '0')).join(''));`,
      '}',
    ].join('\n');
    const js = execFileSync(process.execPath, ['-e', `${jsHelpers}\n${jsBody}`], { encoding: 'utf8', maxBuffer: 1 << 26 })
      .trim().split('\n');

    const pyExpression = program.python.trim().split('\n').pop()!.replace(/;$/, '');
    const pyHelpers = program.python.trim().split('\n').slice(0, -1).join('\n');
    const pyBody = [
      'import json',
      `kat = json.load(open(${JSON.stringify(dataPath)}))`,
      'for entry in kat:',
      `    ${program.names.KEY} = bytes.fromhex(entry['k'])`,
      `    ${program.names.MSG} = bytes.fromhex(entry['m'])`,
      `    print(bytes(${pyExpression}).hex())`,
    ].join('\n');
    const py = execFileSync(pythonCommand, ['-c', `${pyHelpers}\n${pyBody}`], { encoding: 'utf8', maxBuffer: 1 << 26 })
      .trim().split('\n');
    rmSync(dataDir, { recursive: true, force: true });

    all.forEach((entry, index) => {
      // CAVP HMAC 用例按 Tlen 截断 MAC；本项目输出完整 32 字节，因此比较前按 Tlen 截取。
      const expected = entry.mac.slice(0, entry.tlen * 2);
      expect(js[index].slice(0, entry.tlen * 2), `HMAC CAVP Count=${entry.count} Tlen=${entry.tlen} (JS)`).toBe(expected);
      expect(py[index].slice(0, entry.tlen * 2), `HMAC CAVP Count=${entry.count} Tlen=${entry.tlen} (Python)`).toBe(expected);
    });
  });
});
