# ECC + S-Box 块参考

## 椭圆曲线 (SEC 2)

| 块 | 层 | 连接 | 输入→输出 |
|----|----|------|----------|
| `ecc_load_curve_params` | 1 | stmt(→→) | —→— |
| `ecc_load_point` | 1 | stmt(→→) | null→— |
| `ecc_point_double` | 1 | stmt(→→) | null&null→— |
| `ecc_add` | 1 | stmt(→→) | null&null&null→— |
| `ecc_multiply` | 1 | stmt(→→) | null&null→— |

## S-Box (通用)

| 块 | 层 | 连接 | 输入→输出 |
|----|----|------|----------|
| `sbox` | 1 | value(→) | —→SBox |
| `sbox_sub` | 1 | stmt(→→) | null&SBox&null→— |

## 控制流

| 块 | 层 | 连接 | 输入→输出 |
|----|----|------|----------|
| `ctrl_iterate` | 1 | stmt(→→) | —→— |

## 函数封装

| 块 | 层 | 连接 | 输入→输出 |
|----|----|------|----------|
| `crypto_return` | 1 | stmt(→→) | null→— |
| `crypto_func_def` | 1 | stmt(→→) | —→— |
| `crypto_encrypt_func` | 2 | stmt(→→) | —→— |
| `crypto_decrypt_func` | 2 | stmt(→→) | —→— |
| `crypto_hash_func` | 2 | stmt(→→) | —→— |
