---
doc_type: audit-finding
audit: 2026-08-01-full-project
finding_id: "performance-02"
nature: performance
severity: P2
confidence: high
suggested_action: cs-refactor
status: closed
closed_by: 62e4f90b
---

# Finding 11：加载路径双重全树遍历 + 20+ console.log 诊断残留

## 速答

打开含 legacy sbox 的项目 JSON 共做 migrateJsonState（stringify+~48 正则+parse+≥4 次全树递归）→ detectLegacySboxFormat（全树）→ collectSboxFieldValues（再全树）。每 sbox 块 5 处 console.log，16 块 ≈ 120+ 条，devtools 打开时每条带 Map/数组格式化开销；成功路径也打日志。

## 关键证据

- `src/utils/workspace/serialization.ts:295-347` — `fixSboxFieldsAfterLoad` 5 处 console.log + `[...fields.entries()].slice(0,3)` 分配
- `src/utils/workspace/serialization.ts:362-433` — `collectSboxFieldValues` 递归全树 + 每块 5-8 处 console.log
- `src/utils/workspace/serialization.ts:489-497` — loadJson 先 detect 再 fix 两次全树
- `src/utils/workspace/serialization.ts:179` — loadXml 无条件 getAllBlocks

## 影响

每次打开项目/导入都付双重遍历 + 日志开销；诊断残留污染生产日志。

## 修复方向

console.log 删/降级（gated debug 开关）；legacy 检测与字段收集合并单次遍历。

## 建议动作

`cs-refactor`。
