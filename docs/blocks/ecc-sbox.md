# ECC + S-Box 块参考

> [English](./ecc-sbox.en.md) · [中文](./ecc-sbox.md)

## 椭圆曲线 (SEC 2)

| 块 | 层 | 连接 | 输入→输出 |
|----|----|------|----------|
| `ecc_load_curve_params` | 1 | stmt(→→) | —→— |
| `ecc_load_point` | 1 | stmt(→→) | null→— |
| `ecc_point_double` | 1 | stmt(→→) | null&null→— |
| `ecc_add` | 1 | stmt(→→) | null&null&null→— |
| `ecc_multiply` | 1 | stmt(→→) | null&null→— |

## Montgomery 曲线 (RFC 7748)

| 块 | 层 | 连接 | 输入→输出 | 说明 |
|----|----|------|----------|------|
| `x25519` | 1 | value(→) | IntList&IntList→Bytes | X25519(k, u) → 共享密钥 32 字节；k 自动 clamp，u 坐标清位 255；Montgomery ladder p=2^255-19；官方向量（RFC 7748 §5.2 V1/V2） |

## S-Box (通用)

| 块 | 层 | 连接 | 输入→输出 |
|----|----|------|----------|
| `sbox` | 1 | value(→) | —→SBox |
| `sbox_sub` | 1 | stmt(→→) | null&SBox&null→— |
| `sbox_variables_get` | 1 | value(→) | —→SBox |
| `sbox_variables_set` | 1 | stmt(→→) | SBox→— |

## 控制流

| 块 | 层 | 连接 | 输入→输出 |
|----|----|------|----------|
| `ctrl_iterate` | 1 | stmt(→→) | —→— |

## 函数封装

| 块 | 层 | 连接 | 输入→输出 |
|----|----|------|----------|
| `crypto_return` | 1 | stmt(→→) | null→— |
| `procedures_defreturn` | 1 | stmt(→→) | —→— |
| `crypto_encrypt_func` | 2 | stmt(→→) | —→— |
| `crypto_decrypt_func` | 2 | stmt(→→) | —→— |
| `crypto_hash_func` | 2 | stmt(→→) | —→— |
