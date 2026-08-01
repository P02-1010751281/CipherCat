---
doc_type: audit-finding
audit: 2026-08-01-full-project
finding_id: "security-04"
nature: security
severity: P2
confidence: low
suggested_action: cs-refactor
---

# Finding 09：密码学工作区数据明文落盘 IndexedDB 与导出文件

## 速答

密钥类块（AES key、S-box 等）以明文 XML 存 IndexedDB（`useProjectDB`），导出 JSON 亦明文。桌面端本地存储对同机用户无保护。

## 关键证据

- `src/composables/useProjectDB.ts` — IndexedDB 明文存储 workspace XML
- 导出 JSON/文件路径 — 明文序列化

## 影响

教学场景密钥多为演示值，风险有限；但同机其他用户/恶意软件可读。属"已知并接受的本地存储设计"，加固价值低，标注即可。

## 修复方向

如需加固：敏感块类型落盘前加密（WebCrypto AES-GCM，密钥存系统 keyring），或至少 UI 明示"演示密钥不清真"。优先级低。

## 建议动作

`cs-refactor`（可选，低优先）。
