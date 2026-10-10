// @vitest-environment jsdom
/**
 * 三个通用函数模板（crypto_encrypt_func / crypto_decrypt_func / crypto_hash_func）的块级证据。
 *
 * 这三个身份此前既不出现在任何 Demo 中，也没有单元测试直接命中，只由 verify-templates 做
 * 结构/可执行性冒烟。本文件补上可判定断言：
 *   - 预填链在缺少必要参数（16 字节 key）时必须显式失败，而不是静默按空密钥运算；
 *   - 补齐 key 后，结果与 FIPS 197 附录 C.1 的 AES-128 已知答案一致（加密与解密）；
 *   - crypto_hash_func 的输出满足 FIPS 180-4 §5.1.1 的填充结构（0x80 终止符 + 64 位大端比特长度）。
 * 断言范围仅覆盖上述路径；它是这些模板的接口/已知答案证据，不代表完整 AES、SHA-256 实现
 * 符合性或任何形式的认证。模板默认留空参数的行为边界见 CONFORMANCE-INVENTORY.md。
 */
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import * as Blockly from 'blockly/core';
import 'blockly/blocks';
import { setLocale } from 'blockly/core';
import { javascriptGenerator } from 'blockly/javascript';
import { pythonGenerator } from 'blockly/python';
import { describe, expect, it } from 'vitest';

import '@/blocks/procedure/blocks';
import '@/blocks/data/number';
import '@/blocks/hash/sha256';
import '@/blocks/symmetric/modes/blocks';
import '@/generators/javascript';
import '@/generators/python';

const require = createRequire(resolve(process.cwd(), 'package.json'));
setLocale(require('blockly/msg/en'));

// headless workspace 没有渲染层：stub 掉 SVG 初始化/绘制，否则 newBlock 会在预填注入时抛错。
const blockPrototype = Blockly.Block.prototype as unknown as { initSvg?: () => void; render?: () => void };
blockPrototype.initSvg = () => undefined;
blockPrototype.render = () => undefined;

// FIPS 197 附录 C.1 的 AES-128 示例
const C1_PLAINTEXT = [0x6b, 0xc1, 0xbe, 0xe2, 0x2e, 0x40, 0x9f, 0x96, 0xe9, 0x3d, 0x7e, 0x11, 0x73, 0x93, 0x17, 0x2a];
const C1_KEY = [0x2b, 0x7e, 0x15, 0x16, 0x28, 0xae, 0xd2, 0xa6, 0xab, 0xf7, 0x15, 0x88, 0x09, 0xcf, 0x4f, 0x3c];
const C1_CIPHERTEXT = '3ad77bb40d7a3660a89ecaf32466ef97';
const KEY_LENGTH_ERROR = 'AES-128 key must be 16 bytes';
// FIPS 180-4 §5.1.1：message "abc" 填充后为 64 字节，结尾是 64 位大端比特长度 24
const SHA256_ABC_PAD_HEAD = '61626380';
const SHA256_ABC_PAD_TAIL = '0000000000000018';

function prefill(root: Blockly.Block): void {
  const onchange = (root as unknown as { onchange?: (event: unknown) => void }).onchange;
  if (!onchange) throw new Error(`${root.type} 未注册预填处理器`);
  onchange.call(root, { type: 'create', blockId: root.id });
}

function collect(root: Blockly.Block | null, out: Blockly.Block[] = []): Blockly.Block[] {
  if (!root || out.includes(root)) return out;
  out.push(root);
  for (const input of root.inputList) collect(input.connection?.targetBlock() ?? null, out);
  return collect(root.nextConnection?.targetBlock() ?? null, out);
}

function attachDataValue(workspace: Blockly.Workspace, input: Blockly.Input | null, bytes: number[]): void {
  if (!input?.connection) throw new Error('目标输入不存在');
  const block = workspace.newBlock('data_value');
  block.setFieldValue(`[${bytes.map((byte) => `0x${byte.toString(16).padStart(2, '0')}`).join(',')}]`, 'NUM');
  input.connection.connect(block.outputConnection!);
}

/** 创建模板块并触发真实 onchange 预填处理器，返回工作区与模板根块。 */
function buildTemplate(type: string): { workspace: Blockly.Workspace; root: Blockly.Block } {
  const workspace = new Blockly.Workspace();
  const root = workspace.newBlock(type);
  root.setFieldValue(type, 'FUNC_NAME');
  prefill(root);
  return { workspace, root };
}

const generate = (workspace: Blockly.Workspace) => ({
  js: javascriptGenerator.workspaceToCode(workspace),
  py: pythonGenerator.workspaceToCode(workspace),
});

