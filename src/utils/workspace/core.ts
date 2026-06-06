import * as Blockly from 'blockly/core';

import { createToolboxConfig } from '@/utils/toolbox-config';
import { WORKSPACE_OPTIONS } from '@/constants/workspace-config';

import { createBlocklyTheme, type ThemeOptions } from './theme';
import { registerSboxCategoryCallbacks } from '@/blocks/sbox/category';

export interface WorkspaceState {
  workspace: Blockly.WorkspaceSvg | null;
  isReady: boolean;
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
