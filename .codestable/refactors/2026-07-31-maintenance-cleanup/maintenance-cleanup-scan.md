---
doc_type: refactor-scan
refactor: 2026-07-31-maintenance-cleanup
status: user-reviewed
scope: "procedure 模板清单（blocks.ts + JS/PY generators + panel）、BlocklyEditor.vue 样式、locale.ts 键表、remaining.ts/index.ts 类型登记"
summary: "4 条优化点（全为结构类清理），来自审计 finding-14/15/16/17"
---

# 维护性四连 scan

## 总览

- 扫描范围：`src/blocks/procedure/blocks.ts`、`src/generators/{javascript,python}/procedure/blocks.ts`、`src/components/CryptoFunctionPanel.vue`、`src/components/BlocklyEditor.vue`、`src/composables/locale.ts`、`src/blocks/remaining.ts`、`src/blocks/index.ts`（6 文件，来源：审计 finding-14/15/16/17）
- 发现 4 条优化点：结构 4 / 架构 0 / 性能 0 / 可读性 0
- 按风险：低 4 / 中 0 / 高 0
- 建议先做：#1 #2 #3 #4（全为低风险死代码/登记清理，AI 可自证）
- 建议慎做 / 后做：无
- 前置检查 7 条全过：✓（纯声明式内容豁免测试覆盖要求；仅 #1 跨模块但修复方向即收敛单一数据源；范围 6 文件 < 15）

## 条目

### [1] 把 28 项模板清单收敛为单一数据源并删除幻影条目

- **位置**：`src/blocks/procedure/blocks.ts:826-854`（注册）、`src/generators/javascript/procedure/blocks.ts:91-101`、`src/generators/python/procedure/blocks.ts:88-98`（TEMPLATE_TYPES）、`src/components/CryptoFunctionPanel.vue:67-109`（buildCategories）
- **分类**：结构
- **现状**：模板清单手工复制 3+ 处；JS/PY TEMPLATE_TYPES 各含 1 个幻影条目 `crypto_func_def`（全仓无 `Blockly.Blocks['crypto_func_def']`，配套死键 `CRYPTO_FUNC_DEF_LABEL`）
- **问题**：新增/改名一个模板需同步 7 处（blocks + TEMPLATE_PREFILL + TEMPLATE_REGISTRY + JS gen + PY gen + panel + locale）；漂移已实际发生（幻影条目 + 死键），无任何校验
- **建议**：以 `TEMPLATE_REGISTRY`（blocks.ts）为唯一事实源导出模板类型清单；JS/PY 生成器 TEMPLATE_TYPES 与 panel buildCategories 改为从注册表派生；删除幻影条目与死键
- **建议映射的方法**：M-L1-01（Parallel Change 并行变更——迁移全部消费者到单一来源）
- **风险**：低（幻影条目从未生效，删除无行为变化；注册表派生需保证顺序一致）
- **验证**：AI 自证（vue-tsc + vite build + grep 确认无 crypto_func_def 残留 + 浏览器拖出模板/生成代码冒烟）
- **范围**：约 60 行 / 4 文件

### [2] 删除 BlocklyEditor.vue 指向 Blockly ≤11 类名的失效样式

- **位置**：`src/components/BlocklyEditor.vue:143,149,160,173`（`:deep(.blocklyToolboxDiv)` ×2、`:deep(.blocklyTreeRow)`、`:deep(.blocklyTreeSelected)`）
- **分类**：结构
- **现状**：4 条 `:deep()` 选择器指向 `blocklyToolboxDiv`/`blocklyTreeRow`，Blockly 12.5.1 实际类为 `blocklyToolbox`/`blocklyToolboxCategory*`（node_modules 源码核实），样式静默不生效
- **问题**：死样式 4 条（其中 1 条重复定义），维护者改样式无从感知；已沉淀于 compound 文档
- **建议**：删除 4 条死选择器规则；如保留工具箱样式意图，改用 12.5 实际类名重建
- **建议映射的方法**：M-L2-09（Remove Dead Code 死代码移除，本 scan 新增方法号）
- **风险**：低（选择器当前不匹配任何元素，删除无视觉变化）
- **验证**：AI 自证（vue-tsc + 浏览器工具箱渲染截图对比无差异）
- **范围**：约 12 行 / 1 文件

### [3] 删除 locale.ts 中 ~14 对零引用死键

- **位置**：`src/composables/locale.ts` ZH:315,348,354-363,365-368 / EN:568,606-615,618,623-626
- **分类**：结构
- **现状**：206 对键中约 14 对全仓除 locale.ts 外零引用（`CRYPTO_FUNCTIONS_PANEL_EMPTY`、`CRYPTO_FUNC_DEF_LABEL`、`CRYPTO_PROCEDURES_PARAM_TYPE/POLY/SEED/KEY`、`RETURN_BLOCK_TOOLTIP`、`IFRETURN_BLOCK_TOOLTIP`、`TEMPLATE_TITLE`、`TYPE_HINT`、`IMPORT_BUTTON`、`EXPORT_MENU`、`EXPORT_SUCCESS`、`IMPORT_SUCCESS` 等），为 Manager 面板重构后遗留；另有 `CRYPTO_FUNCTIONS_IMPORT_BUTTON` vs `CRYPTO_PROCEDURES_IMPORT_BUTTON` 语义重复键对
- **问题**：死键污染检索、误导 i18n 维护、掩盖块已不存在的信号；改文案易改错对象
- **建议**：删除全部零引用键；合并语义重复键对（保留实际使用的 `CRYPTO_FUNCTIONS_*`）
- **建议映射的方法**：M-L2-09（Remove Dead Code 死代码移除）
- **风险**：低（删除前逐键 grep 确认零引用）
- **验证**：AI 自证（vue-tsc + 逐键 grep 零引用 + 浏览器中英切换冒烟）
- **范围**：约 60 行 / 1 文件

### [4] 把 remaining.ts 的 13 个块纳入 ALL_BLOCK_TYPES 类型联合

- **位置**：`src/blocks/remaining.ts:13-54`、`src/blocks/index.ts:37-50,52-64`
- **分类**：结构
- **现状**：remaining.ts 直接注册 13 个块（nt_mod/bn_*/hash_hmac/base64/hex/endian）但无 `BLOCK_TYPES` 导出；`ALL_BLOCK_TYPES` 与 `AllBlockType` 联合不含它们
- **问题**：13 块游离于类型系统之外，任何依赖 ALL_BLOCK_TYPES 的覆盖率/文档/一致性工具漏报（历次审计需人工补查，finding-02 的 hash_hmac 即在此批）
- **建议**：remaining.ts 导出 `BLOCK_TYPES` 常量并入 index.ts 的 `ALL_BLOCK_TYPES` 与 `AllBlockType` 联合
- **建议映射的方法**：M-L1-01（Parallel Change 并行变更——登记源与类型消费者对齐）
- **风险**：低（类型联合扩展，编译期变更）
- **验证**：AI 自证（vue-tsc + 确认 ALL_BLOCK_TYPES 含 13 块）
- **范围**：约 15 行 / 2 文件
