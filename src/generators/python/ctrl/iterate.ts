import { pythonGenerator } from 'blockly/python';
import type { Block } from 'blockly/core';

pythonGenerator.forBlock['ctrl_iterate'] = function (block: Block): string {
  const varName = block.getFieldValue('VAR') || 'i';
  const times = block.getFieldValue('TIMES') || 32;
  let branch = pythonGenerator.statementToCode(block, 'DO');
  if (!branch || branch.trim() === '') {
    branch = 'pass\n';
  }
  const code =
    `for ${varName} in range(${times}):\n` +
    pythonGenerator.prefixLines(branch, '    ');
  return code;
};
