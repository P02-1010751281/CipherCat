---
doc_type: audit-finding
audit: 2026-08-01-full-project
finding_id: "maintainability-02"
nature: maintainability
severity: P2
confidence: high
suggested_action: cs-refactor
status: closed
closed_by: 88619d47
---

# Finding 16：buildCategories 类目键与 blocks.ts 注册类目双份硬编码（第 5 份）

## 速答

同一组 5 个类目键（base/symmetric/hash/mode/pqc）在 CryptoFunctionPanel 的 `buildCategories` 与 blocks.ts `_makeTemplateBlock` 注册调用各手写一份。新增模板若用拼错/新类目（如 'pqc2'），面板 `if (!group) continue` 静默丢弃——不报错、不 warn、导出全量也缺它。

## 关键证据

- `src/components/CryptoFunctionPanel.vue:86-92` — `buildCategories` 5 个类目键；`:95-96` `if (!group) continue`；`:248` handleExportAll 基于 categories 展开
- `src/blocks/procedure/blocks.ts:943-971` — `_makeTemplateBlock` 第 5 参 category 字符串（'symmetric'/'hash'/'pqc'/'mode'/'base'）

## 影响

模板在面板中静默消失（功能可见性依赖两处字符串完全一致）；面板类目多写一个则渲染空类目头。注册表声明为唯一事实源但类目不在注册表内校验。

## 修复方向

类目集合从 TEMPLATE_REGISTRY 的 info.category 值派生；类目标题经 CRYPTO_SUBCAT_* 键查 locale。

## 建议动作

`cs-refactor`。
