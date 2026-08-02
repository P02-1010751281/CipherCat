# 对称密码块参考 (AES + SM4 + 模式 + 填充)

> [English](./symmetric.en.md) · [中文](./symmetric.md)

## AES (FIPS 197)

| 块 | 层 | 连接 | 输入→输出 | 说明 |
|----|----|------|----------|------|
| `aes_sub_bytes` | 1 | value(→) | IntList→IntList | S-box替换16字节 |
| `aes_shift_rows` | 1 | value(→) | IntList→IntList | 行循环左移 |
| `aes_mix_columns` | 1 | value(→) | IntList→IntList | GF(2⁸)列混合 |
| `aes_add_round_key` | 1 | value(→) | IntList&IntList→IntList | ⊕轮密钥 |

## SM4 (GM/T 0002)

| 块 | 层 | 连接 | 输入→输出 | 说明 |
|----|----|------|----------|------|
| `sm4_round_func` | 1 | value(→) | IntList&Number→IntList | 轮函数F |
| `sm4_linear_transform` | 1 | value(→) | IntList→IntList | L(B)线性变换 |

## 分组模式 (NIST SP 800-38A)

| 块 | 层 | 连接 | 输入→输出 | 说明 |
|----|----|------|----------|------|
| `mode_ecb_encrypt` | 2 | value(→) | Bytes&Bytes→Bytes | AES-ECB 加密（仅教学） |
| `mode_ecb_decrypt` | 2 | value(→) | Bytes&Bytes→Bytes | AES-ECB 解密 |
| `mode_cbc_encrypt` | 2 | value(→) | Bytes&Bytes&Bytes→Bytes | AES-CBC 加密(需IV) |
| `mode_ctr_encrypt` | 2 | value(→) | Bytes&Bytes&Bytes→Bytes | AES-CTR 加密(需nonce) |

## 填充

| 块 | 层 | 连接 | 输入→输出 | 标准 |
|----|----|------|----------|------|
| `pad_pkcs7` | 1 | value(→) | Bytes→Bytes | RFC 2315 §10.3 |
| `pad_zero` | 1 | value(→) | Bytes→Bytes | 通用 |

## 分组 MAC (NIST SP 800-38B)

| 块 | 层 | 连接 | 输入→输出 | 说明 |
|----|----|------|----------|------|
| `cmac_mac` | 1 | value(→) | Bytes&Bytes→Bytes | CMAC(key, msg) → 16 字节认证标签；CIPHER 下拉 AES-128（官方向量）/ SM4（GB/T 15852 同类） |

## 认证加密 CCM (NIST SP 800-38C)

| 块 | 层 | 连接 | 输入→输出 | 说明 |
|----|----|------|----------|------|
| `ccm_encrypt` | 1 | value(→) | Bytes&IntList&IntList&Bytes→Bytes | CCM-Encrypt(key, nonce, aad, msg, tagLen) → 密文‖标签；CBC-MAC 认证 + CTR 加密；TAGLEN 下拉 4-16 字节；AES-128 官方向量（附录 C Example 1-3） |

## 磁盘加密 XTS (NIST SP 800-38E)

| 块 | 层 | 连接 | 输入→输出 | 说明 |
|----|----|------|----------|------|
| `xts_encrypt` | 1 | value(→) | Bytes&IntList&Bytes→Bytes | XTS-Encrypt(key‖K1K2, tweak, data) → 密文；key 32 字节（两个 AES-128），tweak 16 字节（数据单元号），data 须为 16 字节倍数；T = E_K2(tweak)·α^i；官方向量（IEEE 1619-2007）+ cryptography 交叉验证 |
