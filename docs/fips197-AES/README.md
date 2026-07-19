# FIPS 197 — AES 算法参考

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

## 算法步骤索引

| 序号 | 文件 | 名称 | § | CipherCat |
|:--:|------|------|---|---|
| 1 | [01-SubBytes.md](./01-SubBytes.md) | SubBytes | §5.1.1 | `aes_sub_bytes` |
| 2 | [02-ShiftRows.md](./02-ShiftRows.md) | ShiftRows | §5.1.2 | `aes_shift_rows` |
| 3 | [03-MixColumns.md](./03-MixColumns.md) | MixColumns | §5.1.3 | `aes_mix_columns` |
| 4 | [04-AddRoundKey.md](./04-AddRoundKey.md) | AddRoundKey | §5.1.4 | `aes_add_round_key` |
| 5 | [05-KeyExpansion.md](./05-KeyExpansion.md) | Key Expansion | §5.2 | `aes_key_schedule` |
| 6 | [06-InvCipher.md](./06-InvCipher.md) | InvCipher (解密) | §5.3 | — |
| 7 | [09-GF-Multiplication.md](./09-GF-Multiplication.md) | GF(2⁸) 域乘法 | Appendix | `gf_mul` |
| — | [07-Appendix-KeyExpansion-Examples.md](./07-Appendix-KeyExpansion-Examples.md) | 密钥扩展示例 | Appendix A | — |

## GF(2⁸) 域

MixColumns 使用不可约多项式 m(x) = x⁸ + x⁴ + x³ + x + 1 (0x11B)
