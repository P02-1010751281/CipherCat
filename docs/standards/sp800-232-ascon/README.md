# NIST SP 800-232 — ASCON 轻量认证加密

标准原文提取参考：[00-Standard-Source.md](./00-Standard-Source.md)。

## 算法逐项拆分

原文 7 个独立算法均有独立条目页；概览页只负责导航和项目边界。

| 算法 | 条目页 | 项目状态 |
|:--:|---|---|
| 1 `parse` | [`05-parse.md`](./05-parse.md) | 仅参考 |
| 2 `pad` | [`06-pad.md`](./06-pad.md) | 仅参考 |
| 3 `Ascon-AEAD128.enc` | [`07-Ascon-AEAD128-enc.md`](./07-Ascon-AEAD128-enc.md) | 部分实现 |
| 4 `Ascon-AEAD128.dec` | [`08-Ascon-AEAD128-dec.md`](./08-Ascon-AEAD128-dec.md) | 已实现选定路径 |
| 5 `Ascon-Hash256` | [`09-Ascon-Hash256.md`](./09-Ascon-Hash256.md) | 已实现选定路径 |
| 6 `Ascon-XOF128` | [`10-Ascon-XOF128.md`](./10-Ascon-XOF128.md) | 已实现选定路径 |
| 7 `Ascon-CXOF128` | [`11-Ascon-CXOF128.md`](./11-Ascon-CXOF128.md) | 已实现选定路径 |

来源: NIST SP 800-232 — Ascon-Based Lightweight Cryptography Standards for Constrained
      Devices: Authenticated Encryption, Hash, and Extendable Output Functions
      https://csrc.nist.gov/pubs/sp/800/232/final      (2025-08-13 正式发布)
      PDF: [NIST.SP.800-232.pdf](./NIST.SP.800-232.pdf)（Final 版；仓库曾误存 2024-11 IPD 草案，2025-08-05 替换）

## 算法

| 模式 | 类型 | 块实现 |
|------|------|----------|
| Ascon-AEAD128 | AEAD 认证加密 | `ascon_encrypt` ✅（IV=0x00001000808C0001，rate 128/16B，8 轮，即原 Ascon-128a 参数） |
| Ascon-Hash256 / XOF128 / CXOF128 | 哈希 / 可扩展输出 | `ascon_hash256` / `ascon_xof128` / `ascon_cxof128`；扩展 Demo 已验证 |

## 实现状态

`ascon_encrypt`、`ascon_decrypt`、`ascon_hash256`、`ascon_xof128`、`ascon_cxof128` 已接入。
当前 Demo 只核验少量固定输出、空消息解密和错误标签/参数拒绝；未运行完整的 1,089 项 AEAD KAT
或完整 Hash/XOF KAT 套件，也不覆盖标准定义的流式 API。生成代码回归不代表正式验证或认证。

## 函数/原语索引

- [01-Ascon.md](./01-Ascon.md)：标准范围与 AEAD 总览
- [02-Permutation.md](./02-Permutation.md)：320-bit 置换（由高层块内部使用）
- [12-pC.md](./12-pC.md)、[13-pS.md](./13-pS.md)、[14-pL.md](./14-pL.md)：置换三层的公式与边界
- [03-Hash-XOF.md](./03-Hash-XOF.md)：Hash/XOF/CXOF 缺项
- [04-AEAD.md](./04-AEAD.md)：AEAD 加密与解密边界

<!-- standard-body:start -->

## 标准内容

本目录对应 **NIST SP 800-232 — ASCON 轻量认证加密**，按标准条款拆分为 14 个结构化条目，覆盖 「NIST SP 800-232 — Ascon 轻量级密码参考」、「NIST SP 800-232 §4，Ascon-p[12] / Ascon-p[8]」、「NIST SP 800-232 §5.1–§5.3」、「Ascon — AEAD 原语与解密边界」 等。每个条目页给出标准定位、原文出处、公式或伪代码，以及对应积木块与验证边界。

