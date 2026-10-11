# Algorithm 8  SamplePolyCBD_η(B)

## 条目元数据

| 字段 | 内容 |
|---|---|
| 类型 | 算法阶段 / 原语 / 函数 |
| 标准定位 | §4.2.2 采样 |
| 原文证据 | [source 提取稿](./00-Standard-Source.md)（本目录 PDF 清单见 source 页） |
| 原文位置 | [提取稿](./00-Standard-Source.md#L1404)；PDF 物理页需结合同目录 PDF 核对 |
| 项目状态 | 已实现（不代表完整标准覆盖） |

## 原文定位与引用

> 本页按 source 中的“§4.2.2 采样”拆分；这是定位说明，不替代标准逐字引文。完整正文、公式和表格请回看 [source 提取稿](./00-Standard-Source.md#L1404) 与同目录 PDF。

## 原文摘录
> 以下为 source 中 Algorithm 8 的完整原文算法块；仅移除了 PDF 分页标记和页眉页码。

```text
Algorithm 8 SamplePolyCBD𝜂 (𝐵)
Takes a seed as input and outputs a pseudorandom sample from the distribution D𝜂 (𝑅𝑞 ).
Input: byte array 𝐵 ∈ 𝔹64𝜂 .
Output: array 𝑓 ∈ ℤ256𝑞 .                           ▷ the coefficients of the sampled polynomial
  1: 𝑏 ← BytesToBits(𝐵)
  2: for (𝑖 ← 0; 𝑖 < 256; 𝑖 ++)
                 𝜂−1
  3:     𝑥 ← ∑𝑗←0 𝑏[2𝑖𝜂 + 𝑗]                                                        ▷0≤𝑥≤𝜂
                𝜂−1
 4:     𝑦 ← ∑𝑗←0 𝑏[2𝑖𝜂 + 𝜂 + 𝑗]                                                     ▷0≤𝑦≤𝜂
 5:     𝑓[𝑖] ← 𝑥 − 𝑦 mod 𝑞                                 ▷ 0 ≤ 𝑓[𝑖] ≤ 𝜂 or 𝑞 − 𝜂 ≤ 𝑓[𝑖] ≤ 𝑞 − 1
 6: end for
 7: return 𝑓
```

## 标准定义

本页的规范性定义由下方完整算法块给出；不得用项目实现或摘要替代标准语义。

## 公式或伪代码

> 以下完整保留本条目的标准算法块；只移除了 PDF 页眉、页脚、页码和分页标记。

```text
Algorithm 8 SamplePolyCBD𝜂 (𝐵)
Takes a seed as input and outputs a pseudorandom sample from the distribution D𝜂 (𝑅𝑞 ).
Input: byte array 𝐵 ∈ 𝔹64𝜂 .
Output: array 𝑓 ∈ ℤ256𝑞 .                           ▷ the coefficients of the sampled polynomial
  1: 𝑏 ← BytesToBits(𝐵)
  2: for (𝑖 ← 0; 𝑖 < 256; 𝑖 ++)
                 𝜂−1
  3:     𝑥 ← ∑𝑗←0 𝑏[2𝑖𝜂 + 𝑗]                                                        ▷0≤𝑥≤𝜂
                𝜂−1
 4:     𝑦 ← ∑𝑗←0 𝑏[2𝑖𝜂 + 𝜂 + 𝑗]                                                     ▷0≤𝑦≤𝜂
 5:     𝑓[𝑖] ← 𝑥 − 𝑦 mod 𝑞                                 ▷ 0 ≤ 𝑓[𝑖] ≤ 𝜂 or 𝑞 − 𝜂 ≤ 𝑓[𝑖] ≤ 𝑞 − 1
 6: end for
 7: return 𝑓
```

## 输入与输出

输入、输出、取值域和错误返回以完整算法块中的 `Input`、`Output` 及其步骤为准；标准未列出的字段不由项目自行补写。

## 项目映射

`pq_prf` 对应 Algorithm 8 前置的 FIPS 203 §4.1 式 (4.3) `PRFη(s,b)=SHAKE256(s‖b,8·64·η)`，其中 `b` 是单字节 nonce；项目块的输出长度字段用字节计。双语言块测试覆盖两种 SHAKE 速率的 rate−1 拼接边界和 nonce/输出长度契约，但不是官方完整测试集。`pq_prf` 的 SHAKE128 可选项不是 FIPS 203 `PRFη`。本页不把文档条目或块级回归等同于算法验证或认证。

## 核验与缺项

已机械核对完整算法块与 source 算法标题及行号；标准向量、实现语义、边界负例和认证结论仍须按本目录记录分别核验。
