---
doc_type: audit-finding
audit: 2026-08-01-full-project
finding_id: "performance-01"
nature: performance
severity: P2
confidence: high
suggested_action: cs-refactor
---

# Finding 10：call 块 onchange BLOCK_DELETE 触发 O(M×N) 全工作区孤儿扫描

## 速答

每个 `procedures_callreturn/callnoreturn` 实例经 Blockly `setOnChange` 注册为 workspace 级 listener，每个事件都先跑 guard；BLOCK_DELETE 时每个 call 块对全工作区执行 `allProcedures` + `getAllBlocks(false)` + filter/map/includes。删除 K 块堆栈 = K×M×N 次块访问，主线程 20-80ms 卡顿。

## 关键证据

- `src/blocks/procedure/blocks.ts:476-509` — onchange 内 BLOCK_DELETE 分支全量扫描
- `src/blocks/procedure/blocks.ts:318-328` — def 改名同样逐 call 块 `getOptions(false)` + setFieldValue 重扫
- blockly.min.js:982/994 — `setOnChange` 包装成 workspace 级 listener 的机制实证

## 影响

删除是高频交互（拖垃圾桶/多选删除）；N=200、M=20、K=10 时约 4 万次块访问。procedure 密集工作区删除明显卡顿。

## 修复方向

缓存工作区函数名集合（def/template BLOCK_CREATE/DELETE/CHANGE 时失效），孤儿清理惰性/单次扫描，或至少复用一次 `allProcedures` 结果。

## 建议动作

`cs-refactor`。
