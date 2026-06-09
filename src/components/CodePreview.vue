<template>
  <pre
    class="code-content"
  ><code>{{ code || '// 点击生成按钮查看代码' }}</code></pre>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import * as Blockly from 'blockly/core';
import { type CodeLanguage } from '@/constants/code-languages';
import * as Generator from '@/utils/generator';

const props = defineProps<{
  codeLanguage: CodeLanguage;
  algoType: string;
  workspace: Blockly.WorkspaceSvg | null;
}>();

const code = ref<string>('');

const generateCode = (): void => {
  if (props.workspace) {
    code.value = Generator.generateCode(props.workspace, props.codeLanguage);
  }
};

const clearCode = (): void => {
  code.value = '';
};

const setWorkspaceText = (text: string): void => {
  if (!text || text.trim() === '') return;
  code.value = text;
};

watch(
  [() => props.workspace, () => props.codeLanguage, () => props.algoType],
  () => {
    generateCode();
  },
);

// workspace 内容变化自动重新生成，切换 workspace 时重新绑定监听
watch(
  () => props.workspace,
  (ws, _old, onCleanup) => {
    generateCode();
    if (ws) {
      const handler = () => generateCode();
      ws.addChangeListener(handler);
      onCleanup(() => ws.removeChangeListener(handler));
    }
  },
  { immediate: true },
);

defineExpose({
  code,
  generateCode,
  clearCode,
  setWorkspaceText,
});
</script>

<style scoped>
.code-content {
  flex: 1;
  min-height: 0;
  padding: 12px;
  margin: 0;
  overflow: auto;
  font-family:
    "SF Mono", "Monaco", "Menlo", "Consolas", "Liberation Mono", "Courier New",
    monospace;
  font-size: 13px;
  line-height: 1.6;
  color: var(--el-text-color-primary, #303133);
  background-color: var(--el-fill-color-lighter, #fafbfc);
  white-space: pre-wrap;
  word-break: break-word;
  tab-size: 4;
}

.code-content code {
  font-family: inherit;
}

@media (max-width: 1200px) {
  .code-content {
    max-height: 300px;
  }
}
</style>
