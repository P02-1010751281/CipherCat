---
doc_type: issue-analysis
issue: 2026-07-31-procedure-interaction-bugs
status: draft
root_cause_type: logic
related: [procedure-interaction-bugs-report.md]
tags: [procedure, call-block, lifecycle, export]
---

# Procedure 交互缺陷（2 类）根因分析

## 1. 问题定位

| 关键位置 | 说明 |
|---|---|
| `src/blocks/procedure/blocks.ts:378` | call 块 NAME 下拉 `new FieldDropdown(buildCallOptions(this))`——**构建时求值一次**，之后选项冻结 |
| `src/blocks/procedure/blocks.ts:452-469` | call 块 `domToMutation` **不读取 mutation 的 name 属性**——改名无法经 mutateCallers 传到 call 块 |
| `src/blocks/procedure/blocks.ts` makeDefBlock | def 块 **无 onchange**——NAME 字段改名（BLOCK_RENAME）不触发 mutateCallers |
| `src/blocks/procedure/blocks.ts:799-806` | 模板块 FUNC_NAME/PARAM_NAME 用裸 FieldTextInput，无标识符校验 |
| `src/components/CryptoFunctionPanel.vue:178-188,207-220` | `exportTemplate`/`handleExportAll` 在**活动 workspace** 创建临时块（initSvg/render）→ 触发 BLOCK_CREATE → 变更事件/自动保存/undo 污染 |

## 2. 失败路径还原

**正常路径**：函数改名 → def 通知 callers → call NAME 更新；导出无副作用。

**失败路径**：
1. 改 def NAME → 无 onchange 监听 BLOCK_RENAME → mutateCallers 不触发；即使触发，call `domToMutation` 忽略 name → call 块 NAME 保持旧值（生成代码引用已改名函数）
2. Manager ＋📦 新模板 → 已有 call 块下拉选项冻结（buildCallOptions 一次性）
3. 导出 → 活动 ws 临时块 → BLOCK_CREATE 事件 → onWorkspaceChanged 自动保存 + undo 栈污染 + panel 重扫

**分叉点**：均为确定路径。

## 3. 根因

**根因类型**：logic（+ missing-guard）

**根因描述**：
1. call 块缺失生命周期联动——def 无 onchange（BLOCK_RENAME 不传播）、call `domToMutation` 忽略 name、下拉一次性构建
2. 导出复用活动 workspace 而非隔离序列化环境

**是否有多个根因**：是（两个独立成因）。

## 4. 影响面

- **影响范围**：procedure 工作流（改名/删除/导出为常态操作）
- **潜在受害模块**：代码生成（孤立 call 引用未定义函数）；自动保存（导出触发伪变更）
- **数据完整性风险**：有——导出污染 undo/自动保存状态（finding-05）
- **严重程度复核**：维持 P2

## 5. 修复方案

### 方案 A（推荐）：生命周期联动 + 隔离导出

- **做什么**：
  1. def 块加 `onchange`：`BLOCK_RENAME`（本块 NAME 变更）→ `Blockly.Procedures.mutateCallers(this)`；`BLOCK_DELETE`（本块删除）→ 遍历 callers 将 NAME 置空（'unnamed'，明确失效而非静默幽灵）
  2. def `mutationToDom(true)` 已带 name 属性（:151 ✓），补 call `domToMutation` 读取 name → `setFieldValue`
  3. call 块 NAME 下拉改惰性生成：`new FieldDropdown(() => buildCallOptions(block))`——打开菜单时重建选项（Manager 增删模板即时可见）
  4. 模板块 FUNC_NAME/PARAM_NAME 加标识符 validator（`/^[A-Za-z_][A-Za-z0-9_]*$/`，非法输入拒绝）
  5. 导出：`exportTemplate`/`handleExportAll` 改为 `Blockly.Events.disable()` 包裹 + 显式调用块 onchange 触发预填（事件禁用时 BLOCK_CREATE 不派发）+ 去掉 initSvg/render（免视觉闪现）+ dispose——导出内容不变（含预填链），零活动 workspace 副作用
- **优点**：根治改名/删除/下拉冻结/导出污染四问题；导出内容与现行为一致
- **缺点 / 风险**：涉及 def/call 块生命周期语义（需对照 Blockly 12.5 原生行为验证）；导出预填需显式 onchange 调用（事件禁用绕过）
- **影响面**：`src/blocks/procedure/blocks.ts`、`src/components/CryptoFunctionPanel.vue`

### 方案 B：最小化（仅修导出 + 惰性下拉）

- **做什么**：只做 3（惰性下拉）+ 5（隔离导出）；不改 def onchange / call domToMutation / 不校验
- **优点**：改动小
- **缺点 / 风险**：改名仍不传播（finding-04 核心未治）；无标识符校验
- **影响面**：同上

### 推荐方案

**推荐方案 A**：根治 finding-04/05 全部现象；改动集中在 procedure 块生命周期 + panel 导出两处，行为等价可验证（改名/删除/导出浏览器实测 + vue-tsc/build）。
