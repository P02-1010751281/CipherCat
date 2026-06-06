<template>
  <div ref="editorViewRef" class="editor-view" @click="closeMenus">
    <div class="view-left" :style="editorStyle">
      <div class="toolbar">
        <div class="toolbar-section">
          <button
            class="toolbar-btn icon-only"
            @click="goBack"
            :title="ui('back')"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <input
            v-model="projectName"
            @blur="onNameBlur"
            class="name-input"
            :placeholder="ui('projectName')"
          />
          <div class="toolbar-divider" />
          <button
            class="toolbar-btn"
            :disabled="saving"
            @click="onManualSave"
            :title="ui('save')"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"
              />
              <polyline points="17 21 17 13 7 13 7 21" />
              <polyline points="7 3 7 8 15 8" />
            </svg>
            <span>{{ ui("save") }}</span>
          </button>
          <label class="auto-toggle">
            <input type="checkbox" v-model="autoSaveEnabled" />
            <span>{{ ui("autoSave") }}</span>
          </label>
          <span
            v-if="saveStatus === 'saved' && lastSaveTime"
            class="save-status ok"
            >{{ ui("saved") }} {{ lastSaveTime }}</span
          >
          <span v-if="saveStatus === 'unsaved'" class="save-status warn">{{
            ui("unsaved")
          }}</span>
          <span v-if="saveStatus === 'error'" class="save-status error">{{
            ui("saveError") || ""
          }}</span>
        </div>

        <div class="toolbar-section">
          <div class="toolbar-divider" />

          <select
            v-model="selectedBlocklyLocale"
            class="toolbar-select"
            @change="changeBlocklyLocale"
          >
            <option
              v-for="(info, locale) in BLOCKLY_LOCALES"
              :key="locale"
              :value="locale"
            >
              {{ info.label }}
            </option>
          </select>

          <div class="toolbar-divider" />

          <div class="menu-group">
            <button
              class="toolbar-btn"
              :class="{ active: openMenu === 'workspace' }"
              @click.stop="toggleMenu('workspace')"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <circle cx="12" cy="12" r="1" />
                <circle cx="12" cy="5" r="1" />
                <circle cx="12" cy="19" r="1" />
              </svg>
              <span>{{ ui("more") }}</span>
            </button>
            <Transition name="dropdown">
              <div v-if="openMenu === 'workspace'" class="dropdown-menu">
                <button class="dropdown-item" @click="handleExport">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  <span>{{ ui("exportWorkspace") }}</span>
                  <select
                    v-model="exportFormat"
                    class="inline-select"
                    @click.stop
                  >
                    <option value="json">JSON</option>
                    <option value="xml">XML</option>
                  </select>
                </button>
                <button class="dropdown-item" @click.stop="triggerImport">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  <span>{{ ui("importWorkspace") }}</span>
                  <select
                    v-model="importFormat"
                    class="inline-select"
                    @click.stop
                  >
                    <option value="auto">{{ ui("autoDetect") }}</option>
                    <option value="json">JSON</option>
                    <option value="xml">XML</option>
                  </select>
                </button>
                <input
                  ref="importInputRef"
                  type="file"
                  :accept="
                    importFormat === 'json'
                      ? '.json'
                      : importFormat === 'xml'
                        ? '.xml'
                        : '.xml,.json'
                  "
                  @change="onImportFile($event)"
                  class="sr-only-input"
                />
                <div class="dropdown-divider" />
                <button class="dropdown-item" @click="handleNewWorkspace">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  <span>{{ ui("newWorkspace") }}</span>
                </button>
                <div class="dropdown-divider" />
                <button class="dropdown-item danger" @click="handleClear">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <polyline points="3 6 5 6 21 6" />
                    <path
                      d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                    />
                  </svg>
                  <span>{{ ui("clearWorkspace") }}</span>
                </button>
              </div>
            </Transition>
          </div>
        </div>
      </div>
      <BlocklyEditor ref="blocklyEditor" @change="onWorkspaceChanged" />
    </div>

    <div class="split-handle" @mousedown="onSplitDragStart">
      <div class="split-line" />
    </div>

    <div class="view-right" :style="codeStyle">
      <div class="code-toolbar">
        <div class="code-toolbar-left">
          <select v-model="selectedLanguage" class="toolbar-select lang-select">
            <option
              v-for="(label, value) in LANGUAGE_LABELS"
              :key="value"
              :value="value"
            >
              {{ label }}
            </option>
          </select>
          <span class="toolbar-sep">&middot;</span>
        </div>
        <button class="toolbar-btn primary" @click="generateCode">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <polyline points="16 18 22 12 16 6" />
            <polyline points="8 6 2 12 8 18" />
          </svg>
          <span>{{ ui("generateCode") }}</span>
        </button>
        <button class="toolbar-btn copy-btn" @click="copyCode">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          <span>{{ ui("copyCode") }}</span>
        </button>
      </div>
      <CodePreviewer
        ref="codePreviewer"
        :workspace="currentWorkspace"
        :language="selectedLanguage"
      />
    </div>

    <Transition name="toast">
      <div v-if="toastVisible" class="toast">{{ toastMessage }}</div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import BlocklyEditor from '@/components/BlocklyEditor.vue';
