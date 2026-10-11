# NIST SP 800-38D — GCM 认证加密模式

标准原文提取参考：[00-Standard-Source.md](./00-Standard-Source.md)。

## 算法逐项拆分

原文 5 个独立算法均有独立条目页；概览页只负责导航和项目边界。

| 算法 | 条目页 | 标准函数 |
|:--:|---|---|
| 1 块乘法 | [`05-multiply.md`](./05-multiply.md) | `X • Y` |
| 2 GHASH | [`06-GHASH.md`](./06-GHASH.md) | `GHASH_H` |
| 3 GCTR | [`07-GCTR.md`](./07-GCTR.md) | `GCTR_K` |
| 4 认证加密 | [`08-GCM-AE.md`](./08-GCM-AE.md) | `GCM-AE_K` |
| 5 认证解密 | [`09-GCM-AD.md`](./09-GCM-AD.md) | `GCM-AD_K` |

来源: NIST SP 800-38D — Recommendation for Block Cipher Modes: Galois/Counter Mode
      https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-38d.pdf
      PDF: [NIST.SP.800-38D.pdf](./NIST.SP.800-38D.pdf)

## 相关块

| 块 | 说明 |
|----|------|
| `gcm_encrypt` | GCM 认证加密 |

## 函数/原语索引

- [01-GCM.md](./01-GCM.md)：GCM 总览
- [02-GHASH.md](./02-GHASH.md)：GHASH
- [03-GCTR-and-J0.md](./03-GCTR-and-J0.md)：J0 与 GCTR
- [10-inc32.md](./10-inc32.md)：计数器低 32 位递增
- [04-AEAD-Limits.md](./04-AEAD-Limits.md)：AEAD 验证边界

<!-- standard-body:start -->

## 标准内容

本目录对应 **NIST SP 800-38D — GCM 认证加密模式**，按标准条款拆分为 10 个结构化条目，覆盖 「NIST SP 800-38D — GCM 参考」、「GCM — GHASH 原语」、「GCM — J0 与 GCTR 原语」、「NIST SP 800-38D §§8–9，含 §§8.1–8.3、9.1–9.2」 等。每个条目页给出标准定位、原文出处、公式或伪代码，以及对应积木块与验证边界。

| 结构化条目 | 内容 | 项目状态 |
|---|---|---|
| [NIST SP 800-38D — GCM 参考](./01-GCM.md) | NIST SP 800-38D — GCM 参考 | 仅参考（未映射为块实现） |
| [GCM — GHASH 原语](./02-GHASH.md) | GCM — GHASH 原语 | 仅参考（未映射为块实现） |
| [GCM — J0 与 GCTR 原语](./03-GCTR-and-J0.md) | GCM — J0 与 GCTR 原语 | 已实现（不代表完整标准覆盖） |
| [GCM — IV 唯一性、调用上限与实现验证](./04-AEAD-Limits.md) | NIST SP 800-38D §§8–9，含 §§8.1–8.3、9.1–9.2 | 项目有 GCM 加密路径；IV 唯一性策略、标准调用上限和认证解密未形成完整实现覆盖 |
| [Algorithm 1 — GF(2^128) 块乘法（NIST SP 800-38D）](./05-multiply.md) | NIST SP 800-38D §6.3，Algorithm 1 `multiply` | 仅参考 |
| [Algorithm 2 — GHASH（NIST SP 800-38D）](./06-GHASH.md) | NIST SP 800-38D §6.4，Algorithm 2 `GHASH` | 仅参考 |
| [Algorithm 3 — GCTR（NIST SP 800-38D）](./07-GCTR.md) | NIST SP 800-38D §6.5，Algorithm 3 `GCTR` | 部分实现 |
| [Algorithm 4 — GCM 认证加密（NIST SP 800-38D）](./08-GCM-AE.md) | NIST SP 800-38D §7.1，Algorithm 4 `GCM-AE` | 部分实现 |
| [Algorithm 5 — GCM 认证解密（NIST SP 800-38D）](./09-GCM-AD.md) | NIST SP 800-38D §7.2，Algorithm 5 `GCM-AD` | 仅参考 |
| [`inc32` — GCM 计数器递增函数](./10-inc32.md) | NIST SP 800-38D §6.2 | 由 GCM 内部调用；无独立 Blockly 块 |

## 实现与验证映射

| 积木块 | 规范语义范围 | 已登记验证入口 | 边界（本行不能证明什么） |
|---|---|---|---|
| `gcm_encrypt`（+ mode_ctr_encrypt 基础） | SP 800-38D GCM（GHASH + GCTR），AES-128、96-bit IV | `procedures/GCM-Encrypt.json` 回归 TC2 与 TC13，并由 `demo-vector-crosscheck.test.ts` 用 `cryptography` 独立复算一致；`symmetric-bytes-output-contract.test.ts` 核对输出容器 | **TC3 未覆盖**；不覆盖其它 IV 长度、tag 长度族与 AD 处理全谱；Demo 第三条是项目自选变体而非标准 TC |

示例工作区：`demos/procedures/GCM-Encrypt.json（GCM 规范 Test Case 2/13 编号体系 + NIST ACVP AES-GCM 官方用例 tagLen=128/96-bit IV 15 例；SP 800-38D 正文不含用例表）`；Procedure 模板：`proc_mode_gcm（仅 CTR 起始骨架，无 GHASH/tag，不构成 GCM 证据）`。

以上是当前实现与回归范围，不代表已通过认证或完成完整标准测试；逐块证据与缺项见[标准符合性对象清单](../CONFORMANCE-INVENTORY.md)。

<!-- standard-body:end -->
