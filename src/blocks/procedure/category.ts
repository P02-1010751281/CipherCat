/**
 * 自定义函数封装空间 Flyout 回调
 *
 * 扩展 Blockly 内置的 PROCEDURE flyout，额外添加：
 *   - crypto_return：显式暴露的返回块（可独立拖放）
 *   - crypto_func_def：密码学函数模板块（带类型提示参数）
 *   - 预置密码学模板（加密/解密/哈希函数）
 *   - 「导入函数」按钮
 *
 * 参照 Mixly 的函数封装块设计，在 Blockly 12.x 原生 procedure 系统基础上增强。
 */
import * as Blockly from 'blockly/core';

export const PROCEDURE_CATEGORY_KEY = 'CRYPTO_PROCEDURE';
export const IMPORT_BUTTON_KEY = 'CRYPTO_PROCEDURE_IMPORT';

/**
 * 自定义 procedure 分类的 flyout 回调。
 * 基于 Blockly 原生的 PROCEDURE flyout，添加密码学专用块和导入导出功能。
 */
export function createProcedureFlyoutCallback(
  workspace: Blockly.WorkspaceSvg,
): Blockly.utils.toolbox.FlyoutItemInfoArray {
  const msg = Blockly.Msg as Record<string, string>;
  const items: Blockly.utils.toolbox.FlyoutItemInfoArray = [];

  // ── 第一部分：Blockly 原生函数块 ──
  try {
    const builtinItems = Blockly.Procedures.flyoutCategory(workspace, false);
    if (Array.isArray(builtinItems)) {
      items.push(...builtinItems);
    }
  } catch {
    items.push({ kind: 'block', type: 'procedures_defnoreturn' });
    items.push({ kind: 'block', type: 'procedures_defreturn' });
  }

  // ── 第二部分：密码学控制块 ──
  items.push({ kind: 'sep' } as Blockly.utils.toolbox.FlyoutItemInfo);
  items.push({ kind: 'block', type: 'crypto_return' });

  const hasIfreturn = items.some(
    (item) =>
      item.kind === 'block' &&
      (item as Blockly.utils.toolbox.BlockInfo).type === 'procedures_ifreturn',
  );
  if (!hasIfreturn) {
    items.push({ kind: 'block', type: 'procedures_ifreturn' });
  }

  // ── 第三部分：密码学函数模板 ──
  items.push({ kind: 'sep' } as Blockly.utils.toolbox.FlyoutItemInfo);
  items.push({
    kind: 'label',
    text: msg.CRYPTO_PROCEDURES_TEMPLATE_TITLE || 'Crypto Templates',
  } as Blockly.utils.toolbox.LabelInfo);
  items.push({ kind: 'block', type: 'crypto_func_def' });

  // 预置模板变体
  items.push({
    kind: 'label',
    text: '  ── ' + (msg.CRYPTO_PROCEDURES_TYPE_HINT || 'Presets') + ' ──',
  } as Blockly.utils.toolbox.LabelInfo);
  items.push({ kind: 'block', type: 'crypto_encrypt_func' });
  items.push({ kind: 'block', type: 'crypto_decrypt_func' });
  items.push({ kind: 'block', type: 'crypto_hash_func' });

  // ── 第四部分：导入导出按钮 ──
  items.push({ kind: 'sep' } as Blockly.utils.toolbox.FlyoutItemInfo);
  items.push({
    kind: 'button',
    text: msg.CRYPTO_PROCEDURES_IMPORT_BUTTON || '📥 Import Function',
    callbackkey: IMPORT_BUTTON_KEY,
  } as Blockly.utils.toolbox.ButtonInfo);

  return items;
}

/** Workspace 扩展接口 */
interface ProcedureWorkspace extends Blockly.WorkspaceSvg {
  __procedureCategoryRegistered?: boolean;
  __procedureImportRegistered?: boolean;
}

/**
 * 导入函数块的处理函数。
 * 从文件中读取 JSON 并加载到当前工作区。
 */
