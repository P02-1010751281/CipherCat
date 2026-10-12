# 对称密码块参考 (AES + SM4 + 模式 + 填充)

## 文档定位与证据入口

本页是[积木块总览](INDEX.md)的分类详情页。它说明对称密码块的输入输出、组合方式和当前工程边界，不以页面篇幅表示能力权重。

| 入口 | 内容 |
|------|------|
| 标准原文与结构化条目 | [FIPS 197 AES](../standards/fips197-AES/)、[GB/T 32907 SM4](../standards/gbt32907-SM4/)、[SP 800-38A](../standards/sp800-38a-modes/)、[标准覆盖矩阵](../standards/COVERAGE.md) |
| 实现 | 工具箱中的对应积木与代码生成器 |
| 示例工作区 | [Demo 指南](../guides/DEMO.md)、`demos/procedures/` 中的 AES/SM4/CCM/GCM/XTS/ASCON 工作区 |
| 边界 | 原子轮、模式和选定向量不等于所有参数集、拒绝路径或生产安全性；逐算法缺项以覆盖矩阵为准 |


## AES (FIPS 197)

| 块 | 层 | 连接 | 输入→输出 | 说明 |
|----|----|------|----------|------|
| `aes_sub_bytes` | 1 | value(→) | IntList→IntList | S-box替换16字节 |
| `aes_shift_rows` | 1 | value(→) | IntList→IntList | 行循环左移 |
| `aes_mix_columns` | 1 | value(→) | IntList→IntList | GF(2⁸)列混合 |
| `aes_add_round_key` | 1 | value(→) | IntList&IntList→IntList | ⊕轮密钥 |

## SM4 (GB/T 32907-2016)


| 块 | 层 | 连接 | 输入→输出 | 说明 |
|----|----|------|----------|------|
| `sm4_round_func` | 1 | value(→) | IntList&IntList&IntList&IntList&Number→IntList | 轮函数 F(X0,X1,X2,X3,rk) |
| `sm4_sbox` | 1 | value(→) | Number→Number | GB/T 32907-2016 字节 S 盒查表；输入限 0–255 整数 |
| `sm4_linear_transform` | 1 | value(→) | IntList→IntList | L(B)线性变换 |

## 分组模式 (NIST SP 800-38A)

| 块 | 层 | 连接 | 输入→输出 | 说明 |
|----|----|------|----------|------|
| `mode_ecb_encrypt` | 2 | value(→) | Bytes&Bytes→Bytes | AES-ECB 加密（仅教学） |
| `mode_ecb_decrypt` | 2 | value(→) | Bytes&Bytes→Bytes | AES-ECB 解密；密文须为 16 字节整数倍；不移除填充 |
| `mode_cbc_encrypt` | 2 | value(→) | Bytes&Bytes&Bytes→Bytes | AES-CBC 加密(需IV) |
| `mode_ctr_encrypt` | 2 | value(→) | Bytes&Bytes&Bytes→Bytes | AES-CTR 加密(需nonce) |

## 填充

| 块 | 层 | 连接 | 输入→输出 | 标准 |
|----|----|------|----------|------|
| `pad_pkcs7` | 1 | value(→) | Bytes&Number→Bytes | RFC 2315 §10.3；块长 1–255 字节 |
| `pad_zero` | 1 | value(→) | Bytes&Number→Bytes | 项目扩展；不是通用标准填充 |

PKCS#7 块长必须是 1–255 的整数；输入已对齐时仍追加完整填充块。ECB 解密只处理完整密文块，结果中保留原有填充字节，不会自动反填充。零填充在项目中按块长对齐，输入已对齐时追加一个完整零块；由于无法从尾部零字节判断原文长度，调用方必须另行保存原始长度。

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
| `xts_encrypt` | 1 | value(→) | Bytes&IntList&Bytes→Bytes | XTS-Encrypt(key, tweak, data) → 密文；key 为两个不同的 AES-128 密钥（32 字节），tweak 为 16 字节；数据单元 16 字节至 16 MiB，支持末尾部分块 ciphertext stealing。该回归为项目固定回归：IEEE 1619-2007 未随仓库分发，无第三方交叉复算 |

## 轻量认证加密 ASCON (NIST SP 800-232)

| 块 | 层 | 连接 | 输入→输出 | 说明 |
|----|----|------|----------|------|
| `ascon_encrypt` / `ascon_decrypt` | 1 | value(→) | Bytes&IntList&IntList&Bytes→Bytes | Ascon-AEAD128 加解密；解密验证 128 位标签，错误标签拒绝；当前 Demo 是少量固定回归，未运行完整 1,089 项 AEAD KAT |
| `ascon_hash256` / `ascon_xof128` / `ascon_cxof128` | 1 | value(→) | Bytes[&Bytes][&Number]→Bytes | SP 800-232 Hash256、XOF128、CXOF128；输出长度单位为字节，CXOF 定制字符串最多 256 字节；空消息与 `abc` 定制字符串扩展 Demo 双语言通过 |

## 认证加密 GCM (NIST SP 800-38D)

| 块 | 层 | 连接 | 输入→输出 | 说明 |
|----|----|------|----------|------|
| `gcm_gf128_mul` | 1 | value(→) | IntList&IntList→IntList | GF(2¹²⁸) 块乘法 (SP 800-38D Algorithm 1)：两个 16 字节块，右移约定 + 0xE1 约化；GHASH 的构件 |
| `gcm_ghash` | 1 | value(→) | IntList&IntList&IntList→IntList | GHASH_H(A, C) (Algorithm 2)：16 字节分块 + 64 位长度块的多项式哈希，输出 16 字节散列 |
| `gcm_gctr` | 1 | value(→) | Bytes&IntList&Bytes→Bytes | GCTR_K(ICB, X) (Algorithm 3)：AES-128 计数器模式，加解密同一函数，ICB 由调用方派生 |
| `gcm_inc32` | 1 | value(→) | IntList→IntList | inc32 (§6.2)：只对最右 32 位模 2³² 加一，高位不动 |
| `gcm_j0` | 1 | value(→) | IntList&IntList→IntList | J0 派生 (§7.1 Step 1)：96 位 IV 拼 0³¹‖1，其它长度用 GHASH_H({}, IV) |
| `gcm_encrypt` | 1 | value(→) | Bytes&IntList&IntList&Bytes→Bytes | GCM-Encrypt(key, iv, aad, msg) → 密文‖128 位标签；GHASH（GF(2^128)，R=0xE1‖0^120）+ GCTR；iv 12 字节时 J0 = iv‖0^31‖1 否则 GHASH 派生；已核对向量：GCM 规范 Test Case 2/13（编号源自 GCM 规范）与 NIST ACVP AES-GCM 官方用例（tagLen=128）；SP 800-38D 正文与附录不含用例表 |
