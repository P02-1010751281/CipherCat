---
doc_type: audit-finding
audit: 2026-07-31-procedure-system
finding_id: "maintainability-03"
nature: maintainability
severity: P2
confidence: high
suggested_action: cs-refactor
status: closed
closed_by: refactor 2026-07-31-maintenance-cleanup
---

# Finding 16：locale.ts ~14 对死键 + 两套语义重复的 import/export 键并存

## 速答

206 对 i18n 键中约 14 对全仓零引用（Function Manager 面板重构后遗留），且存在语义重复的并行键对（`CRYPTO_FUNCTIONS_IMPORT_BUTTON` vs `CRYPTO_PROCEDURES_IMPORT_BUTTON` 等）——改文案极易改错对象，死键还掩盖了 crypto_func_def 已不存在的信号。

## 关键证据

- `src/composables/locale.ts` ZH:315,348,354-363,365-368 / EN:568,606-615,618,623-626 — `CRYPTO_FUNCTIONS_PANEL_EMPTY`、`CRYPTO_FUNC_DEF_LABEL`、`CRYPTO_PROCEDURES_PARAM_TYPE/POLY/SEED/KEY`、`RETURN_BLOCK_TOOLTIP`、`IFRETURN_BLOCK_TOOLTIP`、`TEMPLATE_TITLE`、`TYPE_HINT`、`IMPORT_BUTTON`、`EXPORT_MENU`、`EXPORT_SUCCESS`、`IMPORT_SUCCESS` 全仓除 locale.ts 外零引用
- 面板实际使用 `CRYPTO_FUNCTIONS_IMPORT_BUTTON/EXPORT_BUTTON`（`CryptoFunctionPanel.vue:11-12`）
- `CRYPTO_PROCEDURES_PARAM_MSG` 被引用（blocks.ts:803）但兄弟键 PARAM_TYPE/POLY/SEED/KEY 全死

## 影响

死键污染检索、误导后续 i18n 维护；语义重复键增加改错风险。

## 修复方向

删除全部死键；合并语义重复键对；可加死键检测脚本。

## 建议动作

`cs-refactor`，因为是键表清理。
