# FIPS 180-4 — SHA-2 算法参考

来源: NIST FIPS 180-4 — Secure Hash Standard (SHS)
      https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.180-4.pdf
      PDF: [NIST.FIPS.180-4.pdf](./NIST.FIPS.180-4.pdf)

## SHA-256 参数 (块实现)

| 参数 | 值 |
|------|-----|
| 输出长度 | 256 bit (32 bytes) |
| 分组长度 | 512 bit (64 bytes) |
| 轮数 | 64 |
| 字长 | 32 bit |

## 算法步骤索引

| 序号 | 文件 | 名称 | § | 块实现 |
|:--:|------|------|---|---|
| 1 | [01-SHA2.md](./01-SHA2.md) | SHA-2 完整算法 | §4–§6 | — |

## 其他 SHA-2 变体

| 变体 | 输出 | 字长 | 轮数 | 状态 |
|------|------|------|------|------|
| SHA-224 | 224 bit | 32 | 64 | ✅ `hash_sha256_compress` + SHA-224 IV（demo `SHA224-Hash.json`） |
| SHA-384 | 384 bit | 64 | 80 | ✅ `hash_sha512_hash`（HASH 下拉 SHA-384/512） |
| SHA-512 | 512 bit | 64 | 80 | ✅ `hash_sha512_hash`（HASH 下拉） |
| SHA-512/224 | 224 bit | 64 | 80 | 未实现 |
| SHA-512/256 | 256 bit | 64 | 80 | 未实现 |
