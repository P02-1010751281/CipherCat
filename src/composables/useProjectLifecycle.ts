import type { Ref } from 'vue';
import { getProject } from '@/api/blockly/project';
import { ElMessage } from 'element-plus';
import type { useProjectIdentity } from './useProjectIdentity';
import type { useEditorState } from './useEditorState';

type Identity = ReturnType<typeof useProjectIdentity>;
type State = ReturnType<typeof useEditorState>;

interface LifecycleDeps {
  editorRef: Ref<any>;
  importInputRef: Ref<HTMLInputElement | null>;
  identity: Identity;
  state: State;
}

export function useProjectLifecycle(deps: LifecycleDeps) {
  const { editorRef, importInputRef, identity, state } = deps;
  const { lang, algoType, primitiveName, projectName } = state;
  const {
    projectId,
    exportFormat,
    importFormat,
    ensureProjectId,
    refreshDirtyState,
    markProjectDirty,
    shouldIgnoreWorkspaceEvent,
    setIgnoreWindow,
  } = identity;

  /** 加载项目 —— 启动时调用 */
  async function loadProject() {
    try {
      const pid = ensureProjectId();
      refreshDirtyState(pid);
      const res: any = await getProject(pid);
      if (res && res.code === 200 && res.data) {
        const meta = res.data.metadata || {};
        if (meta.language) lang.value = meta.language;
        if (meta.workspace) {
          const fmt =
            meta.exportFormat ||
            (meta.workspace.trim().startsWith('<') ? 'xml' : 'json');
          editorRef.value?.loadWorkspace(meta.workspace, fmt);
        } else if (meta.json) {
          editorRef.value?.loadWorkspace(meta.json, 'json');
        } else if (meta.xml) {
          editorRef.value?.loadWorkspace(meta.xml, 'xml');
        }
        if (meta.name) {
          projectName.value = meta.name;
          localStorage.setItem('blockly-project-name', meta.name);
        }
        if (meta.algorithm_type) algoType.value = meta.algorithm_type;
      }
    } catch (err) {
      console.warn('项目加载失败，将使用本地缓存:', err);
    } finally {
      setIgnoreWindow(1200);
    }
  }

  /** 重置项目 ID（导入或新建后） */
  function resetProjectId(reason = 'import', newName = '') {
    projectId.value = identity.generateUuid();
    localStorage.setItem('blockly-project-id', projectId.value);
    const nameVal = reason === 'import' ? newName || '导入项目' : '未命名';
    projectName.value = nameVal;
    localStorage.setItem('blockly-project-name', projectName.value);
    algoType.value = 'unknown';
    markProjectDirty(false, projectId.value);
  }

  /** 工作区变化回调 */
  function onWorkspaceChange() {
    if (shouldIgnoreWorkspaceEvent()) return;
    markProjectDirty(true);
  }

  /** 清空工作区 */
  function onClear() {
    editorRef.value?.clearWorkspace();
  }

  /** 导出工作区 */
  function onExport(): void {
    if (!editorRef.value) return;
    const ext = exportFormat.value === 'xml' ? '.xml' : '.json';
    const baseName = (projectName.value || '未命名').replace(
      /[\\/:*?"<>|]/g,
      '_',
    );
    editorRef.value.downloadWorkspace(`${baseName}_workspace${ext}`);
  }

  /** 触发导入文件选择 */
  function triggerImport() {
    importInputRef.value?.click();
  }

  /** 处理导入文件 */
  async function onImportFile(e: Event): Promise<void> {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file || !editorRef.value) return;
    try {
      const success = await editorRef.value.handleFileUpload(file);
      if (success) {
        const baseName =
          String(file.name || '导入项目').replace(/\.[^.]+$/, '') || '导入项目';
        resetProjectId('import', baseName);
      } else {
        ElMessage.error('导入失败，请检查文件格式');
      }
    } catch {
      ElMessage.error('导入失败，文件读取异常');
    } finally {
      target.value = '';
    }
  }

  return {
    loadProject,
    resetProjectId,
    onWorkspaceChange,
    onClear,
    onExport,
    onImportFile,
    triggerImport,
  };
}
