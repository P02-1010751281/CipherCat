---
doc_type: issue-report
issue: 2026-07-31-app-timer-orphan
status: confirmed
issue_path: fast-track
severity: P2
summary: changeBlocklyLocale 外层 setTimeout 未纳入 toastTimer 管理，组件卸载后产生孤儿定时器
tags: [performance, timer, App]
---

# 孤儿定时器 Issue Report

> 来源：审计 finding-13（.codestable/audits/2026-07-31-procedure-system/），owner 批准全部修复。

## 1. 问题现象

`changeBlocklyLocale` 的 50ms 外层 `setTimeout` 未赋值给 `toastTimer`；若切换语言后 50ms 内组件卸载，回调在已卸载组件上创建 2s 定时器且永不被清除。toast 竞态主体已修复（各路径先 clearTimeout），仅此外层定时器遗漏。

## 2. 复现步骤

切换语言 → 50ms 内卸载组件（路由离开）→ 外层回调执行并创建 2s 定时器 → onUnmounted 已执行，定时器无清理路径。无 DOM 可见影响（模式缺陷）。

复现频率：极端时序（低概率，无用户可见症状）。

## 3. 期望 vs 实际

**期望行为**：所有定时器纳入 `toastTimer` 统一管理，卸载时全部清理。

**实际行为**：外层 `setTimeout`（`src/App.vue:291-298`）不存 toastTimer，`onUnmounted`（:572-584）只清内层。

## 4. 环境信息

- 涉及模块 / 功能：App.vue 语言切换 toast
- 相关文件 / 函数：`src/App.vue:291-298`（外层 setTimeout）、`src/App.vue:572-584`（onUnmounted）
- 运行环境：dev
- 其他上下文：审计 finding-13（low）；旧 #18（toast 竞态）主体已修

## 5. 严重程度

**P2** — 模式缺陷，低影响（无 DOM 症状）。快速通道判定：根因明确（file:line）、fix points = 1（外层 setTimeout 存入 toastTimer 或改内部函数统一管理）、无跨模块 → **可走快速通道**（待 owner 批准）。

## 备注

- 修复方向：外层 setTimeout 返回值存入 toastTimer，或改为 toastTimer 链式管理
