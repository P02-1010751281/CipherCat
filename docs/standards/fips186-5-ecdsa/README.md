# FIPS 186-5 — ECDSA 数字签名标准

来源: NIST FIPS 186-5 — Digital Signature Standard (DSS)
      https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.186-5.pdf
      PDF: [NIST.FIPS.186-5.pdf](./NIST.FIPS.186-5.pdf)

## 相关块

| 块 | 说明 |
|----|------|
| `ecdsa_sign` / `ecdsa_verify` | ECDSA 签名/验签（黑盒，官方向量 RFC 6979 P-256） |
| `ecc_load_curve_params` | 加载曲线参数 |
| `ecc_multiply` | 标量乘法 k*P |

Demo：`demos/procedures/ECDSA.json`（RFC 6979 sample/test 向量）。

## 文档文件

- `01-ECDSA.md` — ECDSA 算法参考
- `NIST.FIPS.186-5.pdf` — 标准原文
