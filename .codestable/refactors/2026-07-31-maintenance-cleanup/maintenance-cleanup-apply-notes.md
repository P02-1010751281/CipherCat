---
doc_type: refactor-apply-notes
refactor: 2026-07-31-maintenance-cleanup
---

# maintenance-cleanup apply notes

## 步骤 1: #4 remaining.ts 13 块纳入 ALL_BLOCK_TYPES

- 完成时间: 2026-07-31
- 改动文件: `src/blocks/remaining.ts`（+`REMAINING_BLOCK_TYPES` 常量 + `RemainingBlockType` 类型）、`src/blocks/index.ts`（ALL_BLOCK_TYPES 展开 + AllBlockType 联合并入）
- 验证结果: vue-tsc 0 errors；REMAINING_BLOCK_TYPES 在 index.ts 引用 2 处（数组 + 类型）
- 偏离: 无

## 步骤 2: #2 删除 BlocklyEditor.vue 死样式

- 完成时间: 2026-07-31
- 改动文件: `src/components/BlocklyEditor.vue`（删除 5 条死选择器规则）
- 验证结果: grep blocklyToolboxDiv/blocklyTreeRow/blocklyTreeSelected 零残留；vue-tsc 0 errors；工具箱渲染无差异（最终冒烟确认）
- 偏离: **scan 列了 4 条规则，实际删除 5 条**——`:156 :deep(.blocklyTreeRow:hover)` 为同类死规则（同 finding-15 家族，选择器同样不匹配 12.5 类名），一并删除；属同一发现范围内，非设计变更

## 步骤 3: #3 删除 locale.ts 死键

- 完成时间: 2026-07-31
- 改动文件: `src/composables/locale.ts`（ZH+EN 各删 15 个死键：PANEL_EMPTY、FUNC_DEF_LABEL、PARAM_TYPE/POLY/SEED/KEY、RETURN/IFRETURN_BLOCK_TOOLTIP、TEMPLATE_TITLE、TYPE_HINT、IMPORT_BUTTON、EXPORT_MENU、EXPORT_SUCCESS、IMPORT_SUCCESS）
- 验证结果: 15 键逐键 grep 全仓 0 残留；vue-tsc 0 errors；保留 PARAM_MSG/TEMPLATE_TOOLTIP（被引用）
- 偏离: scan 写 ~14 对，实际删 15 对（多出 PANEL_EMPTY——审计清单含它但 scan 正文漏列）

## 步骤 4: #1 模板清单收敛为单一数据源

- 完成时间: 2026-07-31
- 改动文件: `src/blocks/procedure/blocks.ts`（TemplateInfo +category 字段；27 个 _makeTemplateBlock 调用补 category；**proc_mlkem_keygen 注册序移到 sponge_duplex 之后以对齐 panel 显示序**；导出 `TEMPLATE_TYPES`）、`src/generators/javascript/procedure/blocks.ts` + `src/generators/python/procedure/blocks.ts`（TEMPLATE_TYPES 改从注册表导入，删除本地清单含幻影 crypto_func_def）、`src/components/CryptoFunctionPanel.vue`（buildCategories 按 category 从注册表派生；PANEL_PARAM 保留原显示文案；base 特殊项 crypto_return/procedures_ifreturn 固定在前）
- 验证结果: vue-tsc 0 errors；vite build ✓；grep crypto_func_def 零残留（**范围：src/ 代码与 i18n**；demos/*.json 仍含幻影块，见遗留）；panel 分组顺序与改前一致（注册序已对齐）
- 偏离: **顺手修复 2 处既有 lint 错误**（CryptoFunctionPanel.vue :166/:231 空 catch 块 → console.warn 显式处理；零行为影响，非本 refactor 引入但阻塞 lint gate）
- 偏离（review nit）: **删除 toolbox-state.ts 死导出 `ALL_TEMPLATE_TYPES`**（第 4 份手工模板清单，全仓零消费者——reviewer 发现，与本 refactor 单一数据源目标直接冲突）

## 顺手发现（不修，后续另开）

- `demos/Procedure-AES-Round.json`、`demos/Procedure-SM4-Round.json` 及 `procedures/` 下 10+ JSON 共 25 处引用块类型 `crypto_func_def`——该块从未注册，这些 demo 文件**改前已无法加载**（Blockly 无法实例化未注册类型）。需更新为已注册模板类型（如 crypto_encrypt_func）或标记已知损坏。

## 全量验证

- vue-tsc --noEmit ✅ 0 errors
- eslint ✅（步骤内已跑相关文件；全量在收尾 gate）
- vite build ✅
- 浏览器冒烟：工具箱渲染、Function Manager 面板分组/顺序、模板拖出 + 生成代码（最终确认）
