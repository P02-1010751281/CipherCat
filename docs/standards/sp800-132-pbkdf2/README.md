# NIST SP 800-132 — PBKDF2 密码基密钥派生

标准原文提取参考：[00-Standard-Source.md](./00-Standard-Source.md)。

来源: NIST SP 800-132 — Recommendation for Password-Based Key Derivation
      https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-132.pdf
      PDF: [NIST.SP.800-132.pdf](./NIST.SP.800-132.pdf)

## 相关块

| 块 | 说明 |
|----|------|
| `pbkdf2` | PBKDF2 密钥派生 |

## 函数/原语索引

- [01-PBKDF2.md](./01-PBKDF2.md)：算法总览
- [02-PRF-and-Block.md](./02-PRF-and-Block.md)：PRF、`U` 链和 `T_i`
- [03-Parameter-Boundaries.md](./03-Parameter-Boundaries.md)：参数与使用边界

<!-- standard-body:start -->

## 标准内容

本目录对应 **NIST SP 800-132 — PBKDF2 密码基密钥派生**，按标准条款拆分为 3 个结构化条目，覆盖 「NIST SP 800-132 — PBKDF2 参考」、「PBKDF2 — PRF 与派生块原语」、「PBKDF2 — 参数与使用边界」。每个条目页给出标准定位、原文出处、公式或伪代码，以及对应积木块与验证边界。

| 结构化条目 | 内容 | 项目状态 |
|---|---|---|
| [NIST SP 800-132 — PBKDF2 参考](./01-PBKDF2.md) | NIST SP 800-132 — PBKDF2 参考 | 仅参考（未映射为块实现） |
| [PBKDF2 — PRF 与派生块原语](./02-PRF-and-Block.md) | PBKDF2 — PRF 与派生块原语 | 仅参考（未映射为块实现） |
| [PBKDF2 — 参数与使用边界](./03-Parameter-Boundaries.md) | PBKDF2 — 参数与使用边界 | 仅参考（未映射为块实现） |

## 实现与验证映射

| 积木块 | 规范语义范围 | 已登记验证入口 | 边界（本行不能证明什么） |
|---|---|---|---|
| `pbkdf2` | RFC 8018 §5.2；当前 SHA-256 与 SM3-HMAC 变体的 `hLen` 均为 32 字节；项目将 `c` 限于 JS 安全整数，`dkLen` 为正整数且不超过 `(2^32−1)×hLen` | `kdf-parameter-contract.test.ts` 通过真实 Blockly 双语言执行 RFC 7914 §11 SHA-256 向量（含 33 字节尾块截断），双语言核对整数值浮点及 `c`/`dkLen` 的非正、普通分数、布尔和上界拒绝；另有 Python-only `fractions.Fraction` 对迭代数和 `dkLen` 的拒绝测试，并核对 JS `Uint8Array` / Python `bytes`。SM3-HMAC 另以固定输入对照 OpenSSL 3 结果 | OpenSSL 对照值不是 GM/T 官方测试向量；未执行 137 GB 上限输出、完整 ACVP/CAVP 会话或口令存储策略。SP 800-132 建议迭代次数至少 1,000 不应误写为算法输入的规范性最小值 |

示例工作区：`demos/procedures/PBKDF2-SHA256.json`、`demos/procedures/PBKDF2.json`；Procedure 模板：`proc_pbkdf2（空循环起始模板，不含派生运算）`。

以上是当前实现与回归范围，不代表已通过认证或完成完整标准测试；逐块证据与缺项见[标准符合性对象清单](../CONFORMANCE-INVENTORY.md)。

<!-- standard-body:end -->
