// @vitest-environment jsdom
import * as Blockly from 'blockly/core';
import 'blockly/blocks';
import { execFileSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';

import '@/blocks/gcm';
import '@/blocks/data/number';
import '@/generators/javascript';
import '@/generators/javascript/gcm';
import '@/generators/python';
import '@/generators/python/gcm';

import { javascriptGenerator } from 'blockly/javascript';
import { pythonGenerator } from 'blockly/python';

const pythonCommand = process.env.CIPHER_CAT_PYTHON ||
  (process.platform === 'win32' ? 'python' : 'python3');

/** AES-128(0^128, 0^128)：GCM 规范 Test Case 3 的 H */
const H = hexToBytes('66e94bd4ef8a2c3b884cfa59ca342b2e');
/** Test Case 3 的密文块 0388DACE60B6A392F328C2B971B2FE78 */
const CIPHER_BLOCK = hexToBytes('0388dace60b6a392f328c2b971b2fe78');
/** C·H（单块乘法），GCM 规范 Test Case 3 派生值 */
const MUL_VALUE = '5e2ec746917062882c85b0685353deb7';
/**
 * GHASH(H, {}, C)：由 Test Case 3 公开值派生——
 * T = GHASH ⊕ AES_K(J0)，其中 T=ab6e47d42cec13bdf53a67b21257bddf、
 * AES_K(J0)=58e2fccfefa7e306136456ccf65237f11（Test Case 2 的标签，空输入时 GHASH=0）。
 */
const GHASH_ONE_BLOCK = 'f38cbb1ad69223dcc3457ae5b6b0f885';
const ZERO_KEY = new Array(16).fill(0);

function hexToBytes(hex: string): number[] {
  return hex.match(/../g)!.map((pair) => parseInt(pair, 16));
}

function generateIn(language: 'javascript' | 'python', blockType: string, inputs: Record<string, number[]>): string {
  const workspace = new Blockly.Workspace();
  try {
    const block = workspace.newBlock(blockType);
    for (const [input, values] of Object.entries(inputs)) {
      const value = workspace.newBlock('data_value');
      value.setFieldValue(`[${values.join(', ')}]`, 'NUM');
      block.getInput(input)!.connection!.connect(value.outputConnection!);
    }
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
  ].join('\n')], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
}

function evaluatePython(program: string): string {
  const lines = program.trim().split('\n');
  const expression = lines.pop()!;
  return execFileSync(pythonCommand, ['-c', [
    ...lines,
    `result = ${expression}`,
    'print(bytes(result).hex())',
  ].join('\n')], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
}

/** 同一输入在两个语言生成器中执行，返回两个十六进制结果 */
function runBoth(blockType: string, inputs: Record<string, number[]>): [string, string] {
  return [
    evaluateJavaScript(generateIn('javascript', blockType, inputs)),
    evaluatePython(generateIn('python', blockType, inputs)),
  ];
}

describe('GCM primitive block contract (SP 800-38D)', () => {
  it('GF(2^128) block multiplication matches the GCM spec Test Case 3 derivative', () => {
    const [js, py] = runBoth('gcm_gf128_mul', { X: CIPHER_BLOCK, Y: H });
    expect(js).toBe(MUL_VALUE);
    expect(py).toBe(MUL_VALUE);
  });

  it('GHASH over one block matches the Test Case 3 tag derivation (Algorithm 2)', () => {
    const [js, py] = runBoth('gcm_ghash', { H, A: [], C: CIPHER_BLOCK });
    expect(js).toBe(GHASH_ONE_BLOCK);
    expect(py).toBe(GHASH_ONE_BLOCK);
  });

  it('GCTR with ICB = J0+1 reproduces Test Case 3 ciphertext block (Algorithm 3)', () => {
    const icb = [...new Array(12).fill(0), 0, 0, 0, 2];
    const [js, py] = runBoth('gcm_gctr', { KEY: ZERO_KEY, ICB: icb, X: new Array(16).fill(0) });
    expect(js).toBe('0388dace60b6a392f328c2b971b2fe78');
    expect(py).toBe('0388dace60b6a392f328c2b971b2fe78');
  });

  it('inc32 wraps the low 32 bits and leaves the high 96 bits untouched', () => {
    const allOnes = [...new Array(12).fill(0), 0xff, 0xff, 0xff, 0xff];
    const [jsWrap, pyWrap] = runBoth('gcm_inc32', { X: allOnes });
    expect(jsWrap).toBe('0'.repeat(24) + '00000000');
    expect(pyWrap).toBe('0'.repeat(24) + '00000000');

    const nearWrap = [...new Array(12).fill(0xab), 0, 0, 0, 0xfe];
    const [js, py] = runBoth('gcm_inc32', { X: nearWrap });
    expect(js).toBe('ab'.repeat(12) + '000000ff');
    expect(py).toBe('ab'.repeat(12) + '000000ff');
  });

  it('J0 uses iv‖0^31‖1 for a 96-bit IV (SP 800-38D §7.1 Step 1)', () => {
    const [js, py] = runBoth('gcm_j0', { H, IV: new Array(12).fill(0) });
    expect(js).toBe('0'.repeat(24) + '00000001');
    expect(py).toBe('0'.repeat(24) + '00000001');
  });

  it('J0 for a non-96-bit IV equals GHASH_H({}, IV) in both languages', () => {
    const iv = hexToBytes('cafebabefacedbad');
    const [jsJ0, pyJ0] = runBoth('gcm_j0', { H, IV: iv });
    const [jsGhash, pyGhash] = runBoth('gcm_ghash', { H, A: [], C: iv });
    expect(jsJ0).toBe(jsGhash);
    expect(pyJ0).toBe(pyGhash);
    expect(jsJ0).toBe(pyJ0);
    expect(jsJ0).toHaveLength(32);
  });

  it('rejects a non-16-byte GCTR key in both languages', () => {
    const shortKey = new Array(15).fill(0);
    const icb = [...new Array(12).fill(0), 0, 0, 0, 2];
    expect(() => evaluateJavaScript(generateIn('javascript', 'gcm_gctr', { KEY: shortKey, ICB: icb, X: new Array(16).fill(0) }))).toThrow();
    expect(() => evaluatePython(generateIn('python', 'gcm_gctr', { KEY: shortKey, ICB: icb, X: new Array(16).fill(0) }))).toThrow();
  });
});
