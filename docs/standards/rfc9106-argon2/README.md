# RFC 9106 — Argon2 内存困难函数

来源：[RFC 9106](https://datatracker.ietf.org/doc/html/rfc9106) — Argon2 Memory-Hard Function for Password Hashing and Proof-of-Work Applications；本目录保存的文本副本：[rfc9106.txt](./rfc9106.txt)。该文件是 IRTF Informational RFC，不是 IETF Standards Track 标准。

## 变体

| 变体 | RFC 描述的用途 | 项目实现 |
|------|------|----------|
| Argon2d | 数据相关访问；适用于侧信道不是主要威胁的场景 | `argon2_hash`（VARIANT 下拉） |
| Argon2i | 数据无关访问 | `argon2_hash`（VARIANT 下拉） |
| Argon2id | 首 pass 前半采用 Argon2i，其余采用 Argon2d；RFC 推荐 | `argon2_hash`（VARIANT 下拉） |

当前块实现固定 v1.3（version `0x13`），提供三种变体。RFC 9106 §3.1 规定 `p`、`t`、`m` 与 Tag 长度的编码范围，且 `m ≥ 8p`；密码、盐、Secret 和附加数据（`P/S/K/X`）长度均不得超过 `2^32−1` 字节。盐推荐 16 字节，但 RFC 没有规定盐的最小长度。项目输入接受字节序列或 UTF-8 文本，拒绝任意迭代器，并将每项输入限制为 1 MiB；这是项目级资源限制，不是 RFC 限值。其他项目执行预算为 `m ≤ 65,536 KiB`、`t ≤ 10`、`p ≤ 16`、Tag `≤ 1,024` 字节，且 `m × t ≤ 65,536 KiB-pass`。

因此本实现不能运行 RFC 推荐的 2 GiB/1-pass 或 64 MiB/3-pass 参数配置，不应作为生产口令存储或密钥派生实现。RFC 9106 §5.1–5.3 的 Demo 回归只核验三种变体的最终 Tag 输出；未核验 pre-hash digest 或每 pass 的中间内存块，也不是完整官方测试集。Demo：[`demos/procedures/ARGON2.json`](../../../demos/procedures/ARGON2.json)。

## 与 PBKDF2 对比

| 特性 | PBKDF2 | Argon2 |
|------|--------|--------|
| 内存硬化 | ❌ | ✅ |
| 并行硬化 | ❌ | ✅ |
| 规范来源 | SP 800-132 | RFC 9106（IRTF Informational） |
| 项目用途 | 口令派生 | 受执行预算限制的教学/研究示例 |

<!-- standard-body:start -->

## 标准内容

本目录对应 **RFC 9106 — Argon2 内存困难函数**，目前以标准来源与积木块映射为主，尚未拆出独立的条款条目页；具体覆盖范围见下方映射与覆盖矩阵。

## 实现与验证映射

| 积木块 | 规范语义范围 | 已登记验证入口 | 边界（本行不能证明什么） |
|---|---|---|---|
| `argon2_hash` | RFC 9106 §3.1 Argon2 v1.3；RFC 9106 是 IRTF Informational RFC。`P/S/K/X≤2^32−1` bytes、`m≥8p`、Tag 至少 4 bytes；盐无 RFC 最小长度，推荐 16 bytes。项目只接受字节序列/UTF-8 文本，每项输入限 1 MiB，执行参数另限 `m≤65,536 KiB`、`t≤10`、`p≤16`、Tag `≤1,024 bytes`、`m×t≤65,536 KiB-pass` | `generator-contracts.test.ts` 通过真实 Blockly JS/Python 生成代码，拒绝 4 类超 1 MiB 输入、任意迭代器和非法字节值，核对 UTF-8 文本与空盐的双语一致，并覆盖参数边界；`ARGON2.json` 回归执行 RFC 9106 §5.1–5.3 三种变体的最终 Tag 样例 | 项目输入/执行上限不是 RFC 限值，且不支持 RFC 推荐的 2 GiB/1-pass、64 MiB/3-pass 配置；Demo 只核对最终 Tag，不核对 pre-hash/中间块，不是完整测试集或生产口令哈希实现 |

示例工作区：`demos/procedures/ARGON2.json`。

以上是当前实现与回归范围，不代表已通过认证或完成完整标准测试；逐块证据与缺项见[标准符合性对象清单](../CONFORMANCE-INVENTORY.md)。

<!-- standard-body:end -->
