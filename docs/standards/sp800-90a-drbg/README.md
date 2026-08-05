# NIST SP 800-90A — Deterministic Random Bit Generators (DRBG)

来源: NIST SP 800-90A Rev.1 — Recommendation for Random Number Generation Using Deterministic Random Bit Generators

## 涵盖算法

- **Hash_DRBG**: 基于 SHA-256/SHA-512 的 DRBG
- **HMAC_DRBG**: 基于 HMAC-SHA-256 的 DRBG
- **CTR_DRBG**: 基于 AES-CTR 的 DRBG

## 文档文件

- `01-DRBG.md` — DRBG 算法参考
- `NIST.SP.800-90A.pdf` — 标准原文

## 实现状态

✅ 已实现：`drbg_generate`（CTR-DRBG，官方向量 CAVP 480/480）。Demo：`demos/procedures/DRBG.json`。
