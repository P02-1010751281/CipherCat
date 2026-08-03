---
doc_type: audit-finding
audit: 2026-08-01-full-project
finding_id: "security-01"
nature: security
severity: P2
confidence: medium
suggested_action: cs-refactor
status: closed
closed_by: 62e4f90b
---

# Finding 06：fs:allow-write-text-file 三目录 scope 无用户交互门槛

## 速答

`src-tauri/capabilities/default.json` 授权 `fs:allow-write-text-file`，scope 含 `$DOWNLOAD/$DESKTOP/$DOCUMENT`。写操作无强制对话框——对话框只是 UX 约定，非 ACL 强制；代码注释"路径即授权"是误解。

## 关键证据

- `src-tauri/capabilities/default.json` — `fs:allow-write-text-file` scope 三个用户目录
- `src/utils/workspace/serialization.ts` — `writeTextFile` 调用点（导出文件）

## 影响

Webview 侧被攻破（XSS/恶意 workspace 导入）后，攻击者可向用户下载/桌面/文档目录静默写入任意文本文件（含覆盖）。实际利用需先有 XSS，纵深缺口而非直接漏洞。

## 修复方向

导出走 `dialog.save()` 强制用户选择路径（fs scope 只留 dialog 相关权限），或 scope 收窄到应用专属子目录。

## 建议动作

`cs-refactor`。
