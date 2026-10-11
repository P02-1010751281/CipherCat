# FIPS 186-5 — 数字签名标准（DSS）

标准原文提取参考：[00-Standard-Source.md](./00-Standard-Source.md)。

来源: NIST FIPS 186-5 — Digital Signature Standard (DSS)
      https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.186-5.pdf
      PDF: [NIST.FIPS.186-5.pdf](./NIST.FIPS.186-5.pdf)

本目录保存 FIPS 186-5 完整标准原文，并按项目涉及的算法拆分结构化参照页；目录名沿用既有 `fips186-5-ecdsa` 标识，不代表该标准只规定 ECDSA。当前分别整理 [ECDSA](./01-ECDSA.md)、[RSA 签名密钥生成](./05-RSA-Key-Generation.md) 和 [RSA 概率素性测试](./06-RSA-Primality-Testing.md)。这些页面是标准参照，不代表代码符合标准或取得认证。

## 相关块

| 块 | 说明 |
|----|------|
| `ecdsa_sign` / `ecdsa_verify` | ECDSA 签名/验签（黑盒，官方向量 RFC 6979 P-256） |
| `ecc_load_curve_params` | 加载曲线参数 |
| `ecc_multiply` | 标量乘法 k*P |

Demo：`demos/procedures/ECDSA.json`（RFC 6979 sample/test 向量）。

## 文档文件

- `01-ECDSA.md` — ECDSA 总览
- `02-Curve-Operations.md` — 曲线与点运算原语
- `03-Sign.md` — 签名原语
- `04-Verify.md` — 验签原语
- `05-RSA-Key-Generation.md` — RSA 签名密钥生成条件和完整概率素数流程（规范参照；项目块未声明符合）
- `06-RSA-Primality-Testing.md` — 附录 B.3.1 Miller–Rabin 完整算法与项目映射（规范参照；没有独立 Blockly 块）
- `NIST.FIPS.186-5.pdf` — 标准原文
- `fips186-5-potential-updates.xlsx` — NIST 发布的潜在勘误表快照；尚非正式修订

<!-- standard-body:start -->

## 标准内容

本目录对应 **FIPS 186-5 — 数字签名标准（DSS）**，按标准条款拆分为 8 个结构化条目，覆盖 「§6.1–§6.4」、「FIPS 186-5 §6；项目使用 NIST P-256 参数」、「FIPS 186-5 §6.4.1」、「FIPS 186-5 §6.4.2」 等。每个条目页给出标准定位、原文出处、公式或伪代码，以及对应积木块与验证边界。

| 结构化条目 | 内容 | 项目状态 |
|---|---|---|
| [NIST FIPS 186-5 — ECDSA 参考](./01-ECDSA.md) | §6.1–§6.4 | 仅参考（未映射为块实现） |
| [ECDSA — 曲线与点运算原语](./02-Curve-Operations.md) | FIPS 186-5 §6；项目使用 NIST P-256 参数 | 教学用 P-256 点运算已映射 |
| [ECDSA — 签名原语](./03-Sign.md) | FIPS 186-5 §6.4.1 | 仅参考（未映射为块实现） |
| [ECDSA — 验签原语](./04-Verify.md) | FIPS 186-5 §6.4.2 | 部分实现（不代表完整标准覆盖） |
| [RSA Signature Key Generation (FIPS 186-5)](./05-RSA-Key-Generation.en.md) | — | — |
| [RSA 签名密钥生成（FIPS 186-5）](./05-RSA-Key-Generation.md) | FIPS 186-5 §5.1、§5.4(a)、附录 A.1.1、A.1.3、B.3 与表 B.1 | 标准参照；当前 `rsa_keygen` 是教学实现，不声明符合 FIPS 186-5 |
| [RSA Probabilistic Primality Testing (FIPS 186-5)](./06-RSA-Primality-Testing.en.md) | — | — |
| [RSA 概率素性测试（FIPS 186-5）](./06-RSA-Primality-Testing.md) | FIPS 186-5 附录 B.3、B.3.1；轮数见表 B.1 和附录 C.1 | 标准参照；当前测试内嵌于教学用 RSA 密钥生成器，未声明符合 FIPS 186-5 |

## 实现与验证映射

| 积木块 | 规范语义范围 | 已登记验证入口 | 边界（本行不能证明什么） |
|---|---|---|---|
| `ecdsa_sign` | — | — | — |
| `ecdsa_verify` | — | — | — |
| `ecc_load_curve_params` | — | — | — |
| `ecc_load_point` | — | — | — |
| `ecc_add` | — | — | — |
| `ecc_point_double` | — | — | — |
| `ecc_multiply` | — | — | — |

示例工作区：`demos/procedures/ECDSA.json`。

以上是当前实现与回归范围，不代表已通过认证或完成完整标准测试；逐块证据与缺项见[标准符合性对象清单](../CONFORMANCE-INVENTORY.md)。

<!-- standard-body:end -->