| 结构化条目 | 内容 | 项目状态 |
|---|---|---|
| [NIST SP 800-232 — Ascon 轻量级密码参考](./01-Ascon.md) | NIST SP 800-232 — Ascon 轻量级密码参考 | 已实现选定单次调用路径（完整 KAT/流式 API 仍有缺项） |
| [Ascon — 320-bit 置换原语](./02-Permutation.md) | NIST SP 800-232 §4，Ascon-p[12] / Ascon-p[8] | 由 Ascon 加密、解密、Hash 和 XOF 块内部调用；无独立置换块 |
| [Ascon — Hash、XOF 与 CXOF 原语族](./03-Hash-XOF.md) | NIST SP 800-232 §5.1–§5.3 | `ascon_hash256`、`ascon_xof128`、`ascon_cxof128` 已实现选定单次调用路径 |
| [Ascon — AEAD 原语与解密边界](./04-AEAD.md) | Ascon — AEAD 原语与解密边界 | 加密、解密和错误标签拒绝已实现选定路径 |
| [Algorithm 1 — 分块解析（NIST SP 800-232）](./05-parse.md) | NIST SP 800-232 §2.1，Algorithm 1 `parse` | 仅参考 |
| [Algorithm 2 — 分隔填充（NIST SP 800-232）](./06-pad.md) | NIST SP 800-232 §2.1，Algorithm 2 `pad` | 仅参考 |
| [Algorithm 3 — Ascon-AEAD128 加密（NIST SP 800-232）](./07-Ascon-AEAD128-enc.md) | NIST SP 800-232 §4.1.1，Algorithm 3 `Ascon-AEAD128-enc` | 部分实现 |
| [Algorithm 4 — Ascon-AEAD128 解密（NIST SP 800-232）](./08-Ascon-AEAD128-dec.md) | NIST SP 800-232 §4.1.2，Algorithm 4 `Ascon-AEAD128-dec` | 已实现选定单次调用路径；官方解密 KAT 仍待补充 |
| [Algorithm 5 — Ascon-Hash256（NIST SP 800-232）](./09-Ascon-Hash256.md) | NIST SP 800-232 §5.1，Algorithm 5 `Ascon-Hash256` | 已实现选定单次调用路径；官方 Hash KAT 仍待补充 |
| [Algorithm 6 — Ascon-XOF128（NIST SP 800-232）](./10-Ascon-XOF128.md) | NIST SP 800-232 §5.2，Algorithm 6 `Ascon-XOF128` | 已实现选定单次调用路径；官方 XOF KAT 仍待补充 |
| [Algorithm 7 — Ascon-CXOF128（NIST SP 800-232）](./11-Ascon-CXOF128.md) | NIST SP 800-232 §5.3，Algorithm 7 `Ascon-CXOF128` | 已实现选定单次调用路径；官方 CXOF KAT 仍待补充 |
| [Ascon `pC` — 轮常量注入层](./12-pC.md) | NIST SP 800-232 §3.2，公式 (3)–(4)、Table 5 | 由置换内部调用；无独立 Blockly 块 |
| [Ascon `pS` — 5-bit S 盒替换层](./13-pS.md) | NIST SP 800-232 §3.3，公式 (5)–(7)、Table 6 | 由置换内部调用；无独立 Blockly 块 |
| [Ascon `pL` — 线性扩散层](./14-pL.md) | NIST SP 800-232 §3.4，公式 (8)–(12) | 由置换内部调用；无独立 Blockly 块 |

## 实现与验证映射

| 积木块 | 规范语义范围 | 已登记验证入口 | 边界（本行不能证明什么） |
|---|---|---|---|
| `ascon_encrypt` | — | — | — |
| `ascon_decrypt` | — | — | — |
| `ascon_hash256` | — | — | — |
| `ascon_xof128` | — | — | — |
| `ascon_cxof128` | — | — | — |

示例工作区：`demos/procedures/ASCON.json`、`demos/ASCON-Extended.json`。

以上是当前实现与回归范围，不代表已通过认证或完成完整标准测试；逐块证据与缺项见[标准符合性对象清单](../CONFORMANCE-INVENTORY.md)。

<!-- standard-body:end -->
