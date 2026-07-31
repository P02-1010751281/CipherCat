---
doc_type: issue-fix
issue: 2026-07-31-app-timer-orphan
status: confirmed
path: fast-track
fix_date: 2026-07-31
related: [app-timer-orphan-report.md]
tags: [performance, timer, App]
---

# 孤儿定时器修复记录

## 1. 问题描述

`changeBlocklyLocale` 外层 50ms `setTimeout` 未纳入 `toastTimer` 管理；组件卸载后回调执行会创建永不被清理的 2s 定时器（审计 finding-13）。

## 2. 根因

`src/App.vue:291` — 外层 `setTimeout(...)` 未赋值给 `toastTimer`；`onUnmounted`（:572-584）只清理 `toastTimer`。

## 3. 修复方案

外层 setTimeout 返回值存入 `toastTimer`（内层逻辑不变；内层回调开始时对已执行完的外层定时器 clearTimeout 为无害 no-op，随后重新赋值内层）。

## 4. 改动文件清单

- `src/App.vue:291` — `setTimeout(...)` → `toastTimer = window.setTimeout(...)`

## 5. 验证结果

- `vue-tsc --noEmit` ✅ 0 errors；`eslint` ✅ 0 errors（1 个既有 no-console warning）
- 定时器链核对：外层存入 toastTimer → onUnmounted 可清理外层；内层逻辑未动（toast 行为不变）

## 6. 遗留事项

none
