<template>
  <Transition name="panel">
    <div v-if="visible" class="cfp-overlay" @click.self="$emit('close')">
      <div class="cfp-panel">
        <div class="cfp-header">
          <h3>{{ msg.CRYPTO_FUNCTIONS_PANEL_TITLE || 'Crypto Functions' }}</h3>
          <button class="cfp-close" @click="$emit('close')">✕</button>
        </div>
        <div class="cfp-actions">
          <button class="cfp-btn" @click="handleImport">{{ msg.CRYPTO_FUNCTIONS_IMPORT_BUTTON || '📥 Import' }}</button>
          <button class="cfp-btn" @click="handleExportAll">{{ msg.CRYPTO_FUNCTIONS_EXPORT_BUTTON || '📤 Export All' }}</button>
        </div>
        <div class="cfp-list">
          <div v-for="cat in categories" :key="cat.key" class="cfp-category">
            <div class="cfp-cat-header">{{ cat.label }}</div>
            <div v-for="type in cat.blocks" :key="type" class="cfp-item">
              <span class="cfp-name" :title="type">{{ templateName(type) }}</span>
              <button class="cfp-item-btn cfp-item-insert" @click="insertTemplate(type)" title="Insert into workspace">＋</button>
              <button class="cfp-item-btn cfp-item-export" @click="exportTemplate(type)" title="Export as .json">📤</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import * as Blockly from 'blockly/core';

const msg = Blockly.Msg as Record<string, string>;
const props = defineProps<{ visible: boolean; workspace: Blockly.WorkspaceSvg | null }>();

interface SubCategory { key: string; label: string; blocks: string[] }

const categories: SubCategory[] = [
  { key: 'CRYPTO_SUBCAT_BASE',            label: msg.CRYPTO_SUBCAT_BASE || 'Base',             blocks: ['crypto_func_def', 'crypto_return', 'procedures_ifreturn', 'crypto_encrypt_func', 'crypto_decrypt_func', 'crypto_hash_func'] },
  { key: 'CRYPTO_SUBCAT_SYMMETRIC',       label: msg.CRYPTO_SUBCAT_SYMMETRIC || 'Symmetric',    blocks: ['proc_aes_round', 'proc_aes_last_round', 'proc_aes_key_schedule', 'proc_sm4_round', 'proc_sm4_key_schedule'] },
  { key: 'CRYPTO_SUBCAT_HASH_MAC_KDF',    label: msg.CRYPTO_SUBCAT_HASH_MAC_KDF || 'Hash / MAC / KDF', blocks: ['proc_sha256_hash', 'proc_sm3_hash', 'proc_hmac_sha256', 'proc_sm3_hmac', 'proc_pbkdf2', 'proc_hkdf'] },
  { key: 'CRYPTO_SUBCAT_MODE',            label: msg.CRYPTO_SUBCAT_MODE || 'Mode',             blocks: ['proc_mode_ecb', 'proc_mode_cbc', 'proc_mode_ctr', 'proc_mode_gcm'] },
  { key: 'CRYPTO_SUBCAT_ITERATE_SPONGE_PQC', label: msg.CRYPTO_SUBCAT_ITERATE_SPONGE_PQC || 'PQC', blocks: ['proc_md_iterate', 'proc_sponge_duplex', 'proc_mlkem_keygen', 'proc_ntt_vec', 'proc_pq_cbd', 'proc_pq_mat_mul', 'proc_pq_sample', 'proc_pq_vec_add', 'proc_pq_vec_sub'] },
];

