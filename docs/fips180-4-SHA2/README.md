# FIPS 180-4 — SHA-2 算法参考

来源: NIST FIPS 180-4 — Secure Hash Standard (SHS)
      https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.180-4.pdf
      PDF: [NIST.FIPS.180-4.pdf](./NIST.FIPS.180-4.pdf)

## SHA-256 参数 (CipherCat 实现)

| 参数 | 值 |
|------|-----|
| 输出长度 | 256 bit (32 bytes) |
| 分组长度 | 512 bit (64 bytes) |
| 轮数 | 64 |
| 字长 | 32 bit |

## 算法步骤索引

| 序号 | 文件 | 名称 | § | CipherCat |
|:--:|------|------|---|---|
| 1 | [01-Functions-Constants.md](./01-Functions-Constants.md) | 函数 + 常数 | §4.1.2, §4.2.2 | `hash_sha256_compress` |
| 2 | [02-Preprocessing.md](./02-Preprocessing.md) | 预处理 (填充+解析) | §5.1.1, §5.2.1, §6.2.1 | `hash_sha256_pad` |
| 3 | [03-HashComputation.md](./03-HashComputation.md) | 哈希计算 (消息扩展+主循环) | §5.3.3, §6.2.2 | `hash_sha256_compress` |

## 其他 SHA-2 变体

| 变体 | 输出 | 字长 | 轮数 | 状态 |
|------|------|------|------|------|
| SHA-224 | 224 bit | 32 | 64 | 未实现 |
| SHA-384 | 384 bit | 64 | 80 | 未实现 |
| SHA-512 | 512 bit | 64 | 80 | 未实现 |
| SHA-512/224 | 224 bit | 64 | 80 | 未实现 |
| SHA-512/256 | 256 bit | 64 | 80 | 未实现 |
