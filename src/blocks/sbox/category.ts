import * as Blockly from 'blockly/core';
import { SBOX_BLOCK_TYPES } from './sbox';
import { SBOX_VAR_BLOCK_TYPES } from './sbox_variables';

const BUTTON_KEY = 'SBOX_CREATE_VARIABLE';
const CATEGORY_KEY = 'SBOX';

export function getSboxCategoryKey(): string {
  return CATEGORY_KEY;
}

export function createSboxFlyoutCallback(
  _workspace: Blockly.WorkspaceSvg,
): Blockly.utils.toolbox.FlyoutItemInfoArray {
  const msg = Blockly.Msg as Record<string, string>;
  const items: Blockly.utils.toolbox.FlyoutItemInfoArray = [];

  for (const type of SBOX_VAR_BLOCK_TYPES) {
    items.push({ kind: 'block', type });
  }
  items.push({ kind: 'sep' } as Blockly.utils.toolbox.FlyoutItemInfo);

  for (const type of SBOX_BLOCK_TYPES) {
    items.push({ kind: 'block', type });
  }
  items.push({ kind: 'sep' } as Blockly.utils.toolbox.FlyoutItemInfo);

  items.push({
    kind: 'button',
    text: msg.CRYPTO_SBOX_CREATE_VARIABLE || '创建SBox变量',
    callbackkey: BUTTON_KEY,
  } as Blockly.utils.toolbox.ButtonInfo);

  return items;
}

export function registerSboxCategoryCallbacks(
  workspace: Blockly.WorkspaceSvg,
): void {
  if ((workspace as any).__sboxCategoryRegistered) return;

  workspace.registerToolboxCategoryCallback(
    CATEGORY_KEY,
    createSboxFlyoutCallback,
  );

  workspace.registerButtonCallback(
    BUTTON_KEY,
    (button: Blockly.FlyoutButton) => {
      Blockly.Variables.createVariableButtonHandler(
        button.getTargetWorkspace() as Blockly.WorkspaceSvg,
        undefined,
        'SBox',
      );
    },
  );

  (workspace as any).__sboxCategoryRegistered = true;
}