import CodePreviewer from '@/components/CodePreviewer.vue';
import {
  CODE_LANGUAGES,
  LANGUAGE_LABELS,
  type CodeLanguage,
} from '@/constants/code-languages';
import {
  useBlocklyLocale,
  BLOCKLY_LOCALES,
  type BlocklyLocale,
  ui,
} from '@/composables/locale';
import { useEditorProject } from '@/composables/useEditorProject';

const blocklyLocale = useBlocklyLocale();
const selectedBlocklyLocale = ref<BlocklyLocale>(
  blocklyLocale.getCurrentLocale(),
);

const changeBlocklyLocale = (): void => {
  blocklyLocale.setLocale(selectedBlocklyLocale.value);
  blocklyEditor.value?.updateToolbox();
  blocklyEditor.value?.refreshBlocks();
  // 显示切换提示（延迟到中文覆盖生效后）
  setTimeout(() => {
    toastMessage.value = ui('localeChanged');
    toastVisible.value = true;
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      toastVisible.value = false;
    }, 2000);
  }, 50);
};

blocklyLocale.initLocale();

const router = useRouter();
const blocklyEditor = ref<InstanceType<typeof BlocklyEditor> | null>(null);
const codePreviewer = ref<InstanceType<typeof CodePreviewer> | null>(null);
const selectedLanguage = ref<CodeLanguage>(CODE_LANGUAGES.PYTHON);
const exportFormat = ref<'json' | 'xml'>('json');
const importFormat = ref<'auto' | 'json' | 'xml'>('auto');

// ---- 项目管理 ----
const {
  projectName,
  autoSaveEnabled,
  saving,
  saveStatus,
  lastSaveTime,
  doSave,
  handleNewWorkspace,
} = useEditorProject({
  getWorkspaceXml: () => {
    return blocklyEditor.value?.exportWorkspace('xml') || '';
  },
  getLanguage: () => selectedLanguage.value,
  loadWorkspaceXml: (xml: string) => {
    return blocklyEditor.value?.loadWorkspace(xml, 'xml') || false;
  },
  onWorkspaceChange: (handler: () => void) => {
    // Return cleanup fn - the BlocklyEditor emits 'change' so we listen via template
    cleanupWorkspaceHandler = handler;
    return () => {
      cleanupWorkspaceHandler = null;
    };
  },
  clearWorkspace: () => {
    blocklyEditor.value?.clearWorkspace();
    codePreviewer.value?.clearCode();
  },
});
let cleanupWorkspaceHandler: (() => void) | null = null;

function onWorkspaceChanged() {
  if (cleanupWorkspaceHandler) cleanupWorkspaceHandler();
}

function onNameBlur() {
  // Auto-save name change on blur
  if (autoSaveEnabled.value) doSave();
}

function onManualSave() {
  doSave();
  toastMessage.value = ui('saved');
  toastVisible.value = true;
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    toastVisible.value = false;
  }, 1500);
}

function goBack() {
  router.push('/');
}

// ---- Toast 提示 ----
const toastVisible = ref(false);
const toastMessage = ref('');
let toastTimer: number | undefined;

const currentWorkspace = computed(() => {
  return blocklyEditor.value?.workspaceRef || null;
});

// ---- 监听导出完成事件 ----
window.addEventListener('ciphercat:workspace-saved', onWorkspaceSaved);

