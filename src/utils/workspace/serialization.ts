import * as Blockly from 'blockly/core';
import { migrateXmlText, migrateJsonState } from '@/utils/migration';

export const jsonTypes = ['.json', '.txt', 'text/json', 'application/json'];
export const xmlTypes = ['.xml', '.txt', 'text/xml', 'application/xml'];
export const validTypes = [...jsonTypes, ...xmlTypes];

export async function handleFileUpload(
  file: File,
  workspace: Blockly.WorkspaceSvg | null,
  callback: (
    _workspace: Blockly.WorkspaceSvg | null,
    _content: string,
  ) => boolean,
): Promise<boolean> {
  if (!file) {
    console.error('文件不存在');
    return false;
  }

  if (!workspace) {
    console.error('工作空间不存在');
    return false;
  }

  const isValidType = validTypes.some(
    (type) =>
      file.name.toLowerCase().endsWith(type) || file.type.includes(type),
  );

  if (!isValidType) {
    console.error('不支持的文件类型:', file.type, file.name);
    return false;
  }

  try {
    const reader = new FileReader();
    const content = await new Promise<string>((resolve, reject) => {
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (e) =>
        reject(
          new Error(`文件读取失败: ${e.target?.error?.message || '未知错误'}`),
        );
      reader.readAsText(file);
    });

    return callback(workspace, content);
  } catch (error) {
    console.error('文件读取或处理失败:', error);
    return false;
  }
}

/** 自定义事件名，Tauri 保存成功后携带路径广播 */
export const WORKSPACE_SAVED_EVENT = 'ciphercat:workspace-saved';

export function downloadContent(content: string, filename: string): void {
  if (!content) {
    console.warn('没有可下载的内容');
    return;
  }

  if (!filename) {
    console.warn('没有文件名');
    return;
  }

  // Tauri v2 原生保存
  // withGlobalTauri: true 暴露 window.__TAURI__，
  // invoke 可能在 .core.invoke 或顶层 .invoke（依 Tauri v2 版本）
  const tauriGlobal = (window as unknown as Record<string, unknown>)[
    '__TAURI__'
  ] as Record<string, unknown> | undefined;
  if (tauriGlobal) {
    // 兼容两种结构：v2.0.x 用 core.invoke，其他用顶层 invoke
    const invoke:
      | ((cmd: string, args: Record<string, unknown>) => Promise<unknown>)
      | undefined =
      ((tauriGlobal['core'] as Record<string, unknown> | undefined)?.[
        'invoke'
      ] as
        | ((cmd: string, args: Record<string, unknown>) => Promise<unknown>)
        | undefined) ??
      (tauriGlobal['invoke'] as
        | ((cmd: string, args: Record<string, unknown>) => Promise<unknown>)
        | undefined);
    if (invoke) {
      invoke('save_workspace', { content, filename })
        .then((path: unknown) => {
          const savedPath = String(path || '');
          console.log('Workspace exported to:', savedPath);
          // 广播事件，让 App.vue 更新 toast 显示路径
          window.dispatchEvent(
            new CustomEvent(WORKSPACE_SAVED_EVENT, {
              detail: { path: savedPath },
            }),
          );
        })
        .catch((err: unknown) => {
          const msg = String(err || '');
          console.error('Workspace export failed:', msg);
          // 用户取消不弹 toast，真正失败才广播
          if (msg !== 'User cancelled') {
            window.dispatchEvent(
              new CustomEvent(WORKSPACE_SAVED_EVENT, {
                detail: { path: '', error: msg },
              }),
            );
          }
        });
      return;
    }
  }

  // 浏览器回退：Blob URL 下载
  try {
    const blob = new Blob([content], { type: 'text/plain' });
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
    console.log('Workspace downloaded via Blob URL:', filename);
    return;
  } catch (error) {
    console.warn('Blob URL download failed, trying data URI:', error);
  }

  // 最终回退：data URI 下载（兼容 WebView / Tauri 无原生支持的场景）
  try {
    const a = document.createElement('a');
    a.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(content);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    console.log('Workspace downloaded via data URI:', filename);
  } catch (error) {
    console.error('All download methods failed:', error);
  }
}

export function loadXml(
  workspace: Blockly.WorkspaceSvg | null,
  xmlText: string,
): boolean {
  if (!workspace) {
    console.error('工作空间不存在');
    return false;
  }
  if (!xmlText || xmlText.trim() === '') {
    console.error('XML 内容为空');
    return false;
  }

  try {
    const migratedXml = migrateXmlText(xmlText);
    const xmlDom = Blockly.utils.xml.textToDom(migratedXml);

    Blockly.Events.disable();
    workspace.clear();
    Blockly.Events.enable();
    Blockly.Xml.domToWorkspace(xmlDom, workspace);

    fixSboxFieldsAfterXmlLoad(workspace, migratedXml);

    return true;
  } catch (error) {
    console.error('导入 XML 失败:', error);
    Blockly.Events.enable();
    return false;
  }
}

