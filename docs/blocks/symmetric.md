# 对称密码块参考 (AES + SM4 + 模式 + 填充)

## AES (FIPS 197)

| 块 | 层 | 连接 | 输入→输出 | 说明 |
|----|----|------|----------|------|
| `aes_sub_bytes` | 1 | value(→) | IntList→IntList | S-box替换16字节 |
| `aes_shift_rows` | 1 | value(→) | IntList→IntList | 行循环左移 |
| `aes_mix_columns` | 1 | value(→) | IntList→IntList | GF(2⁸)列混合 |
| `aes_add_round_key` | 1 | value(→) | IntList&IntList→IntList | ⊕轮密钥 |
| `aes_round` | 2 | value(→) | IntList&IntList→IntList | SubBytes→ShiftRows→MixColumns→AddRoundKey |
| `aes_last_round` | 2 | value(→) | IntList&IntList→IntList | 同上跳过MixColumns |
| `aes_key_schedule` | 2 | value(→) | Bytes→IntList | 128/192/256密钥扩展 |

## SM4 (GM/T 0002)

| 块 | 层 | 连接 | 输入→输出 | 说明 |
|----|----|------|----------|------|
| `sm4_round_func` | 1 | value(→) | IntList&Number→IntList | 轮函数F |
| `sm4_linear_transform` | 1 | value(→) | IntList→IntList | L(B)线性变换 |
| `sm4_round` | 2 | value(→) | IntList&Number→IntList | 完整轮(含密钥异或) |
| `sm4_key_schedule` | 2 | value(→) | Bytes→IntList | 32轮密钥生成 |

## 分组模式 (NIST SP 800-38)

| 块 | 层 | 连接 | 输入→输出 | 说明 |
|----|----|------|----------|------|
| `mode_ecb` | 2 | value(→) | Bytes&Bytes→Bytes | 电子密码本 |
| `mode_cbc` | 2 | value(→) | Bytes&Bytes&Bytes→Bytes | 密码块链接(需IV) |
| `mode_ctr` | 2 | value(→) | Bytes&Bytes&Bytes→Bytes | 计数器模式(需IV) |
| `mode_gcm` | 2 | value(→) | Bytes&Bytes&Bytes→Bytes | 认证加密(需IV) |

## 填充

| 块 | 层 | 连接 | 输入→输出 | 标准 |
|----|----|------|----------|------|
| `pad_pkcs7` | 1 | value(→) | Bytes→Bytes | RFC 2315 §10.3 |
| `pad_zero` | 1 | value(→) | Bytes→Bytes | 通用 |
