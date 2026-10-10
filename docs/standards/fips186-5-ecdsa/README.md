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