export function exportXml(workspace: Blockly.WorkspaceSvg | null): string {
  if (!workspace) {
    console.error('工作空间不存在');
    return '';
  }
  try {
    const xmlDom = Blockly.Xml.workspaceToDom(workspace);
    const xmlText = Blockly.Xml.domToText(xmlDom);
    return xmlText;
  } catch (error) {
    console.error('导出 XML 失败:', error);
    return '';
  }
}

/**
 * 安排一个宏任务在 Blockly 完成当前渲染周期后执行。
 * 优先使用 requestAnimationFrame（双帧保证渲染完成），
 * 降级使用 setTimeout(0)。
 */
function scheduleDeferred(fn: () => void): void {
  if (typeof requestAnimationFrame === 'function') {
    // 双帧 RAF：第一帧排队，第二帧执行，确保 DOM 已更新
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        try {
          fn();
        } catch (e) {
          console.warn('[serialization] deferred fn error:', e);
        }
      });
    });
  } else {
    setTimeout(() => {
      try {
        fn();
      } catch (e) {
        console.warn('[serialization] deferred fn error:', e);
      }
    }, 16); // ~1 frame @ 60fps
  }
}

function _applySboxFields(
  block: Blockly.Block,
  fields: Map<string, string>,
): void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (typeof (block as any).updateShape !== 'function') return;

  const firstKey = fields.keys().next().value;
  if (!firstKey) return;
  const hasField = block.getField(firstKey) !== null;

  Blockly.Events.disable();
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (block as any).updateShape();
    if (hasField) {
      // Old-format block: SBox_ fields exist
      for (const [fieldName, value] of fields) {
        const field = block.getField(fieldName);
        if (field) field.setValue(value);
      }
    } else {
      // New-format block: inject into gridData
      const rowCount = Number(block.getFieldValue('ROW')) || 4;
      const colCount = Number(block.getFieldValue('COL')) || 4;
      const size = rowCount * colCount;
      const gd: string[] = new Array(size).fill('00');
      for (const [fieldName, value] of fields) {
        const m = fieldName.match(/^SBox_(\d+)_(\d+)$/);
        if (m) {
          const idx = parseInt(m[1]) * colCount + parseInt(m[2]);
          if (idx < size) gd[idx] = value.padStart(2, '0');
        }
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (block as any).gridData = gd;
    }
  } finally {
    Blockly.Events.enable();
  }
}

/** 检测 state 中是否存在旧格式 _sbx_def_ 的 S-box 块 */
function detectLegacySboxFormat(obj: unknown): boolean {
  if (Array.isArray(obj)) {
    for (const item of obj) {
      if (detectLegacySboxFormat(item)) return true;
    }
    return false;
  }
  if (typeof obj !== 'object' || obj === null) return false;

  const record = obj as Record<string, unknown>;
  if (record.type === 'sbox' && record._sbx_def_) return true;

  for (const key of Object.keys(record)) {
    if (detectLegacySboxFormat(record[key])) return true;
  }
  return false;
}

function fixSboxFieldsAfterLoad(
  workspace: Blockly.WorkspaceSvg,
  state: Record<string, unknown>,
): void {
  const sboxFieldValues = collectSboxFieldValues(state);

  console.log(
    '[fixSboxFieldsAfterLoad] 从 state 中找到的 S-box 数据:',
    sboxFieldValues.size,
    '个',
  );

  const allBlocks = workspace.getAllBlocks(false);
  const sboxBlocks = allBlocks.filter((b) => b.type === 'sbox');
  console.log(
    '[fixSboxFieldsAfterLoad] workspace 中的 sbox 块:',
    sboxBlocks.length,
    '个, 总块数:',
    allBlocks.length,
  );

  sboxBlocks.forEach((block) => {
    console.log(
      '[fixSboxFieldsAfterLoad] block id:',
      block.id,
      'type:',
      block.type,
      'has updateShape:',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      typeof (block as any).updateShape === 'function',
    );

    const fields = sboxFieldValues.get(block.id);
    if (!fields) {
      console.warn(
        '[fixSboxFieldsAfterLoad] ⚠️ 未找到 block',
        block.id,
        '的 S-box 数据',
      );
      return;
    }

    console.log(
      '[fixSboxFieldsAfterLoad] block',
      block.id,
      '有',
      fields.size,
      '个 S-box 字段值, 示例:',
      [...fields.entries()].slice(0, 3),
    );

    scheduleDeferred(() => _applySboxFields(block, fields));
  });
}

function fixSboxFieldsAfterXmlLoad(
  workspace: Blockly.WorkspaceSvg,
  xmlText: string,
): void {
  const sboxFieldValues = collectSboxFieldValuesFromXml(xmlText);
  workspace.getAllBlocks(false).forEach((block) => {
    if (block.type !== 'sbox') return;
    const fields = sboxFieldValues.get(block.id);
    if (!fields) return;
    scheduleDeferred(() => _applySboxFields(block, fields));
  });
}

