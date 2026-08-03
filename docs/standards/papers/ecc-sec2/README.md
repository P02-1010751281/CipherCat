# SEC 2 — 椭圆曲线域参数

## 下载

PDF✅: [sec2-v2.pdf](./sec2-v2.pdf) (6页)

来源: Standards for Efficient Cryptography (SEC)
      https://www.secg.org/sec2-v2.pdf

## 包含曲线

| 曲线 | 块实现 |
|------|----------|
| secp256k1 (Bitcoin) | 可用 ECC 块支持 |
| secp256r1 (NIST P-256) | 同上 |
| secp384r1 (NIST P-384) | 同上 |
| secp521r1 (NIST P-521) | 同上 |

所有曲线可通过 `ecc_load_curve_params` 块加载参数。

## SM2 曲线

SM2 曲线参数在 GB/T 32918.5-2017 中定义（已下载 → `gbt32918-SM2/`）。
