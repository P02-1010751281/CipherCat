## 条目元数据

| 字段 | 内容 |
|---|---|
| 类型 | 原语 / 函数 |
| 标准定位 | NIST SP 800-38A — 分组密码操作模式 |
| 原文证据 | [source 提取稿](./00-Standard-Source.md)（本目录 PDF 清单见 source 页） |
| 原文位置 | [提取稿 §6.1–§6.5，行 531–1023](./00-Standard-Source.md#L531-L1023)；PDF 物理页需结合同目录 PDF 核对 |
| 项目状态 | 部分实现（详见本文现有实现/缺项说明） |

## 原文定位与引用

> 本页按 source 中的“NIST SP 800-38A — 分组密码操作模式”拆分；这是定位说明，不替代标准逐字引文。完整正文、公式和表格请回看 [source 提取稿](./00-Standard-Source.md) 与同目录 PDF。

## 原文摘录

> 本页正文是按 source 的“NIST SP 800-38A — 分组密码操作模式”拆出的结构化说明；该定位是概览/组合页，未强行截取不唯一的行号。需要核对时请按 [source 提取稿](./00-Standard-Source.md) 的章节标题和同目录 PDF 查看原文。

> **来源版本**：NIST SP 800-38A，2001 Edition。本文按 §6 及附录 D 重新整理，
> 不使用 PDF 图形的文本层转录。逐字原文见 [NIST.SP.800-38A.pdf](./NIST.SP.800-38A.pdf)。

设底层分组密码 `CIPH_K` 的分组长度为 `b` bit，输入分组为 `P_j`，输出分组为 `C_j`。
ECB、CBC、CFB、OFB、CTR 都是保密性模式；它们本身不提供完整性认证。

## 模式索引

| 模式 | 标准章节 | 参考页 | CipherCat 状态 |
|---|---|---|---|
| ECB | §6.1 | [01-ECB.md](./01-ECB.md) | `mode_ecb_encrypt/decrypt` |
| CBC | §6.2 | [02-CBC.md](./02-CBC.md) | `mode_cbc_encrypt` |
| CFB | §6.3 | [03-CFB.md](./03-CFB.md) | 未实现 |
| OFB | §6.4 | [04-OFB.md](./04-OFB.md) | 未实现 |
| CTR | §6.5 | [05-CTR.md](./05-CTR.md) | `mode_ctr_encrypt` |

## 公式或伪代码

> 本条目是分组密码模式索引，没有独立归属的公式或伪代码规范单元；上文模式表仅作导航，不能当作完整标准摘录。
> 完整规范单元见 [ECB](./01-ECB.md)、[CBC](./02-CBC.md)、[CFB](./03-CFB.md)、[OFB](./04-OFB.md)、[CTR](./05-CTR.md) 和本页 [source](./00-Standard-Source.md)。

## 共同边界

- ECB、CBC、CFB 和 OFB 需要完整分组；CTR 可处理最后一个不完整分组。
- CBC 的 IV 必须不可预测，CFB/OFB 的 IV 也必须按标准要求生成；IV 不必保密，但完整性应受保护。
- CTR 的每个计数器块在同一密钥下必须唯一，计数器空间耗尽前不得回绕。
- 若应用需要防篡改，应使用 GCM、CCM、CMAC 等认证机制，而不是把上述模式单独当作 AEAD。

## 相关标准

国产分组模式 [GB/T 17964](../gbt17964-modes/01-Modes.md) 的教学页按 SM4 场景说明相同的模式关系；
具体使用仍须以对应标准版本和实现约束为准。
