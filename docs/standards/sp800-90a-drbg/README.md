# NIST SP 800-90A — Deterministic Random Bit Generators (DRBG)

来源: NIST SP 800-90A Rev.1 — Recommendation for Random Number Generation Using Deterministic Random Bit Generators

## 涵盖算法

- **Hash_DRBG**: 基于 SHA-256/SHA-512 的 DRBG
- **HMAC_DRBG**: 基于 HMAC-SHA-256 的 DRBG
- **CTR_DRBG**: 基于 AES-CTR 的 DRBG

## 文档文件

- `full.txt` — PDF 全文提取 (4871 lines)
- `extracted.md` — pdfplumber 结构化提取

## 实现状态

未实现。DRBG 是 NIST 推荐的确定性随机数生成器，可用于密钥生成和随机性测试。
