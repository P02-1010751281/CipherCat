# 哈希块参考 (SHA + SM3 + Keccak + XOF)

> [English](./hash.en.md) · [中文](./hash.md)

## SHA-256 (FIPS 180-4)

| 块 | 层 | 连接 | 输入→输出 | 说明 |
|----|----|------|----------|------|
| `hash_sha256_pad` | 1 | value(→) | null→Bytes | MD填充 |
| `hash_sha256_pad_text` | 1 | value(→) | null→Bytes | UTF-8文本填充 |
| `hash_sha256_pad_hex` | 1 | value(→) | null→Bytes | Hex填充 |
| `hash_sha256_compress` | 1 | value(→) | null&null→null | 64轮压缩函数 |

## SHA-3 / Keccak (FIPS 202)

| 块 | 层 | 连接 | 输入→输出 | 说明 |
|----|----|------|----------|------|
| `keccak_state_init` | 1 | value(→) | —→null | 25×64-bit零状态 |
| `keccak_f` | 1 | value(→) | null→null | Keccak-f[b]置换(24轮) |
| `sponge_pad` | 1 | value(→) | null→Bytes | pad10*1填充 |
| `sponge_absorb` | 1 | value(→) | null&Bytes→null | 海绵吸收 |
| `sponge_squeeze` | 1 | value(→) | null&Number→Bytes | 海绵挤压 |
| `hash_sha3_pad_text` | 1 | value(→) | null→Bytes | SHA-3文本填充 |
| `hash_sha3_pad_hex` | 1 | value(→) | null→Bytes | SHA-3 Hex填充 |

## SM3 (GM/T 0004)

| 块 | 层 | 连接 | 输入→输出 | 说明 |
|----|----|------|----------|------|
| `hash_sm3_pad` | 1 | value(→) | null→Bytes | 消息填充 |
| `hash_sm3_pad_text` | 1 | value(→) | null→Bytes | UTF-8填充 |
| `hash_sm3_pad_hex` | 1 | value(→) | null→Bytes | Hex填充 |
| `hash_sm3_compress` | 1 | value(→) | null&null→null | 64轮压缩函数 |

## XOF / PRF (FIPS 202 §6)

| 块 | 层 | 连接 | 输入→输出 | 说明 |
|----|----|------|----------|------|
| `pq_xof` | 1 | value(→) | Bytes&Number→Bytes | SHAKE XOF |
| `pq_prf` | 1 | value(→) | Bytes&Number&Number→Bytes | SHAKE PRF |

## HMAC (FIPS 198-1)

| 块 | 层 | 连接 | 输入→输出 | 说明 |
|----|----|------|----------|------|
| `hash_hmac` | 1 | value(→) | Bytes&Bytes→Bytes | HMAC(SHA-256/SM3可选) |
