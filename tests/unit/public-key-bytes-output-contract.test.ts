// @vitest-environment jsdom
import * as Blockly from 'blockly/core';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import '@/blocks/data';
import '@/blocks/procedure/blocks';
import '@/blocks/rsa';
import '@/blocks/ecdsa';
import '@/blocks/eddsa';
import '@/blocks/sm2sig';
import '@/blocks/sm2enc';
import '@/blocks/sm9';
import '@/blocks/mldsa';
import '@/generators/javascript';
import '@/generators/python';
import { javascriptGenerator } from 'blockly/javascript';
import { pythonGenerator } from 'blockly/python';
import { isNativeUint8Array } from './helpers/native-bytes';

const pythonCommand = process.env.CIPHER_CAT_PYTHON ||
  (process.platform === 'win32' ? 'python' : 'python3');

const procedures = [
  ['ECDSA.json', 'ECDSA_Sign', 'ecdsa_sign'],
  ['EDDSA.json', 'EDDSA_Sign', 'eddsa_sign'],
  ['SM2-Sign.json', 'SM2_Sign', 'sm2_sign'],
  ['SM2-Encrypt.json', 'SM2_Decrypt', 'sm2_decrypt'],
  ['SM9-Sign.json', 'SM9_Sign', 'sm9_sign'],
  ['ML-DSA-Sign.json', 'MLDSA_Sign', 'mldsa_sign'],
  ['RSA-Encrypt.json', 'RSA_Keygen', 'rsa_keygen'],
  ['RSA-Encrypt.json', 'RSA_Encrypt', 'rsa_encrypt'],
  ['RSA-Encrypt.json', 'RSA_Decrypt', 'rsa_decrypt'],
  ['RSA-Sign.json', 'RSA_Sign', 'rsa_sign'],
] as const;

function generateProcedure(
  language: 'javascript' | 'python',
  fileName: string,
  functionName: string,
  blockType: string,
): string {
  const demo = JSON.parse(readFileSync(
    resolve(process.cwd(), 'demos/procedures', fileName),
    'utf8',
  ));
  const workspace = new Blockly.Workspace();
  try {
    Blockly.serialization.workspaces.load(demo, workspace);
    const block = workspace.getAllBlocks(false).find((candidate) => candidate.type === blockType);
    expect(block, `${fileName} must include ${blockType}`).toBeDefined();
    expect(block!.outputConnection?.getCheck()).toContain('Bytes');
    const procedure = workspace.getAllBlocks(false).find((candidate) =>
      candidate.type === 'procedures_defreturn' && candidate.getFieldValue('NAME') === functionName,
    );
    expect(procedure, `${fileName} must define ${functionName}`).toBeDefined();
    expect(procedure!.getInputTargetBlock('RETURN')).toBe(block);
    return (language === 'javascript' ? javascriptGenerator : pythonGenerator).workspaceToCode(workspace);
  } finally {
    workspace.dispose();
  }
}

function evaluateJavaScript(program: string, functionName: string): unknown {
  return new Function(`${program}\nreturn ${functionName}();`)();
}

function evaluatesToPythonBytes(program: string, functionName: string): boolean {
  return execFileSync(pythonCommand, ['-c', [
    program,
    `result = ${functionName}()`,
    'print(type(result) is bytes)',
  ].join('\n')], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim() === 'True';
}

describe('public-key Bytes output contracts', () => {
  it.each(procedures)('%s / %s returns Uint8Array and bytes', (fileName, functionName, blockType) => {
    const javascript = generateProcedure('javascript', fileName, functionName, blockType);
    const python = generateProcedure('python', fileName, functionName, blockType);
    const javascriptResult = evaluateJavaScript(javascript, functionName);

    expect(isNativeUint8Array(javascriptResult)).toBe(true);
    expect(evaluatesToPythonBytes(python, functionName)).toBe(true);
  });
});
