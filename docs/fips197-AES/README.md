# FIPS 197 — AES 算法参考

来源: NIST FIPS 197 — Advanced Encryption Standard
      https://csrc.nist.gov/pubs/fips/197/final
      https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.197-upd1.pdf

## 参数

| 参数 | AES-128 | AES-192 | AES-256 |
|------|:-----:|:-----:|:-----:|
| 分组长度 | 128 | 128 | 128 |
| 密钥长度 | 128 | 192 | 256 |
| 轮数 Nr | 10 | 12 | 14 |
| 扩展密钥字 Nk | 4 | 6 | 8 |

## 算法步骤

| 步骤 | 名称 | § | CipherCat 块 |
|------|------|---|------------|
| 1 | SubBytes | §5.1.1 | `aes_sub_bytes` |
| 2 | ShiftRows | §5.1.2 | `aes_shift_rows` |
| 3 | MixColumns | §5.1.3 | `aes_mix_columns` |
| 4 | AddRoundKey | §5.1.4 | `aes_add_round_key` |
| — | 密钥扩展 | §5.2 | `aes_key_schedule` |
| — | 便利轮 | — | `aes_round`, `aes_last_round` |

## S-Box

256 字节替换表 (§5.1.1)，详见 CipherCat 生成器中的 `AES_SBOX` 常量。

## GF(2⁸) 域

MixColumns 使用不可约多项式 m(x) = x⁸ + x⁴ + x³ + x + 1 (0x11B)。
CipherCat 对应块: `gf_mul`
