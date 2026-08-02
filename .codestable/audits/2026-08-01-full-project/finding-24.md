---
doc_type: audit-finding
audit: 2026-08-01-full-project
finding_id: "docs-api-05"
nature: docs-api
severity: P2
confidence: medium
suggested_action: cs-issue
status: closed
closed_by: 88619d47
---

# Finding 24：Metacrypto 品牌残留侵入 CipherCat 文档与源码头注释

## 速答

品牌迁移（2026-07-31 brand-migration 将 CipherCat→Metacrypto）反向侵入：CipherCat 仓库的 `docs/blocks/INDEX.md:1` 标题与 `src/constants/block-types.ts:2` 文件头注释为 "Metacrypto"。两仓库共享 Blockly 核心（sync-to-metacrypt.sh 单向 CipherCat→metacrypt），品牌方向搞反。

## 关键证据

- `docs/blocks/INDEX.md:1` — "Metacrypto" 标题（CipherCat 文档）
- `src/constants/block-types.ts:2` — 源码头注释 "Metacrypto"
- 对照：CipherCat 根 README/文档主体仍为 CipherCat 品牌；brand-migration 改的是 metacrypt_server 侧

## 影响

品牌混淆：用户分不清两个项目归属；CipherCat 是教学版独立品牌，被误标为 Metacrypto。

## 修复方向

CipherCat 侧恢复 CipherCat 品牌（INDEX.md 标题、block-types.ts 头注释），确认 sync 脚本不做品牌替换。

## 建议动作

`cs-issue`（文档同步批次）。
