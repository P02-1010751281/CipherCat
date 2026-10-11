# RFC 8017 (PKCS#1 v2.2) — 全算法索引

来源: IETF RFC 8017 — PKCS #1: RSA Cryptography Specifications Version 2.2
      https://www.rfc-editor.org/rfc/rfc8017.txt      (2016-11，取代 RFC 3447/2437/2313)

> RFC 8017 定义 RSA 方案，不定义密钥生成。CipherCat 的 `rsa_encrypt/decrypt/sign/verify` 是相应方案的教学实现；`rsa_keygen` 是项目自定义教学辅助，不属于 RFC 8017，也未声明符合 FIPS 186-5。

## 算法清单

| 序号 | 文件 | 名称 | 类别 | 块实现 |
|:--:|------|------|------|:--:|
| — | `01-RSA.md` | RSAES-PKCS1-v1_5 加解密与 RSASSA-PKCS1-v1_5 签名/验签方案 | 公钥密码 | 教学实现 |

### 块实现明细

| 部件 | 类别 | 块 |
|------|------|----|
| PKCS#1 v1.5 加密（EM = 0x00‖0x02‖PS‖0x00‖M） | 加密 | `rsa_encrypt` |
| PKCS#1 v1.5 解密 | 解密 | `rsa_decrypt` |
| PKCS#1 v1.5 SHA-256 签名 | 签名 | `rsa_sign` |
| 验签 | 验签 | `rsa_verify` |

`rsa_keygen` 输出项目自定义的 `n‖e‖d‖p‖q` 字节格式，包含私钥材料。它不属于本目录的 RFC 条目；RSA 签名密钥生成的规范参照见 [FIPS 186-5 RSA 密钥生成页](../fips186-5-ecdsa/05-RSA-Key-Generation.md)。互操作测试不是标准符合性评估或正式认证。

## 相关

- PKCS#1 v1.5 填充的对称件 `pad_pkcs7` 见 `rfc2315-pkcs7/`（PKCS#7 填充语义）。
- Demo：`demos/procedures/RSA-Encrypt.json`（项目教学 512-bit 模数下的加解密往返与输出容器）、
  `RSA-Sign.json`（SHA-256 签名与验签正/负例，项目固定回归；仓库内无第三方实现交叉复算）。

<!-- standard-body:start -->

## 标准内容

本目录对应 **RFC 8017 (PKCS#1 v2.2) — 全算法索引**，按标准条款拆分为 1 个结构化条目，覆盖 「RFC 8017 §7.2、§8.2」。每个条目页给出标准定位、原文出处、公式或伪代码，以及对应积木块与验证边界。

| 结构化条目 | 内容 | 项目状态 |
|---|---|---|
| [RFC 8017 §7.2、§8.2](./01-RSA.md) | RFC 8017 §7.2、§8.2 | 教学实现（按所列 RFC 方案做互操作测试；不构成标准符合性或认证声明） |

## 实现与验证映射

| 积木块 | 规范语义范围 | 已登记验证入口 | 边界（本行不能证明什么） |
|---|---|---|---|
| `rsa_encrypt` | — | — | — |
| `rsa_decrypt` | — | — | — |
| `rsa_sign` | — | — | — |
| `rsa_verify`（教学实现） | — | — | — |

示例工作区：`demos/procedures/RSA-Encrypt.json`、`demos/RSA-Sign.json`。

以上是当前实现与回归范围，不代表已通过认证或完成完整标准测试；逐块证据与缺项见[标准符合性对象清单](../CONFORMANCE-INVENTORY.md)。

<!-- standard-body:end -->
