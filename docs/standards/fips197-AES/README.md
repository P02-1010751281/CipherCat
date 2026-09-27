# FIPS 197 — AES 算法参考

标准原文提取参考：[00-Standard-Source.md](./00-Standard-Source.md)。

来源: NIST FIPS 197 — Advanced Encryption Standard
      https://csrc.nist.gov/pubs/fips/197/final
      PDF: [NIST.FIPS.197.pdf](./NIST.FIPS.197.pdf)

## 参数

| 参数 | AES-128 | AES-192 | AES-256 |
|------|:-----:|:-----:|:-----:|
| 分组长度 | 128 bit | 128 bit | 128 bit |
| 密钥长度 | 128 bit | 192 bit | 256 bit |
| 轮数 Nr | 10 | 12 | 14 |
| 扩展密钥字 Nk | 4 | 6 | 8 |

## 标准算法逐项拆分

| 序号 | 文件 | 名称 | § | 块实现 |
|:--:|------|------|---|---|
| 1 | [06-CIPHER.md](./06-CIPHER.md) | CIPHER | §5.1 | `aes_encrypt` 路径 |
| 2 | [07-KEY-EXPANSION.md](./07-KEY-EXPANSION.md) | KEY EXPANSION | §5.2 | `proc_aes_key_schedule` 模板 |
| 3 | [08-INV-CIPHER.md](./08-INV-CIPHER.md) | INV CIPHER | §5.3 | 未提供独立块 |
| 4 | [09-EQ-INV-CIPHER.md](./09-EQ-INV-CIPHER.md) | EQ INV CIPHER | §5.3.5 | 未提供独立块 |
| 5 | [10-KEY-EXPANSION-EIC.md](./10-KEY-EXPANSION-EIC.md) | KEY EXPANSION EIC | §5.3.5 | 未提供独立块 |

## 组成变换索引

| 文件 | 内容 |
|---|---|
| [01-SubBytes.md](./01-SubBytes.md) | SubBytes / S-box |
| [02-ShiftRows.md](./02-ShiftRows.md) | ShiftRows |
| [03-MixColumns-AddRoundKey.md](./03-MixColumns-AddRoundKey.md) | MixColumns + AddRoundKey |
| [04-KeyExpansion.md](./04-KeyExpansion.md) | 密钥扩展说明 |
| [05-Appendix.md](./05-Appendix.md) | 附录、版本与实现说明 |

## GF(2⁸) 域

MixColumns 使用不可约多项式 m(x) = x⁸ + x⁴ + x³ + x + 1 (0x11B)
