# NIST SP 800-38A — 分组密码操作模式

标准原文提取参考：[00-Standard-Source.md](./00-Standard-Source.md)。

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

<!-- standard-body:start -->

## 标准内容

本目录对应 **NIST SP 800-38A — 分组密码操作模式**，按标准条款拆分为 6 个结构化条目，覆盖 「NIST SP 800-38A §6.1 — ECB」、「NIST SP 800-38A — 分组密码操作模式」、「NIST SP 800-38A §6.2 — CBC」、「NIST SP 800-38A §6.3 — CFB」 等。每个条目页给出标准定位、原文出处、公式或伪代码，以及对应积木块与验证边界。

| 结构化条目 | 内容 | 项目状态 |
|---|---|---|
| [NIST SP 800-38A §6.1 — ECB](./01-ECB.md) | NIST SP 800-38A §6.1 — ECB | 仅参考（未映射为块实现） |
| [NIST SP 800-38A — 分组密码模式概述](./01-Modes.md) | NIST SP 800-38A — 分组密码操作模式 | 部分实现（不代表完整标准覆盖） |
| [NIST SP 800-38A §6.2 — CBC](./02-CBC.md) | NIST SP 800-38A §6.2 — CBC | 仅参考（未映射为块实现） |
| [NIST SP 800-38A §6.3 — CFB](./03-CFB.md) | NIST SP 800-38A §6.3 — CFB | 仅参考（未映射为块实现） |
| [NIST SP 800-38A §6.4 — OFB](./04-OFB.md) | NIST SP 800-38A §6.4 — OFB | 仅参考（未映射为块实现） |
| [NIST SP 800-38A §6.5 — CTR](./05-CTR.md) | NIST SP 800-38A §6.5 — CTR | 仅参考（未映射为块实现） |

## 实现与验证映射

| 积木块 | 规范语义范围 | 已登记验证入口 | 边界（本行不能证明什么） |
|---|---|---|---|
| `mode_ecb_encrypt`/decrypt | — | — | — |
| `mode_cbc_encrypt` | — | — | — |
| `mode_ctr_encrypt` | — | — | — |
| `pad_pkcs7` | RFC 2315 §10.3：填充块长须为 1–255 bytes，填充值编码长度；整块输入仍追加完整填充块 | `symmetric-padding-mode-contract.test.ts` 真实 Blockly 双语测试覆盖 0/1/15/16/17-byte 输入、JS `Uint8Array` / Python `bytes` 输出及 0、负数、非整数、256 的拒绝 | 完整 RFC/实现测试集、对所有块长及超大输入的资源行为 |
| `pad_zero` | 项目定义的零填充扩展，不声称由 PKCS#7 或单一通用标准规定；整块输入按当前接口追加一个完整块，必须由调用方保留原始长度 | 同一测试通过真实 Blockly 双语核验非整块和整块输入、JS `Uint8Array` / Python `bytes` 输出，并拒绝非正/非整数块长 | 零填充不可从结果唯一恢复原文长度；未定义通用反填充算法，也不应将其当作标准认证证据 |

示例工作区：`demos/procedures/Mode-ECB.json`、`demos/Mode-CBC.json`、`demos/Mode-CTR.json`；Procedure 模板：`proc_mode_ecb（AES-128；key 留空）`、`proc_mode_cbc（AES-128；key/IV 留空）`、`proc_mode_ctr（AES-128；key/nonce 留空）`。

以上是当前实现与回归范围，不代表已通过认证或完成完整标准测试；逐块证据与缺项见[标准符合性对象清单](../CONFORMANCE-INVENTORY.md)。

<!-- standard-body:end -->
