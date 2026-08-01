<template>
  <Transition name="panel">
    <div v-if="visible" class="cfp-overlay" @click.self="$emit('close')">
      <div class="cfp-panel">
        <div class="cfp-header">
          <h3>{{ msg.CRYPTO_FUNCTIONS_PANEL_TITLE || 'Crypto Functions' }}</h3>
          <button class="cfp-close" @click="$emit('close')">✕</button>
        </div>
        <div class="cfp-actions">
          <button class="cfp-btn cfp-btn-new" @click="insertTemplate('procedures_defreturn')">{{ msg.CRYPTO_FUNCTIONS_NEW_BUTTON || '＋ 新建' }}</button>
          <button class="cfp-btn" @click="handleImport">{{ msg.CRYPTO_FUNCTIONS_IMPORT_BUTTON || '📥 导入' }}</button>
          <button class="cfp-btn" @click="handleExportAll">{{ msg.CRYPTO_FUNCTIONS_EXPORT_BUTTON || '📤 导出' }}</button>
        </div>
        <div class="cfp-list">
          <!-- Templates -->
          <div v-for="cat in categories" :key="cat.key" class="cfp-category">
            <div class="cfp-cat-header">{{ cat.label }}</div>
            <div v-for="tpl in cat.templates" :key="tpl.type" class="cfp-item">
              <span class="cfp-name" :title="tpl.type">{{ tpl.label }}</span>
              <span class="cfp-param">{{ tpl.param }}</span>
              <button
                class="cfp-item-btn"
                :class="isInToolbox(tpl.type) ? 'cfp-item-in-toolbox' : ''"
                @click="toggleTpl(tpl.type)"
                :title="isInToolbox(tpl.type) ? (msg.CRYPTO_FUNCTIONS_REMOVE_TIP || 'Remove from toolbox') : (msg.CRYPTO_FUNCTIONS_ADD_TIP || 'Add to toolbox')"
              >{{ isInToolbox(tpl.type) ? '✕' : '＋📦' }}</button>
              <button class="cfp-item-btn cfp-item-export" @click="exportTemplate(tpl.type)" :title="msg.CRYPTO_FUNCTIONS_EXPORT_TIP || 'Export'">📤</button>
            </div>
          </div>
          <!-- Workspace Functions -->
          <div v-if="wsFuncs.length > 0" class="cfp-category">
            <div class="cfp-cat-header">{{ msg.CRYPTO_FUNCTIONS_WORKSPACE_SECTION || 'Workspace' }}</div>
            <div v-for="fn in wsFuncs" :key="fn.id" class="cfp-item cfp-item-ws">
              <span class="cfp-name" :title="fn.type">{{ fn.name }}</span>
              <span class="cfp-param">{{ fn.type }}</span>
              <button class="cfp-item-btn cfp-item-export" @click="exportWsBlock(fn.id)" :title="msg.CRYPTO_FUNCTIONS_EXPORT_TIP || 'Export'">📤</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue';
import * as Blockly from 'blockly/core';
import { toolboxTemplates, toggleTemplate } from '@/blocks/procedure/toolbox-state';
import { TEMPLATE_REGISTRY } from '@/blocks/procedure/blocks';

const msg = Blockly.Msg as Record<string, string>;
const props = defineProps<{ visible: boolean; workspace: Blockly.WorkspaceSvg | null }>();

interface Template { type: string; label: string; param: string }
interface SubCategory { key: string; label: string; templates: Template[] }
const LABEL_KEYS: Record<string, string> = {
  crypto_return: 'CRYPTO_RETURN_LABEL',
  procedures_ifreturn: 'CRYPTO_IFRETURN_LABEL',
  crypto_encrypt_func: 'CRYPTO_PROCEDURES_ENCRYPT_LABEL',
  crypto_decrypt_func: 'CRYPTO_PROCEDURES_DECRYPT_LABEL',
  crypto_hash_func: 'CRYPTO_PROCEDURES_HASH_LABEL',
};
function L(type: string): string {
  const key = LABEL_KEYS[type] || (type + '_LABEL').toUpperCase();
  return (msg as Record<string, string>)[key] || type;
}

