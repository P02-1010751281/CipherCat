---
doc_type: audit-finding
audit: 2026-08-01-full-project
finding_id: "maintainability-03"
nature: maintainability
severity: P2
confidence: high
suggested_action: cs-issue
---

# Finding 17：i18n 缺 CRYPTO_CATEGORY_CRYPTO_TEMPLATES + POSTQUANTUM 死键

## 速答

`toolbox-config.ts` 引用 `CRYPTO_CATEGORY_CRYPTO_TEMPLATES` 但 ZH/EN 两 locale 均未定义 → 中文界面永久英文回退（`|| 'Crypto Templates'` 兜底掩盖缺失，lint/类型检查查不出）。反向：`CRYPTO_CATEGORY_POSTQUANTUM`（不带 _BASIC/_ADVANCED 后缀）有定义无引用，死键对。

## 关键证据

- `src/utils/toolbox-config.ts:211` — `name: (msg.CRYPTO_CATEGORY_CRYPTO_TEMPLATES || 'Crypto Templates')`
- `src/composables/locale.ts` — 16 个 CRYPTO_CATEGORY_* 键均无 CRYPTO_CATEGORY_CRYPTO_TEMPLATES；`:300/:545` POSTQUANTUM 死键（toolbox 只用 POSTQUANTUM_BASIC/ADVANCED，toolbox-config.ts:184/194）

## 影响

"Crypto Templates" 类目名在 zh-hans 界面永远英文；死键是"已修 15 对死键"同源的漏网一对，说明缺自动化校验（key-set 同步 + 引用↔定义双向检查）。

## 修复方向

补 CRYPTO_CATEGORY_CRYPTO_TEMPLATES 到两个 locale + 删 POSTQUANTUM 死键对；加 key-set 同步校验。

## 建议动作

`cs-issue`。