// ---- 下拉菜单 ----
const openMenu = ref<string>('');
const importInputRef = ref<HTMLInputElement | null>(null);

function toggleMenu(menu: string) {
  openMenu.value = openMenu.value === menu ? '' : menu;
}

function closeMenus() {
  openMenu.value = '';
}

// ---- 操作 ----
const generateCode = (): void => {
  codePreviewer.value?.generateCode();
};

const copyCode = async (): Promise<void> => {
  const code = codePreviewer.value?.code as string | undefined;
  if (!code) return;
  try {
    await navigator.clipboard.writeText(code);
  } catch (err) {
    console.error(ui('copyFailed'), err);
  }
};

const triggerImport = (): void => {
  importInputRef.value?.click();
};

const onImportFile = (event: Event): void => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file && blocklyEditor.value) {
    blocklyEditor.value
      .handleFileUpload(file)
      .then((success: boolean) => {
        if (success) console.log('文件导入成功:', file.name);
        else console.error('文件导入失败:', file.name);
      })
      .catch((error: Error) => {
        console.error('文件导入错误:', error);
      });
  }
  target.value = '';
};

function handleExport() {
  openMenu.value = '';
  if (blocklyEditor.value) {
    const filename =
      exportFormat.value === 'xml'
        ? 'blockly_workspace.xml'
        : 'blockly_workspace.json';
    blocklyEditor.value.downloadWorkspace(filename);
    // 先显示短 toast，Tauri 保存成功后通过自定义事件更新路径
    toastMessage.value = ui('exported') || 'Exported';
    toastVisible.value = true;
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      toastVisible.value = false;
    }, 4000);
  }
}

// 监听 Tauri 保存事件
function onWorkspaceSaved(e: Event) {
  const detail = (e as { detail?: { path?: string; error?: string } }).detail;
  if (!detail) return;
  if (detail.error) {
    toastMessage.value =
      (ui('exportError') || 'Export failed') + ': ' + detail.error;
    toastVisible.value = true;
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      toastVisible.value = false;
    }, 6000);
  } else if (detail.path) {
    toastMessage.value = (ui('exported') || 'Exported') + ': ' + detail.path;
    toastVisible.value = true;
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      toastVisible.value = false;
    }, 8000);
  }
}

function handleClear() {
  openMenu.value = '';
  if (blocklyEditor.value) {
    blocklyEditor.value.clearWorkspace();
    codePreviewer.value?.clearCode();
  }
}

// ---- 拖拽分割条 ----
const editorViewRef = ref<HTMLElement | null>(null);
const rightWidth = ref<number | undefined>(undefined);
const topHeight = ref<number | undefined>(undefined);
const MIN_RIGHT = 320;
const MIN_TOP = 160;
const MAX_RIGHT_RATIO = 0.55;

let splitDragging = false;
let rafId = 0;
const narrowMedia = window.matchMedia('(max-width: 1200px)');

function isNarrowLayout() {
  return narrowMedia.matches;
}

const codeStyle = computed(() => {
  // NOTE: 必须在所有分支之前读取 topHeight/rightWidth，确保 Vue 正确追踪依赖
  // 否则从宽屏切到窄屏时，computed 依赖链断裂，永远返回 {}
  const _th = topHeight.value;
  const _rw = rightWidth.value;
  if (isNarrowLayout()) {
    if (_th !== undefined) {
      return {
        height: `calc(100% - ${_th}px - 6px)`,
        flex: 'none',
        width: '100%',
      };
    }
    return {};
  }
  if (_rw !== undefined) {
    return { width: `${_rw}px`, flex: 'none' };
  }
  return {};
});

const editorStyle = computed(() => {
  // NOTE: 必须在所有分支之前读取 topHeight/rightWidth，确保 Vue 正确追踪依赖
  const _th = topHeight.value;
  const _rw = rightWidth.value;
  const narrow = isNarrowLayout();
  if (narrow) {
    if (_th !== undefined) {
      return { height: `${_th}px`, flex: 'none', width: '100%' };
    }
    return {};
  }
  if (_rw !== undefined) {
    return { width: `calc(100% - ${_rw}px - 6px)`, flex: 'none' };
  }
  return {};
});

