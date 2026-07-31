---
doc_type: audit-finding
audit: 2026-07-31-procedure-system
finding_id: "performance-04"
nature: performance
severity: P2
confidence: low
suggested_action: cs-issue
status: closed
closed_by: cs-issue 2026-07-31-app-timer-orphan
---

# Finding 13：changeBlocklyLocale 外层 setTimeout 未纳入 toastTimer 管理（旧 #18 残留）

## 速答

`changeBlocklyLocale` 的 50ms 外层 `setTimeout` 未赋值给 `toastTimer`；若切换语言后 50ms 内组件卸载，回调在已卸载组件上创建 2s 定时器且永不被清除。toast 竞态主体已修复（各路径先 clearTimeout），仅此外层定时器遗漏。

## 关键证据

- `src/App.vue:291-298` — 外层 `setTimeout(() => { toastMessage.value = ...; toastTimer = window.setTimeout(..., 2000); }, 50)`；外层不存 toastTimer
- `src/App.vue:572-584` — onUnmounted 只清 toastTimer（内层）

## 影响

极端时序下孤儿定时器（无 DOM 影响，模式缺陷）；低影响。

## 修复方向

外层 setTimeout 存入 toastTimer，或改由内部函数统一管理。

## 建议动作

`cs-issue`，因为是小范围定时器管理缺陷。
