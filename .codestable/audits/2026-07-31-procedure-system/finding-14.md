---
doc_type: audit-finding
audit: 2026-07-31-procedure-system
finding_id: "maintainability-01"
nature: maintainability
severity: P2
confidence: high
suggested_action: cs-refactor
status: closed
closed_by: refactor 2026-07-31-maintenance-cleanup
---

# Finding 14：28 项模板清单三处手工复制已漂移（幻影条目 crypto_func_def）；生成器 JS/Python 镜像无一致性机制

## 速答

模板清单在 blocks.ts、JS 生成器、Python 生成器三处手工复制（另有 CryptoFunctionPanel buildCategories 第 4 处）；已漂移出幻影条目 `crypto_func_def`（生成器 TEMPLATE_TYPES 含它，但块已不存在）+ 配套死键。新增/改名模板需同步七处，无任何校验。

## 关键证据

- `src/generators/javascript/procedure/blocks.ts:91-101` — `TEMPLATE_TYPES` 含 `'crypto_func_def'`
- `src/generators/python/procedure/blocks.ts:88-98` — 与 JS 逐字重复（连幻影条目一致）
- `src/blocks/procedure/blocks.ts:826-854` — 实际只注册 27 个模板；`PROCEDURE_BLOCK_TYPES`（:13-18）无 crypto_func_def；全仓无 `Blockly.Blocks['crypto_func_def']`
- `src/components/CryptoFunctionPanel.vue:67-109` — 5 子类目模板清单（第 4 处手工副本）+ 两套 LABEL 键方案（crypto_* vs proc_*）
- 旧审计 full-project #5（JS/PY 生成器 27 文件完全镜像）结构未变

## 影响

清单漂移已实际发生（幻影生成器条目 + 死键 + 后续模板改动极易漏同步）；镜像复制使每加一块维护两份代码。

## 修复方向

单一数据源：模板注册表导出清单，生成器/Panel/工具箱从同一常量派生；加一致性校验脚本（或单元测试断言三处相等）；清理幻影条目与命名统一（crypto_* 泛化名 vs proc_* 算法名）。

## 建议动作

`cs-refactor`，因为是结构性去重与单一数据源改造。
