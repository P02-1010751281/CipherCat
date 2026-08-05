# NIST SP 800-38A — 分组密码操作模式

来源: NIST SP 800-38A — Recommendation for Block Cipher Modes of Operation
      PDF: [NIST.SP.800-38A.pdf](./NIST.SP.800-38A.pdf)

## 模式索引

| 编号 | 文件 | 模式 | § | 块实现 |
|:--:|------|------|---|----------|
| 1 | [01-ECB.md](./01-ECB.md) | ECB 电子密码本 | §6.1 | `mode_ecb_encrypt`/`decrypt` |
| 2 | [02-CBC.md](./02-CBC.md) | CBC 密码块链接 | §6.2 | `mode_cbc_encrypt` |
| 3 | [03-CFB.md](./03-CFB.md) | CFB 密码反馈 | §6.3 | 未实现 |
| 4 | [04-OFB.md](./04-OFB.md) | OFB 输出反馈 | §6.4 | 未实现 |
| 5 | [05-CTR.md](./05-CTR.md) | CTR 计数器 | §6.5 | `mode_ctr_encrypt` |

> 版本注：NIST 2022-03 提案、2023-04 决定修订 SP 800-38A（现行版仍为 2001-12）；拆分与块实现基于现行版。
