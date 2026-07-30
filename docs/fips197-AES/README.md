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
| 3 | [03-MixColumns-AddRoundKey.md](./03-MixColumns-AddRoundKey.md) | MixColumns + AddRoundKey | §5.1.3–§5.1.4 | `aes_mix_columns`, `aes_add_round_key` |
| 4 | [04-KeyExpansion.md](./04-KeyExpansion.md) | Key Expansion | §5.2 | `aes_key_schedule` |
| 5 | [05-Appendix.md](./05-Appendix.md) | 附录 | Appendix | — |

## GF(2⁸) 域

MixColumns 使用不可约多项式 m(x) = x⁸ + x⁴ + x³ + x + 1 (0x11B)
