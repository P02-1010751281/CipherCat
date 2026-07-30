import * as Blockly from 'blockly/core';

export async function exportFunctionBlock(block: Blockly.Block): Promise<void> {
  const s = Blockly.serialization.blocks.save(block, { addCoordinates: false }); if (!s) return;
  const json = JSON.stringify({ blocks: { languageVersion: 0, blocks: [s] } }, null, 2);
  const n = block.getFieldValue('FUNC_NAME') || block.type || 'function';
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([json], { type: 'application/json' })); a.download = n + '.json';
  document.body.appendChild(a); a.click();
  setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(a.href); }, 0);
}

(function regCtx() {
  Blockly.ContextMenuRegistry.registry.register({
    displayText: '📤 Export Block', id: 'cryptoExportBlock', weight: 100,
    preconditionFn: s => s.block && ['crypto_func_def','crypto_encrypt_func','crypto_decrypt_func','crypto_hash_func'].includes(s.block.type) ? 'enabled' : 'hidden',
    callback: s => { if (s.block) exportFunctionBlock(s.block); },
    scopeType: Blockly.ContextMenuRegistry.ScopeType.BLOCK,
  });
})();
