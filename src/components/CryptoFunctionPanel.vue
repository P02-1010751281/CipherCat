<template>
  <Transition name="panel">
    <div v-if="visible" class="cfp-overlay" @click.self="$emit('close')">
      <div class="cfp-panel">
        <div class="cfp-header">
          <h3>{{ msg.CRYPTO_FUNCTIONS_PANEL_TITLE || 'Crypto Functions' }}</h3>
          <button class="cfp-close" @click="$emit('close')">✕</button>
        </div>
        <div class="cfp-actions">
          <button class="cfp-btn cfp-btn-new" @click="insertTemplate('crypto_func_def')">{{ msg.CRYPTO_FUNCTIONS_NEW_BUTTON || '＋ 新建' }}</button>
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
              <button class="cfp-item-btn cfp-item-insert" @click="insertTemplate(tpl.type)" title="Insert">＋</button>
              <button class="cfp-item-btn cfp-item-export" @click="exportTemplate(tpl.type)" title="Export">📤</button>
            </div>
          </div>
          <!-- Workspace Functions -->
          <div v-if="wsFuncs.length > 0" class="cfp-category">
            <div class="cfp-cat-header">{{ msg.CRYPTO_FUNCTIONS_WORKSPACE_SECTION || 'Workspace' }}</div>
            <div v-for="fn in wsFuncs" :key="fn.id" class="cfp-item cfp-item-ws">
              <span class="cfp-name" :title="fn.type">{{ fn.name }}</span>
              <span class="cfp-param">{{ fn.type }}</span>
              <button class="cfp-item-btn cfp-item-export" @click="exportWsBlock(fn.id)" title="Export">📤</button>
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

const msg = Blockly.Msg as Record<string, string>;
const props = defineProps<{ visible: boolean; workspace: Blockly.WorkspaceSvg | null }>();

interface Template { type: string; label: string; param: string }
interface SubCategory { key: string; label: string; templates: Template[] }
function L(type: string): string {
  const key = (type + '_LABEL').toUpperCase();
  return (msg as Record<string, string>)[key] || type;
}

const categories: SubCategory[] = [
  { key: 'base', label: msg.CRYPTO_SUBCAT_BASE || 'Base', templates: [
    { type: 'crypto_func_def',       label: '🔧 Function',              param: '1 param (default seed:Bytes)' },
    { type: 'crypto_return',         label: '🔧 return',                param: 'value' },
    { type: 'procedures_ifreturn',   label: '🔧 if return',            param: 'condition' },
    { type: 'crypto_encrypt_func',   label: '🔐 Encrypt',              param: '1 param' },
    { type: 'crypto_decrypt_func',   label: '🔓 Decrypt',              param: '1 param' },
    { type: 'crypto_hash_func',      label: '#️⃣ Hash',                 param: '1 param' },
  ]},
  { key: 'symmetric', label: msg.CRYPTO_SUBCAT_SYMMETRIC || 'Symmetric', templates: [
    { type: 'proc_aes_round',        label: L('proc_aes_round'),        param: '1 param' },
    { type: 'proc_aes_last_round',   label: L('proc_aes_last_round'),   param: '1 param' },
    { type: 'proc_aes_key_schedule', label: L('proc_aes_key_schedule'), param: '1 param' },
    { type: 'proc_sm4_round',        label: L('proc_sm4_round'),        param: '1 param' },
    { type: 'proc_sm4_key_schedule', label: L('proc_sm4_key_schedule'), param: '1 param' },
  ]},
  { key: 'hash', label: msg.CRYPTO_SUBCAT_HASH_MAC_KDF || 'Hash / MAC / KDF', templates: [
    { type: 'proc_sha256_hash',      label: L('proc_sha256_hash'),      param: '1 param' },
    { type: 'proc_sm3_hash',         label: L('proc_sm3_hash'),         param: '1 param' },
    { type: 'proc_hmac_sha256',      label: L('proc_hmac_sha256'),      param: '1 param' },
    { type: 'proc_sm3_hmac',         label: L('proc_sm3_hmac'),         param: '1 param' },
    { type: 'proc_pbkdf2',           label: L('proc_pbkdf2'),           param: '1 param' },
    { type: 'proc_hkdf',             label: L('proc_hkdf'),             param: '1 param' },
  ]},
  { key: 'mode', label: msg.CRYPTO_SUBCAT_MODE || 'Mode', templates: [
    { type: 'proc_mode_ecb',         label: L('proc_mode_ecb'),         param: '1 param: data:Bytes' },
    { type: 'proc_mode_cbc',         label: L('proc_mode_cbc'),         param: '1 param: data:Bytes' },
    { type: 'proc_mode_ctr',         label: L('proc_mode_ctr'),         param: '1 param: data:Bytes' },
    { type: 'proc_mode_gcm',         label: L('proc_mode_gcm'),         param: '1 param: data:Bytes' },
  ]},
  { key: 'pqc', label: msg.CRYPTO_SUBCAT_ITERATE_SPONGE_PQC || 'PQC', templates: [
    { type: 'proc_md_iterate',       label: L('proc_md_iterate'),       param: '1 param: iv:IntList' },
    { type: 'proc_sponge_duplex',    label: L('proc_sponge_duplex'),    param: '1 param: state:IntList' },
    { type: 'proc_mlkem_keygen',     label: L('proc_mlkem_keygen'),     param: '1 param: seed:Seed' },
    { type: 'proc_ntt_vec',          label: L('proc_ntt_vec'),          param: '1 param: vec:IntList' },
    { type: 'proc_pq_cbd',           label: L('proc_pq_cbd'),           param: '1 param: seed:Seed' },
    { type: 'proc_pq_mat_mul',       label: L('proc_pq_mat_mul'),       param: '1 param: mat:IntList' },
    { type: 'proc_pq_sample',        label: L('proc_pq_sample'),        param: '1 param: seed:Seed' },
    { type: 'proc_pq_vec_add',       label: L('proc_pq_vec_add'),       param: '1 param: a:IntList' },
    { type: 'proc_pq_vec_sub',       label: L('proc_pq_vec_sub'),       param: '1 param: a:IntList' },
  ]},
];