function collectSboxFieldValues(
  obj: unknown,
  result: Map<string, Map<string, string>> = new Map(),
  _depth: number = 0,
): Map<string, Map<string, string>> {
  if (Array.isArray(obj)) {
    for (const item of obj) collectSboxFieldValues(item, result, _depth + 1);
    return result;
  }
  if (typeof obj !== 'object' || obj === null) return result;

  const record = obj as Record<string, unknown>;
  if (record.type === 'sbox' && record.id) {
    console.log(
      '[collectSboxFieldValues] 找到 sbox 块 id:',
      record.id,
      'has _sbx_def_:',
      !!record._sbx_def_,
      'fields keys:',
      record.fields ? Object.keys(record.fields) : 'null',
    );
    let fieldMap: Map<string, string> | undefined;

    if (record._sbx_def_ && typeof record._sbx_def_ === 'object') {
      fieldMap = new Map<string, string>();
      for (const [key, val] of Object.entries(
        record._sbx_def_ as Record<string, unknown>,
      )) {
        if (typeof val === 'string') fieldMap.set(key, val);
      }
      console.log(
        '[collectSboxFieldValues] 从 _sbx_def_ 提取了',
        fieldMap.size,
        '个字段',
      );
    } else if (record.fields && typeof record.fields === 'object') {
      fieldMap = new Map<string, string>();
      const fieldObj = record.fields as Record<string, unknown>;
      for (const [key, val] of Object.entries(fieldObj)) {
        if (key.startsWith('SBox_') && typeof val === 'string') {
          fieldMap.set(key, val);
        }
      }
      console.log(
        '[collectSboxFieldValues] 从 fields 提取了',
        fieldMap.size,
        '个 SBox_ 字段',
      );
    }

    if (fieldMap && fieldMap.size > 0) {
      result.set(record.id as string, fieldMap);
      console.log(
        '[collectSboxFieldValues] 注册 block',
        record.id,
        '共',
        result.size,
        '个',
      );
    } else {
      console.warn(
        '[collectSboxFieldValues] ⚠️ sbox 块',
        record.id,
        '没有找到 S-box 数据!',
      );
    }
  }

  for (const key of Object.keys(record))
    collectSboxFieldValues(record[key], result, _depth + 1);
  return result;
}

function collectSboxFieldValuesFromXml(
  xmlText: string,
): Map<string, Map<string, string>> {
  const result = new Map<string, Map<string, string>>();
  const blockRegex =
    /<block type="sbox" id="([^"]*)"[^>]*>([\s\S]*?)<\/block>/g;
  let match: RegExpExecArray | null;

  while ((match = blockRegex.exec(xmlText)) !== null) {
    const fieldMap = new Map<string, string>();
    const fieldRegex =
      /<field name="(SBox_\d+_\d+)">((?:[^<]|<(?!\/field>))*)<\/field>/g;
    let fMatch: RegExpExecArray | null;
    while ((fMatch = fieldRegex.exec(match[2])) !== null) {
      fieldMap.set(fMatch[1], fMatch[2]);
    }
    if (fieldMap.size > 0) result.set(match[1], fieldMap);
  }

  return result;
}

export function loadJson(
  workspace: Blockly.WorkspaceSvg | null,
  jsonText: string,
): boolean {
  if (!workspace) {
    console.error('工作空间不存在');
    return false;
  }

  if (!jsonText || jsonText.trim() === '') {
    console.error('JSON 内容为空');
    return false;
  }

  let state: object;
  try {
    state = JSON.parse(jsonText);
  } catch (error) {
    console.error('JSON 解析失败:', error);
    return false;
  }

  const migratedState = migrateJsonState(state as Record<string, unknown>);
  console.log('[serialization] 迁移完成，准备加载工作区');

  try {
    Blockly.Events.disable();
    workspace.clear();
    Blockly.Events.enable();
    Blockly.serialization.workspaces.load(migratedState, workspace);

    // 仅对旧格式（_sbx_def_）执行兼容修复；新格式 SBox_* 已在 fields 中由 Blockly 原生加载
    const hasLegacySbox = detectLegacySboxFormat(
      migratedState as Record<string, unknown>,
    );
    if (hasLegacySbox) {
      console.log('[serialization] 检测到旧格式 _sbx_def_，执行兼容修复');
      fixSboxFieldsAfterLoad(
        workspace,
        migratedState as Record<string, unknown>,
      );
    }

    console.log('JSON 加载成功');
    return true;
  } catch (error) {
    console.error('加载 JSON 到工作空间失败:', error);
    Blockly.Events.enable();
    return false;
  }
}

export function exportJson(workspace: Blockly.WorkspaceSvg | null): string {
  if (!workspace) {
    console.error('工作空间未初始化');
    return '';
  }

  try {
    const state = Blockly.serialization.workspaces.save(workspace);
    return JSON.stringify(state, null, 2);
  } catch (error) {
    console.error('导出 JSON 失败:', error);
    return '';
  }
}
