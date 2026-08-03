---
doc_type: audit-finding
audit: 2026-08-01-full-project
finding_id: "performance-04"
nature: performance
severity: P2
confidence: medium
suggested_action: cs-issue
status: closed
closed_by: 62e4f90b
---

# Finding 13：sbox 表格弹窗 document click listener + DOM 在 events-disabled clear/dispose 时泄漏

## 速答

sbox 弹窗清理只挂在 `BLOCK_DELETE` 事件的 onchange 上；加载/导入路径在 `Blockly.Events.disable()` 下 `workspace.clear()` 不发事件，BlocklyEditor dispose 也不清 → 弹窗开着时打开新项目/导入/组件卸载，document 级 click listener + body 上 popup DOM 永久残留（closure 持有 popup）。每次 locale 切换/导入累积一个 listener。

## 关键证据

- `src/blocks/sbox/sbox.ts:296-300` — `setTimeout(() => document.addEventListener('click', handler))`
- `src/blocks/sbox/sbox.ts:97-107` — 清理仅挂在 BLOCK_DELETE
- `src/utils/workspace/serialization.ts:174-176/483-485` — events-disabled 下 `workspace.clear()`

## 影响

低频（需弹窗开着时 clear/dispose）但后果是 document listener 累积泄漏，长时间会话内存增长。

## 修复方向

清理改由 `this.dispose`/destroy 钩子或 workspace FINISHED_LOADING 兜底，不依赖事件派发。

## 建议动作

`cs-issue`。
