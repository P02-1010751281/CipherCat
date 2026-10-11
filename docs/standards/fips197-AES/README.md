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

<!-- standard-body:start -->

## 标准内容

本目录对应 **FIPS 197 — AES 算法参考**，按标准条款拆分为 11 个结构化条目，覆盖 「§5」、「FIPS 197 §5.1.1，Eq. (5.2)–(5.4)」、「FIPS 197 §5.1.2，Eq. (5.5)」、「FIPS 197 §5.1.3–§5.1.4，Eq. (5.6)–(5.9)」 等。每个条目页给出标准定位、原文出处、公式或伪代码，以及对应积木块与验证边界。

| 结构化条目 | 内容 | 项目状态 |
|---|---|---|
| [FIPS 197 — AES 概述](./01-AES.md) | §5 | 仅参考（未映射为块实现） |
| [AES — SubBytes 原语](./01-SubBytes.md) | FIPS 197 §5.1.1，Eq. (5.2)–(5.4) | 已实现；也可作为 AES 轮变换中的独立步骤核对 |
| [AES — ShiftRows 原语](./02-ShiftRows.md) | FIPS 197 §5.1.2，Eq. (5.5) | 已实现；可作为 AES 轮变换中的独立步骤核对 |
| [AES — MixColumns 与 AddRoundKey 原语](./03-MixColumns-AddRoundKey.md) | FIPS 197 §5.1.3–§5.1.4，Eq. (5.6)–(5.9) | `aes_mix_columns`、`aes_add_round_key` 已实现 |
| [FIPS 197 — AES 密钥扩展参考](./04-KeyExpansion.md) | §5.2 | 仅参考（未映射为块实现） |
| [FIPS 197 — AES 标准向量](./05-Appendix.md) | 附录 A–C | 仅参考（未映射为块实现） |
| [Algorithm 1 — AES CIPHER（NIST FIPS 197）](./06-CIPHER.md) | NIST FIPS 197 §5.1，Algorithm 1 | 部分实现 |
| [Algorithm 2 — AES 密钥扩展（NIST FIPS 197）](./07-KEY-EXPANSION.md) | NIST FIPS 197 §5.2，Algorithm 2 | 部分实现 |
| [Algorithm 3 — AES 逆 CIPHER（NIST FIPS 197）](./08-INV-CIPHER.md) | NIST FIPS 197 §5.3，Algorithm 3 | 仅参考 |
| [Algorithm 4 — AES 等价逆 CIPHER（NIST FIPS 197）](./09-EQ-INV-CIPHER.md) | NIST FIPS 197 §5.3.5，Algorithm 4 | 仅参考 |
| [Algorithm 5 — AES 等价逆密钥扩展（NIST FIPS 197）](./10-KEY-EXPANSION-EIC.md) | NIST FIPS 197 §5.3.5，Algorithm 5 | 仅参考 |

## 实现与验证映射

| 积木块 | 规范语义范围 | 已登记验证入口 | 边界（本行不能证明什么） |
|---|---|---|---|
| `aes_sub_bytes` | — | — | — |
| `aes_shift_rows` | — | — | — |
| `aes_mix_columns` | — | — | — |
| `aes_add_round_key` | — | — | — |
| `sbox`(PRESET=AES) | — | — | — |
| `pad_pkcs7` | RFC 2315 §10.3：填充块长须为 1–255 bytes，填充值编码长度；整块输入仍追加完整填充块 | `symmetric-padding-mode-contract.test.ts` 真实 Blockly 双语测试覆盖 0/1/15/16/17-byte 输入、JS `Uint8Array` / Python `bytes` 输出及 0、负数、非整数、256 的拒绝 | 完整 RFC/实现测试集、对所有块长及超大输入的资源行为 |

示例工作区：`demos/AES-Atomic-Round.json`、`demos/Procedure-AES-Round.json`、`demos/procedures/AES-Round.json`、`demos/procedures/AES-LastRound.json`；Procedure 模板：`proc_aes_round`、`proc_aes_last_round`、`proc_aes_key_schedule（10 次空循环；无轮密钥计算）`。

以上是当前实现与回归范围，不代表已通过认证或完成完整标准测试；逐块证据与缺项见[标准符合性对象清单](../CONFORMANCE-INVENTORY.md)。

<!-- standard-body:end -->
