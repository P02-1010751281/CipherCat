---
doc_type: audit-finding
audit: 2026-07-31-procedure-system
finding_id: "bug-05"
nature: bug
severity: P2
confidence: medium
suggested_action: cs-issue
status: closed
closed_by: cs-issue 2026-07-31-procedure-interaction-bugs
---

# Finding 05：Function Manager 导出在活动 workspace 物化临时块，污染 undo/变更状态

## 速答

`exportTemplate`/`handleExportAll` 用 `ws.newBlock(type)` 在**活动工作区**创建临时块来序列化，触发变更事件与 change listener（自动保存、面板重扫、undo 栈）——导出操作本身污染用户工作区状态。

## 关键证据

- `src/components/CryptoFunctionPanel.vue:178-188` — `exportTemplate`: `ws.newBlock(type)` → initSvg/render → serialize → `dispose(false)`
- `src/components/CryptoFunctionPanel.vue:207-220` — `handleExportAll` 循环 28 个类型同样物化临时块
- `src/App.vue` onWorkspaceChanged → 自动保存；Panel 自身 change listener → `refreshWsFuncs` 全量重扫

## 影响

用户点击导出后可能触发意外自动保存、undo 历史含幽灵块、面板列表抖动。导出是无副作用期望的操作。

## 修复方向

序列化不依赖活动 workspace：用 `new Blockly.Workspace()` 独立临时 workspace 创建/序列化后 dispose，或直接构造块 JSON state。

## 建议动作

`cs-issue`，因为确定触发的状态污染，修复范围小（panel 内部）。
