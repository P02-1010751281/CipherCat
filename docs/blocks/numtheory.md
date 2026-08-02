# 数论 + 大数块参考

> [English](./numtheory.en.md) · [中文](./numtheory.md)

## 域运算 + NTT

| 块 | 层 | 连接 | 输入→输出 |
|----|----|------|----------|
| `nt_field_add` | 1 | value(→) | null&null&null→null |
| `nt_mod_inverse` | 1 | stmt(→→) | null&null&null→— |
| `nt_mod` | 1 | value(→) | Number&Number→Number |
| `nt_mod_pow` | 1 | value(→) | Number&Number&Number→Number |
| `nt_div_rem` | 1 | value(→) | Number&Number→Number |
| `pq_poly_add` | 1 | value(→) | IntList&IntList→IntList |
| `pq_poly_sub` | 1 | value(→) | IntList&IntList→IntList |
| `pq_mat_vec_mul` | 1 | value(→) | IntList&IntList→IntList |
| `pq_ntt` | 1 | value(→) | IntList→IntList |
| `pq_intt` | 1 | value(→) | IntList→IntList |
| `pq_ntt_mul` | 1 | value(→) | IntList&IntList→IntList |
| `pq_ntt_butterfly` | 1 | value(→) | null&null&null→null |

## 大数运算

| 块 | 层 | 连接 | 输入→输出 |
|----|----|------|----------|
| `bn_add` | 1 | value(→) | IntList&IntList→IntList |
| `bn_sub` | 1 | value(→) | IntList&IntList→IntList |
| `bn_mul` | 1 | value(→) | IntList&IntList→IntList |
| `bn_div` | 1 | value(→) | IntList&IntList→IntList |

## RSA 公钥密码 (FIPS 186-4 / RFC 8017)

| 块 | 层 | 连接 | 输入→输出 | 说明 |
|----|----|------|----------|------|
| `rsa_keygen` | 1 | value(→) | Number→Bytes | RSA 密钥生成：BITS 下拉 512/1024/2048 → n‖e‖d‖p‖q 定长编码（512 位 → 196 字节）；Miller-Rabin 素数测试 + e=65537 |
| `rsa_encrypt` | 1 | value(→) | Bytes&Bytes→Bytes | RSAES-PKCS#1 v1.5 加密：m^e mod n（随机非零 PS 填充） |
| `rsa_decrypt` | 1 | value(→) | Bytes&Bytes→Bytes | RSAES-PKCS#1 v1.5 解密：m^d mod n 去填充 |
| `rsa_sign` | 1 | value(→) | Bytes&Bytes→Bytes | RSASSA-PKCS#1 v1.5 签名：SHA-256 + DigestInfo 编码，m^d mod n |
| `rsa_verify` | 1 | value(→) | Bytes&Bytes&Bytes→Boolean | RSASSA-PKCS#1 v1.5 验签 |

> 交叉验证：cryptography 49 库双向一致（encrypt/decrypt/sign/verify + 密钥有效性）；RSA-1024 生成代码被 cryptography 接受；教学 demo 用 512 位（勿用于真实安全）。

## GF(2⁸) 域 (FIPS 197)

| 块 | 层 | 连接 | 输入→输出 |
|----|----|------|----------|
| `gf2m_mul` | 1 | value(→) | Number&Number→Number |