function onSplitDragStart(e: MouseEvent) {
  e.preventDefault();
  splitDragging = true;
  window.addEventListener('mousemove', onSplitDragMove, { capture: true });
  window.addEventListener('mouseup', onSplitDragEnd, { capture: true });
  document.body.style.cursor = isNarrowLayout() ? 'row-resize' : 'col-resize';
  document.body.style.userSelect = 'none';
}

function onSplitDragMove(e: MouseEvent) {
  if (!splitDragging) return;
  e.preventDefault();
  const container = editorViewRef.value;
  if (!container) return;
  const rect = container.getBoundingClientRect();

  if (isNarrowLayout()) {
    const fromTop = e.clientY - rect.top;
    const maxTop = rect.height * 0.7;
    const newVal = Math.max(MIN_TOP, Math.min(fromTop, maxTop));
    topHeight.value = newVal;
  } else {
    const fromRight = rect.right - e.clientX;
    const maxRight = rect.width * MAX_RIGHT_RATIO;
    rightWidth.value = Math.max(MIN_RIGHT, Math.min(fromRight, maxRight));
  }
  // 拖拽中节流刷新 workspace
  if (!rafId) {
    rafId = requestAnimationFrame(() => {
      rafId = 0;
      blocklyEditor.value?.resizeWorkspace();
    });
  }
}

function onSplitDragEnd() {
  splitDragging = false;
  window.removeEventListener('mousemove', onSplitDragMove, { capture: true });
  window.removeEventListener('mouseup', onSplitDragEnd, { capture: true });
  document.body.style.cursor = '';
  document.body.style.userSelect = '';
  blocklyEditor.value?.resizeWorkspace();
}

onUnmounted(() => {
  window.removeEventListener('ciphercat:workspace-saved', onWorkspaceSaved);
  if (toastTimer) clearTimeout(toastTimer);
  if (splitDragging) {
    window.removeEventListener('mousemove', onSplitDragMove, { capture: true });
    window.removeEventListener('mouseup', onSplitDragEnd, { capture: true });
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }
  if (rafId) {
    cancelAnimationFrame(rafId);
  }
});

// 响应式布局切换时重置尺寸（nextTick 等 DOM 更新完）
const onBreakpointChange = () => {
  if (narrowMedia.matches) {
    rightWidth.value = undefined;
  } else {
    topHeight.value = undefined;
  }
  nextTick(() => blocklyEditor.value?.resizeWorkspace());
};
narrowMedia.addEventListener('change', onBreakpointChange);
onUnmounted(() => {
  narrowMedia.removeEventListener('change', onBreakpointChange);
});
</script>

<style scoped>
.editor-view {
  height: 100%;
  display: flex;
  gap: 0;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  background: var(--color-bg-main);
  color: var(--color-text);
}

/* ---- 工具栏 ---- */
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  padding: 8px 12px;
  background: var(--color-bg-card);
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
  gap: 8px 12px;
  overflow: visible;
}

.toolbar-section {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.section-icon {
  width: 16px;
  height: 16px;
  color: var(--color-primary);
  flex-shrink: 0;
}

.toolbar-title {
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
}

.toolbar-divider {
  width: 1px;
  height: 24px;
  background: var(--color-border);
  flex-shrink: 0;
}

.toolbar-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 10px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: var(--color-bg-card);
  color: var(--color-text);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
  flex-shrink: 0;
}

.toolbar-btn svg {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}

.toolbar-btn:hover {
  background: var(--color-bg-hover);
  border-color: var(--color-border-hover);
}

.toolbar-btn.active {
  background: var(--color-primary-light);
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.toolbar-btn.primary {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: #fff;
}

.toolbar-btn.primary:hover {
  opacity: 0.9;
}

.toolbar-btn.icon-only {
  padding: 0 8px;
  min-width: 32px;
  justify-content: center;
}

.name-input {
  max-width: 180px;
  min-width: 100px;
  flex: 1 1 auto;
  height: 32px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  padding: 0 10px;
  background: var(--color-bg-card);
  color: var(--color-text);
  font-size: 12px;
  transition: border-color 0.2s;
}

.name-input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.auto-toggle {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--color-text-secondary);
  cursor: pointer;
  white-space: nowrap;
}

.auto-toggle input {
  margin: 0;
}

.save-status {
  font-size: 12px;
  white-space: nowrap;
  flex-shrink: 0;
}

