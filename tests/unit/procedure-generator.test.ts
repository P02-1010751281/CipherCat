// @vitest-environment jsdom
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import * as Blockly from 'blockly/core';
import { setLocale } from 'blockly/core';
import { javascriptGenerator, Order as JavaScriptOrder } from 'blockly/javascript';
import { pythonGenerator, Order as PythonOrder } from 'blockly/python';
import { describe, expect, it } from 'vitest';

import '@/blocks/procedure/blocks';
import '@/blocks/symmetric/sm4/blocks';
import '@/generators/python/procedure/blocks';
import '@/generators/javascript/procedure/blocks';
import '@/generators/python/symmetric/sm4/blocks';
import '@/generators/javascript/symmetric/sm4/blocks';
import { generateDefreturnJS } from '@/generators/javascript/procedure/blocks';
import { generateDefreturnPy } from '@/generators/python/procedure/blocks';

const require = createRequire(resolve(process.cwd(), 'package.json'));
setLocale(require('blockly/msg/en'));

describe('procedure code generators', () => {
  it('preserves an explicitly connected typed return', () => {
    const demo = JSON.parse(readFileSync(resolve(process.cwd(), 'demos/procedures/SM4-Sbox.json'), 'utf8'));
    const workspace = new Blockly.Workspace();
    Blockly.serialization.workspaces.load(demo, workspace);

    const python = pythonGenerator.workspaceToCode(workspace);
    const javascript = javascriptGenerator.workspaceToCode(workspace);
    expect(python).toContain('def SM4_Sbox(x: int) -> int:');
    expect(python).toContain('return sm4_sbox_lookup(x)');
    expect(python).not.toContain('# TODO: implement SM4_Sbox algorithm');
    expect(javascript).toContain('@returns {number}');
    expect(javascript).toContain('return sm4SboxLookup(x);');
    workspace.dispose();
  });

  it('does not infer a missing return from the first parameter', () => {
    const workspace = new Blockly.Workspace();
    const block = workspace.newBlock('procedures_defreturn');
    block.setFieldValue('transform', 'NAME');
    block.loadExtraState!({ params: [{ name: 'input', id: 'param_input', type: 'bytes' }] });

    const python = generateDefreturnPy(block);
    const javascript = generateDefreturnJS(block);
    expect(python).toContain('def transform(input: bytes) -> None:');
    expect(python).toContain('return None');
    expect(python).not.toContain('return input');
    expect(javascript).toContain('@returns {undefined}');
    expect(javascript).toContain('return undefined;');
    expect(javascript).not.toContain('return input;');
    workspace.dispose();
  });

  it('does not emit a return statement for a no-return procedure', () => {
    const workspace = new Blockly.Workspace();
    const block = workspace.newBlock('procedures_defnoreturn');
    block.setFieldValue('consume', 'NAME');
    block.loadExtraState!({ params: [{ name: 'value', id: 'param_value', type: 'int' }] });

    expect(generateDefreturnPy(block)).toContain('def consume(value: int) -> None:');
    expect(generateDefreturnJS(block)).not.toMatch(/^\s*return\b/m);
    workspace.dispose();
  });

  it('emits procedure calls as expressions or statements according to block type', () => {
    const block = (type: string): Blockly.Block => ({
      type,
      getFieldValue: () => 'transform',
      mutationToDom: () => null,
    } as unknown as Blockly.Block);
    expect(pythonGenerator.forBlock.procedures_callreturn(block('procedures_callreturn'), pythonGenerator))
      .toEqual(['transform()', PythonOrder.FUNCTION_CALL]);
    expect(pythonGenerator.forBlock.procedures_callnoreturn(block('procedures_callnoreturn'), pythonGenerator))
      .toBe('transform()\n');
    expect(javascriptGenerator.forBlock.procedures_callreturn(block('procedures_callreturn'), javascriptGenerator))
      .toEqual(['transform()', JavaScriptOrder.FUNCTION_CALL]);
    expect(javascriptGenerator.forBlock.procedures_callnoreturn(block('procedures_callnoreturn'), javascriptGenerator))
      .toBe('transform();\n');
  });
});
