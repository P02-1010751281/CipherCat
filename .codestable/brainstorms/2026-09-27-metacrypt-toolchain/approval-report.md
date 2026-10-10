---
doc_type: approval-report
unit: .codestable/brainstorms/2026-09-27-metacrypt-toolchain
status: accepted
reason: route-choice
approvals:
  package-manager: approved-pnpm
approval_groups: {}
created_at: 2026-09-27
---

# Metacrypt 前端工具链升级：包管理器决策

## Decision History

- 2026-09-27：owner 回复“ok继续吧”，接受采用 pnpm 作为唯一包管理器及锁文件入口。

## Accepted Decision

- **package-manager**：pnpm；`frontend/pnpm-lock.yaml` 为唯一跟踪的锁文件。

## Why Now

仓库提交了 `frontend/pnpm-lock.yaml`，但忽略 `frontend/package-lock.json`；Dockerfile 却要求复制后者并运行 `npm install`。这会使干净检出缺少可复现的依赖入口，升级版本前必须先统一。

## Context

本次主线升级目标是 `metacrypt_server/frontend` 的 Vue/Vite/TypeScript 工具链，不替换 Vue 或 Flask。CipherCat 只做只读版本核对。

## Options

1. **改用 pnpm（推荐）**：保留已提交的 pnpm 锁文件作为唯一来源；为项目固定 pnpm 版本，并同步调整 Docker 构建和安装文档，使用冻结锁文件安装。
2. **改用 npm**：把 npm 锁文件纳入版本控制作为唯一来源，并调整或移除 pnpm 锁文件及其使用说明。

## Recommendation

选择 pnpm。仓库当前唯一提交的锁文件就是 `pnpm-lock.yaml`；按它收敛最少偏离已提交依赖状态。Docker 与 README 中的 npm 步骤视为需要同步修正的历史入口。

## Risks And Tradeoffs

- 选 pnpm 需要在容器构建中固定并启用 pnpm，变更安装命令；但能让本地与容器共享同一锁文件。
- 选 npm 则需要明确纳入并维护 npm 锁文件，同时处理现有 pnpm 锁文件，迁移面更大。

## Non-Automatic Actions

无论选择哪项，本决策都不授权提交或推送；CipherCat 依赖也不会因这次核对自动改动。依赖升级将在对应方案确认后分阶段实施并逐阶段验证。

## Follow-up

分阶段升级方案已记录在 `metacrypt_server/.codestable/epics/frontend-toolchain-mainline.md`；这份选择记录不授权提交或推送。
