import * as Blockly from 'blockly/core';
import { javascriptGenerator } from 'blockly/javascript';
import { pythonGenerator } from 'blockly/python';

import { CODE_LANGUAGES, type CodeLanguage } from '@/constants/code-languages';

export function generateCode(
  workspace: Blockly.WorkspaceSvg,
  language: CodeLanguage = CODE_LANGUAGES.PYTHON
): string {
  if (!workspace) {
    console.error('工作空间不存在');
    return '';
  }

  try {
    switch (language) {
      case CODE_LANGUAGES.PYTHON:
        return pythonGenerator.workspaceToCode(workspace as Blockly.Workspace);
      case CODE_LANGUAGES.JAVASCRIPT:
        return javascriptGenerator.workspaceToCode(workspace as Blockly.Workspace);
      default:
        return '';
    }
  } catch (e) {
    console.error('生成代码失败:', e);
    return `// 错误: ${(e as Error).message}`;
  }
}
