---
doc_type: audit-finding
audit: 2026-07-31-procedure-system
finding_id: "security-01"
nature: security
severity: P1
confidence: high
suggested_action: cs-issue
status: closed
closed_by: 2026-07-31-dead-save-workspace-ipc
---

# Finding 06：死代码 IPC 命令 save_workspace 是多余攻击面，rx.recv() 可永久阻塞

## 速答

`save_workspace` 命令注册于 invoke_handler 但前端从未调用（死代码）；其 `rx.recv()` 无超时等待，且是无界 `String` 参数——多余攻击面 + 潜在永久阻塞。

## 关键证据

- `src-tauri/src/lib.rs:6,28` — `save_workspace(content: String)`：`content` 无大小上限，`std::fs::write` 直接落盘
- `src-tauri/src/lib.rs:42` — `run().expect(...)` 为 crate 内唯一 panic 路径（标准 Tauri 样板，可接受）
- 前端全仓 grep 无 `invoke('save_workspace')`；实际保存走 plugin-dialog + plugin-fs（`serialization.ts`）
- 旧审计 full-project #23（无界 String）关联

## 影响

IPC 桥每多一个命令就多一份 Tauri 侧攻击面（CSP/净化被绕过时的纵深依赖）；无界参数 + 无超时阻塞是明显缺陷。当前无调用方，属于应删除的债务。

## 修复方向

删除 `save_workspace` 命令及其 invoke_handler 注册（或前端改用后加参数校验与超时）。

## 建议动作

`cs-issue`，因为死代码 + 明确缺陷，删除即可，无行为影响。