/** 模板项显示文案：从注册表派生（`1 param: ${paramName}:${paramType}`），缺省兜底。 */

/** 类目标题 locale 键：注册表 category → CRYPTO_SUBCAT_* 键。 */
const SUBCAT_LABEL_KEYS: Record<string, string> = {
  base: 'CRYPTO_SUBCAT_BASE',
  symmetric: 'CRYPTO_SUBCAT_SYMMETRIC',
  hash: 'CRYPTO_SUBCAT_HASH_MAC_KDF',
  mode: 'CRYPTO_SUBCAT_MODE',
  pqc: 'CRYPTO_SUBCAT_ITERATE_SPONGE_PQC',
};

function buildCategories(): SubCategory[] {
  // 类目键从注册表 info.category 派生（去重保留顺序），标题经 CRYPTO_SUBCAT_* 键查 locale
  const seen = new Set<string>();
  const categories: SubCategory[] = [];
  for (const info of Object.values(TEMPLATE_REGISTRY)) {
    if (seen.has(info.category)) continue;
    seen.add(info.category);
    const labelKey = SUBCAT_LABEL_KEYS[info.category];
    categories.push({
      key: info.category,
      label: (labelKey && msg[labelKey]) || info.category,
      templates: [],
    });
  }
  // 模板清单从注册表派生（单一数据源）
  for (const [type, info] of Object.entries(TEMPLATE_REGISTRY)) {
    const group = categories.find((c) => c.key === info.category);
    if (!group) continue;
    group.templates.push({
      type,
      label: L(type),
      param: '1 param: ' + info.paramName + ':' + info.paramType,
    });
  }
  // base 类目额外项（非注册表模板，固定在前）
  const base = categories.find((c) => c.key === 'base');
  if (base) {
    base.templates.unshift(
      { type: 'crypto_return', label: L('crypto_return'), param: 'value' },
      { type: 'procedures_ifreturn', label: L('procedures_ifreturn'), param: 'condition' },
    );
  }
  return categories;
}

const categories = ref<SubCategory[]>(buildCategories());

// ── Workspace function tracking ──
interface WsFunc { id: string; name: string; type: string }
const wsFuncs = ref<WsFunc[]>([]);
let changeListener: (() => void) | null = null;

// 模板类型清单静态化（派生自注册表；类别/文案仍随 locale 动态构建）
const TEMPLATE_TYPE_SET = new Set(Object.keys(TEMPLATE_REGISTRY));

function refreshWsFuncs() {
  const ws = props.workspace; if (!ws) { wsFuncs.value = []; return; }
  const all: {id:string; name:string; type:string}[] = [];
  ws.getAllBlocks(false).forEach((b) => {
    if (TEMPLATE_TYPE_SET.has(b.type)) {
      all.push({ id: b.id, name: (b.getFieldValue('FUNC_NAME') as string) || b.type, type: b.type });
    } else if (b.type === 'procedures_defreturn' || b.type === 'procedures_defnoreturn') {
      const model = (b as unknown as Record<string, () => {getName:()=>string}>).getProcedureModel?.();
      all.push({ id: b.id, name: model?.getName() || (b.getFieldValue('NAME') as string) || b.type, type: b.type });
    }
  });
  // 无变化不赋值（避免响应式重渲染）
  const prev = wsFuncs.value;
  if (prev.length === all.length && prev.every((f, i) => f.id === all[i].id && f.name === all[i].name && f.type === all[i].type)) return;
  wsFuncs.value = all;
}

function setupChangeListener() {
  if (!props.workspace || changeListener) return;
  const handler = (e: Blockly.Events.Abstract) => {
    // 过滤非内容变更事件（拖拽/滚动/加载），降低重扫频率
    const t = e.type;
    if (t === Blockly.Events.UI || t === Blockly.Events.BLOCK_MOVE || t === Blockly.Events.FINISHED_LOADING) return;
    refreshWsFuncs();
  };
  props.workspace.addChangeListener(handler);
  changeListener = () => props.workspace?.removeChangeListener(handler);
}

function teardownChangeListener() {
  changeListener?.();
  changeListener = null;
}

