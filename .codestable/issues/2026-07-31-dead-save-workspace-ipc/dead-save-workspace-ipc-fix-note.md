---
doc_type: issue-fix
issue: 2026-07-31-dead-save-workspace-ipc
status: confirmed
path: fast-track
fix_date: 2026-07-31
related: [dead-save-workspace-ipc-report.md]
tags: [security, tauri, dead-code]
---

# 死代码 IPC save_workspace 修复记录

## 1. 问题描述

`save_workspace` Tauri 命令注册于 invoke_handler 但前端从未调用；接受无界 `String` 参数、`rx.recv()` 无超时等待——多余攻击面 + 潜在永久阻塞（审计 finding-06，P1）。

## 2. 根因

`src-tauri/src/lib.rs:3-33` 历史遗留命令（早期保存路径），前端已迁移至 plugin-dialog + plugin-fs（`serialization.ts`），命令从未删除。

## 3. 修复方案

删除死代码：命令定义（:3-33）、`DialogExt` import（:1）、`invoke_handler` 注册（:40）。保留 `tauri_plugin_dialog::init()` / `tauri_plugin_fs::init()`（前端仍在用）。

## 4. 改动文件清单

- `src-tauri/src/lib.rs` — 删除 `save_workspace` 命令 + `use tauri_plugin_dialog::DialogExt` + `.invoke_handler(...)` 行

## 5. 验证结果

- `cargo check`（src-tauri）：✅ Finished dev profile in 44.88s，0 errors 0 warnings
- 全仓 grep `save_workspace`：src/ + src-tauri/（除 target/）零匹配，无残留引用
- 前端保存路径不受影响（plugin-dialog + plugin-fs 未动）

## 6. 遗留事项

none（死代码删除无行为影响；`.expect()` 标准样板保留，低优先）。
