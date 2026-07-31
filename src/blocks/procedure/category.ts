/**
 * 自定义 Functions flyout 回调
 *
 * 替代原生 PROCEDURE 回调：在原生基础块 + 已定义函数之外，
 * 额外收集工作区中的模板块（proc_* / crypto_*），为其生成 call 块。
 */
import * as Blockly from 'blockly/core';

export const CRYPTO_PROCEDURE_KEY = 'CRYPTO_PROCEDURE';

/** 模板块类型判断（有 FUNC_NAME 字段的函数模板）。 */
function isTemplateBlock(block: Blockly.Block): boolean {
  return block.getField('FUNC_NAME') !== null && block.type !== 'procedures_defreturn' && block.type !== 'procedures_defnoreturn';
}

/** 生成 Functions flyout 内容。 */
export function createProcedureFlyout(workspace: Blockly.WorkspaceSvg): Blockly.utils.toolbox.FlyoutItemInfoArray {
  const items: Blockly.utils.toolbox.FlyoutItemInfoArray = [];
  const msg = Blockly.Msg as Record<string, string>;

  // 1. 基础块（原生）
  items.push({ kind: 'block', type: 'procedures_defnoreturn', gap: 16, fields: { NAME: msg.PROCEDURES_DEFNORETURN_PROCEDURE || 'do something' } });
  items.push({ kind: 'block', type: 'procedures_defreturn', gap: 16, fields: { NAME: msg.PROCEDURES_DEFRETURN_PROCEDURE || 'do something' } });
  items.push({ kind: 'block', type: 'procedures_ifreturn', gap: 24 });

  // 2. 工作区已定义函数（原生机制）
  try {
    const tuples = Blockly.Procedures.allProcedures(workspace);
    const pushCall = (tuples: [string, string[], boolean][], callType: string) => {
      for (const [name, params] of tuples) {
        items.push({ kind: 'block', type: callType, gap: 16, extraState: { name, params } });
      }
    };
    pushCall(tuples[0], 'procedures_callnoreturn');
    pushCall(tuples[1], 'procedures_callreturn');
  } catch { /* 忽略 */ }

  // 3. 工作区中的模板块（proc_* / crypto_*）→ 生成 call 块
  const seen = new Set<string>();
  for (const block of workspace.getAllBlocks(false)) {
    if (!isTemplateBlock(block)) continue;
    const name = (block.getFieldValue('FUNC_NAME') as string) || block.type;
    if (seen.has(name)) continue;
    seen.add(name);
    const paramName = (block.getFieldValue('PARAM_NAME') as string) || '';
    const paramType = (block.getFieldValue('PARAM_TYPE') as string) || 'bytes';
    items.push({
      kind: 'block',
      type: 'procedures_callreturn',
      gap: 16,
      extraState: { name, params: paramName ? [paramName] : [] },
    });
  }

  return items;
}

/** 注册 Functions flyout 回调（含模板 call 块）。 */
export function registerProcedureCallbacks(workspace: Blockly.WorkspaceSvg): void {
  workspace.registerToolboxCategoryCallback(CRYPTO_PROCEDURE_KEY, (w) => createProcedureFlyout(w as Blockly.WorkspaceSvg));
}
