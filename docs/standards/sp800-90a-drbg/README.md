# NIST SP 800-90A — Deterministic Random Bit Generators (DRBG)

标准原文提取参考：[00-Standard-Source.md](./00-Standard-Source.md)。

来源: NIST SP 800-90A Rev.1 — Recommendation for Random Number Generation Using Deterministic Random Bit Generators

## 标准算法与项目子集

- **Hash_DRBG**: 基于 SHA-256/SHA-512 的 DRBG
- **HMAC_DRBG**: 基于 HMAC-SHA-256 的 DRBG
- **CTR_DRBG**: 基于 AES-CTR 的 DRBG（标准有定义，当前项目未实现）

## 文档文件

- `01-DRBG.md` — DRBG 算法参考
- `NIST.SP.800-90A.pdf` — 标准原文

## 实现状态

✅ 已实现：`drbg_generate`（HMAC-DRBG / HMAC-SHA-256 的教学子集，Demo 含少量固定输入/输出回归；不是完整 NIST CAVP 向量集）。
未覆盖：Hash_DRBG、CTR_DRBG、additional input、prediction resistance，以及公开块级别的完整 reseed 生命周期验证。Demo：`demos/procedures/DRBG.json`。

## 函数/原语索引

- [01-DRBG.md](./01-DRBG.md)：标准族与项目子集总览
- [02-HMAC-DRBG-Update.md](./02-HMAC-DRBG-Update.md)：HMAC_DRBG 状态与 Update
- [03-Generate-and-Lifecycle.md](./03-Generate-and-Lifecycle.md)：Generate 与生命周期缺项

<!-- standard-body:start -->

## 标准内容

本目录对应 **NIST SP 800-90A — Deterministic Random Bit Generators (DRBG)**，按标准条款拆分为 3 个结构化条目，覆盖 「NIST SP 800-90A Rev.1 — DRBG 参考」、「DRBG — HMAC_DRBG Update 原语」、「NIST SP 800-90A Rev.1 §10.1.2」。每个条目页给出标准定位、原文出处、公式或伪代码，以及对应积木块与验证边界。

| 结构化条目 | 内容 | 项目状态 |
|---|---|---|
| [NIST SP 800-90A Rev.1 — DRBG 参考](./01-DRBG.md) | NIST SP 800-90A Rev.1 — DRBG 参考 | 部分实现（不代表完整标准覆盖） |
| [DRBG — HMAC_DRBG Update 原语](./02-HMAC-DRBG-Update.md) | DRBG — HMAC_DRBG Update 原语 | 仅参考（未映射为块实现） |
| [DRBG — Generate 与生命周期边界](./03-Generate-and-Lifecycle.md) | NIST SP 800-90A Rev.1 §10.1.2 | HMAC-DRBG 一次性教学路径已覆盖；完整生命周期为缺项 |

## 实现与验证映射

| 积木块 | 规范语义范围 | 已登记验证入口 | 边界（本行不能证明什么） |
|---|---|---|---|
| `drbg_generate` | SP 800-90A Rev.1 §10.1.2 HMAC-SHA-256 教学子集；标准规定请求不超过 Table 2 的 `2^19` bit 并按左端请求位返回；项目 API 以 MSB-first 字节数组承载位串，未请求的末字节低位清零 | `drbg-block-contract.test.ts` 通过真实 Blockly 块双语言执行，覆盖 0-bit 空输出、1/8/9/16-bit 左端截取与项目字节编码、负数/小数/超上限拒绝；并核对 NIST CAVS 14.3 HMAC_DRBG SHA-256、无重播种配置下 COUNT=0 的一次选定返回值；上限依据标准原文表 2 | 该单条 CAVS 向量不代表完整向量集或算法验证；未覆盖实例化熵要求、状态/重播种计数、additional input 生命周期、预测抗性、SP 800-90B 熵源证据及 SP 800-90C 构造证据；不构成模块认证 |

示例工作区：`demos/procedures/DRBG.json`。

以上是当前实现与回归范围，不代表已通过认证或完成完整标准测试；逐块证据与缺项见[标准符合性对象清单](../CONFORMANCE-INVENTORY.md)。

<!-- standard-body:end -->