// ── Workspace function tracking ──
interface WsFunc { id: string; name: string; type: string }
const wsFuncs = ref<WsFunc[]>([]);
let changeListener: (() => void) | null = null;

function refreshWsFuncs() {
  const ws = props.workspace; if (!ws) { wsFuncs.value = []; return; }
  const cTypes = categories.flatMap(c => c.templates.map(t => t.type));
  wsFuncs.value = ws.getAllBlocks(false)
    .filter(b => cTypes.includes(b.type) || b.type === 'procedures_defreturn' || b.type === 'procedures_defnoreturn')
    .map(b => ({
      id: b.id,
      name: (b.getFieldValue('FUNC_NAME') || b.getFieldValue('NAME') || b.type) as string,
      type: b.type,
    }));
}

function setupChangeListener() {
  if (!props.workspace || changeListener) return;
  const handler = () => refreshWsFuncs();
  props.workspace.addChangeListener(handler);
  changeListener = () => props.workspace?.removeChangeListener(handler);
}

function teardownChangeListener() {
  changeListener?.();
  changeListener = null;
}

watch(() => props.workspace, (ws) => {
  teardownChangeListener();
  if (ws) { refreshWsFuncs(); setupChangeListener(); }
});

watch(() => props.visible, (v) => {
  if (v) { refreshWsFuncs(); setupChangeListener(); }
  else { teardownChangeListener(); }
});

onUnmounted(() => teardownChangeListener());

// ── Actions ──
function insertTemplate(type: string) {
  const ws = props.workspace; if (!ws) return;
  const block = ws.newBlock(type);
  block.initSvg();
  block.render();
  const m = ws.getMetrics();
  block.moveBy(m.viewLeft + 40, m.viewTop + 40);
}

async function exportTemplate(type: string) {
  const ws = props.workspace; if (!ws) return;
  const block = ws.newBlock(type);
  try {
    block.initSvg(); block.render();
    const state = Blockly.serialization.blocks.save(block, { addCoordinates: false });
    if (!state) return;
    const json = JSON.stringify({ blocks: { languageVersion: 0, blocks: [state] } }, null, 2);
    download(json, type + '.json');
  } finally { block.dispose(false); }
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
  const ws = props.workspace; if (!ws) return;
  const allTypes = categories.flatMap(c => c.templates.map(t => t.type));
  const states: unknown[] = [];
  for (const type of allTypes) {
    const block = ws.newBlock(type);
    try {
      block.initSvg(); block.render();
      const s = Blockly.serialization.blocks.save(block, { addCoordinates: false });
      if (s) states.push(s);
    } finally { block.dispose(false); }
  }
  if (!states.length) return;
  download(JSON.stringify({ blocks: { languageVersion: 0, blocks: states } }, null, 2), 'ciphercat_templates.json');
}

function exportWsBlock(id: string) {
  const ws = props.workspace; if (!ws) return;
  const block = ws.getBlockById(id); if (!block) return;
  const s = Blockly.serialization.blocks.save(block, { addCoordinates: false });
  if (!s) return;
  const name = (block.getFieldValue('FUNC_NAME') || block.getFieldValue('NAME') || block.type || 'function') as string;
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
.cfp-item-insert:hover { color: var(--color-primary); }
.cfp-item-ws { border-left: 2px solid var(--color-primary); }

.panel-enter-active, .panel-leave-active { transition: opacity 0.2s ease; }
.panel-enter-active .cfp-panel, .panel-leave-active .cfp-panel { transition: transform 0.2s ease, opacity 0.2s ease; }
.panel-enter-from, .panel-leave-to { opacity: 0; }
.panel-enter-from .cfp-panel, .panel-leave-to .cfp-panel { transform: scale(0.95); }
</style>
