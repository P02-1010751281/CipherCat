# NIST SP 800-38E — XTS 磁盘加密模式

标准原文提取参考：[00-Standard-Source.md](./00-Standard-Source.md)。

来源: NIST SP 800-38E — Recommendation for Block Cipher Modes: XTS-AES Mode
      PDF: [NIST.SP.800-38E.pdf](./NIST.SP.800-38E.pdf)

## 关键算法

- **AES-XTS**: XEX-based Tweaked-codebook mode with ciphertext Stealing
- 专为磁盘/存储加密设计，支持独立扇区加解密

## 文档文件

- `01-XTS.md` — XTS 算法参考
- `NIST.SP.800-38E.pdf` — 标准原文

## 实现状态

✅ 已实现：`xts_encrypt` 支持整块与末尾部分块 ciphertext stealing；拒绝相同 K1/K2，数据单元限制为 16 字节至 16 MiB。Demo 核对 16、17、31、47 字节输入，属项目固定回归；IEEE 1619-2007 为付费文档且未随仓库分发，仓库内无第三方实现交叉复算。XTS 子密钥相同需在使用前拒绝，依据 [NIST FIPS 140-3 Implementation Guidance C.I](https://csrc.nist.gov/csrc/media/Projects/cryptographic-module-validation-program/documents/fips%20140-3/Archived/FIPS%20140-3%20IG%20%5B2024-12-20%5D.pdf)。Demo：`demos/procedures/XTS-Encrypt.json`。该回归不是 NIST 认证测试。

## 函数/原语索引

- [01-XTS.md](./01-XTS.md)：XTS 总览
- [02-Tweak.md](./02-Tweak.md)：tweak 与有限域加倍
- [03-Data-Unit.md](./03-Data-Unit.md)：数据单元与 ciphertext stealing 边界

<!-- standard-body:start -->

## 标准内容

本目录对应 **NIST SP 800-38E — XTS 磁盘加密模式**，按标准条款拆分为 3 个结构化条目，覆盖 「NIST SP 800-38E — XTS-AES 参考」、「XTS — tweak 与有限域加倍原语」、「XTS — 数据单元与 ciphertext stealing 边界」。每个条目页给出标准定位、原文出处、公式或伪代码，以及对应积木块与验证边界。

| 结构化条目 | 内容 | 项目状态 |
|---|---|---|
| [NIST SP 800-38E — XTS-AES 参考](./01-XTS.md) | NIST SP 800-38E — XTS-AES 参考 | 仅参考（未映射为块实现） |
| [XTS — tweak 与有限域加倍原语](./02-Tweak.md) | XTS — tweak 与有限域加倍原语 | 仅参考（未映射为块实现） |
| [XTS — 数据单元与 ciphertext stealing 边界](./03-Data-Unit.md) | XTS — 数据单元与 ciphertext stealing 边界 | 仅参考（未映射为块实现） |

## 实现与验证映射

| 积木块 | 规范语义范围 | 已登记验证入口 | 边界（本行不能证明什么） |
|---|---|---|---|
| `xts_encrypt` | IEEE 1619-2007 / SP 800-38E XTS（AES-128，32 字节 key 拆成两个半钥、16 字节 tweak） | `procedures/XTS-Encrypt.json` 为 `fixed-regression`：使用 IEEE 1619-2007 的经典向量（来源文档付费且未随仓库分发，不可离线核对），并覆盖 17/31/47 字节消息的密文窃取路径、拒绝两半相同的 key 与短于一个分组的消息；输出容器由 `symmetric-bytes-output-contract.test.ts` 核对 | 不登记为官方向量；仓库内亦无第三方独立复算；不覆盖其它数据单元长度与侧信道 |

示例工作区：`demos/procedures/XTS-Encrypt.json`。

以上是当前实现与回归范围，不代表已通过认证或完成完整标准测试；逐块证据与缺项见[标准符合性对象清单](../CONFORMANCE-INVENTORY.md)。

<!-- standard-body:end -->
