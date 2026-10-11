# GM/T 0103-2021 — 随机数发生器总体框架

标准原文提取参考：[00-Standard-Source.md](./00-Standard-Source.md)。

来源: GM/T 0103-2021
      PDF: [GMT-0103-2021.pdf](./GMT-0103-2021.pdf)
      仓库: https://github.com/gmkits/cryptography-standards

## 内容

GM/T 0103-2021《随机数发生器总体框架》规定随机数发生器设计的一般框架，不定义特定的 DRBG 算法。

## 实现状态

`gm_rng` 是借鉴 HMAC_DRBG 结构的确定性 SM3-HMAC 教学路径，只演示确定性生成概念，不是 GM/T 0103、GM/T 0105 或 SP 800-90A 的符合实现。`demos/procedures/GM-RNG.json` 使用项目固定输入/输出；回归另以固定 SM3-HMAC 样例检查生成结果和字节长度边界。这不是 GM/T、GB/T 或 NIST 官方向量，也不构成完整算法或认证证据。`seed_bytes` 块提供种子材料输入，不是熵源实现；空种子只适用于可复现演示。

> GM/T 0103 是总体框架，不是单一算法。结构化参考见 [01-rng.md](./01-rng.md)；
> 熵评估、健康测试和产品检测不由本目录的 `gm_rng` 教学路径代替。

## 函数/原语索引

- [02-Entropy-and-Health.md](./02-Entropy-and-Health.md)：熵源、评估、健康检测和故障边界
- [03-Deterministic-Generation.md](./03-Deterministic-Generation.md)：`gm_rng` 确定性生成路径

<!-- standard-body:start -->

## 标准内容

本目录对应 **GM/T 0103-2021 — 随机数发生器总体框架**，按标准条款拆分为 3 个结构化条目，覆盖 「GM/T 0103-2021 — 随机数发生器总体框架参考」、「GM/T 0103-2021 §4.2–§4.5 熵源、熵评估、后处理与检测要求」、「GM/T 0103-2021 §4.1(c)、§4.4 后处理框架（关系说明；非算法依据）」。每个条目页给出标准定位、原文出处、公式或伪代码，以及对应积木块与验证边界。

| 结构化条目 | 内容 | 项目状态 |
|---|---|---|
| [GM/T 0103-2021 — 随机数发生器总体框架参考](./01-rng.md) | GM/T 0103-2021 — 随机数发生器总体框架参考 | 仅作框架参考；当前教学块不构成标准符合实现 |
| [GM/T 0103 — 熵源、检测与故障处理](./02-Entropy-and-Health.md) | GM/T 0103-2021 §4.2–§4.5 熵源、熵评估、后处理与检测要求 | 现状与缺项映射；不构成实现符合性结论 |
| [确定性生成：项目教学示例（GM/T 0103 框架参考）](./03-Deterministic-Generation.md) | GM/T 0103-2021 §4.1(c)、§4.4 后处理框架（关系说明；非算法依据） | 教学路径；不是 GM/T 0103 或 SP 800-90A 的符合性实现 |

## 实现与验证映射

| 积木块 | 规范语义范围 | 已登记验证入口 | 边界（本行不能证明什么） |
|---|---|---|---|
| `gm_rng`（确定性 SM3-HMAC 教学示例，不覆盖熵源/评估/检测） | 借鉴 HMAC_DRBG 结构的确定性 SM3-HMAC 教学示例；固定输入可复现，长度范围是项目定义的 `0..65536` 字节；不声明符合 GM/T 0103/0105 或 SP 800-90A | `gmdrbg-contract.test.ts` 通过真实 Blockly 双语言执行 Demo 样例，对照独立 Node.js/OpenSSL SM3-HMAC 结果，并检查长度边界与 `Uint8Array` / `bytes` 输出 | 固定样例不是 GM/T、GB/T 或 NIST 官方向量；不证明完整 DRBG 符合性、熵源质量、健康检测、故障响应或认证 |

示例工作区：`demos/procedures/GM-RNG.json`。

以上是当前实现与回归范围，不代表已通过认证或完成完整标准测试；逐块证据与缺项见[标准符合性对象清单](../CONFORMANCE-INVENTORY.md)。

<!-- standard-body:end -->
