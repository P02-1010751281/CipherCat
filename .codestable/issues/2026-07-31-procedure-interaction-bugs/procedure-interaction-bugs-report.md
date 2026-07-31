---
doc_type: issue-report
issue: 2026-07-31-procedure-interaction-bugs
status: draft
issue_path: standard
severity: P2
summary: call 块缺失原生 onchange 生命周期（改名/删除后孤立）；Manager 导出在活动 workspace 物化临时块污染状态
tags: [procedure, call-block, lifecycle, panel, export]
---

# Procedure 交互缺陷（2 类）Issue Report

> 来源：审计 finding-04/05（.codestable/audits/2026-07-31-procedure-system/），owner 批准全部修复。

## 1. 问题现象

1. **call 块函数生命周期缺失**：函数改名/删除后，已存在的 call 块保留旧名（生成代码引用未定义函数）；NAME 下拉在块创建时一次性构建，Manager 新增模板不出现于已有 call 块
2. **Manager 导出污染工作区**：点击模板 📤 导出会在**活动工作区**创建临时块序列化后销毁——触发变更事件（自动保存、undo 栈、面板重扫）

## 2. 复现步骤

1. 拖出模板/定义函数 → 拖出对应 call 块 → 重命名函数（FUNC_NAME）→ 观察 call 块 NAME 与参数不跟随
2. 删除函数定义 → call 块保留 → 生成代码引用未定义函数
3. 打开 Function Manager → 点任意模板 📤 导出 → 观察工作区触发 change 事件（自动保存/undo 污染）

复现频率：稳定（代码路径确定）。

## 3. 期望 vs 实际

**期望行为**：
1. 函数改名/删除时 call 块同步更新或明确失效提示；下拉动态反映最新可用函数
2. 导出是无副作用的操作，不触碰活动工作区状态

**实际行为**：
1. call 块 NAME 静态化（`buildCallOptions` 在 `new FieldDropdown(...)` 时求值一次）；无 rename/delete 联动；`FUNC_NAME` 自由文本无标识符校验（空格/非法字符可入）
2. `exportTemplate`/`handleExportAll` 用 `ws.newBlock(type)` 在活动 workspace 创建临时块

## 4. 环境信息

- 涉及模块 / 功能：procedure call 块生命周期（`src/blocks/procedure/blocks.ts:322-333,342-345,377-386`）；Function Manager 导出（`src/components/CryptoFunctionPanel.vue:178-188,207-220`）
- 相关文件 / 函数：`blocks.ts`（`buildCallOptions`/`syncCallParams`/call 块定义）、`CryptoFunctionPanel.vue`（`exportTemplate`/`handleExportAll`）
- 运行环境：dev
- 其他上下文：旧审计 finding-04（medium）/ finding-05（medium）；call 块下拉范围已在 finding-03 修复轮收紧（workspace 函数 + 拖出模板 + toolbox 模板）

## 5. 严重程度

**P2** — 非核心功能受损：函数改名/删除是 procedure 工作流常态操作，孤立 call 导致生成代码与工作区不一致（教学场景困惑）；导出污染为状态副作用。快速通道判定：fix points > 2、跨模块 → 标准路径。

## 备注

- 修复方向：call 块补 onchange（监听改名/删除刷新 NAME+参数）；FUNC_NAME 加 validator；下拉动态刷新；导出改用独立临时 `Blockly.Workspace` 序列化