function runJs(code: string): string {
  return execFileSync(process.execPath, ['-e', code], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}

function runPy(code: string): string {
  return execFileSync(process.platform === 'win32' ? 'python' : 'python3', ['-c', code], {
    encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
}

const jsHexOf = (expression: string): string =>
  `console.log(Array.from(${expression}).map((byte) => byte.toString(16).padStart(2, '0')).join(''));`;

describe('crypto_* function template default chains', () => {
  it('crypto_encrypt_func fails closed without a key and matches FIPS 197 C.1 with the C.1 key', () => {
    Blockly.Events.disable();
    const { workspace, root } = buildTemplate('crypto_encrypt_func');
    try {
      const ecb = collect(root).find((block) => block.type === 'mode_ecb_encrypt');
      expect(ecb, 'crypto_encrypt_func 应预填 mode_ecb_encrypt 链').toBeTruthy();
      const bare = generate(workspace);

      const jsMissingKey = runJs([
        bare.js,
        `try { crypto_encrypt_func(new Uint8Array(${JSON.stringify(C1_PLAINTEXT)})); console.log('NO_THROW'); }`,
        'catch (error) { console.log(String(error.message || error)); }',
      ].join('\n'));
      const pyMissingKey = runPy([
        bare.py,
        'try:',
        `    crypto_encrypt_func(bytes(${JSON.stringify(C1_PLAINTEXT)}))`,
        "    print('NO_THROW')",
        'except Exception as error:',
        '    print(str(error))',
      ].join('\n'));
      expect(jsMissingKey).toBe(KEY_LENGTH_ERROR);
      expect(pyMissingKey).toBe(KEY_LENGTH_ERROR);

      attachDataValue(workspace, ecb!.getInput('KEY'), C1_KEY);
      const keyed = generate(workspace);
      const jsCiphertext = runJs(`${keyed.js}\n${jsHexOf(`crypto_encrypt_func(new Uint8Array(${JSON.stringify(C1_PLAINTEXT)}))`)}`);
      const pyCiphertext = runPy(`${keyed.py}\nprint(crypto_encrypt_func(bytes(${JSON.stringify(C1_PLAINTEXT)})).hex())`);
      expect(jsCiphertext).toBe(C1_CIPHERTEXT);
      expect(pyCiphertext).toBe(C1_CIPHERTEXT);
    } finally {
      Blockly.Events.enable();
      workspace.dispose();
    }
  });

  it('crypto_decrypt_func recovers the FIPS 197 C.1 plaintext when the C.1 key is supplied', () => {
    Blockly.Events.disable();
    const { workspace, root } = buildTemplate('crypto_decrypt_func');
    try {
      const ecb = collect(root).find((block) => block.type === 'mode_ecb_decrypt');
      expect(ecb, 'crypto_decrypt_func 应预填 mode_ecb_decrypt 链').toBeTruthy();
      attachDataValue(workspace, ecb!.getInput('KEY'), C1_KEY);

      const ciphertextBytes = C1_CIPHERTEXT.match(/../g)!.map((pair) => Number.parseInt(pair, 16));
      const { js, py } = generate(workspace);
      const jsPlaintext = runJs(`${js}\n${jsHexOf(`crypto_decrypt_func(new Uint8Array(${JSON.stringify(ciphertextBytes)}))`)}`);
      const pyPlaintext = runPy(`${py}\nprint(crypto_decrypt_func(bytes(${JSON.stringify(ciphertextBytes)})).hex())`);
      const expected = C1_PLAINTEXT.map((byte) => byte.toString(16).padStart(2, '0')).join('');
      expect(jsPlaintext).toBe(expected);
      expect(pyPlaintext).toBe(expected);
    } finally {
      Blockly.Events.enable();
      workspace.dispose();
    }
  });

  it('crypto_hash_func returns the FIPS 180-4 §5.1.1 padding for "abc" in both languages', () => {
    Blockly.Events.disable();
    const { workspace } = buildTemplate('crypto_hash_func');
    try {
      const { js, py } = generate(workspace);
      const message = [0x61, 0x62, 0x63];
      const jsPadded = runJs(`${js}\n${jsHexOf(`crypto_hash_func(new Uint8Array(${JSON.stringify(message)}))`)}`);
      const pyPadded = runPy(`${py}\nprint(crypto_hash_func(bytes(${JSON.stringify(message)})).hex())`);

      expect(jsPadded).toBe(pyPadded);
      expect(jsPadded).toHaveLength(128); // 64 字节 = 一个 SHA-256 填充块
      expect(jsPadded.startsWith(SHA256_ABC_PAD_HEAD)).toBe(true);
      expect(jsPadded.endsWith(SHA256_ABC_PAD_TAIL)).toBe(true);
    } finally {
      Blockly.Events.enable();
      workspace.dispose();
    }
  });
});
