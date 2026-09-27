# GM/T 0005 — 随机性检测规范

标准原文提取参考：[00-Standard-Source.md](./00-Standard-Source.md)。

来源: GM/T 0005-2021 — 随机性检测规范（2021-10-19 发布，2022-05-01 实施，全部代替 GM/T 0005-2012）
      PDF: [0005-2021随机性检测规范DI.pdf](./0005-2021随机性检测规范DI.pdf)

> GB/T 32915 是独立的国家标准：2016 版截至 2026-09-26 仍现行，2026 版将于 2026-12-01 实施并全部代替旧版。它与本目录的 GM/T 0005 不是同一标准；版本、适用性及结构化拆分状态见 [GB/T 32915 文档入口](../gbt32915-randomness/README.md)。

## 检测项

GM/T 0005-2021 规定 15 项检测：单比特频数、块内频数、扑克、重叠子序列、游程总数、
游程分布、块内最大游程、二元推导、自相关、矩阵秩、累加和、近似熵、线性复杂度、
Maurer 通用统计和离散傅立叶。2021 版在样本通过率判定基础上增加**样本分布均匀性判定**（§6.3）。

## 实现状态

未实现（Blockly 块）。随机性检测适合独立工具，非积木块教学范围——metacrypt_server
Go 后端 `randomness/` 模块已实现（Trisia/randomness 血统，15 项检测）。

> 条款参考见 [01-Randomness.md](./01-Randomness.md)。随机性判定必须以 `metacrypt_server`
> Go 后端报告为准；前端仅用于用户测试代码和展示结果。

## 函数/流程索引

- [01-Randomness.md](./01-Randomness.md)：标准范围与检测导航
- [02-Test-Suites.md](./02-Test-Suites.md)：2021 版检测项目族
- [03-Backend-Evaluation.md](./03-Backend-Evaluation.md)：后端测评边界、报告字段和当前缺项
- [03-Backend-Evaluation.en.md](./03-Backend-Evaluation.en.md)：Backend boundary, report fields, and current gaps
- [04-Frequency-and-Pattern-Tests.md](./04-Frequency-and-Pattern-Tests.md)：单比特/块内频数、扑克、重叠子序列
- [05-Runs-and-Relation-Tests.md](./05-Runs-and-Relation-Tests.md)：游程、二元推导、自相关
- [06-Matrix-Complexity-and-Spectrum.md](./06-Matrix-Complexity-and-Spectrum.md)：矩阵秩、累加和、近似熵、线性复杂度、Maurer、DFT
- [07-Decision-and-Sample-Settings.md](./07-Decision-and-Sample-Settings.md)：样本档位、通过率与均匀性判定
