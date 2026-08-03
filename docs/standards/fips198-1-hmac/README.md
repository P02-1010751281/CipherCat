# FIPS 198-1 — HMAC 消息认证码

来源: NIST FIPS 198-1 — The Keyed-Hash Message Authentication Code (HMAC)
      https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.198-1.pdf
      PDF: [NIST.FIPS.198-1.pdf](./NIST.FIPS.198-1.pdf)

## 公式

HMAC(K, text) = H((K₀ ⊕ opad) ‖ H((K₀ ⊕ ipad) ‖ text))

## 相关块

| 块 | 说明 |
|----|------|
| `hash_hmac` | HMAC (SHA-256/SM3可选) |
| `hmac_sha256` | HMAC-SHA256 一键 |
| `sm3_hmac` | HMAC-SM3 一键 |
