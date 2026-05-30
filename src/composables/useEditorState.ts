import { ref } from 'vue';
import {
  CODE_LANGUAGES,
  LANGUAGE_LABELS,
  type CodeLanguage,
} from '@/constants/code-languages';

export function useEditorState() {
  const lang = ref<CodeLanguage>(CODE_LANGUAGES.PYTHON);
  const algoType = ref('unknown');
  const primitiveName = ref('');
  const openMenu = ref('');
  const showNameDialog = ref(false);
  const nameInput = ref('');
  const copied = ref(false);
  const projectName = ref(localStorage.getItem('blockly-project-name') || '');

  function closeMenus(e: MouseEvent) {
    const target = e.target as HTMLElement;
    if (target.closest('.menu-group')) return;
    openMenu.value = '';
  }

  function toggleMenu(name: string) {
    openMenu.value = openMenu.value === name ? '' : name;
  }

  function onProjectNameBlur() {
    const name = (projectName.value || '').trim();
    projectName.value = name;
    localStorage.setItem('blockly-project-name', name);
  }

  function cancelNameDialog() {
    showNameDialog.value = false;
  }

  function triggerCopyFeedback() {
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  }

  return {
    // state
    lang,
    algoType,
    primitiveName,
    openMenu,
    showNameDialog,
    nameInput,
    copied,
    projectName,
    // constants
    LANGUAGE_LABELS,
    CODE_LANGUAGES,
    // methods
    closeMenus,
    toggleMenu,
    onProjectNameBlur,
    cancelNameDialog,
    triggerCopyFeedback,
  };
}
