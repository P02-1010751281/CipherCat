# GB/T 32905 — SM3 密码杂凑算法参考

标准原文提取参考：[00-Standard-Source.md](./00-Standard-Source.md)。

来源: GB/T 32905-2016 — 信息安全技术 SM3密码杂凑算法
      PDF: [GBT-32905-2016-SM3.pdf](./GBT-32905-2016-SM3.pdf)

## 参数

| 参数 | 值 |
|------|-----|
| 输出长度 | 256 bit |
| 分组长度 | 512 bit |
| 轮数 | 64 |

## 文件索引

| 序号 | 文件 | 名称 |
|:--:|------|------|
| 1 | [01-SM3.md](./01-SM3.md) | SM3 总览 |
| 2 | [02-Padding.md](./02-Padding.md) | 消息填充 |
| 3 | [03-Expansion-Compression.md](./03-Expansion-Compression.md) | 消息扩展与压缩 |
| 4 | [04-Hash-HMAC.md](./04-Hash-HMAC.md) | 完整哈希与 HMAC 复用 |

## 相关块

| 块 | 说明 |
|----|------|
| `hash_sm3_pad` | 消息填充 |
| `hash_sm3_compress` | 64轮压缩函数 |
| `sm3_hash` | 生成器内部 helper；模板 `proc_sm3_hash` |

> `01-SM3.md` 是从标准 PDF 的参数、公式和 `abc` 向量重新整理的结构化参考；
> 原 PDF 保留用于逐条核验。

<!-- standard-body:start -->

## 标准内容

本目录对应 **GB/T 32905 — SM3 密码杂凑算法参考**，按标准条款拆分为 4 个结构化条目，覆盖 「GB/T 32905-2016 — SM3 算法参考」、「SM3 — 消息填充原语」、「SM3 — 消息扩展与压缩原语」、「SM3 — 完整哈希与 HMAC 复用」。每个条目页给出标准定位、原文出处、公式或伪代码，以及对应积木块与验证边界。

| 结构化条目 | 内容 | 项目状态 |
|---|---|---|
| [GB/T 32905-2016 — SM3 算法参考](./01-SM3.md) | GB/T 32905-2016 — SM3 算法参考 | 仅参考（未映射为块实现） |
| [SM3 — 消息填充原语](./02-Padding.md) | SM3 — 消息填充原语 | 仅参考（未映射为块实现） |
| [SM3 — 消息扩展与压缩原语](./03-Expansion-Compression.md) | SM3 — 消息扩展与压缩原语 | 仅参考（未映射为块实现） |
| [SM3 — 完整哈希与 HMAC 复用](./04-Hash-HMAC.md) | SM3 — 完整哈希与 HMAC 复用 | 仅参考（未映射为块实现） |

## 实现与验证映射

| 积木块 | 规范语义范围 | 已登记验证入口 | 边界（本行不能证明什么） |
|---|---|---|---|
| `hash_sm3_pad` | — | — | — |
| `hash_sm3_compress` | GB/T 32905 SM3 压缩函数（与填充块组合成 `SM3_Hash`） | `procedures/SM3-Hash.json` 回归 SM3("abc") = `66c7f0f4…`（GB/T 32905-2016 A.1 官方值，另经独立实现复算）；`procedures/PBKDF2-SM3.json` 复用该压缩路径 | 只覆盖 512-bit 单块压缩与所列向量；不覆盖多块消息与长度编码全谱 |
| `hash_hmac`(SM3) | FIPS 198-1 HMAC；SHA-256 使用批准底层哈希，SM3-HMAC 标为项目扩展，不冒称 NIST 批准选项 | `hmac-block-contract.test.ts` 通过真实 Blockly 块双语执行：RFC 4231 SHA-256 case 1/6、Node/OpenSSL SM3 交叉结果、非法字节与孤立代理项拒绝、合法 Unicode 一致性、公开输出为 JS `Uint8Array` / Python `bytes` 及同步组合；HMAC Demo 59 项回归中的对应工作区也通过 | 完整官方 HMAC 测试集、完整 GB/T/GM/T 符合性、密钥擦除/常量时间、CAVP 或产品认证 |

示例工作区：`demos/procedures/SM3-Hash.json`、`demos/procedures/PBKDF2-SM3.json`；Procedure 模板：`proc_sm3_hash（仅 padding）`、`proc_sm3_hmac（消息输入留空）`。

以上是当前实现与回归范围，不代表已通过认证或完成完整标准测试；逐块证据与缺项见[标准符合性对象清单](../CONFORMANCE-INVENTORY.md)。

<!-- standard-body:end -->