watch(() => props.workspace, (ws) => {
  teardownChangeListener();
  if (ws) {
    refreshWsFuncs();
    // 仅面板可见时挂监听（visible watch 负责开/关）
    if (props.visible) setupChangeListener();
  }
});

watch(() => props.visible, (v) => {
  if (v) { categories.value = buildCategories(); refreshWsFuncs(); setupChangeListener(); }
  else { teardownChangeListener(); }
});

onUnmounted(() => teardownChangeListener());

// ── Actions ──
function isInToolbox(type: string): boolean {
  return toolboxTemplates.value.includes(type);
}

function toggleTpl(type: string) {
  toggleTemplate(type);
  // 刷新 toolbox 显示（null = 用原配置重新渲染）
  try { props.workspace?.updateToolbox(null); }
  catch (e) { console.warn('[FunctionManager] toolbox refresh failed:', e); }
}

function insertTemplate(type: string) {
  const ws = props.workspace; if (!ws) return;
  const block = ws.newBlock(type);
  block.initSvg();
  block.render();
  const m = ws.getMetrics();
  block.moveBy(m.viewLeft + 40, m.viewTop + 40);
}

/** 物化模板块并序列化（事件禁用 + 显式触发预填 → 零活动 workspace 副作用：
 *  预填会向变量表 createVariable（事件禁用只抑制事件，变量表插入无条件），
 *  导出后清理本次新增的变量）。 */
function serializeTemplate(type: string): Blockly.serialization.blocks.State | null {
  const ws = props.workspace; if (!ws) return null;
  const varMap = ws.getVariableMap();
  const beforeVarIds = new Set(varMap.getAllVariables().map((v) => v.getId()));
  let tmpBlock: Blockly.Block | null = null;
  Blockly.Events.disable();
  try {
    tmpBlock = ws.newBlock(type);
    // 事件禁用时 BLOCK_CREATE 不派发 → 显式调用 onchange 触发预填链注入
    const onchange = (tmpBlock as unknown as { onchange?: (e: unknown) => void }).onchange;
    if (onchange) {
      try { onchange.call(tmpBlock, { type: 'BLOCK_CREATE' }); }
      catch (e) { console.warn('[FunctionManager] template prefill failed:', e); }
    }
    return Blockly.serialization.blocks.save(tmpBlock, { addCoordinates: false });
  } finally {
    if (tmpBlock) tmpBlock.dispose(false);
    // 清理预填新增的参数变量（仅本次新增；变量作用域在 workspace，不随块销毁）
    for (const v of varMap.getAllVariables()) {
      if (!beforeVarIds.has(v.getId())) {
        try { varMap.deleteVariable(v); }
        catch (e) { console.warn('[FunctionManager] prefill variable cleanup failed:', e); }
      }
    }
    Blockly.Events.enable();
  }
}

async function exportTemplate(type: string) {
  const state = serializeTemplate(type);
  if (!state) return;
  const json = JSON.stringify({ blocks: { languageVersion: 0, blocks: [state] } }, null, 2);
  download(json, type + '.json');
}

function handleImport() {
  const input = document.createElement('input'); input.type = 'file'; input.accept = '.json';
  input.onchange = async () => {
    const f = input.files?.[0]; if (!f || !props.workspace) return;
    try {
      const s = JSON.parse(await f.text());
      let bs: Record<string, unknown> | null = null;
      if (s.type) bs = s;
      else if (s.blocks?.blocks?.length) bs = s.blocks.blocks[0];
      if (!bs) return;
      Blockly.Events.disable();
      try { Blockly.serialization.blocks.append(bs as unknown as Blockly.serialization.blocks.State, props.workspace, { recordUndo: true }); } finally { Blockly.Events.enable(); }
    } catch (e) { console.error('Import failed:', e); }
  };
  input.click();
}

async function handleExportAll() {
  const allTypes = categories.value.flatMap(c => c.templates.map(t => t.type));
  const states: unknown[] = [];
  for (const type of allTypes) {
    const s = serializeTemplate(type);
    if (s) states.push(s);
  }
  if (!states.length) return;
  download(JSON.stringify({ blocks: { languageVersion: 0, blocks: states } }, null, 2), 'ciphercat_templates.json');
}

