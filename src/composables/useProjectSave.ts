import type { Ref } from 'vue';
import router from '@/router';
import * as codeGeneratorUtils from '@/utils/generator';
import {
  inferAlgorithmType,
  collectPrimitiveCandidates,
} from '@/utils/generator';
import { injectPrimitives } from '@/generators/python';
import { saveProject } from '@/api/blockly/project';
import { ElMessage } from 'element-plus';
import type { useProjectIdentity } from './useProjectIdentity';
import type { useEditorState } from './useEditorState';

type Identity = ReturnType<typeof useProjectIdentity>;
type State = ReturnType<typeof useEditorState>;

interface SaveDeps {
  editorRef: Ref<any>;
  codePreviewerRef: Ref<any>;
  identity: Identity;
  state: State;
}

export function useProjectSave(deps: SaveDeps) {
  const { editorRef, codePreviewerRef, identity, state } = deps;
  const {
    lang,
    algoType,
    primitiveName,
    projectName,
    showNameDialog,
    nameInput,
  } = state;
  const {
    projectId,
    exportFormat,
    autoSaveEnabled,
    saving,
    ensureProjectId,
    markProjectDirty,
    scheduleAction,
    clearAutoTimer,
  } = identity;

  function currentWorkspace() {
    return editorRef.value?.workspaceRef || null;
  }

  /** 推断算法类型 */
  function runAutoAlgorithmTypeInference() {
    const ws = currentWorkspace();
    const inferred = inferAlgorithmType(ws);
    if (algoType.value === 'unknown') algoType.value = inferred;
    const candidates = collectPrimitiveCandidates(ws, algoType.value);
    if (!primitiveName.value && candidates.length > 0)
      primitiveName.value = candidates[0];
  }

  /** 编排自动保存 */
  function scheduleAutoSave() {
    if (!autoSaveEnabled.value) return;
    clearAutoTimer();
    scheduleAction(() => {
      runAutoAlgorithmTypeInference();
      doSave(true);
    }, 1500);
  }

  /** 手动保存 */
  async function onManualSave() {
    clearAutoTimer(); // 取消待处理的自动保存，防止重复弹出"已保存"
    if (!projectName.value) state.onProjectNameBlur();
    if (!projectName.value) projectName.value = '未命名';
    return doSave(false);
  }

  /** 保存并测试 */
  async function onSaveAndTest() {
    clearAutoTimer(); // 取消待处理的自动保存
    if (!projectName.value) state.onProjectNameBlur();
    if (!projectName.value) projectName.value = '未命名';
    const ok = await doSave(false);
    if (!ok) return;
    const pid = ensureProjectId();
    router.push({
      path: '/resources/index',
      query: { startTestProjectId: pid },
    });
  }

  /** 命名对话框确认后保存 */
  async function confirmNameAndSave() {
    const name = (nameInput.value || '').trim() || '未命名';
    projectName.value = name;
    localStorage.setItem('blockly-project-name', name);
    showNameDialog.value = false;
    return doSave(false);
  }

  /** 核心保存逻辑 */
  async function doSave(isAuto: boolean): Promise<boolean> {
    if (saving.value || !editorRef.value || !currentWorkspace()) return false;
    try {
      saving.value = true;
      const pid = ensureProjectId();

      let pyCode =
        codeGeneratorUtils.generateCode(currentWorkspace(), 'python') || '';
      pyCode = injectPrimitives(pyCode, algoType.value);
      const jsCode =
        codeGeneratorUtils.generateCode(currentWorkspace(), 'javascript') || '';
      const workspaceText =
        editorRef.value.exportWorkspace?.(exportFormat.value) || '';
      const xmlText =
        exportFormat.value === 'xml'
          ? workspaceText
          : editorRef.value.exportWorkspace?.('xml') || '';

      const payload = {
        projectId: pid,
        pythonCode: pyCode,
        jsCode: jsCode,
        metadata: {
          name: projectName.value || '未命名',
          language: lang.value,
          workspace: workspaceText,
          xml: xmlText,
          exportFormat: exportFormat.value,
          savedAt: new Date().toISOString(),
          algorithm_type: algoType.value,
          primitive: primitiveName.value,
        },
      };

      const res: any = await saveProject(payload);
      if (res && res.code === 200) {
        ElMessage.success('已保存');
        markProjectDirty(false, pid);
        return true;
      }

      if (!isAuto) {
        ElMessage.error(res?.msg || '保存失败，请检查网络');
      }
      return false;
    } catch (err: any) {
      const code = err && (err.code ?? err.status);
      if (!isAuto) {
        if (code === 401 || code === 403) ElMessage.error('无权限，请重新登录');
        else ElMessage.error('保存失败，请检查网络');
      }
      return false;
    } finally {
      saving.value = false;
    }
  }

  return {
    runAutoAlgorithmTypeInference,
    scheduleAutoSave,
    onManualSave,
    onSaveAndTest,
    confirmNameAndSave,
    doSave,
  };
}
