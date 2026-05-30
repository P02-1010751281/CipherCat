import { javascriptGenerator, Order } from 'blockly/javascript';
import type { Block } from 'blockly/core';

javascriptGenerator.forBlock['ctrl_iterate'] = function(block: Block): string {
  const varName = block.getFieldValue('VAR') || 'i';
  const times = block.getFieldValue('TIMES') || 32;
  let branch = javascriptGenerator.statementToCode(block, 'DO');
  if (!branch || branch.trim() === '') {
    branch = '  // 空操作\n';
  }
  return `// 迭代循环\nfor (let ${varName} = 0; ${varName} < ${times}; ${varName}++) {\n${branch}}\n`;
};
