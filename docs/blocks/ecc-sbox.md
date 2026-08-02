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

## 数字签名 (EdDSA / ECDSA / SM2 / SM9)

| 块 | 层 | 连接 | 输入→输出 | 说明 |
|----|----|------|----------|------|
| `eddsa_sign` | 1 | value(→) | Bytes&Bytes→Bytes | Ed25519 签名（RFC 8032）：sk 32B + msg → 64B 签名；官方向量 TEST 1/2/3 |
| `eddsa_verify` | 1 | value(→) | Bytes&Bytes&Bytes→Boolean | Ed25519 验签：pk 32B + msg + sig → true/false |
| `ecdsa_sign` | 1 | value(→) | Bytes&String→Bytes | ECDSA P-256 确定性签名（RFC 6979）：sk 32B + msg → r‖s 64B |
| `ecdsa_verify` | 1 | value(→) | String&Bytes&Bytes→Boolean | ECDSA 验签：msg + pk 65B + r‖s → true/false |
| `sm2_sign` | 1 | value(→) | String&String&Bytes&String→Bytes | SM2 签名（GB/T 32918.2）：da + id + msg + k → r‖s 64B；k 留空随机 |
| `sm2_verify` | 1 | value(→) | String&String&Bytes&String&String→Boolean | SM2 验签：pax/pay + id + msg + r + s → true/false |
| `sm9_master_key` | 1 | value(→) | Bytes→Bytes | SM9 签名主公钥（GB/T 38635.2）：ks → Ppub 128B（G2） |
| `sm9_user_key` | 1 | value(→) | Bytes&Bytes&Number→Bytes | SM9 用户签名私钥：ks + id + hid → ds 64B（G1） |
| `sm9_sign` | 1 | value(→) | Bytes&Bytes&Bytes&Bytes→Bytes | SM9 签名：msg + ds + Ppub + r → h‖S 97B |
| `sm9_verify` | 1 | value(→) | Bytes&Bytes&Bytes&Bytes&Bytes&Number→Boolean | SM9 验签：msg + id + h + S + Ppub + hid → true/false |

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
