---
doc_type: audit-finding
audit: 2026-09-12-ciphercat-full-review
id: CC-20260912-04
dimension: security/docs-api
severity: P1
confidence: high
status: resolved
recommendation: cs-docs
---

# CC-20260912-04 前端试运行与可信测评边界

## 证据

- 前端仓库包含生成代码和本地 demo harness；[`package.json:31-35`](/run/media/user/6b058d20-a617-484d-b7c6-cd7146baf77c/package.json:31)的验证命令属于开发回归。
- [`RULES.md:88-92`](/run/media/user/6b058d20-a617-484d-b7c6-cd7146baf77c/RULES.md:88)和 [`docs/standards/papers/README.md:8-13`](/run/media/user/6b058d20-a617-484d-b7c6-cd7146baf77c/docs/standards/papers/README.md:8)明确：随机性样本、统计测评、隔离执行和最终报告由 `metacrypt_server` 后端完成。

## 影响

如果 UI 结果被称为“可信测评”或“平台评分”，会把选定向量回归误读为熵源统计、CAVP/ACVTS 或 CMVP/FIPS 140-3 证据。

## 处理

已在工程规则、标准覆盖矩阵、开发指南、审计报告和研究文档中写明执行面和保证分层；后续任何 UI/README 文案都必须沿用“用户试运行”和“后端可信测评”的术语。
