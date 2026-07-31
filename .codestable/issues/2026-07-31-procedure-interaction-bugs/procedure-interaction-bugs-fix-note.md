---
doc_type: issue-fix
issue: 2026-07-31-procedure-interaction-bugs
status: confirmed
path: standard
fix_date: 2026-07-31
related: [procedure-interaction-bugs-analysis.md]
tags: [procedure, call-block, lifecycle, export]
---

# Procedure 交互缺陷（2 类）修复记录

## 1. 根因摘要

1. **call 生命周期缺失**（finding-04）：def 无 onchange（改名不传播）、call `domToMutation` 忽略 mutation 的 name、NAME 下拉一次性构建（`buildCallOptions` 构建时求值）、FUNC_NAME/PARAM_NAME 无标识符校验
2. **导出污染**（finding-05）：`exportTemplate`/`handleExportAll` 在活动 workspace 物化临时块（initSvg/render）→ BLOCK_CREATE 事件 → 自动保存/undo 栈/面板重扫

## 2. 实际采用方案

**方案 A**（owner 批准）：
- **改名传播**：def 加 `onchange`（BLOCK_CHANGE field NAME）——按事件 `oldValue` 直接匹配 call 块并同步 NAME（`mutateCallers` 按新名匹配会落空），再 `mutateCallers` 同步参数
- **删除兜底**：def 的 change listener 在 dispose 时被移除（BLOCK_DELETE 派发时 def 侧收不到）——改由 **call 块侧 onchange** 处理：BLOCK_DELETE 后校验引用名是否仍有效（allProcedures + 工作区模板 + toolbox 模板），失效则 `doValueUpdate_('')` 清空（绕过下拉选项校验，'' 可能不在选项列表）
- **下拉惰性化**：`new FieldDropdown(() => buildCallOptions(block))`——菜单打开时刷新选项（Manager 增删模板即时可见）
- **下拉缓存刷新**：FieldDropdown `getOptions(true)` 走构造时缓存——改名/删除同步前先 `getOptions(false)` 刷新（rename 路径），删除用 `doValueUpdate_` 绕过
- **标识符校验**：模板块 FUNC_NAME/PARAM_NAME 加 `identifierValidator`（`/^[A-Za-z_][A-Za-z0-9_]*$/`）
- **导出隔离**：`serializeTemplate` helper——`Events.disable()` 包裹 + 显式调用块 onchange 触发预填（事件禁用时 BLOCK_CREATE 不派发）+ 去掉 initSvg/render + dispose

## 3. 改动文件清单

| 文件 | 改动 |
|---|---|
| `src/blocks/procedure/blocks.ts` | `identifierValidator`；def `onchange`（改名传播）；call 块 `onchange`（删除兜底）+ 惰性下拉 + `domToMutation` 读 name + 缓存刷新 |
| `src/components/CryptoFunctionPanel.vue` | `serializeTemplate` 隔离导出（Events.disable + 显式 onchange） |

## 4. 验证结果

- `vue-tsc` 0 errors / `eslint` 0 errors / `vite build` ✓ / `cargo check` ✓
- **Chromium 实测**（异步事件派发，setFieldValue 后等待）：
  - 改名：def `my_func`→`renamed_func` → call NAME 跟随 `renamed_func` ✅
  - 删除：dispose def → call NAME 清空为 `''`（unnamed）✅
  - 标识符校验：`bad name!` 被拒（保持原值）、`good_name` 接受 ✅
  - 导出隔离：点击 📤 导出 → **0 个 workspace change 事件**、块数不变、导出 JSON 有效 ✅
  - 惰性下拉：`menuGenerator_` 为 function、`isOptionListDynamic()=true`、菜单选项实时刷新 ✅

## 5. 遗留事项

1. 删除兜底依赖 call 块 onchange 的异步事件派发时序（def 需已从工作区移除才自清）——实测通过；若极端时序下 def 仍在工作区，call 会保留旧名直到下次删除/刷新（与原生 Blockly 行为一致，不阻塞）