function exportWsBlock(id: string) {
  const ws = props.workspace; if (!ws) return;
  const block = ws.getBlockById(id); if (!block) return;
  const s = Blockly.serialization.blocks.save(block, { addCoordinates: false });
  if (!s) return;
  let name = (block.getFieldValue('FUNC_NAME') || block.getFieldValue('NAME') || block.type || 'function') as string;
  // Native procedures: try model-based name
  const fn = block as unknown as Record<string, () => {getName:()=>string}>;
  if (fn.getProcedureModel) {
    try { name = fn.getProcedureModel().getName(); }
    catch (e) { console.warn('[FunctionManager] procedure model name unavailable, falling back to field name:', e); }
  }
  download(JSON.stringify({ blocks: { languageVersion: 0, blocks: [s] } }, null, 2), name + '.json');
}

function download(content: string, filename: string) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([content], { type: 'application/json' }));
  a.download = filename;
  document.body.appendChild(a); a.click();
  setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(a.href); }, 0);
}
</script>

<style scoped>
.cfp-overlay { position: fixed; inset: 0; z-index: 1000; pointer-events: auto; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(3px); -webkit-backdrop-filter: blur(3px); }
.cfp-panel { pointer-events: auto; width: min(400px, 90vw); max-height: min(85vh, 700px); background: var(--color-bg-card); border: 1px solid var(--color-border); border-radius: 8px; box-shadow: 0 8px 32px rgba(0,0,0,0.35); display: flex; flex-direction: column; overflow: hidden; }
.cfp-header { display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; border-bottom: 1px solid var(--color-border); }
.cfp-header h3 { margin: 0; font-size: 14px; font-weight: 600; color: var(--color-text); }
.cfp-close { background: none; border: none; color: var(--color-text-secondary); font-size: 16px; cursor: pointer; padding: 2px 6px; border-radius: 4px; }
.cfp-close:hover { background: var(--color-bg-hover); color: var(--color-text); }
.cfp-actions { display: flex; gap: 4px; padding: 8px 14px; border-bottom: 1px solid var(--color-border); }
.cfp-btn { flex: 1; padding: 6px 8px; border: 1px solid var(--color-border); border-radius: 5px; background: var(--color-bg-hover); color: var(--color-text); font-size: 12px; cursor: pointer; }
.cfp-btn:hover { background: var(--color-border); }
.cfp-btn-new { background: var(--color-primary); color: #fff; border-color: var(--color-primary); }
.cfp-btn-new:hover { background: var(--color-primary-dark); border-color: var(--color-primary-dark); }
.cfp-list { flex: 1; overflow-y: auto; padding: 6px 0; }
.cfp-category { margin-bottom: 2px; }
.cfp-cat-header { padding: 6px 14px; font-size: 11px; font-weight: 700; color: var(--color-text-secondary); text-transform: uppercase; letter-spacing: 0.5px; }
.cfp-item { display: flex; align-items: center; padding: 4px 14px; gap: 6px; }
.cfp-item:hover { background: var(--color-bg-hover); }
.cfp-name { flex: 0 0 auto; font-size: 12px; color: var(--color-text); font-family: ui-monospace, monospace; white-space: nowrap; }
.cfp-param { flex: 1; font-size: 10px; color: var(--color-text-secondary); font-family: ui-monospace, monospace; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-align: right; }
.cfp-item-btn { background: none; border: 1px solid transparent; border-radius: 4px; font-size: 12px; cursor: pointer; padding: 2px 6px; color: var(--color-text-secondary); flex-shrink: 0; }
.cfp-item-btn:hover { border-color: var(--color-border); background: var(--color-bg-hover); color: var(--color-text); }
.cfp-item-in-toolbox { color: var(--color-success); border-color: var(--color-success); }
.cfp-item-ws { border-left: 2px solid var(--color-primary); }

.panel-enter-active, .panel-leave-active { transition: opacity 0.2s ease; }
.panel-enter-active .cfp-panel, .panel-leave-active .cfp-panel { transition: transform 0.2s ease, opacity 0.2s ease; }
.panel-enter-from, .panel-leave-to { opacity: 0; }
.panel-enter-from .cfp-panel, .panel-leave-to .cfp-panel { transform: scale(0.95); }
</style>
