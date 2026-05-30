<template>
  <div class="code-preview-container">
    <pre class="code-content"><code v-if="code" v-html="highlightedCode" /><code v-else>{{ dragHint }}</code></pre>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import * as Blockly from 'blockly/core';
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import python from 'highlight.js/lib/languages/python';
import { type CodeLanguage } from '@/constants/code-languages';
import { generateCode as generateCodeFromWorkspace } from '@/composables/generator';
import { ui } from '@/composables/locale';

hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('python', python);

const props = defineProps<{
  workspace: Blockly.WorkspaceSvg | null;
  language: CodeLanguage;
}>();

const code = ref<string>('');
const dragHint = computed(() => code.value ? '' : ui('dragHint'));

const highlightedCode = computed(() => {
  if (!code.value) return '';
  const result = hljs.highlight(code.value, { language: props.language });
  // replace \n with <br> for pre-wrap display, but keep pre format
  return result.value;
});

const generateCode = (): void => {
  if (props.workspace) {
    code.value = generateCodeFromWorkspace(props.workspace, props.language);
  }
};

const clearCode = (): void => {
  code.value = ui('workspaceCleared');
};

watch(() => props.workspace, () => {
  generateCode();
});

watch(() => props.language, () => {
  generateCode();
});

defineExpose({
  code,
  generateCode,
  clearCode,
});
</script>

<style scoped>
.code-preview-container {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  background-color: var(--color-bg-card);
  overflow: hidden;
}

.code-content {
  flex: 1;
  padding: 12px 16px;
  margin: 0;
  overflow: auto;
  font-family: var(--font-family-mono);
  font-size: 13px;
  line-height: 1.6;
  color: var(--color-text);
  white-space: pre-wrap;
  word-break: break-word;
}

.code-content code {
  font-family: inherit;
}
</style>