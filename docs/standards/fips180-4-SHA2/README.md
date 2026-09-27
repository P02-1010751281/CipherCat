# FIPS 180-4 — SHA-2 算法参考

标准原文提取参考：[00-Standard-Source.md](./00-Standard-Source.md)。

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
| 1 | [01-SHA2.md](./01-SHA2.md) | SHA-2 总览 | §4–§6 | — |
| 2 | [02-Padding.md](./02-Padding.md) | 消息填充 | §5 | `hash_sha256_pad` · `hash_sha512_pad` |
| 3 | [03-MessageExpansion.md](./03-MessageExpansion.md) | 消息扩展 | §6 | 压缩块内部 |
| 4 | [04-Compression.md](./04-Compression.md) | 压缩函数 | §6 | `hash_sha256_compress` · `hash_sha512_compress` |
| 5 | [05-Digest.md](./05-Digest.md) | 摘要输出与变体 | §6 | `hash_sha224_hash` · `hash_sha512_hash` |

## 其他 SHA-2 变体

| 变体 | 输出 | 字长 | 轮数 | 状态 |
|------|------|------|------|------|
| SHA-224 | 224 bit | 32 | 64 | ✅ `hash_sha256_compress` + SHA-224 IV（demo `SHA224-Hash.json`） |
| SHA-384 | 384 bit | 64 | 80 | ✅ `hash_sha512_hash`（HASH 下拉 SHA-384/512） |
| SHA-512 | 512 bit | 64 | 80 | ✅ `hash_sha512_hash`（HASH 下拉） |
| SHA-512/224 | 224 bit | 64 | 80 | 未实现 |
| SHA-512/256 | 256 bit | 64 | 80 | 未实现 |