function templateName(type: string): string {
  const key = (type + '_LABEL').toUpperCase();
  const i18n = (msg as Record<string, string>)[key];
  if (i18n) return i18n;
  // Fallback friendly names for non-proc types
  const names: Record<string, string> = {
    crypto_func_def: '🔧 Function',
    crypto_return: '🔧 return',
    procedures_ifreturn: '🔧 if return',
    crypto_encrypt_func: '🔐 Encrypt',
    crypto_decrypt_func: '🔓 Decrypt',
    crypto_hash_func: '#️⃣ Hash',
  };
  return names[type] || type;
}

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
    block.initSvg();
    block.render();
    const state = Blockly.serialization.blocks.save(block, { addCoordinates: false });
    if (!state) return;
    const json = JSON.stringify({ blocks: { languageVersion: 0, blocks: [state] } }, null, 2);
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
    a.download = type + '.json';
    document.body.appendChild(a); a.click();
    setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(a.href); }, 0);
  } finally {
    block.dispose(false);
  }
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
  const allTypes = categories.flatMap(c => c.blocks);
  const states: unknown[] = [];
  for (const type of allTypes) {
    const block = ws.newBlock(type);
    try {
      block.initSvg();
      block.render();
      const s = Blockly.serialization.blocks.save(block, { addCoordinates: false });
      if (s) states.push(s);
    } finally {
      block.dispose(false);
    }
  }
  if (!states.length) return;
  const json = JSON.stringify({ blocks: { languageVersion: 0, blocks: states } }, null, 2);
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
  a.download = 'ciphercat_templates.json';
  document.body.appendChild(a); a.click();
  setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(a.href); }, 0);
}
</script>

<style scoped>
.cfp-overlay { position: fixed; inset: 0; z-index: 1000; pointer-events: none; display: flex; align-items: flex-start; justify-content: flex-end; backdrop-filter: blur(3px); -webkit-backdrop-filter: blur(3px); }
.cfp-panel { pointer-events: auto; width: min(340px, 90vw); max-height: min(85vh, 700px); margin: clamp(24px, 5vh, 48px) clamp(8px, 2vw, 16px) 0 0; background: var(--color-bg-card); border: 1px solid var(--color-border); border-radius: 8px; box-shadow: 0 8px 32px rgba(0,0,0,0.35); display: flex; flex-direction: column; overflow: hidden; }
.cfp-header { display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; border-bottom: 1px solid var(--color-bg-hover); }
.cfp-header h3 { margin: 0; font-size: 14px; font-weight: 600; color: var(--color-text); }
.cfp-close { background: none; border: none; color: var(--color-text-secondary); font-size: 16px; cursor: pointer; padding: 2px 6px; border-radius: 4px; }
.cfp-close:hover { background: var(--color-bg-hover); color: var(--color-text); }
.cfp-actions { display: flex; gap: 6px; padding: 8px 14px; border-bottom: 1px solid var(--color-bg-hover); }
.cfp-btn { flex: 1; padding: 6px 10px; border: 1px solid var(--color-border); border-radius: 5px; background: var(--color-bg-hover); color: var(--color-text); font-size: 12px; cursor: pointer; }
.cfp-btn:hover { background: var(--color-border); }
.cfp-list { flex: 1; overflow-y: auto; padding: 6px 0; }
.cfp-category { margin-bottom: 2px; }
.cfp-cat-header { padding: 6px 14px; font-size: 11px; font-weight: 700; color: var(--color-text-secondary); text-transform: uppercase; letter-spacing: 0.5px; }
.cfp-item { display: flex; align-items: center; padding: 4px 14px; gap: 6px; }
.cfp-item:hover { background: var(--color-bg-hover); }
.cfp-name { flex: 1; font-size: 12px; color: var(--color-text); font-family: ui-monospace, monospace; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cfp-item-btn { background: none; border: 1px solid transparent; border-radius: 4px; font-size: 12px; cursor: pointer; padding: 2px 6px; color: var(--color-text-secondary); }
.cfp-item-btn:hover { border-color: var(--color-border); background: var(--color-bg-card); color: var(--color-text); }
.cfp-item-insert:hover { color: var(--color-primary); }

.panel-enter-active, .panel-leave-active { transition: opacity 0.2s ease; }
.panel-enter-active .cfp-panel, .panel-leave-active .cfp-panel { transition: transform 0.2s ease; }
.panel-enter-from, .panel-leave-to { opacity: 0; }
.panel-enter-from .cfp-panel, .panel-leave-to .cfp-panel { transform: translateX(40px); }
</style>
