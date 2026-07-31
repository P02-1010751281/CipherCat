---
doc_type: audit-finding
audit: 2026-07-31-procedure-system
finding_id: "maintainability-05"
nature: maintainability
severity: P2
confidence: medium
suggested_action: cs-refactor
status: open
---

# Finding 18：Metacrypto 品牌迁移未完成（旧 #14 未关）

## 速答

项目已从"薛定喵/CipherCat"迁移到 Metacrypto，但 Tauri 产物名与多文档仍为 CipherCat——安装产物、文档、索引品牌不一致。

## 关键证据

- `src-tauri/tauri.conf.json:3` — `productName` 仍为 "CipherCat"
- `docs/blocks/INDEX.md:1` 等文档品牌未迁移；薛定喵残留仅 `docs/SYNC-PLAN.md:5` 一处
- 旧审计 full-project #14 open

## 影响

发布产物与项目名不符；跨文档检索品牌关键词遗漏。

## 修复方向

统一 productName 与文档品牌为 Metacrypto（保留 discussion_log 历史称呼）。

## 建议动作

`cs-refactor`，因为是批量改名（tauri.conf.json + docs）。
