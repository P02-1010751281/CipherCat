// @vitest-environment jsdom
import * as Blockly from 'blockly/core';
import 'blockly/blocks';
import { javascriptGenerator, Order as JavaScriptOrder } from 'blockly/javascript';
import { pythonGenerator, Order as PythonOrder } from 'blockly/python';
import { afterEach, describe, expect, it } from 'vitest';
import '@/blocks/procedure/blocks';
import '@/generators/javascript/procedure/blocks';
import '@/generators/python/procedure/blocks';
import { createProcedureFlyout } from '@/blocks/procedure/category';

describe('procedure template flyout', () => {
  let workspace: Blockly.Workspace | null = null;

  afterEach(() => {
    workspace?.dispose();
    workspace = null;
  });

  it('exposes every parameter of a multi-parameter template call', () => {
    workspace = new Blockly.Workspace();
    Blockly.Events.disable();
    try {
      workspace.newBlock('proc_mlkem_encaps');
    } finally {
      Blockly.Events.enable();
    }

    const call = createProcedureFlyout(
      workspace as unknown as Blockly.WorkspaceSvg,
    ).find(
      (item) => 'type' in item && item.type === 'procedures_callreturn' &&
        'extraState' in item && item.extraState.name === 'proc_mlkem_encaps',
    );

    expect(call).toMatchObject({
      kind: 'block',
      type: 'procedures_callreturn',
      extraState: { name: 'proc_mlkem_encaps', params: ['ek', 'm'] },
    });

    if (!call || !('extraState' in call)) throw new Error('multi-parameter call missing from flyout');
    const callBlock = workspace.newBlock('procedures_callreturn');
    callBlock.loadExtraState!(call.extraState as Record<string, unknown>);

    expect(callBlock.getInput('ARG0')).not.toBeNull();
    expect(callBlock.getInput('ARG1')).not.toBeNull();
    expect(pythonGenerator.blockToCode(callBlock)).toEqual([
      'proc_mlkem_encaps(None, None)',
      PythonOrder.FUNCTION_CALL,
    ]);
    expect(javascriptGenerator.blockToCode(callBlock)).toEqual([
      'proc_mlkem_encaps(undefined, undefined)',
      JavaScriptOrder.FUNCTION_CALL,
    ]);
  });
});
