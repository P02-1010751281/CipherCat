# 对称密码块参考 (AES + SM4 + 模式 + 填充)

## 文档定位与证据入口

本页是[积木块总览](INDEX.md)的分类详情页。它说明对称密码块的输入输出、组合方式和当前工程边界，不以页面篇幅表示能力权重。

| 入口 | 内容 |
|------|------|
| 标准原文与结构化条目 | [FIPS 197 AES](../standards/fips197-AES/)、[GB/T 32907 SM4](../standards/gbt32907-SM4/)、[SP 800-38A](../standards/sp800-38a-modes/)、[标准覆盖矩阵](../standards/COVERAGE.md) |
| 实现 | `src/blocks/symmetric/`、`src/blocks/cmac/`、`src/blocks/ccm/`、`src/blocks/gcm/`、`src/blocks/xts/`、`src/blocks/ascon/` |
| Demo 与测试 | [Demo 指南](../guides/DEMO.md)、[Demo 测试登记](../../demos/tests.json)、`demos/procedures/` 中的 AES/SM4/CCM/GCM/XTS/ASCON 工作区 |
| 边界 | 原子轮、模式和选定向量不等于所有参数集、拒绝路径或生产安全性；逐算法缺项以覆盖矩阵为准 |


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

## 轻量认证加密 ASCON (NIST SP 800-232)

| 块 | 层 | 连接 | 输入→输出 | 说明 |
|----|----|------|----------|------|
| `ascon_encrypt` / `ascon_decrypt` | 1 | value(→) | Bytes&IntList&IntList&Bytes→Bytes | Ascon-AEAD128 加解密；解密验证 128 位标签，错误标签抛出异常；官方向量（ascon-c 仓 LWC KAT 1089 例全过） |
| `ascon_hash256` / `ascon_xof128` / `ascon_cxof128` | 1 | value(→) | Bytes[&Bytes][&Number]→Bytes | SP 800-232 Hash256、XOF128、CXOF128；输出长度单位为字节，CXOF 定制字符串最多 256 字节；空消息与 `abc` 定制字符串扩展 Demo 双语言通过 |

## 认证加密 GCM (NIST SP 800-38D)

| 块 | 层 | 连接 | 输入→输出 | 说明 |
|----|----|------|----------|------|
| `gcm_encrypt` | 1 | value(→) | Bytes&IntList&IntList&Bytes→Bytes | GCM-Encrypt(key, iv, aad, msg) → 密文‖128 位标签；GHASH（GF(2^128)，R=0xE1‖0^120）+ GCTR；iv 12 字节时 J0 = iv‖0^31‖1 否则 GHASH 派生；官方向量（SP 800-38D TC2/TC3/TC16）+ pycryptodome 交叉 |
