---
doc_type: audit-finding
id: 4
title: "SBox orphaned event listener — memory leak"
severity: P1
nature: performance
confidence: high
recommendation: cs-issue
---

## 描述

`src/blocks/sbox/sbox.ts` 的 `toggleSboxTable()` 方法通过 `setTimeout(0)` 注册全局 `click` 事件监听器来检测弹窗外点击。该监听器只在用户显式调用 `toggleSboxTable()` 关闭弹窗时被移除——但如果 SBox 块被从工作区删除（dispose），监听器成为孤儿，永远不触发也无法被 GC 回收。

## 证据

**文件**: `src/blocks/sbox/sbox.ts:206-291`（`toggleSboxTable` 方法内）

核心问题：
1. 监听器通过 `setTimeout(..., 0)` 注册到 `document` 上
2. 只在 `toggleSboxTable()` 再次调用且弹窗关闭时通过 `removeEventListener` 清理
3. Blockly 的 `onchange` 或 `dispose` 回调中**没有**清理此监听器

## 影响

用户在工作区创建/删除多个 SBox 块并操作弹窗后，`document` 上累积多个孤儿事件监听器。长时间会话中内存持续增长。

## 修复方向

在 `sbox` 块定义中添加 `onchange` 监听：块被删除时调用 `removeEventListener` 清理。或使用 `AbortController` 统一管理监听器生命周期。
