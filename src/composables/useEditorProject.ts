import { ref, onMounted, onUnmounted, watch, type Ref } from 'vue';
import {
  onBeforeRouteLeave,
  onBeforeRouteUpdate,
  useRoute,
  useRouter,
} from 'vue-router';
import {
  getProject,
  saveProject,
  type ProjectRecord,
} from '@/composables/useProjectDB';
import { ui } from '@/composables/locale';
interface EditorProjectDeps<TLanguage extends string> {
  getWorkspaceXml: () => string;
  language: Ref<TLanguage>;
  loadWorkspaceXml: (_xml: string) => boolean;
  onWorkspaceChange: (_handler: () => void) => () => void;
  clearWorkspace: () => void;
}

export function useEditorProject<TLanguage extends string>(
  deps: EditorProjectDeps<TLanguage>,
) {
  const route = useRoute();
  const router = useRouter();

  const projectId = ref<number | null>(null);
  const projectName = ref('');
  const autoSaveEnabled = ref(false);
  const saving = ref(false);
  const saveStatus = ref<'saved' | 'unsaved' | 'error'>('saved');
  const lastSaveTime = ref('');
  const navigationPending = ref(false);

  let autoSaveTimer: ReturnType<typeof setTimeout> | null = null;
  let cleanupListeners: (() => void) | null = null;
  let cleanupAfterEach: (() => void) | null = null;
  let cleanupOnError: (() => void) | null = null;
  let createdAt: string | null = null;
  let workspaceChangeVersion = 0;
  let lastSavedChangeVersion = 0;
  let projectNameChangeVersion = 0;
  let lastSavedNameChangeVersion = 0;
  let languageChangeVersion = 0;
  let lastSavedLanguageChangeVersion = 0;
  let workspaceReady = false;
  let applyingProjectWorkspace = false;
  let loadingProject = false;
  let loadVersion = 0;
  let navigationTarget: string | null = null;

  function updateSaveStatus(status: 'saved' | 'unsaved' | 'error') {
    saveStatus.value = status;
    if (status === 'saved') {
      const now = new Date();
      const pad = (n: number) => String(n).padStart(2, '0');
      lastSaveTime.value = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
    }
  }

  function hasUnsavedChanges(): boolean {
    return (
      workspaceChangeVersion !== lastSavedChangeVersion ||
      projectNameChangeVersion !== lastSavedNameChangeVersion ||
      languageChangeVersion !== lastSavedLanguageChangeVersion
    );
  }

  function confirmBeforeUnload(event: BeforeUnloadEvent) {
    if (!hasUnsavedChanges()) return;
    event.preventDefault();
    event.returnValue = '';
  }

  watch(
    projectName,
    () => {
      if (applyingProjectWorkspace) return;
      projectNameChangeVersion += 1;
      updateSaveStatus('unsaved');
      scheduleAutoSave();
    },
    { flush: 'sync' },
  );

  watch(
    deps.language,
    () => {
      if (applyingProjectWorkspace) return;
      languageChangeVersion += 1;
      updateSaveStatus('unsaved');
      scheduleAutoSave();
    },
    { flush: 'sync' },
  );

  async function doSave(updateRoute = true): Promise<boolean> {
    if (saving.value || loadingProject) return false;
    if (autoSaveTimer) clearTimeout(autoSaveTimer);
    autoSaveTimer = null;
    const existingProjectId = projectId.value;
    const saveLoadVersion = loadVersion;
    const saveVersion = workspaceChangeVersion;
    const saveNameVersion = projectNameChangeVersion;
    const saveLanguageVersion = languageChangeVersion;
    try {
      saving.value = true;
      const now = new Date().toISOString();
      const workspace = deps.getWorkspaceXml();
      const record: ProjectRecord = {
        ...(existingProjectId === null ? {} : { id: existingProjectId }),
        name: projectName.value || ui('unnamed'),
        workspace,
        format: 'xml',
        language: deps.language.value,
        createdAt: createdAt || now,
        updatedAt: now,
      };
      const createdId = await saveProject(record);
      if (projectId.value !== existingProjectId || loadVersion !== saveLoadVersion) {
        if (autoSaveEnabled.value && hasUnsavedChanges()) scheduleAutoSave();
        return false;
      }
      if (existingProjectId === null) {
        projectId.value = createdId;
        if (updateRoute) void router.replace(`/editor/${createdId}`);
      }
      createdAt = record.createdAt;
      lastSavedChangeVersion = saveVersion;
      lastSavedNameChangeVersion = saveNameVersion;
      lastSavedLanguageChangeVersion = saveLanguageVersion;
      if (!hasUnsavedChanges()) {
        updateSaveStatus('saved');
        return true;
      } else {
        updateSaveStatus('unsaved');
        scheduleAutoSave();
        return false;
      }
    } catch {
      if (projectId.value === existingProjectId && loadVersion === saveLoadVersion) {
        updateSaveStatus('error');
      } else if (autoSaveEnabled.value && hasUnsavedChanges()) {
        scheduleAutoSave();
      }
      return false;
    } finally {
      saving.value = false;
    }
  }

  function scheduleAutoSave() {
    if (!autoSaveEnabled.value) return;
    if (autoSaveTimer) clearTimeout(autoSaveTimer);
    autoSaveTimer = setTimeout(() => {
      autoSaveTimer = null;
      updateSaveStatus('unsaved');
      doSave();
    }, 1500);
  }

  function handleWorkspaceChange() {
    if (applyingProjectWorkspace) return;
    workspaceChangeVersion += 1;
    updateSaveStatus('unsaved');
    scheduleAutoSave();
  }

  async function saveBeforeNavigation(target?: string): Promise<boolean> {
    if (navigationPending.value) return target !== undefined && target === navigationTarget;
    if (saving.value || loadingProject) return false;
    const hasChanges = hasUnsavedChanges();
    if (hasChanges && !window.confirm(ui('saveBeforeLeave'))) return false;
    navigationPending.value = true;
    navigationTarget = target ?? null;
    if (!hasChanges) return true;
    const saved = await doSave(false);
    if (saved && !hasUnsavedChanges()) return true;
    navigationPending.value = false;
    navigationTarget = null;
    return false;
  }

  async function handleNewWorkspace() {
    if (!(await saveBeforeNavigation())) return;
    try {
      // Create a fresh project
      if (autoSaveTimer) clearTimeout(autoSaveTimer);
      const now = new Date().toISOString();
      const newRecord: ProjectRecord = {
        name: ui('unnamed'),
        workspace: '',
        format: 'xml',
        language: deps.language.value,
        createdAt: now,
        updatedAt: now,
      };
      const newId = await saveProject(newRecord);
      navigationTarget = `/editor/${newId}`;
      await router.push(`/editor/${newId}`);
      if (Number(route.params.id) !== newId) {
        navigationPending.value = false;
        navigationTarget = null;
      }
    } catch {
      navigationPending.value = false;
      navigationTarget = null;
      updateSaveStatus('error');
    }
  }

  async function loadProject(
    routeId = route.params.id,
    changeVersionAtStart = workspaceChangeVersion,
    nameVersionAtStart = projectNameChangeVersion,
    languageVersionAtStart = languageChangeVersion,
  ) {
    const version = ++loadVersion;
    loadingProject = true;
    projectId.value = null;
    const id = Number(routeId);
    if (!id || isNaN(id)) {
      createdAt = null;
      updateSaveStatus('error');
      loadingProject = false;
      navigationPending.value = false;
      navigationTarget = null;
      return;
    }
    try {
      const record = await getProject(id);
      if (version !== loadVersion) return;
      if (!record) throw new Error(`Project ${id} was not found`);
      const nameChangedWhileLoading = projectNameChangeVersion !== nameVersionAtStart;
      const languageChangedWhileLoading = languageChangeVersion !== languageVersionAtStart;
      if (workspaceChangeVersion !== changeVersionAtStart) {
        if (autoSaveTimer) clearTimeout(autoSaveTimer);
        autoSaveTimer = null;
        createdAt = record.createdAt;
        if (!nameChangedWhileLoading) {
          applyingProjectWorkspace = true;
          try {
            projectName.value =
              record.name && record.name !== '未命名' ? record.name : ui('unnamed');
            lastSavedNameChangeVersion = projectNameChangeVersion;
          } finally {
            applyingProjectWorkspace = false;
          }
        }
        if (!languageChangedWhileLoading && record.language) {
          applyingProjectWorkspace = true;
          try {
            deps.language.value = record.language as TLanguage;
            lastSavedLanguageChangeVersion = languageChangeVersion;
          } finally {
            applyingProjectWorkspace = false;
          }
        }
        projectId.value = id;
        updateSaveStatus('unsaved');
        if (autoSaveEnabled.value) scheduleAutoSave();
        return;
      }
      if (nameChangedWhileLoading || languageChangedWhileLoading) {
        if (autoSaveTimer) clearTimeout(autoSaveTimer);
        autoSaveTimer = null;
      }
      applyingProjectWorkspace = true;
      try {
        if (record.workspace && !deps.loadWorkspaceXml(record.workspace)) {
          throw new Error(`Project ${id} workspace could not be loaded`);
        }
        if (!record.workspace) deps.clearWorkspace();
        if (!nameChangedWhileLoading) {
          projectName.value =
            record.name && record.name !== '未命名' ? record.name : ui('unnamed');
          lastSavedNameChangeVersion = projectNameChangeVersion;
        }
        if (!languageChangedWhileLoading && record.language) {
          deps.language.value = record.language as TLanguage;
          lastSavedLanguageChangeVersion = languageChangeVersion;
        }
      } finally {
        applyingProjectWorkspace = false;
      }
      createdAt = record.createdAt;
      projectId.value = id;
      lastSavedChangeVersion = workspaceChangeVersion;
      updateSaveStatus(hasUnsavedChanges() ? 'unsaved' : 'saved');
      if (hasUnsavedChanges() && autoSaveEnabled.value) scheduleAutoSave();
    } catch {
      if (version !== loadVersion) return;
      createdAt = null;
      if (projectNameChangeVersion === nameVersionAtStart) {
        applyingProjectWorkspace = true;
        try {
          projectName.value = ui('unnamed');
        } finally {
          applyingProjectWorkspace = false;
        }
      }
      updateSaveStatus('error');
    } finally {
      if (version === loadVersion) {
        loadingProject = false;
        navigationPending.value = false;
        navigationTarget = null;
        if (hasUnsavedChanges() && autoSaveEnabled.value) scheduleAutoSave();
      }
    }
  }

  watch(
    () => route.params.id,
    (id) => {
      if (workspaceReady && Number(id) !== projectId.value) void loadProject(id);
    },
  );

  onBeforeRouteLeave((to) => saveBeforeNavigation(to.fullPath));
  onBeforeRouteUpdate((to, from) =>
    to.params.id === from.params.id ? true : saveBeforeNavigation(to.fullPath),
  );
  cleanupAfterEach = router.afterEach((to, _from, failure) => {
    if (
      failure &&
      !loadingProject &&
      navigationPending.value &&
      to.fullPath === navigationTarget
    ) {
      navigationPending.value = false;
      navigationTarget = null;
    }
  });
  cleanupOnError = router.onError((_error, to) => {
    if (navigationPending.value && to.fullPath === navigationTarget) {
      navigationPending.value = false;
      navigationTarget = null;
    }
  });

  onMounted(async () => {
    window.addEventListener('beforeunload', confirmBeforeUnload);
    cleanupListeners = deps.onWorkspaceChange(handleWorkspaceChange);
    const initialChangeVersion = workspaceChangeVersion;
    const initialNameVersion = projectNameChangeVersion;
    const initialLanguageVersion = languageChangeVersion;
    // Delay load slightly to allow BlocklyEditor to finish initializing
    await new Promise((r) => setTimeout(r, 100));
    workspaceReady = true;
    await loadProject(
      route.params.id,
      initialChangeVersion,
      initialNameVersion,
      initialLanguageVersion,
    );
  });

  onUnmounted(() => {
    loadVersion += 1;
    if (autoSaveTimer) clearTimeout(autoSaveTimer);
    if (cleanupListeners) cleanupListeners();
    if (cleanupAfterEach) cleanupAfterEach();
    if (cleanupOnError) cleanupOnError();
    window.removeEventListener('beforeunload', confirmBeforeUnload);
  });

  return {
    projectId,
    projectName,
    autoSaveEnabled,
    saving,
    saveStatus,
    lastSaveTime,
    navigationPending,
    doSave,
    scheduleAutoSave,
    handleWorkspaceChange,
    handleNewWorkspace,
  };
}
