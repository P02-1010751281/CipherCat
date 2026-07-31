import * as Blockly from 'blockly/core';

import { createToolboxConfig } from '@/utils/toolbox-config';
import { WORKSPACE_OPTIONS } from '@/constants/workspace-config';

import { createBlocklyTheme, type ThemeOptions } from './theme';
import { registerSboxCategoryCallbacks } from '@/blocks/sbox/category';
import { registerProcedureCallbacks } from '@/blocks/procedure/category';
import { toolboxTemplates } from '@/blocks/procedure/toolbox-state';

export interface WorkspaceState {
  workspace: Blockly.WorkspaceSvg | null;
  isReady: boolean;
}

/** 注册 Crypto Templates 动态类目：flyout 内容来自 Manager 添加的模板列表。 */
function registerCryptoTemplateCallbacks(workspace: Blockly.WorkspaceSvg): void {
  workspace.registerToolboxCategoryCallback('CRYPTO_TEMPLATES', () => {
    return toolboxTemplates.value.map((type) => ({
      kind: 'block' as const,
      type,
    }));
  });
}

export function createWorkspace(
  container: HTMLElement | null,
): WorkspaceState | null {
  if (!container) {
    console.error('容器元素不存在');
    return null;
  }

  try {
    const isDark = document.documentElement.classList.contains('dark');
    const theme = createBlocklyTheme(isDark);

    const workspace = Blockly.inject(container, {
      toolbox: createToolboxConfig() as Blockly.utils.toolbox.ToolboxDefinition,
      theme,
      ...WORKSPACE_OPTIONS,
    });

    registerSboxCategoryCallbacks(workspace);
    registerProcedureCallbacks(workspace);
    registerCryptoTemplateCallbacks(workspace);

    return {
      workspace,
      isReady: true,
    };
  } catch (error) {
    console.error('初始化工作空间失败:', error);
    return null;
  }
}

export function setWorkspaceTheme(
  workspace: Blockly.WorkspaceSvg | null,
  isDark: boolean,
  customOptions?: Partial<ThemeOptions>,
): void {
  if (!workspace) return;
  workspace.setTheme(createBlocklyTheme(isDark, customOptions));
}

export function resizeWorkspace(workspace: Blockly.WorkspaceSvg | null): void {
  if (!workspace) {
    console.error('工作空间不存在');
    return;
  }
  Blockly.svgResize(workspace);
}

export function disposeWorkspace(workspace: Blockly.WorkspaceSvg | null): void {
  if (!workspace) {
    console.error('工作空间不存在');
    return;
  }
  workspace.dispose();
}
