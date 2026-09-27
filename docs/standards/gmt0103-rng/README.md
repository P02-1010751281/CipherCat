# GM/T 0103-2021 — 随机数发生器总体框架

标准原文提取参考：[00-Standard-Source.md](./00-Standard-Source.md)。

来源: GM/T 0103-2021
      PDF: [GMT-0103-2021.pdf](./GMT-0103-2021.pdf)
      仓库: https://github.com/gmkits/cryptography-standards

## 内容

中国随机数发生器 (RNG) 标准，定义确定性随机比特生成器 (DRBG) 框架。

## 实现状态

✅ 已实现：`gm_rng`（SM3-HMAC-DRBG，GM/T 0103 框架），官方向量 Demo：`demos/procedures/GM-RNG.json`。`seed_bytes` 块提供种子输入。

> GM/T 0103 是总体框架，不是单一算法。结构化参考见 [01-rng.md](./01-rng.md)；
> 熵评估、健康测试和产品检测不由本目录的 `gm_rng` 教学路径代替。

## 函数/原语索引

- [02-Entropy-and-Health.md](./02-Entropy-and-Health.md)：熵源、评估、健康检测和故障边界
- [03-Deterministic-Generation.md](./03-Deterministic-Generation.md)：`gm_rng` 确定性生成路径
