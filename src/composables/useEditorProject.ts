import { ref, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  getProject,
  saveProject,
  type ProjectRecord,
} from '@/composables/useProjectDB';
import { ui } from '@/composables/locale';
interface EditorProjectDeps {
  getWorkspaceXml: () => string;
  getLanguage: () => string;
  loadWorkspaceXml: (_xml: string) => boolean;
  onWorkspaceChange: (_handler: () => void) => () => void;
  clearWorkspace: () => void;
}

export function useEditorProject(deps: EditorProjectDeps) {
  const route = useRoute();
  const router = useRouter();

  const projectId = ref<number | null>(null);
  const projectName = ref('');
  const autoSaveEnabled = ref(false);
  const saving = ref(false);
  const saveStatus = ref<'saved' | 'unsaved' | 'error'>('saved');
  const lastSaveTime = ref('');

  let autoSaveTimer: ReturnType<typeof setTimeout> | null = null;
  let cleanupListeners: (() => void) | null = null;

  function updateSaveStatus(status: 'saved' | 'unsaved' | 'error') {
    saveStatus.value = status;
    if (status === 'saved') {
      const now = new Date();
      const pad = (n: number) => String(n).padStart(2, '0');
      lastSaveTime.value = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
    }
  }

  async function doSave(): Promise<boolean> {
    if (saving.value || projectId.value === null) return false;
    try {
      saving.value = true;
      const now = new Date().toISOString();
      const workspace = deps.getWorkspaceXml();
      const record: ProjectRecord = {
        id: projectId.value,
        name: projectName.value || ui('unnamed'),
        workspace,
        format: 'xml',
        language: deps.getLanguage(),
        createdAt: now,
        updatedAt: now,
      };
      await saveProject(record);
      updateSaveStatus('saved');
      return true;
    } catch {
      updateSaveStatus('error');
      return false;
    } finally {
      saving.value = false;
    }
  }

  function scheduleAutoSave() {
    if (!autoSaveEnabled.value) return;
    if (autoSaveTimer) clearTimeout(autoSaveTimer);
    autoSaveTimer = setTimeout(() => {
      updateSaveStatus('unsaved');
      doSave();
    }, 1500);
  }

  function handleWorkspaceChange() {
    updateSaveStatus('unsaved');
    scheduleAutoSave();
  }

  async function handleNewWorkspace() {
    try {
      // Create a fresh project
      if (autoSaveTimer) clearTimeout(autoSaveTimer);
      const now = new Date().toISOString();
      const newRecord: ProjectRecord = {
        name: ui('unnamed'),
        workspace: '',
        format: 'xml',
        language: deps.getLanguage(),
        createdAt: now,
        updatedAt: now,
      };
      const newId = await saveProject(newRecord);
      deps.clearWorkspace();
      projectId.value = null;
      projectName.value = '';
      updateSaveStatus('saved');
      router.push(`/editor/${newId}`);
    } catch {
      // ignore
    }
  }

  async function loadProject() {
    const id = Number(route.params.id);
    if (!id || isNaN(id)) return;
    projectId.value = id;
    try {
      const record = await getProject(id);
      if (record) {
        projectName.value =
          record.name && record.name !== '未命名' ? record.name : ui('unnamed');
        if (record.workspace) {
          deps.loadWorkspaceXml(record.workspace);
        }
      } else {
        projectName.value = ui('unnamed');
      }
      updateSaveStatus('saved');
    } catch {
      projectName.value = ui('unnamed');
    }
  }

  onMounted(async () => {
    // Delay load slightly to allow BlocklyEditor to finish initializing
    await new Promise((r) => setTimeout(r, 100));
    await loadProject();
    cleanupListeners = deps.onWorkspaceChange(handleWorkspaceChange);
  });

  onUnmounted(() => {
    if (autoSaveTimer) clearTimeout(autoSaveTimer);
    if (cleanupListeners) cleanupListeners();
  });

  return {
    projectId,
    projectName,
    autoSaveEnabled,
    saving,
    saveStatus,
    lastSaveTime,
    doSave,
    scheduleAutoSave,
    handleWorkspaceChange,
    handleNewWorkspace,
  };
}
