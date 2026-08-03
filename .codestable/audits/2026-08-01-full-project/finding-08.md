---
doc_type: audit-finding
audit: 2026-08-01-full-project
finding_id: "security-03"
nature: security
severity: P2
confidence: low
suggested_action: cs-refactor
status: closed
closed_by: 62e4f90b
---

# Finding 08：CSP meta+config 双处重复定义，缺 base-uri/object-src 硬化

## 速答

CSP 在 `index.html` meta 与 `tauri.conf.json` 各定义一份，交集生效但存在漂移风险（改一处漏另一处）；两处均缺 `base-uri`/`object-src` 指令。

## 关键证据

- `index.html` — `<meta http-equiv="Content-Security-Policy">`
- `src-tauri/tauri.conf.json` — `app.security.csp` 第二处定义；`devtools:false`

## 影响

当前 default-src 'self' 已挡住大多数向量，双定义属维护性漂移风险而非直接漏洞；`base-uri`/`object-src` 缺失是纵深硬化缺口。

## 修复方向

合并为单一来源（保留 tauri.conf.json，meta 删除或反之），补 `base-uri 'none'` + `object-src 'none'`。

## 建议动作

`cs-refactor`。
