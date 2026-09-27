---
doc_type: audit-finding
audit: 2026-09-12-ciphercat-full-review
id: CC-20260912-03
dimension: standards/docs
severity: P2
confidence: high
status: mitigated
recommendation: cs-docs
---

# CC-20260912-03 标准证据元数据尚未完全统一

## 证据

- [`docs/standards/COVERAGE.md:8-18`](/run/media/user/6b058d20-a617-484d-b7c6-cd7146baf77c/docs/standards/COVERAGE.md:8)已规定版本、来源、向量、errata、实现状态和安全边界的口径，但 37 个算法目录的 README 仍有“需手动下载”、仅给仓库地址或缺少明确向量出处的情况，例如 [`gbt36624-aead/README.md:1-12`](/run/media/user/6b058d20-a617-484d-b7c6-cd7146baf77c/docs/standards/gbt36624-aead/README.md:1)。
- 现在的 [`docs/standards/standards-manifest.json`](/run/media/user/6b058d20-a617-484d-b7c6-cd7146baf77c/docs/standards/standards-manifest.json)统一记录 37 个目录的标准身份、版本、状态、来源 URL、来源核对日期、Errata 状态/URL 和本地 PDF SHA-256，并由 `npm run standards:check` 校验。
- 逐目录的官方向量来源、实现状态和安全边界仍主要保留在 README/COVERAGE 中，尚未全部结构化；`errata_status=tracked` 的语义限定为“已记录 URL”，因此本发现保留为 mitigated。

## 影响

读者可能把“有 standards 目录”误解为“已完整实现或已认证”，也难以复现某个 demo 使用的准确版本和向量。

## 建议

继续为 ML-KEM、ML-DSA、SLH-DSA、Ascon、ZUC、SM2/SM4 和随机性测评目录补齐向量来源、实现状态和安全边界字段；每次更新标准时同步本地 PDF、SHA-256、覆盖矩阵和研究报告。
