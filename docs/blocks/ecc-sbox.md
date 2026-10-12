# ECC + S-Box 块参考

## 文档定位与证据入口

本页是[积木块总览](INDEX.md)的经典公钥与椭圆曲线分类详情页；RSA 数论构件在[数论块参考](numtheory.md)中，后量子公钥方案在[后量子块参考](post-quantum.md)中。

| 入口 | 内容 |
|------|------|
| 标准原文与结构化条目 | [FIPS 186-5 ECDSA](../standards/fips186-5-ecdsa/)、[RFC 5903 ECDH](../standards/rfc5903-ecdh/)、[RFC 7748 X25519](../standards/rfc7748-x25519/)、[RFC 8032 EdDSA](../standards/rfc8032-eddsa/)、[GB/T 32918 SM2](../standards/gbt32918-SM2/)、[GB/T 38635 SM9](../standards/gbt38635-SM9/)、[标准覆盖矩阵](../standards/COVERAGE.md) |
| 实现 | 工具箱中的对应积木与代码生成器 |
| 示例工作区 | [Demo 指南](../guides/DEMO.md)、ECDH/ECDSA/EdDSA/X25519/SM2/SM9 工作区 |
| 边界 | 仅对页面列出的曲线、编码和协议链作结论；Demo 通过不代表通用公钥安全、侧信道安全或认证 |


## 椭圆曲线 (SEC 2)

| 块 | 层 | 连接 | 输入→输出 |
|----|----|------|----------|
| `ecc_load_curve_params` | 1 | stmt(→→) | —→— |
| `ecc_load_point` | 1 | stmt(→→) | null→— |
| `ecc_point_double` | 1 | stmt(→→) | null&null→— |
| `ecc_add` | 1 | stmt(→→) | null&null&null→— |
| `ecc_multiply` | 1 | stmt(→→) | null&null→— |

这些块只实现素数域上的短 Weierstrass 曲线算术：`ecc_load_curve_params` 接收系数 `a`、`b` 和模数 `p`，曲线方程为 `y² ≡ x³ + ax + b (mod p)`；调用方必须提供素数 `p > 3` 及 `0 ≤ a,b < p`。生成代码检查范围和非奇异条件 `4a³ + 27b² ≠ 0 (mod p)`，但**不验证 `p` 的素数性**。有限点的 `x,y` 必须是对象自有属性（JavaScript）或内置 `dict` 中的键（Python），值须位于 `[0,p)` 并满足曲线方程；因此 Python 不接受 `dict` 子类。无穷远点用布尔 `infinity: true` 表示。当前块不接收或验证基点 `G`、阶 `n`、点阶或子群成员资格，也不构成完整的 SEC 2 曲线参数验证或生产级 ECC 实现。

## 数字签名 (EdDSA / ECDSA / SM2 / SM9)

| 块 | 层 | 连接 | 输入→输出 | 说明 |
|----|----|------|----------|------|
| `eddsa_sign` | 1 | value(→) | Bytes&Bytes→Bytes | Ed25519 签名（RFC 8032）：sk 32B + msg → 64B 签名；官方向量 TEST 1/2/3 |
| `eddsa_verify` | 1 | value(→) | Bytes&Bytes&Bytes→Boolean | Ed25519 验签：pk 32B + msg + sig → true/false |
| `ecdsa_k_rfc6979` | 1 | value(→) | Bytes&Bytes→Bytes | RFC 6979 §3.2 确定性 k（P-256 + SHA-256）：priv(32B) + msgHash(32B) → k(32B)；只返回 k，不生成 r/s |
| `ecdsa_sign` | 1 | value(→) | Bytes&Bytes→Bytes | ECDSA P-256 确定性签名（RFC 6979）：sk 32B + msg → r‖s 64B |
| `ecdsa_verify` | 1 | value(→) | Bytes&Bytes&Bytes→Boolean | ECDSA 验签：msg + pk 65B + r‖s → true/false |
| `sm2_sign` | 1 | value(→) | String&String&Bytes&String→Bytes | SM2 签名（GB/T 32918.2）：da + id + msg + k → r‖s 64B；k 留空随机 |
| `sm2_verify` | 1 | value(→) | String&String&String&Bytes&String&String→Boolean | SM2 验签：pax/pay + id + msg + r + s → true/false |
| `sm9_master_key` | 1 | value(→) | Bytes→Bytes | SM9 签名主公钥（GB/T 38635.2）：ks → Ppub 128B（G2） |
| `sm9_user_key` | 1 | value(→) | Bytes&Bytes→Bytes | SM9 用户签名私钥：ks + id，hid 为下拉 → ds 64B（G1） |
| `sm9_sign` | 1 | value(→) | Bytes&Bytes&Bytes&Bytes→Bytes | SM9 签名：msg + ds + Ppub + r → h‖S 97B |
| `sm9_verify` | 1 | value(→) | Bytes&Bytes&Bytes&Bytes&Bytes→Boolean | SM9 验签：msg + id + h + S + Ppub，hid 为下拉 → true/false |

