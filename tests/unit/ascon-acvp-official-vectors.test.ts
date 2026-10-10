// @vitest-environment jsdom
/**
 * Ascon 官方 ACVP 向量回归（ITEM-2 / ITEM-3）。
 *
 * 数据源：docs/standards/sp800-232-ascon/vectors/ACVP-Ascon-*-SP800-232.json
 * （NIST usnistgov/ACVP-Server gen-val 数据集）。覆盖四个端点：
 *   ascon_encrypt（AEAD128，tagLen=128）、ascon_hash256、ascon_xof128、ascon_cxof128。
 * 输入通过“工作区变量 + driver 注入”传递（长向量不写进 Blockly 字段，避免字段截断），
 * 双语言生成并执行后与官方 `md` / `ct‖tag` 比较，并记录 tgId/tcId。
 *
 * 边界：每个端点取前若干例（含全部或指定的参数子集），不是完整 ACVP 会话
 * （完整文件含全部长度组合与解密方向）；不构成算法验证或认证。
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
const vectorsDir = resolve(process.cwd(), 'docs/standards/sp800-232-ascon/vectors');
const CASE_LIMIT = 5;

const toBytes = (hex: string): number[] =>
  Array.from({ length: hex.length / 2 }, (_, index) => Number.parseInt(hex.slice(index * 2, index * 2 + 2), 16));

interface CaseInputs { bytes: Record<string, string>; numbers?: Record<string, string> }

function generate(blockType: string, inputNames: string[]) {
  const workspace = new Blockly.Workspace();
  const block = workspace.newBlock(blockType);
  const names: string[] = [];
  for (const inputName of inputNames) {
    const variableName = `kat_${inputName.toLowerCase()}`;
    const variable = workspace.getVariableMap().createVariable(variableName);
    const getter = workspace.newBlock('variables_get');
    getter.setFieldValue(variable.getId(), 'VAR');
    block.getInput(inputName)!.connection!.connect(getter.outputConnection!);
    names.push(variableName);
  }
  const javascript = javascriptGenerator.workspaceToCode(workspace);
  const python = pythonGenerator.workspaceToCode(workspace);
  workspace.dispose();
  return { javascript, python, names };
}

const jsLiteral = (hex: string) => `new Uint8Array([${toBytes(hex).map((b) => `0x${b.toString(16).padStart(2, '0')}`).join(',')}])`;
const pyLiteral = (hex: string) => `bytes([${toBytes(hex).join(',')}])`;

function runCases(program: { javascript: string; python: string; names: string[] }, cases: CaseInputs[]) {
  const jsExpression = program.javascript.trim().split('\n').pop()!.replace(/;$/, '');
  const jsHelpers = program.javascript.trim().split('\n').slice(0, -1).join('\n');
  const jsBody = cases.map((inputs) => {
    const assignments = program.names.map((name) => {
      // 生成代码顶部已经 `var` 声明了这些变量，driver 只做赋值。
      if (name in inputs.bytes) return `${name} = ${jsLiteral(inputs.bytes[name])};`;
      return `${name} = ${(inputs.numbers || {})[name]};`;
    }).join('\n');
    return `${assignments}\nconsole.log(Array.from(${jsExpression}).map((b) => b.toString(16).padStart(2, '0')).join(''));`;
  }).join('\n');
  const js = execFileSync(process.execPath, ['-e', `${jsHelpers}\n${jsBody}`], { encoding: 'utf8', maxBuffer: 1 << 26 }).trim().split('\n');

  const pyExpression = program.python.trim().split('\n').pop()!.replace(/;$/, '');
  const pyHelpers = program.python.trim().split('\n').slice(0, -1).join('\n');
  const pyBody = cases.map((inputs) => {
    const assignments = program.names.map((name) => {
      if (name in inputs.bytes) return `${name} = ${pyLiteral(inputs.bytes[name])}`;
      return `${name} = ${(inputs.numbers || {})[name]}`;
    }).join('\n');
    return `${assignments}\nprint(bytes(${pyExpression}).hex())`;
  }).join('\n');
  const py = execFileSync(pythonCommand, ['-c', `${pyHelpers}\n${pyBody}`], { encoding: 'utf8', maxBuffer: 1 << 26 }).trim().split('\n');
  return { js, py };
}

function readGroup(fileName: string, pick: (testCase: Record<string, unknown>) => boolean) {
  const path = resolve(vectorsDir, fileName);
  if (!existsSync(path)) return null;
  const data = JSON.parse(readFileSync(path, 'utf8')) as {
    testGroups: Array<{ tgId: number; tests: Array<Record<string, unknown>> }>;
  };
  for (const group of data.testGroups) {
    const cases = group.tests.filter(pick).slice(0, CASE_LIMIT);
    if (cases.length) return { tgId: group.tgId, cases };
  }
  return null;
}

const asHex = (value: unknown) => String(value).toLowerCase();

describe('Ascon official ACVP vectors', () => {
  // 只取**字节对齐**的用例：ACVP 文件同时包含位长度消息（len % 8 ≠ 0），
  // 而本项目的块接口是字节串（不等同于声明这些位级用例已被覆盖）。
  const byteAligned = (value: unknown) => Number(value) % 8 === 0;
  const aead = readGroup('ACVP-Ascon-AEAD128-SP800-232.json',
    (c) => Number(c.tagLen) === 128 && byteAligned(c.payloadLen) && byteAligned(c.adLen));
  const hash256 = readGroup('ACVP-Ascon-Hash256-SP800-232.json', (c) => byteAligned(c.len));
  const xof128 = readGroup('ACVP-Ascon-XOF128-SP800-232.json',
    (c) => byteAligned(c.len) && byteAligned(c.outLen) && Number(c.outLen) / 8 <= 4096);
  const cxof128 = readGroup('ACVP-Ascon-CXOF128-SP800-232.json',
    (c) => byteAligned(c.len) && byteAligned(c.csLen) && byteAligned(c.outLen) && Number(c.outLen) / 8 <= 4096);

  // 官方 AEAD128 用例在本数据集中为**位级输入**（len % 8 ≠ 0）且 tag 长度可变；
  // 本项目的 ascon_encrypt 是字节接口 + 固定 128 位 tag，因此这些用例不适用于当前块 API。
  // 这里显式跳过并保留结论，而不是把不适用当成“通过”。
  it.skipIf(!aead)('matches official AEAD128 encryption cases (tagLen=128, byte-aligned)', () => {
    const program = generate('ascon_encrypt', ['KEY', 'NONCE', 'AD', 'MSG']);
    const cases = aead!.cases.map((c) => ({ bytes: { kat_key: asHex(c.key), kat_nonce: asHex(c.nonce), kat_ad: asHex(c.ad), kat_msg: asHex(c.pt) } }));
    const expected = aead!.cases.map((c) => `${asHex(c.ct)}${asHex(c.tag)}`);
    const { js, py } = runCases(program, cases);
    aead!.cases.forEach((c, index) => {
      expect(js[index], `AEAD tgId=${aead!.tgId} tcId=${c.tcId} (JS)`).toBe(expected[index]);
      expect(py[index], `AEAD tgId=${aead!.tgId} tcId=${c.tcId} (Python)`).toBe(expected[index]);
    });
  });

  it.skipIf(!hash256)('matches official Hash256 cases', () => {
    const program = generate('ascon_hash256', ['MSG']);
    const cases = hash256!.cases.map((c) => ({ bytes: { kat_msg: asHex(c.msg) } }));
    const expected = hash256!.cases.map((c) => asHex(c.md));
    const { js, py } = runCases(program, cases);
    hash256!.cases.forEach((c, index) => {
      expect(js[index], `Hash256 tgId=${hash256!.tgId} tcId=${c.tcId} (JS)`).toBe(expected[index]);
      expect(py[index], `Hash256 tgId=${hash256!.tgId} tcId=${c.tcId} (Python)`).toBe(expected[index]);
    });
  });

  it.skipIf(!xof128)('matches official XOF128 cases (outLen in bits)', () => {
    const program = generate('ascon_xof128', ['MSG', 'LEN']);
    const cases = xof128!.cases.map((c) => ({ bytes: { kat_msg: asHex(c.msg) }, numbers: { kat_len: String(Number(c.outLen) / 8) } }));
    const expected = xof128!.cases.map((c) => asHex(c.md));
    const { js, py } = runCases(program, cases);
    xof128!.cases.forEach((c, index) => {
      expect(js[index], `XOF128 tgId=${xof128!.tgId} tcId=${c.tcId} (JS)`).toBe(expected[index]);
      expect(py[index], `XOF128 tgId=${xof128!.tgId} tcId=${c.tcId} (Python)`).toBe(expected[index]);
    });
  });

  it.skipIf(!cxof128)('matches official CXOF128 cases (outLen in bits)', () => {
    const program = generate('ascon_cxof128', ['MSG', 'CUSTOM', 'LEN']);
    const cases = cxof128!.cases.map((c) => ({
      bytes: { kat_msg: asHex(c.msg), kat_custom: asHex(c.cs) },
      numbers: { kat_len: String(Number(c.outLen) / 8) },
    }));
    const expected = cxof128!.cases.map((c) => asHex(c.md));
    const { js, py } = runCases(program, cases);
    cxof128!.cases.forEach((c, index) => {
      expect(js[index], `CXOF128 tgId=${cxof128!.tgId} tcId=${c.tcId} (JS)`).toBe(expected[index]);
      expect(py[index], `CXOF128 tgId=${cxof128!.tgId} tcId=${c.tcId} (Python)`).toBe(expected[index]);
    });
  });
});
