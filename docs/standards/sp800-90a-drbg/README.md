# NIST SP 800-90A — Deterministic Random Bit Generators (DRBG)

标准原文提取参考：[00-Standard-Source.md](./00-Standard-Source.md)。

来源: NIST SP 800-90A Rev.1 — Recommendation for Random Number Generation Using Deterministic Random Bit Generators

## 标准算法与项目子集

- **Hash_DRBG**: 基于 SHA-256/SHA-512 的 DRBG
- **HMAC_DRBG**: 基于 HMAC-SHA-256 的 DRBG
- **CTR_DRBG**: 基于 AES-CTR 的 DRBG（标准有定义，当前项目未实现）

## 文档文件

- `01-DRBG.md` — DRBG 算法参考
- `NIST.SP.800-90A.pdf` — 标准原文

## 实现状态

✅ 已实现：`drbg_generate`（HMAC-DRBG / HMAC-SHA-256 的教学子集，使用 NIST CAVP 向量核对）。
未覆盖：Hash_DRBG、CTR_DRBG、additional input、prediction resistance，以及公开块级别的完整 reseed 生命周期验证。Demo：`demos/procedures/DRBG.json`。

## 函数/原语索引

- [01-DRBG.md](./01-DRBG.md)：标准族与项目子集总览
- [02-HMAC-DRBG-Update.md](./02-HMAC-DRBG-Update.md)：HMAC_DRBG 状态与 Update
- [03-Generate-and-Lifecycle.md](./03-Generate-and-Lifecycle.md)：Generate 与生命周期缺项
