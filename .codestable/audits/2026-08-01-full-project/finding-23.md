---
doc_type: audit-finding
audit: 2026-08-01-full-project
finding_id: "docs-api-04"
nature: docs-api
severity: P2
confidence: medium
suggested_action: cs-issue
status: closed
closed_by: 88619d47
---

# Finding 23：根 README 目录结构/技术栈过时（core/、SHA-1 等）

## 速答

根 README（57-95 行）描述的项目结构（blocks/core/、number-theory/、api/）与技术栈（SHA-1、随机数生成器）与当前实现不符——块实际按 bitwise/logic/sbox/data/symmetric/hash/numtheory/ecc/post-quantum/array/ctrl/procedure 分类，无 SHA-1 内容。

## 关键证据

- `README.md:57-95` — 目录结构/技术栈描述过时
- 实际：`src/blocks/` 13 个子类目；无 SHA-1 块（hash/ 下为 SHA-2/SHA-3/SM3）

## 影响

新用户按 README 了解项目形态即被误导；README 是项目门面，失真影响最大。

## 修复方向

重写 README 项目结构/技术栈节，对齐当前类目与能力；同步品牌名（Metacrypto 迁移见 finding-24）。

## 建议动作

`cs-issue`（文档同步批次）。
