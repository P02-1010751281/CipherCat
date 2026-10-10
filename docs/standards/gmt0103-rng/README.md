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
