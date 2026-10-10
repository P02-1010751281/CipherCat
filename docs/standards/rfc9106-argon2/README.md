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
