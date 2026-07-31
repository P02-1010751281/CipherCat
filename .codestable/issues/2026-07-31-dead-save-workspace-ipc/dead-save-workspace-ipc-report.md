---
doc_type: issue-report
issue: 2026-07-31-dead-save-workspace-ipc
status: confirmed
issue_path: fast-track
severity: P1
summary: 死代码 IPC 命令 save_workspace（前端未调用，无界参数 + rx.recv() 无超时）是多余攻击面
tags: [security, tauri, ipc, dead-code]
---

# 死代码 IPC save_workspace Issue Report

> 来源：审计 finding-06（.codestable/audits/2026-07-31-procedure-system/），owner 已批准修复。

## 1. 问题现象

Tauri `save_workspace` 命令注册于 invoke_handler，但前端从未调用（死代码）。命令接受无界 `String` 参数并直接 `std::fs::write`，且 `rx.recv()` 无超时等待——多余攻击面 + 潜在永久阻塞 + 无界输入。

## 2. 复现步骤

死代码不产生用户可见现象，无复现步骤。风险性质：
1. 攻击面：IPC 桥每多一个命令多一份 Tauri 侧暴露（当前 CSP+净化缓解，纵深依赖）
2. 若被调用：`content` 无大小上限；`rx.recv()` 等待可永久阻塞命令线程

复现频率：N/A（死代码）。

## 3. 期望 vs 实际

**期望行为**：不存在的功能不应注册为 IPC 命令；攻击面最小化。

**实际行为**：`save_workspace` 仍在 `invoke_handler` 注册（`src-tauri/src/lib.rs`），参数无界、接收无超时。

## 4. 环境信息

- 涉及模块 / 功能：src-tauri IPC（实际保存走 plugin-dialog + plugin-fs）
- 相关文件 / 函数：`src-tauri/src/lib.rs:6,28,42`（`save_workspace` 定义 + `invoke_handler` 注册）；`src/utils/workspace/serialization.ts`（前端实际保存路径）
- 运行环境：dev / 生产构建均含
- 其他上下文：旧审计 full-project #23（无界 String）与 #22（.expect()）关联；前端全仓 grep 无 `invoke('save_workspace')`

## 5. 严重程度

**P1** — 审计定级：死代码 + 明确缺陷（无界参数、无超时阻塞），删除即可无行为影响。快速通道判定：根因明确（file:line）、fix points ≤ 2（删命令 + 注册）、无跨模块风险（仅 src-tauri）→ **可走快速通道**（待 owner 批准）。

## 备注

- 审计 finding-06（high）为证据来源
- 修复方向：删除 `save_workspace` 命令与 invoke_handler 注册；`cargo check` 验证
