# GF(2⁸) 域乘法 — Rijndael 原始提案

## 下载

PDF✅: [rijndael-ammended.pdf](./rijndael-ammended.pdf) (19页)

来源: NIST AES Development, Rijndael Ammended Proposal
      https://csrc.nist.gov/CSRC/media/Projects/Cryptographic-Standards-and-Guidelines/documents/aes-development/Rijndael-ammended.pdf

## 相关内容

- §4: 算法描述 (The Rijndael Block Cipher)
- GF(2⁸) 定义: 不可约多项式 m(x) = x⁸ + x⁴ + x³ + x + 1
- MixColumns 的数学原理
- 查表实现 (xtime, Log/Antilog tables)

## 对应块

`gf_mul` — GF(2⁸) 域乘法
`aes_mix_columns` — 列混合
