---
doc_type: audit-finding
audit: 2026-08-01-full-project
finding_id: "performance-03"
nature: performance
severity: P2
confidence: high
suggested_action: cs-refactor
status: closed
closed_by: 62e4f90b
---

# Finding 12：buildCallOptions 每次下拉打开全量重建函数列表

## 速答

call 块 NAME 用 `new Blockly.FieldDropdown(() => buildCallOptions(block))`（惰性生成器），每次打开下拉都执行全量扫描：`allProcedures`（内部遍历 def 块）+ `getAllBlocks(false)` + filter/map + new Set + 数组拼接。改名一个 def 时 mutateCallers 对每个 call 块强制 getOptions(false) 重建再 setFieldValue，O(M×N)。

## 关键证据

- `src/blocks/procedure/blocks.ts:354-371` — buildCallOptions 全量扫描
- `src/blocks/procedure/blocks.ts:412` — FieldDropdown 惰性生成器每次打开执行
- `src/blocks/procedure/blocks.ts:324/495/498/529` — 改名/清理/domToMutation 强制 getOptions(false) 触发重建

## 影响

procedure 密集工作区每次点开 call 下拉全量 O(N)；改名级联 O(M×N)。交互卡顿。

## 修复方向

选项生成器按 workspace 缓存（事件驱动失效），或惰性增量 diff。

## 建议动作

`cs-refactor`。
