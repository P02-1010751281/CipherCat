---
doc_type: audit-finding
audit: 2026-07-31-procedure-system
finding_id: "security-02"
nature: security
severity: P2
confidence: medium
suggested_action: cs-issue
status: open
---

# Finding 07：文件系统写权限过宽（$HOME/**）+ withGlobalTauri + 跳过保存对话框

## 速答

capabilities 允许 `fs:allow-write-text-file` 到 `$HOME/**`（含 DOWNLOAD/DESKTOP/DOCUMENT），配合 `withGlobalTauri: true` 暴露 `window.__TAURI__`，且前端 `lastExportPath` 缓存使后续导出**跳过保存对话框直接覆写**——XSS 场景下可静默覆写任意家目录文件（纵深防御缺口）。

## 关键证据

- `src-tauri/capabilities/default.json:9-15` — `fs:allow-write-text-file` 允许 `$HOME/**` 写入（无 read）
- `src-tauri/tauri.conf.json` — `withGlobalTauri: true`
- `src/utils/workspace/serialization.ts` — `lastExportPath` 缓存，后续导出跳过 dialog 直接 `writeTextFile`
- 缓解：CSP 全指令启用 + DOMPurify 净化已使前端注入当前难以触发（旧 #2/#3 已修），本条属纵深防御

## 影响

若任何前端漏洞被利用，攻击者可覆写用户家目录任意文本文件；教学平台资产含本地工作区 JSON。

## 修复方向

写权限收敛到应用数据目录（如 `$APPDATA`/`$DOCUMENT` 白名单），移除 `lastExportPath` 无确认覆写，评估关闭 `withGlobalTauri`（改用 `@tauri-apps/api` import）。

## 建议动作

`cs-issue`，因为权限边界收紧属安全修复，涉及 capabilities + serialization.ts 协同。
