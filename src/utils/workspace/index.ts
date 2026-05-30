import * as Blockly from 'blockly/core';

import * as workspaceUtils from './core';
import * as serialization from './serialization';
import { errorHandler } from '@/utils/errorHandler';
import { createToolboxConfig } from '@/utils/toolbox-config';

export interface WorkspaceReturn {
  getWorkspace: () => Blockly.WorkspaceSvg | null;
  getIsReady: () => boolean;
  initWorkspace: (container: HTMLElement) => Blockly.WorkspaceSvg | null;
  loadWorkspace: (workspaceText: string, type: 'xml' | 'json') => boolean;
  exportWorkspace: (type: 'xml' | 'json') => string;
  downloadWorkspace: (filename?: string) => void;
  handleFileUpload: (file: File) => Promise<boolean>;
  clearWorkspace: () => void;
  zoomInWorkspace: () => void;
  zoomOutWorkspace: () => void;
  resetZoomWorkspace: () => void;
  resizeWorkspace: () => void;
  updateToolbox: () => void;
    refreshBlocks: () => void;
  disposeWorkspace: () => void;
  setupResizeListener: () => () => void;
  setTheme: (isDark: boolean) => void;
}

export function Workspace(): WorkspaceReturn {
  let workspace: Blockly.WorkspaceSvg | null = null;
  let isReady = false;

  const initWorkspace = (
    container: HTMLElement,
  ): Blockly.WorkspaceSvg | null => {
    try {
      const result = workspaceUtils.createWorkspace(container);
      if (result) {
        workspace = result.workspace;
        isReady = result.isReady;
      }
      return workspace;
    } catch (error) {
      errorHandler.handleWorkspaceError('初始化', error);
      return null;
    }
  };

  const loadWorkspace = (
    workspaceText: string,
    type: 'xml' | 'json',
  ): boolean => {
    try {
      return type === 'xml'
        ? serialization.loadXml(workspace, workspaceText)
        : serialization.loadJson(workspace, workspaceText);
    } catch (error) {
      errorHandler.handleWorkspaceError('加载', error);
      return false;
    }
  };

  const exportWorkspace = (type: 'xml' | 'json'): string => {
    try {
      return type === 'xml'
        ? serialization.exportXml(workspace)
        : serialization.exportJson(workspace);
    } catch (error) {
      errorHandler.handleWorkspaceError('导出', error);
      return '';
    }
  };

  const downloadWorkspace = (filename?: string): void => {
    if (!filename) {
      filename = 'blockly_workspace.json';
    }
    try {
      return filename.endsWith('.xml')
        ? serialization.downloadContent(
            serialization.exportXml(workspace),
            filename,
          )
        : serialization.downloadContent(
            serialization.exportJson(workspace),
            filename,
          );
    } catch (error) {
      errorHandler.handleFileError('下载工作空间', error);
    }
  };

  const handleFileUpload = async (file: File): Promise<boolean> => {
    const fileName = file.name.toLowerCase();
    const fileType = file.type.toLowerCase();

    try {
      if (
        fileName.endsWith('.xml') ||
        serialization.xmlTypes.some((type) => fileType.includes(type))
      ) {
        return await serialization.handleFileUpload(
          file,
          workspace,
          serialization.loadXml,
        );
      }
      if (
        fileName.endsWith('.json') ||
        serialization.jsonTypes.some((type) => fileType.includes(type))
      ) {
        return await serialization.handleFileUpload(
          file,
          workspace,
          serialization.loadJson,
        );
      }

      errorHandler.handleError(
        'FILE_ERROR',
        `不支持的文件类型: ${file.type} ${file.name}`,
      );
      return false;
    } catch (error) {
      errorHandler.handleFileError('文件上传', error);
      return false;
    }
  };

  const clearWorkspace = (): void => {
    try {
      if (workspace === null) {
        return;
      }
      workspace.clear();
    } catch (error) {
      errorHandler.handleWorkspaceError('清除', error);
    }
  };

  const zoomInWorkspace = (): void => {
    if (workspace) workspace.setScale(workspace.getScale() * 1.1);
  };

  const zoomOutWorkspace = (): void => {
    if (workspace) workspace.setScale(workspace.getScale() / 1.1);
  };

  const resetZoomWorkspace = (): void => {
    if (workspace) workspace.setScale(1);
  };

  const resizeWorkspace = (): void => {
    workspaceUtils.resizeWorkspace(workspace);
  };

  const updateToolbox = (): void => {
    if (workspace) {
      workspace.updateToolbox(
        createToolboxConfig() as Blockly.utils.toolbox.ToolboxDefinition,
      );
    }
  };

  const refreshBlocks = (): void => {
    if (!workspace) return;
    try {
      const xml = serialization.exportXml(workspace);
      if (!xml) return;
      workspace.clear();
      serialization.loadXml(workspace, xml);
    } catch (error) {
      errorHandler.handleWorkspaceError('刷新区块', error);
    }
  };

  const disposeWorkspace = (): void => {
    try {
      workspaceUtils.disposeWorkspace(workspace);
      workspace = null;
      isReady = false;
    } catch (error) {
      errorHandler.handleWorkspaceError('销毁', error);
    }
  };

  const setupResizeListener = (): (() => void) => {
    const resize = () => workspaceUtils.resizeWorkspace(workspace);
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  };

  const setTheme = (isDark: boolean): void => {
    workspaceUtils.setWorkspaceTheme(workspace, isDark);
  };

  const getWorkspace = (): Blockly.WorkspaceSvg | null => workspace;
  const getIsReady = (): boolean => isReady;

  return {
    getWorkspace,
    getIsReady,
    initWorkspace,
    loadWorkspace,
    exportWorkspace,
    downloadWorkspace,
    handleFileUpload,
    clearWorkspace,
    zoomInWorkspace,
    zoomOutWorkspace,
    resetZoomWorkspace,
    resizeWorkspace,
    updateToolbox,
    refreshBlocks,
    disposeWorkspace,
    setupResizeListener,
    setTheme,
  };
}
