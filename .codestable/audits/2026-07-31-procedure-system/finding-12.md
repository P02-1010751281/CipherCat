---
doc_type: audit-finding
audit: 2026-07-31-procedure-system
finding_id: "performance-03"
nature: performance
severity: P2
confidence: low
suggested_action: cs-refactor
status: closed
closed_by: refactor 2026-07-31-perf-optimizations
---

# Finding 12：分割条拖拽每次 mousemove 强制回流，rAF 仅节流 Blockly resize

## 速答

`onSplitDragMove` 每次 mousemove 调 `getBoundingClientRect()`（强制回流）+ 两次响应式写入；rAF 节流只覆盖 `resizeWorkspace`，布局计算本身未节流。

## 关键证据

- `src/App.vue:537-561` — `const rect = container.getBoundingClientRect();`（每次 mousemove 布局读）+ `topHeight.value/rightWidth.value` 直接写入；`if (!rafId) { ... resizeWorkspace }` 仅包 Blockly resize
- 拖拽起点处 container rect 不变（可缓存）；高刷新率设备 mousemove 可达 120Hz+

## 影响

拖拽期间持续强制回流与重渲染，高刷新率设备上可感知卡顿。

## 修复方向

拖拽起点缓存 rect；整个 handler 体 rAF 节流。

## 建议动作

`cs-refactor`，因为是性能微优化。
