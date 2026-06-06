<template>
  <div ref="blocklyDiv" class="blockly-workspace"></div>
</template>

<script setup lang="ts">
import { ref, shallowRef, onMounted, onUnmounted } from 'vue';
import * as Blockly from 'blockly/core';
import { Workspace } from '@/utils/workspace';

const emit = defineEmits<{
  (_e: 'change'): void;
}>();

const blocklyDiv = ref<HTMLElement | null>(null);

const workspaceRef = shallowRef<Blockly.WorkspaceSvg | null>(null);
const isReadyRef = ref(false);

const workspaceApi = Workspace();

let cleanupResizeListener: (() => void) | null = null;

onMounted(() => {
  if (!blocklyDiv.value) {
    console.error('容器元素不存在');
    return;
  }

  const result = workspaceApi.initWorkspace(blocklyDiv.value);
  if (result) {
    workspaceRef.value = result;
    isReadyRef.value = workspaceApi.getIsReady();
  }

  // Ensure workspace SVG is properly sized after mount so zoom/trashcan controls
  // are positioned within the visible viewport.
  workspaceApi.resizeWorkspace();

  cleanupResizeListener = workspaceApi.setupResizeListener();

  if (workspaceRef.value) {
    const changeListener = (event: Blockly.Events.Abstract) => {
      if (event.type !== Blockly.Events.UI) {
        emit('change');
      }
    };
    workspaceRef.value.addChangeListener(changeListener);
  }
});

onUnmounted(() => {
  if (cleanupResizeListener) {
    cleanupResizeListener();
    cleanupResizeListener = null;
  }

  workspaceApi.disposeWorkspace();
  workspaceRef.value = null;
  isReadyRef.value = false;
});

const clearWorkspace = () => {
  workspaceApi.clearWorkspace();
};

const zoomInWorkspace = () => {
  workspaceApi.zoomInWorkspace();
};

const zoomOutWorkspace = () => {
  workspaceApi.zoomOutWorkspace();
};

const resetZoomWorkspace = () => {
  workspaceApi.resetZoomWorkspace();
};

const resizeWorkspace = () => {
  workspaceApi.resizeWorkspace();
};

const updateToolbox = () => {
  workspaceApi.updateToolbox();
};

const refreshBlocks = () => {
  workspaceApi.refreshBlocks();
};

const exportWorkspace = (format: 'json' | 'xml'): string => {
  return workspaceApi.exportWorkspace(format);
};

const handleFileUpload = async (file: File): Promise<boolean> => {
  return await workspaceApi.handleFileUpload(file);
};

const downloadWorkspace = (filename?: string) => {
  workspaceApi.downloadWorkspace(filename);
};

const loadWorkspace = (
  workspaceText: string,
  type: 'xml' | 'json',
): boolean => {
  return workspaceApi.loadWorkspace(workspaceText, type);
};

const setTheme = (isDark: boolean): void => {
  workspaceApi.setTheme(isDark);
};

defineExpose({
  workspaceRef,
  isReadyRef,
  exportWorkspace,
  clearWorkspace,
  zoomInWorkspace,
  zoomOutWorkspace,
  resetZoomWorkspace,
  resizeWorkspace,
  updateToolbox,
  handleFileUpload,
  downloadWorkspace,
  loadWorkspace,
  setTheme,
  refreshBlocks,
});
</script>

<style scoped>
.blockly-workspace {
  flex: 1;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}

:deep(.blocklyMainBackground) {
  stroke: none !important;
}

:deep(.blocklyToolboxDiv) {
  background: var(--el-fill-color-lighter, #fafbfc) !important;
  border-right: 1px solid var(--el-border-color-light, #e4e7ed) !important;
  padding: 4px 0 !important;
}

:deep(.blocklyTreeRow) {
  padding: 6px 12px !important;
  margin: 2px 4px !important;
  border-radius: 6px !important;
  transition: background 0.15s !important;
}

:deep(.blocklyTreeRow:hover) {
  background: var(--el-color-primary-light-9, #ecf5ff) !important;
}

:deep(.blocklyTreeSelected) {
  background: var(--el-color-primary-light-8, #d9ecff) !important;
}

:deep(.blocklyFlyoutBackground) {
  fill: var(--el-fill-color-light, #f7f8fa) !important;
  fill-opacity: 0.97 !important;
}

:deep(.blocklyFlyout) {
  z-index: 30 !important;
}

:deep(.blocklyToolboxDiv) {
  z-index: 20 !important;
}

:deep(.blocklyWidgetDiv) {
  z-index: 100 !important;
}

:deep(.blocklyDropDownDiv) {
  z-index: 110 !important;
}

:deep(.blocklyTooltipDiv) {
  z-index: 120 !important;
}

:deep(.blocklyScrollbarHandle) {
  fill: var(--el-border-color-hover, #c0c4cc) !important;
  rx: 4 !important;
  ry: 4 !important;
}

:deep(.blocklyScrollbarBackground) {
  fill: transparent !important;
}

:deep(.blocklyZoom > image) {
  opacity: 0.6;
}

:deep(.blocklyZoom > image:hover) {
  opacity: 1;
}

@media (max-width: 1200px) {
  .blockly-workspace {
    width: 100% !important;
  }
}
</style>
