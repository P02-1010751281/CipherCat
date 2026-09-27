# FIPS 198-1 — HMAC 消息认证码

标准原文提取参考：[00-Standard-Source.md](./00-Standard-Source.md)。

来源: NIST FIPS 198-1 — The Keyed-Hash Message Authentication Code (HMAC)
      https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.198-1.pdf
      PDF: [NIST.FIPS.198-1.pdf](./NIST.FIPS.198-1.pdf)

## 公式

HMAC(K, text) = H((K₀ ⊕ opad) ‖ H((K₀ ⊕ ipad) ‖ text))

## 相关块

| 块 | 说明 |
|----|------|
| `hash_hmac` | HMAC (SHA-256/SM3可选) |
| `hmac_sha256` / `sm3_hmac` | 生成器内部 helper；模板 `proc_hmac_sha256` / `proc_sm3_hmac` 复用 `hash_hmac` |

## 函数/原语索引

- [01-HMAC.md](./01-HMAC.md)：HMAC 总览
- [02-Key-Normalization.md](./02-Key-Normalization.md)：密钥规范化
- [03-Construction.md](./03-Construction.md)：ipad/opad 内外层构造