## Montgomery 曲线 (RFC 7748)

## 协议封装 (ECDH / SM2 加密)

| 块 | 层 | 连接 | 输入→输出 | 说明 |
|----|----|------|----------|------|
| `ecdh_shared_secret` | 1 | value(→) | String&String&String→String | P-256 ECDH 共享密钥（RFC 5903 §8.1 两方向，并有独立实现复算）：d + Qx + Qy → 共享点 x 坐标 32B hex；d 自动 mod n |
| `sm2_encrypt` | 1 | value(→) | Bytes&String&String&String→String | SM2 加密（GB/T 32918.4）：msg + 公钥 x/y + k → C1‖C3‖C2 hex（C1=04‖x‖y 65B，C3=SM3(x2‖M‖y2) 32B）；官方向量附录 A 示例 2 |
| `sm2_decrypt` | 1 | value(→) | String&String→Bytes | SM2 解密：C1‖C3‖C2 + d → 明文；C3 校验失败抛错 |
| `sm2_key_exchange` | 1 | value(→) | String×8&Number→String | GB/T 32918.3-2016 §6.1 响应方 B 的 B1–B7 及 KDF；不含 B8/B9 密钥确认，也不实现发起方流程 |

交换输入依次为 `dB, rB, Pax, Pay, RA, RB, ZA, ZB`（十六进制字符串）和输出位长 `wlen`。实现限于响应方 B；示例和定向测试不能外推为发起方流程、密钥确认或完整协议认证。

| 块 | 层 | 连接 | 输入→输出 | 说明 |
|----|----|------|----------|------|
| `x25519` | 1 | value(→) | IntList&IntList→Bytes | X25519(k, u) → 32 字节结果；输入各含 32 个 0..255 的字节值；k 自动 clamp，u 坐标清位 255；RFC 7748 §5.2 向量 |

X25519 的低阶 `u` 输入可能得到全零输出。RFC 7748 §6.1 允许协议方在不泄露额外信息的前提下检查全零共享密钥并中止；此块只实现标量乘法，不含协议层检查或密钥派生。当前 JavaScript/Python Montgomery ladder 使用依赖私有标量位的分支及高层整数运算，不提供常数时间保证，仅用于教学和回归，不应用于保护生产私钥。

## S-Box (通用)

| 块 | 层 | 连接 | 输入→输出 |
|----|----|------|----------|
| `sbox` | 1 | value(→) | —→SBox |
| `sbox_sub` | 1 | stmt(→→) | null&SBox&null→— |
| `sbox_variables_get` | 1 | value(→) | —→SBox |
| `sbox_variables_set` | 1 | stmt(→→) | SBox→— |

`bit_byte_substitute` 的输入是 `0..255` 字节索引；`sbox_sub` 按大端顺序拆分 `0..2^32−1` 的无符号整数，并使用展平后前 256 个表项。表项须为 `0..255` 的整数值；两种替换块均在生成代码运行时检查所需输入和表值。测试使用真实 Blockly 工作区执行 JavaScript/Python，逐项比对 AES、SM4、ZUC S0/S1 四张内置预置表与对应标准来源；并对 AES、SM4 的每个字节索引验证 `sbox_sub` 两种语言结果。另覆盖 AES 一维/二维输出、整数值浮点、非法索引/32 位输入、短表以及布尔/分数/越界表项。这些测试验证表映射与块契约，不代表完整算法测试或正式认证。

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

`crypto_encrypt_func`、`crypto_decrypt_func` 和 `crypto_hash_func` 是可编辑的组合起始模板，不是可直接用于生产或声称符合标准的完整算法。默认加/解密模板仅预填 ECB 组合且未提供密钥；默认哈希模板只预填 SHA-256 填充块，不包含完整压缩/迭代流程。使用者须补齐参数、算法流程并自行验证。
