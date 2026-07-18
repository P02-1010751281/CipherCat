# FIPS 180-4 — SHA-2 算法参考

来源: NIST FIPS 180-4 — Secure Hash Standard (SHS)
      https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.180-4.pdf

## SHA-256 参数 (CipherCat 实现)

| 参数 | 值 |
|------|-----|
| 输出长度 | 256 bit (32 bytes) |
| 分组长度 | 512 bit (64 bytes) |
| 轮数 | 64 |
| 初始值 H⁰ | 8×32-bit IV |
| 轮常数 Kt | 64×32-bit |

## CipherCat 块

| 块 | 说明 |
|----|------|
| `hash_sha256_pad` | Merkle-Damgård 填充 (1‖0*‖64-bit大端长度) |
| `hash_sha256_compress` | 64轮压缩函数 |
| `hash_sha256_pad_text` | UTF-8文本填充 |
| `hash_sha256_pad_hex` | 十六进制填充 |
