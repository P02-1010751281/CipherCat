# GB/T 33133 — ZUC 祖冲之序列密码算法

标准原文提取参考：[00-Standard-Source.md](./00-Standard-Source.md)。

来源: GB/T 33133-2016/2021 — 信息安全技术 祖冲之序列密码算法（第 1-3 部分）
      第1部分 [GBT-33133.1-2016.pdf](./GBT-33133.1-2016.pdf) · 第2部分 [GBT+33133.2-2021.pdf](./GBT+33133.2-2021.pdf) · 第3部分 [GBT+33133.3-2021.pdf](./GBT+33133.3-2021.pdf)

## 参数

| 参数 | 值 |
|------|-----|
| 密钥长度 | 128 bit (ZUC-128) |
| IV 长度 | 128 bit |
| 输出 | 32-bit 密钥流字 |

## 结构

| 组件 | 说明 |
|------|------|
| LFSR | 16 级线性反馈移位寄存器 (31-bit cells) |
| BR | 比特重组 (从 LFSR 提取 4×32-bit) |
| F | 非线性函数 (含 S-box) |

> 相关标准：GM/T 0001.4-2024《祖冲之序列密码算法 第4部分：鉴别式加密机制》（AEAD，2024 新行业标准，未覆盖）；ZUC-256（256 位密钥/184 位 IV）为后续变体，未覆盖。

## 指南

- [ZUC-KeyStream-搭建指南.md](guides/ZUC-KeyStream-搭建指南.md)（中文）
- [ZUC-KeyStream-搭建指南.en.md](guides/ZUC-KeyStream-搭建指南.en.md)（English）

## 函数/原语索引

- [02-SBox-Linear.md](./02-SBox-Linear.md)：`S0/S1/L1/L2`
- [03-F-and-LFSR.md](./03-F-and-LFSR.md)：比特重组、F 和 LFSR
- [04-Keystream.md](./04-Keystream.md)：密钥流生成
- [05-EEA3-EIA3.md](./05-EEA3-EIA3.md)：EEA3 与 EIA3 的完整公式、Blockly 块及向量覆盖

## 实现状态

已实现：`src/blocks/zuc/` 7 块（S0/S1/L1/L2/F 原子块、`zuc_keystream` 和 `zuc_eia3`）+ `proc_zuc_keystream` 模板。EEA3 与 EIA3 Demo 分别见 `demos/procedures/EEA3.json` 和 `demos/procedures/EIA3.json`；后者使用 GB/T 33133.3-2021 附录 B 示例 1、2，并验证双语言输出及非法参数拒绝。搭建方法见上方指南。

> 说明：算法主线已在 [01-ZUC.md](./01-ZUC.md) 重新整理；PDF 保留用于逐条核验。
> 128-EIA3 的块和选定官方向量已接入；覆盖范围不等于认证或生产安全证明。

<!-- standard-body:start -->

## 标准内容

本目录对应 **GB/T 33133 — ZUC 祖冲之序列密码算法**，按标准条款拆分为 5 个结构化条目，覆盖 「GB/T 33133 — ZUC 祖冲之序列密码算法参考」、「GB/T 33133.1-2016 §5.4、附录 A」、「GB/T 33133.1-2016 §5.2、§5.4–§5.6」、「GB/T 33133.1-2016 §5.3、§5.4、§6」 等。每个条目页给出标准定位、原文出处、公式或伪代码，以及对应积木块与验证边界。

| 结构化条目 | 内容 | 项目状态 |
|---|---|---|
| [GB/T 33133 — ZUC 祖冲之序列密码算法参考](./01-ZUC.md) | GB/T 33133 — ZUC 祖冲之序列密码算法参考 | 部分实现（不代表完整标准覆盖） |
| [ZUC — S 盒与线性变换原语](./02-SBox-Linear.md) | GB/T 33133.1-2016 §5.4、附录 A | `S0`、`S1`、`L1`、`L2` 原子块已实现 |
| [ZUC — F 函数、LFSR 与初始化](./03-F-and-LFSR.md) | GB/T 33133.1-2016 §5.2、§5.4–§5.6 | LFSR、F 的原子实现和组合块已登记 |
| [ZUC — 比特重组与密钥流生成](./04-Keystream.md) | GB/T 33133.1-2016 §5.3、§5.4、§6 | `zuc_keystream` 与 `proc_zuc_keystream` 已覆盖 |
| [ZUC — 128-EEA3 与 128-EIA3](./05-EEA3-EIA3.md) | GB/T 33133.2-2021 §5.2；GB/T 33133.3-2021 §5.2 | EEA3 教学链和 EIA3 MAC 块已覆盖；GB/T 33133.3 附录 B 示例 1、2（1 bit、577 bit）及非法参数拒绝在双语言 Demo 中验证 |

## 实现与验证映射

| 积木块 | 规范语义范围 | 已登记验证入口 | 边界（本行不能证明什么） |
|---|---|---|---|
| `zuc_s0` | — | — | — |
| `zuc_s1` | — | — | — |
| `zuc_l1` | — | — | — |
| `zuc_l2` | — | — | — |
| `zuc_f` | GB/T 33133.1-2016 §5.4 非线性函数；本 Blockly 原子块只返回字 `W`，不持久化下一轮 `R1/R2` | 同一 `zuc-primitives.test.ts` 双语言核验 `W=(X0⊕R1)+R2 mod 2^32` 的固定算术案例，并拒绝五个输入中的非法字值；ZUC 完整密钥流另以附录 C 的 C1/C2/C3 向量在同文件测试 | 单一 F 用例不覆盖 S/L 组合和状态更新全流程；不替代完整密钥流、EEA3/EIA3 测试或正式验证 |
| `zuc_keystream` | — | — | — |
| `zuc_eia3` | — | — | — |
| `sbox`(PRESET=ZUC S0/S1) | — | — | — |

示例工作区：`demos/procedures/EEA3.json`、`demos/EIA3.json`；Procedure 模板：`proc_zuc_keystream（IV/长度留空的起始骨架）`；搭建指南：✅ ZUC-KeyStream-搭建指南（+ en）。

以上是当前实现与回归范围，不代表已通过认证或完成完整标准测试；逐块证据与缺项见[标准符合性对象清单](../CONFORMANCE-INVENTORY.md)。

<!-- standard-body:end -->
