# NIST SP 800-38D — GCM 认证加密模式

标准原文提取参考：[00-Standard-Source.md](./00-Standard-Source.md)。

## 算法逐项拆分

原文 5 个独立算法均有独立条目页；概览页只负责导航和项目边界。

| 算法 | 条目页 | 标准函数 |
|:--:|---|---|
| 1 块乘法 | [`05-multiply.md`](./05-multiply.md) | `X • Y` |
| 2 GHASH | [`06-GHASH.md`](./06-GHASH.md) | `GHASH_H` |
| 3 GCTR | [`07-GCTR.md`](./07-GCTR.md) | `GCTR_K` |
| 4 认证加密 | [`08-GCM-AE.md`](./08-GCM-AE.md) | `GCM-AE_K` |
| 5 认证解密 | [`09-GCM-AD.md`](./09-GCM-AD.md) | `GCM-AD_K` |

来源: NIST SP 800-38D — Recommendation for Block Cipher Modes: Galois/Counter Mode
      https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-38d.pdf
      PDF: [NIST.SP.800-38D.pdf](./NIST.SP.800-38D.pdf)

## 相关块

| 块 | 说明 |
|----|------|
| `gcm_encrypt` | GCM 认证加密 |

## 函数/原语索引

- [01-GCM.md](./01-GCM.md)：GCM 总览
- [02-GHASH.md](./02-GHASH.md)：GHASH
- [03-GCTR-and-J0.md](./03-GCTR-and-J0.md)：J0 与 GCTR
- [10-inc32.md](./10-inc32.md)：计数器低 32 位递增
- [04-AEAD-Limits.md](./04-AEAD-Limits.md)：AEAD 验证边界
