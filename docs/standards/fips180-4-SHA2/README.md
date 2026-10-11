# FIPS 180-4 — SHA-2 算法参考

标准原文提取参考：[00-Standard-Source.md](./00-Standard-Source.md)。

来源: NIST FIPS 180-4 — Secure Hash Standard (SHS)
      https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.180-4.pdf
      PDF: [NIST.FIPS.180-4.pdf](./NIST.FIPS.180-4.pdf)

## SHA-256 参数 (块实现)

| 参数 | 值 |
|------|-----|
| 输出长度 | 256 bit (32 bytes) |
| 分组长度 | 512 bit (64 bytes) |
| 轮数 | 64 |
| 字长 | 32 bit |

## 算法步骤索引

| 序号 | 文件 | 名称 | § | 块实现 |
|:--:|------|------|---|---|
| 1 | [01-SHA2.md](./01-SHA2.md) | SHA-2 总览 | §4–§6 | — |
| 2 | [02-Padding.md](./02-Padding.md) | 消息填充 | §5 | `hash_sha256_pad` · `hash_sha256_pad_text` · `hash_sha256_pad_hex` · `hash_sha512_pad` |
| 3 | [03-MessageExpansion.md](./03-MessageExpansion.md) | 消息扩展 | §6 | 压缩块内部 |
| 4 | [04-Compression.md](./04-Compression.md) | 压缩函数 | §6 | `hash_sha256_compress` · `hash_sha512_compress` |
| 5 | [05-Digest.md](./05-Digest.md) | 摘要输出与变体 | §6 | `hash_sha224_hash` · `hash_sha512_hash` |

## 其他 SHA-2 变体

| 变体 | 输出 | 字长 | 轮数 | 状态 |
|------|------|------|------|------|
| SHA-224 | 224 bit | 32 | 64 | ✅ `hash_sha256_compress` + SHA-224 IV（Demo `SHA224-Hash.json`） |
| SHA-384 | 384 bit | 64 | 80 | ✅ `hash_sha512_hash`（HASH 下拉 SHA-384/512） |
| SHA-512 | 512 bit | 64 | 80 | ✅ `hash_sha512_hash`（HASH 下拉） |
| SHA-512/224 | 224 bit | 64 | 80 | 未实现 |
| SHA-512/256 | 256 bit | 64 | 80 | 未实现 |

<!-- standard-body:start -->

## 标准内容

本目录对应 **FIPS 180-4 — SHA-2 算法参考**，按标准条款拆分为 5 个结构化条目，覆盖 「§6.1–§6.7」、「FIPS 180-4 §5.1，§5.2」、「FIPS 180-4 §6.2.2、§6.4.2」、「FIPS 180-4 §6」。每个条目页给出标准定位、原文出处、公式或伪代码，以及对应积木块与验证边界。

| 结构化条目 | 内容 | 项目状态 |
|---|---|---|
| [NIST FIPS 180-4 — SHA-2 参考](./01-SHA2.md) | §6.1–§6.7 | 部分实现（不代表完整标准覆盖） |
| [SHA-2 — 消息填充原语](./02-Padding.md) | FIPS 180-4 §5.1，§5.2 | SHA-224/256、SHA-384/512 填充路径已映射 |
| [SHA-2 — 消息扩展原语](./03-MessageExpansion.md) | FIPS 180-4 §6.2.2、§6.4.2 | 仅参考（未映射为块实现） |
| [SHA-2 — 压缩函数原语](./04-Compression.md) | FIPS 180-4 §6.2.2、§6.4.2 | 仅参考（未映射为块实现） |
| [SHA-2 — 摘要输出与变体原语](./05-Digest.md) | FIPS 180-4 §6 | SHA-224/256、SHA-384/512 已覆盖；SHA-512/t 未覆盖 |

## 实现与验证映射

| 积木块 | 规范语义范围 | 已登记验证入口 | 边界（本行不能证明什么） |
|---|---|---|---|
| `hash_sha224_hash` | FIPS 180-4 §5.3.2、§6.3；RFC 3874 §3.1 Test Vector #1 | `sha256-block-contract.test.ts` 通过真实 Blockly 高层块生成并运行 JS/Python，核对 `abc` → `23097d223405d8228642a477bda255b32aadbce4bda0b3f7e36c9da7` | 只覆盖一个 24-bit 消息已知答案；不替代 SHAVS 全量测试、其它长度/运行环境或 CAVP/产品验证 |
| `hash_sha256_pad` | — | — | — |
| `hash_sha256_compress` | FIPS 180-4 §6.2.2；Blockly 插槽 `W` 为兼容旧工作区保留，实际接收一个原始 64-byte 消息分组并在内部扩展调度 | `sha256-block-contract.test.ts` 通过真实 Blockly 块执行 JS/Python，核对 SHA-256("abc") 单块结果、状态/字节范围、非法值、稀疏数组、整数值浮点输入与无符号输出 | 完整官方测试向量集、长消息端点、其它实现/运行环境及 CAVP/产品认证 |
| `hash_sha512_pad` | FIPS 180-4 §5.1；1024-bit 分组、128-bit 大端消息长度字段 | `sha512-block-contract.test.ts` 从真实 Blockly 块执行双语言代码，核对 `abc` 固定填充块、0/111/112/127/128/239/240-byte 长度边界、`0x80` 标记和 128-bit 长度字段 | 完整 SHAVS 测试向量集、位级消息、超出当前可驻留内存范围的长度及正式算法验证 |
| `hash_sha512_compress` | FIPS 180-4 §6.4；8 个 64-bit 初始状态字、单个 1024-bit 分组、内部扩展 80-word 消息调度并执行压缩 | 同一 `sha512-block-contract.test.ts` 以实际 Pad→Compress Blockly 连接，从 SHA-512 IV 得到固定 `abc` 摘要状态，JS/Python 均比对 | 完整 SHAVS 测试向量集、任意中间状态/多分组流程、其它运行环境及正式算法验证 |
| `hash_sha512_hash`(SHA-384/512 下拉) | FIPS 180-4 §6.4/§6.5 SHA-512 与 SHA-384；共用 64-bit 核但使用各自 IV，SHA-384 截断到 384 bit | 同一测试通过实际 Blockly 哈希块核对 SHA-512/384 的 `abc` 固定结果；`procedures/SHA512-Hash.json`、`SHA384-Hash.json` 另由 Demo 双语言驱动执行 | 完整官方向量集、空/多分组消息矩阵、其它运行环境及 CAVP/产品认证 |

示例工作区：`demos/SHA256-Atomic-Hash.json`、`demos/procedures/SHA224-Hash.json`、`demos/procedures/SHA256-Hash.json`、`demos/procedures/SHA384-Hash.json`、`demos/procedures/SHA512-Hash.json`；Procedure 模板：`proc_sha256_hash（仅 padding 片段）`、`proc_md_iterate`。

以上是当前实现与回归范围，不代表已通过认证或完成完整标准测试；逐块证据与缺项见[标准符合性对象清单](../CONFORMANCE-INVENTORY.md)。

<!-- standard-body:end -->