async function handleImportFunction(
  workspace: Blockly.WorkspaceSvg,
): Promise<void> {
  const msg = Blockly.Msg as Record<string, string>;

  // 创建隐藏的 file input
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';

  input.onchange = async () => {
    const file = input.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const state = JSON.parse(text);

      // 支持两种格式：单个块的序列化 或 完整工作区状态
      let blockState: Record<string, unknown> | null = null;
      if (state.type && typeof state.type === 'string') {
        // 单个块格式
        blockState = state;
      } else if (
        state.blocks &&
        typeof state.blocks === 'object' &&
        Array.isArray((state.blocks as Record<string, unknown>).blocks)
      ) {
        // 完整工作区格式 — 取第一个块
        const blocks = (state.blocks as Record<string, unknown>).blocks as Array<Record<string, unknown>>;
        if (blocks.length > 0) {
          blockState = blocks[0];
        }
      }

      if (!blockState) {
        console.error('无效的函数块文件格式');
        return;
      }

      Blockly.Events.disable();
      try {
        const block = Blockly.serialization.blocks.append(
          blockState as unknown as Blockly.serialization.blocks.State,
          workspace,
          { recordUndo: true },
        );
        if (block) {
          console.log(
            msg.CRYPTO_PROCEDURES_IMPORT_SUCCESS || 'Function block imported',
            block.type,
          );
        }
      } finally {
        Blockly.Events.enable();
      }
    } catch (e) {
      console.error('导入函数块失败:', e);
    }
  };

  input.click();
}

/**
 * 导出单个函数块到文件。
 * @param block 要导出的 Blockly 块
 */
export async function exportFunctionBlock(block: Blockly.Block): Promise<void> {
  const msg = Blockly.Msg as Record<string, string>;

  try {
    const state = Blockly.serialization.blocks.save(block, {
      addCoordinates: false,
    });
    if (!state) {
      console.error('无法序列化块');
      return;
    }

    // 包装为完整格式（兼容导入逻辑）
    const wrapper = {
      blocks: {
        languageVersion: 0,
        blocks: [state],
      },
    };

    const json = JSON.stringify(wrapper, null, 2);
    const blockName =
      block.getFieldValue('FUNC_NAME') ||
      block.type ||
      'function';
    const filename = `${blockName}.json`;

    // 浏览器下载
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);

    console.log(
      msg.CRYPTO_PROCEDURES_EXPORT_SUCCESS || 'Function block exported',
      filename,
    );
  } catch (e) {
    console.error('导出函数块失败:', e);
  }
}

/**
 * 注册自定义右键菜单 — 为密码学函数块添加「导出」选项。
 */
function registerExportContextMenu(): void {
  const msg = Blockly.Msg as Record<string, string>;
  const EXPORTABLE_TYPES = [
    'crypto_func_def',
    'crypto_encrypt_func',
    'crypto_decrypt_func',
    'crypto_hash_func',
  ];

  Blockly.ContextMenuRegistry.registry.register({
    displayText: msg.CRYPTO_PROCEDURES_EXPORT_MENU || '📤 Export Block',
    preconditionFn: function (scope: Blockly.ContextMenuRegistry.Scope) {
      const block = scope.block;
      if (!block) return 'hidden';
      if (EXPORTABLE_TYPES.includes(block.type)) return 'enabled';
      return 'hidden';
    },
    callback: function (scope: Blockly.ContextMenuRegistry.Scope) {
      if (scope.block) {
        exportFunctionBlock(scope.block);
      }
    },
    scopeType: Blockly.ContextMenuRegistry.ScopeType.BLOCK,
    id: 'cryptoExportBlock',
    weight: 100,
  });
}

// 在模块加载时注册右键菜单
registerExportContextMenu();

/**
 * 注册自定义 procedure 分类回调到 workspace。
 */
export function registerProcedureCategoryCallbacks(
  workspace: Blockly.WorkspaceSvg,
): void {
  const ws = workspace as ProcedureWorkspace;
  if (ws.__procedureCategoryRegistered) return;

  workspace.registerToolboxCategoryCallback(
    PROCEDURE_CATEGORY_KEY,
    createProcedureFlyoutCallback,
  );

  if (!ws.__procedureImportRegistered) {
    workspace.registerButtonCallback(
      IMPORT_BUTTON_KEY,
      () => handleImportFunction(workspace),
    );
    ws.__procedureImportRegistered = true;
  }

  ws.__procedureCategoryRegistered = true;
}
