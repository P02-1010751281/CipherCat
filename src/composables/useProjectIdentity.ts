import { ref } from 'vue';

export function useProjectIdentity() {
  const projectId = ref(localStorage.getItem('blockly-project-id') || '');
  const exportFormat = ref<'json' | 'xml'>('json');
  const importFormat = ref<'auto' | 'json' | 'xml'>('auto');
  const autoSaveEnabled = ref(true);
  const saving = ref(false);
  const hasUnsavedChanges = ref(false);

  let ignoreDirtyUntil = 0;
  let autoTimer: ReturnType<typeof setTimeout> | null = null;

  function generateUuid() {
    return (
      crypto.randomUUID?.() ||
      `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
    );
  }

  function dirtyKey(pid: string) {
    return `blockly-dirty-${pid}`;
  }

  function ensureProjectId(): string {
    if (!projectId.value) {
      projectId.value = generateUuid();
      localStorage.setItem('blockly-project-id', projectId.value);
    }
    return projectId.value;
  }

  function markProjectDirty(isDirty: boolean, pid = '') {
    const id = pid || projectId.value || ensureProjectId();
    if (!id) return;
    localStorage.setItem(dirtyKey(id), isDirty ? '1' : '0');
    if (id === projectId.value) hasUnsavedChanges.value = !!isDirty;
  }

  function refreshDirtyState(pid = '') {
    const id = pid || projectId.value || ensureProjectId();
    if (!id) return;
    hasUnsavedChanges.value = localStorage.getItem(dirtyKey(id)) === '1';
  }

  function shouldIgnoreWorkspaceEvent() {
    return Date.now() < ignoreDirtyUntil;
  }

  function setIgnoreWindow(ms: number) {
    ignoreDirtyUntil = Date.now() + ms;
  }

  function scheduleAction(fn: () => void, delayMs: number) {
    if (autoTimer) clearTimeout(autoTimer);
    autoTimer = setTimeout(fn, delayMs);
  }

  function clearAutoTimer() {
    if (autoTimer) {
      clearTimeout(autoTimer);
      autoTimer = null;
    }
  }

  return {
    projectId,
    exportFormat,
    importFormat,
    autoSaveEnabled,
    saving,
    hasUnsavedChanges,
    // methods
    ensureProjectId,
    markProjectDirty,
    refreshDirtyState,
    shouldIgnoreWorkspaceEvent,
    setIgnoreWindow,
    scheduleAction,
    clearAutoTimer,
    generateUuid,
  };
}
