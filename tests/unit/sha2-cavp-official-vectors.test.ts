// @vitest-environment jsdom
/**
 * SHA-2 官方 CAVP 向量回归（ITEM-2 / ITEM-3）。
 *
 * 数据源：docs/standards/fips180-4-SHA2/vectors/shabytetestvectors.zip
 * （NIST CAVP 的 SHA 字节导向测试向量，CAVS 11.0）。
 *   - SHA-224：`hash_sha224_hash` 对 SHA224ShortMsg + SHA224LongMsg 全量用例
 *   - SHA-384 / SHA-512：`hash_sha512_hash`（SIZE 下拉）对 SHA384/SHA512 的 ShortMsg + LongMsg 全量用例
 *   - SHA-256：项目只有“单块 pad→compress”路径（无多块 SHA-256 块），因此只取官方 ShortMsg 中
 *     单块可容纳的用例（Len ≤ 440 bit），超过一个分组的官方用例记为未覆盖缺口。
 *
 * 边界：上述范围之外的官方用例（SHA-1、SHA-512/224、SHA-512/256、Monte Carlo 与位导向文件）
 * 不在本测试内；也不构成完整 CAVP 会话或认证。
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
const zipPath = resolve(process.cwd(), 'docs/standards/fips180-4-SHA2/vectors/shabytetestvectors.zip');

interface ShavsCase { len: number; msg: string; md: string }

function loadShavs(fileName: string, filter: (entry: ShavsCase) => boolean): ShavsCase[] | null {
  if (!existsSync(zipPath)) return null;
  let extractedDir: string | null = null;
  try {
    extractedDir = mkdtempSync(join(tmpdir(), 'sha-cavp-'));
    execFileSync('unzip', ['-o', '-q', zipPath, '-d', extractedDir]);
    const text = readFileSync(join(extractedDir, 'shabytetestvectors', fileName), 'utf8');
    const cases: ShavsCase[] = [];
    for (const block of text.split(/\n\s*\n/)) {
      const len = block.match(/Len\s*=\s*(\d+)/)?.[1];
      const rawMsg = block.match(/Msg\s*=\s*([0-9a-fA-F]*)/)?.[1];
      const md = block.match(/MD\s*=\s*([0-9a-fA-F]+)/)?.[1];
      if (len !== undefined && rawMsg !== undefined && md) {
        // CAVP 字节文件在 Len=0 时写 `Msg = 00` 作为占位；真实消息长度是 Len 位。
        const msg = rawMsg.slice(0, Number(len) / 4);
        const entry = { len: Number(len), msg, md: md.toLowerCase() };
        if (filter(entry)) cases.push(entry);
      }
    }
    return cases;
  } catch {
    return null;
  } finally {
    if (extractedDir) rmSync(extractedDir, { recursive: true, force: true });
  }
}

function generateDigest(blockType: string, field?: { name: string; value: string }) {
  const workspace = new Blockly.Workspace();
  const block = workspace.newBlock(blockType);
  const variable = workspace.getVariableMap().createVariable('kat_msg');
  const getter = workspace.newBlock('variables_get');
  getter.setFieldValue(variable.getId(), 'VAR');
  block.getInput('MSG')!.connection!.connect(getter.outputConnection!);
  if (field) block.setFieldValue(field.value, field.name);
  const javascript = javascriptGenerator.workspaceToCode(workspace);
  const python = pythonGenerator.workspaceToCode(workspace);
  workspace.dispose();
  return { javascript, python, variable: variable.getName() };
}

function runCases(
  program: { javascript: string; python: string; variable: string },
  cases: ShavsCase[],
  format: 'bytes' | 'words' = 'bytes',
) {
  // 向量总量可达数 MB，直接拼进命令行会触发 E2BIG；改为写临时 JSON 由驱动进程读取。
  const dataDir = mkdtempSync(join(tmpdir(), 'sha-cases-'));
  const dataPath = join(dataDir, 'cases.json');
  writeFileSync(dataPath, JSON.stringify(cases.map((entry) => ({ m: entry.msg }))));
  const jsExpression = program.javascript.trim().split('\n').pop()!.replace(/;$/, '');
  const jsHelpers = program.javascript.trim().split('\n').slice(0, -1).join('\n');
  const jsBody = [
    `const kat = JSON.parse(require('fs').readFileSync(${JSON.stringify(dataPath)}, 'utf8'));`,
    'for (const entry of kat) {',
    `  ${program.variable} = Uint8Array.from(Buffer.from(entry.m, 'hex'));`,
    format === 'words'
      ? `  console.log(Array.from(${jsExpression}).map((w) => (w >>> 0).toString(16).padStart(8, '0')).join(''));`
      : `  console.log(Array.from(${jsExpression}).map((b) => b.toString(16).padStart(2, '0')).join(''));`,
    '}',
  ].join('\n');
  const js = execFileSync(process.execPath, ['-e', `${jsHelpers}\n${jsBody}`], { encoding: 'utf8', maxBuffer: 1 << 26 }).trim().split('\n');

  const pyExpression = program.python.trim().split('\n').pop()!.replace(/;$/, '');
  const pyHelpers = program.python.trim().split('\n').slice(0, -1).join('\n');
  const pyBody = [
    'import json',
    `kat = json.load(open(${JSON.stringify(dataPath)}))`,
    'for entry in kat:',
    `    ${program.variable} = bytes.fromhex(entry['m'])`,
    format === 'words'
      ? `    print(''.join(f'{w & 0xffffffff:08x}' for w in ${pyExpression}))`
      : `    print(bytes(${pyExpression}).hex())`,
  ].join('\n');
  const py = execFileSync(pythonCommand, ['-c', `${pyHelpers}\n${pyBody}`], { encoding: 'utf8', maxBuffer: 1 << 26 }).trim().split('\n');
  rmSync(dataDir, { recursive: true, force: true });
  return { js, py };
}

describe('SHA-2 official CAVP vectors', () => {
  const sha224Short = loadShavs('SHA224ShortMsg.rsp', () => true);
  const sha224Long = loadShavs('SHA224LongMsg.rsp', () => true);
  const sha384Short = loadShavs('SHA384ShortMsg.rsp', () => true);
  const sha512Short = loadShavs('SHA512ShortMsg.rsp', () => true);
  const sha512Long = loadShavs('SHA512LongMsg.rsp', () => true);
  const sha256SingleBlock = loadShavs('SHA256ShortMsg.rsp', (entry) => entry.len <= 440);

  it.skipIf(!sha224Short || !sha224Long)('matches every SHA-224 CAVP byte-oriented case', () => {
    const cases = [...sha224Short!, ...sha224Long!];
    const program = generateDigest('hash_sha224_hash');
    const { js, py } = runCases(program, cases);
    cases.forEach((entry, index) => {
      expect(js[index], `SHA-224 Len=${entry.len} (JS)`).toBe(entry.md);
      expect(py[index], `SHA-224 Len=${entry.len} (Python)`).toBe(entry.md);
    });
  });

  it.skipIf(!sha384Short || !sha512Short || !sha512Long)('matches every SHA-384 / SHA-512 CAVP byte-oriented case', () => {
    const groups: Array<[string, ShavsCase[]]> = [
      ['384', [...sha384Short!]],
      ['512', [...sha512Short!, ...sha512Long!]],
    ];
    for (const [size, cases] of groups) {
      const program = generateDigest('hash_sha512_hash', { name: 'SIZE', value: size });
      const { js, py } = runCases(program, cases);
      cases.forEach((entry, index) => {
        expect(js[index], `SHA-${size} Len=${entry.len} (JS)`).toBe(entry.md);
        expect(py[index], `SHA-${size} Len=${entry.len} (Python)`).toBe(entry.md);
      });
    }
  });

  it.skipIf(!sha256SingleBlock)('matches SHA-256 CAVP cases that fit the single-block pad→compress path', () => {
    const cases = sha256SingleBlock!;
    expect(cases.length).toBeGreaterThan(0);
    const workspace = new Blockly.Workspace();
    const compress = workspace.newBlock('hash_sha256_compress');
    const pad = workspace.newBlock('hash_sha256_pad');
    const variable = workspace.getVariableMap().createVariable('kat_msg');
    const getter = workspace.newBlock('variables_get');
    getter.setFieldValue(variable.getId(), 'VAR');
    pad.getInput('INPUT')!.connection!.connect(getter.outputConnection!);
    compress.getInput('W')!.connection!.connect(pad.outputConnection!);
    const iv = workspace.newBlock('data_value');
    iv.setFieldValue(
      '[0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19]',
      'NUM',
    );
    compress.getInput('V')!.connection!.connect(iv.outputConnection!);
    const javascript = javascriptGenerator.workspaceToCode(workspace);
    const python = pythonGenerator.workspaceToCode(workspace);
    workspace.dispose();
    const program = { javascript, python, variable: variable.getName() };
    const { js, py } = runCases(program, cases, 'words');
    cases.forEach((entry, index) => {
      expect(js[index], `SHA-256 Len=${entry.len} (JS)`).toBe(entry.md);
      expect(py[index], `SHA-256 Len=${entry.len} (Python)`).toBe(entry.md);
    });
  });
});
