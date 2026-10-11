# GM/T 0091-2020 — 基于口令的密钥派生规范

标准原文提取参考：[00-Standard-Source.md](./00-Standard-Source.md)。

来源: GM/T 0091-2020
      PDF: [GMT-0091-2020.pdf](./GMT-0091-2020.pdf)
      仓库: https://github.com/gmkits/cryptography-standards

## 内容

中国版 PBKDF2 标准。定义基于口令的密钥派生函数 (KDF)。

## 对应块

`pbkdf2` — PBKDF2 密钥派生（GM/T 0091 同构 SM3 路径，Demo：`demos/procedures/PBKDF2-SM3.json`）

> PBKDF2 结构化参考见 [01-kdf.md](./01-kdf.md)；原 PDF 保留用于条款核验。

## 函数/原语索引

- [01-kdf.md](./01-kdf.md)：总览
- [02-KDF.md](./02-KDF.md)：SM3-HMAC PRF、迭代和截断

<!-- standard-body:start -->

## 标准内容

本目录对应 **GM/T 0091-2020 — 基于口令的密钥派生规范**，按标准条款拆分为 2 个结构化条目，覆盖 「GM/T 0091 — 基于口令的密钥派生规范」、「GM/T 0091 — 密钥派生函数原语」。每个条目页给出标准定位、原文出处、公式或伪代码，以及对应积木块与验证边界。

| 结构化条目 | 内容 | 项目状态 |
|---|---|---|
| [GM/T 0091 — 基于口令的密钥派生规范](./01-kdf.md) | GM/T 0091 — 基于口令的密钥派生规范 | 已实现（不代表完整标准覆盖） |
| [GM/T 0091 — 密钥派生函数原语](./02-KDF.md) | GM/T 0091 — 密钥派生函数原语 | 仅参考（未映射为块实现） |

## 实现与验证映射

| 积木块 | 规范语义范围 | 已登记验证入口 | 边界（本行不能证明什么） |
|---|---|---|---|
| `hash_hmac`(SM3) | FIPS 198-1 HMAC；SHA-256 使用批准底层哈希，SM3-HMAC 标为项目扩展，不冒称 NIST 批准选项 | `hmac-block-contract.test.ts` 通过真实 Blockly 块双语执行：RFC 4231 SHA-256 case 1/6、Node/OpenSSL SM3 交叉结果、非法字节与孤立代理项拒绝、合法 Unicode 一致性、公开输出为 JS `Uint8Array` / Python `bytes` 及同步组合；HMAC Demo 59 项回归中的对应工作区也通过 | 完整官方 HMAC 测试集、完整 GB/T/GM/T 符合性、密钥擦除/常量时间、CAVP 或产品认证 |
| `pbkdf2`（SM3 同构） | RFC 8018 §5.2；当前 SHA-256 与 SM3-HMAC 变体的 `hLen` 均为 32 字节；项目将 `c` 限于 JS 安全整数，`dkLen` 为正整数且不超过 `(2^32−1)×hLen` | `kdf-parameter-contract.test.ts` 通过真实 Blockly 双语言执行 RFC 7914 §11 SHA-256 向量（含 33 字节尾块截断），双语言核对整数值浮点及 `c`/`dkLen` 的非正、普通分数、布尔和上界拒绝；另有 Python-only `fractions.Fraction` 对迭代数和 `dkLen` 的拒绝测试，并核对 JS `Uint8Array` / Python `bytes`。SM3-HMAC 另以固定输入对照 OpenSSL 3 结果 | OpenSSL 对照值不是 GM/T 官方测试向量；未执行 137 GB 上限输出、完整 ACVP/CAVP 会话或口令存储策略。SP 800-132 建议迭代次数至少 1,000 不应误写为算法输入的规范性最小值 |

示例工作区：`demos/procedures/PBKDF2-SM3.json`；Procedure 模板：`proc_pbkdf2`。

以上是当前实现与回归范围，不代表已通过认证或完成完整标准测试；逐块证据与缺项见[标准符合性对象清单](../CONFORMANCE-INVENTORY.md)。

<!-- standard-body:end -->