.save-status.ok {
  color: var(--color-success, #67c23a);
}

.save-status.warn {
  color: var(--color-warning, #e6a23c);
}

.save-status.error {
  color: var(--color-danger, #f56c6c);
}

.toolbar-select {
  height: 32px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  padding: 0 22px 0 8px;
  font-size: 12px;
  background: var(--color-bg-card)
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8' viewBox='0 0 24 24' fill='none' stroke='%23909399' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")
    no-repeat right 6px center;
  color: var(--color-text);
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  outline: none;
  transition: border-color 0.15s;
}

.toolbar-select:focus {
  border-color: var(--color-primary);
}

/* ---- 下拉菜单 ---- */
.menu-group {
  position: relative;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  min-width: 220px;
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.15);
  padding: 6px;
  z-index: 300;
  margin-top: 2px;
}

.dropdown-enter-active {
  transition: all 0.15s ease-out;
}

.dropdown-leave-active {
  transition: all 0.1s ease-in;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 10px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--color-text);
  font-size: 13px;
  text-align: left;
  cursor: pointer;
  transition: background 0.12s;
}

.dropdown-item svg {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  opacity: 0.6;
}

.dropdown-item:hover {
  background: var(--color-bg-hover);
}

.dropdown-item:hover svg {
  opacity: 1;
}

.dropdown-item.danger {
  color: #f56c6c;
}

.dropdown-item.danger:hover {
  background: rgba(245, 108, 108, 0.08);
}

.inline-select {
  margin-left: auto;
  height: 26px;
  min-width: 60px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  padding: 0 20px 0 6px;
  font-size: 11px;
  background: var(--color-bg-card)
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8' viewBox='0 0 24 24' fill='none' stroke='%23909399' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")
    no-repeat right 5px center;
  color: var(--color-text);
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  outline: none;
  transition: border-color 0.12s;
  flex-shrink: 0;
}

.sr-only-input {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.dropdown-divider {
  height: 1px;
  background: var(--color-border);
  margin: 4px 0;
}

/* ---- 左侧区 ---- */
.view-left {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}

/* ---- 分割条 ---- */
/* 负 margin 向两侧面板各延伸 5px 点击热区，视觉宽度不变。
   即使 Blockly SVG 缩放后溢出，也无法盖住中心区域。 */
.split-handle {
  width: 6px;
  flex-shrink: 0;
  cursor: col-resize;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 20;
  margin-left: -5px;
  margin-right: -5px;
  transition: background 0.15s;
}

.split-handle:hover {
  background: var(--color-primary-light);
}

.split-line {
  width: 2px;
  height: 40px;
  border-radius: 1px;
  background: var(--color-border);
  transition: background 0.15s;
}

.split-handle:hover .split-line {
  background: var(--color-primary);
}

/* ---- 右侧代码区 ---- */
.view-right {
  width: 380px;
  min-width: 320px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
  border-left: 1px solid var(--color-border);
  background: var(--color-bg-card);
}

.code-toolbar {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background: var(--color-bg-card);
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
  gap: 8px;
  overflow: hidden;
}

.code-toolbar-left {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.copy-btn {
  margin-left: auto;
}

.toolbar-sep {
  color: var(--color-border-hover);
  font-size: 14px;
  flex-shrink: 0;
}

.lang-select {
  min-width: 64px;
}

/* ---- Toast 提示 ---- */
.toast {
  position: fixed;
  top: 12px;
  left: 50%;
  transform: translateX(-50%);
  padding: 8px 20px;
  background: var(--color-primary);
  color: #fff;
  border-radius: 6px;
  font-size: 13px;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  pointer-events: none;
}

.toast-enter-active {
  transition: all 0.25s ease-out;
}

.toast-leave-active {
  transition: all 0.2s ease-in;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(-8px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-4px);
}

/* ---- 响应式 ---- */
@media (max-width: 1200px) {
  .editor-view {
    flex-direction: column;
  }

  .view-left {
    width: 100% !important;
    flex: 1;
    height: auto;
  }

  .split-handle {
    width: 100%;
    height: 6px;
    flex-shrink: 0;
    cursor: row-resize;
    margin: -5px 0;
  }

  .split-line {
    width: 40px;
    height: 2px;
  }

  .view-right {
    width: 100% !important;
    flex: 1;
    min-width: 0;
    min-height: 0;
    border-left: none;
    border-top: 1px solid var(--color-border);
  }
}
</style>
