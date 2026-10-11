# NIST SP 800-38C — CCM 认证加密模式

标准原文提取参考：[00-Standard-Source.md](./00-Standard-Source.md)。

来源: NIST SP 800-38C — Recommendation for Block Cipher Modes: CCM Mode for Authentication and Confidentiality
      PDF: [NIST.SP.800-38C.pdf](./NIST.SP.800-38C.pdf)

## 关键算法

- **AES-CCM**: CTR 加密 + CBC-MAC 认证的组合模式
- 提供机密性和认证性的 AEAD 方案

## 文档文件

- `01-CCM.md` — CCM 算法参考
- `NIST.SP.800-38C.pdf` — 标准原文

## 实现状态

✅ 已实现：`ccm_encrypt`，SP 800-38C 附录 C Example 1-3 官方向量（tagLen 4/6/8），并由独立实现复算一致。Demo：`demos/procedures/CCM-Encrypt.json`。

## 函数/原语索引

- [01-CCM.md](./01-CCM.md)：CCM 总览
- [02-Formatting.md](./02-Formatting.md)：B0、AAD 与计数器编码
- [03-CBC-MAC.md](./03-CBC-MAC.md)：认证链
- [04-CTR.md](./04-CTR.md)：CTR 加密与标签掩码

<!-- standard-body:start -->

## 标准内容

本目录对应 **NIST SP 800-38C — CCM 认证加密模式**，按标准条款拆分为 4 个结构化条目，覆盖 「NIST SP 800-38C — CCM 参考」、「NIST SP 800-38C §6.1–§6.2」、「NIST SP 800-38C §6.3」、「CCM — CTR 加密原语」。每个条目页给出标准定位、原文出处、公式或伪代码，以及对应积木块与验证边界。

| 结构化条目 | 内容 | 项目状态 |
|---|---|---|
| [NIST SP 800-38C — CCM 参考](./01-CCM.md) | NIST SP 800-38C — CCM 参考 | 部分实现（不代表完整标准覆盖） |
| [CCM — B0、AAD 与计数器编码原语](./02-Formatting.md) | NIST SP 800-38C §6.1–§6.2 | 由 `ccm_encrypt` 内部实现 |
| [CCM — CBC-MAC 认证原语](./03-CBC-MAC.md) | NIST SP 800-38C §6.3 | 由 `ccm_encrypt` 内部实现；无独立 CBC-MAC 块 |
| [CCM — CTR 加密原语](./04-CTR.md) | CCM — CTR 加密原语 | 仅参考（未映射为块实现） |

## 实现与验证映射

| 积木块 | 规范语义范围 | 已登记验证入口 | 边界（本行不能证明什么） |
|---|---|---|---|
| `ccm_encrypt` | SP 800-38C CCM（CBC-MAC + CTR），AES-128 | `procedures/CCM-Encrypt.json` 回归附录 C Example 1/2/3（tagLen 4/6/8），并由 `demo-vector-crosscheck.test.ts` 独立复算一致；输出容器由 `symmetric-bytes-output-contract.test.ts` 核对 | 只覆盖 Example 1-3 的参数组合；不覆盖全部 nonce/tag 长度组合 |

示例工作区：`demos/procedures/CCM-Encrypt.json`。

以上是当前实现与回归范围，不代表已通过认证或完成完整标准测试；逐块证据与缺项见[标准符合性对象清单](../CONFORMANCE-INVENTORY.md)。

<!-- standard-body:end -->
