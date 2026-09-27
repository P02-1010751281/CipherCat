# Algorithm 9  NTT(f) — 前向数论变换

## 条目元数据

| 字段 | 内容 |
|---|---|
| 类型 | 原语 / 函数 |
| 标准定位 | §4.3 NTT 变换 |
| 原文证据 | [source 提取稿](./00-Standard-Source.md)（本目录 PDF 清单见 source 页） |
| 原文位置 | [提取稿](./00-Standard-Source.md#L1505)；PDF 物理页需结合同目录 PDF 核对 |
| 项目状态 | 已实现（详见本文现有实现/缺项说明） |

## 原文定位与引用

> 本页按 source 中的“§4.3 NTT 变换”拆分；这是定位说明，不替代标准逐字引文。完整正文、公式和表格请回看 [source 提取稿](./00-Standard-Source.md#L1505) 与同目录 PDF。

## 原文摘录
> 以下为 source 中 Algorithm 9 的完整原文算法块；仅移除了 PDF 分页标记和页眉页码。

```text
Algorithm 9 NTT(𝑓)
                                  ̂ the given polynomial 𝑓 ∈ 𝑅 .
Computes the NTT representation 𝑓 of                          𝑞
Input: array 𝑓 ∈ ℤ256   𝑞 .                               ▷ the coefficients of the input polynomial
                   ̂
Output: array 𝑓 ∈ ℤ𝑞 .   256
                                              ▷ the coefficients of the NTT of the input polynomial
  1: 𝑓 ̂ ← 𝑓                                        ▷ will compute in place on a copy of input array
  2: 𝑖 ← 1
  3: for (len ← 128; len ≥ 2; len ← len/2)
  4:      for (start ← 0; start < 256; start ← start + 2 ⋅ len)
  5:          zeta ← 𝜁 BitRev7 (𝑖) mod 𝑞
  6:          𝑖 ← 𝑖+1
  7:          for (𝑗 ← start; 𝑗 < start + len; 𝑗 ++)
  8:              𝑡 ← zeta ⋅ 𝑓[𝑗̂ + len]                                ▷ steps 8-10 done modulo 𝑞
  9:                 ̂             ̂
                  𝑓[𝑗 + len] ← 𝑓[𝑗] − 𝑡
10:               𝑓[𝑗] ̂ ← 𝑓[𝑗]
                             ̂ +𝑡
11:           end for
12:       end for
13: end for
14: return 𝑓 ̂
```

## 标准定义

本页的规范性定义由下方完整算法块给出；不得用项目实现或摘要替代标准语义。

## 公式或伪代码

> 以下完整保留本条目的标准算法块；只移除了 PDF 页眉、页脚、页码和分页标记。

```text
Algorithm 9 NTT(𝑓)
                                  ̂ the given polynomial 𝑓 ∈ 𝑅 .
Computes the NTT representation 𝑓 of                          𝑞
Input: array 𝑓 ∈ ℤ256   𝑞 .                               ▷ the coefficients of the input polynomial
                   ̂
Output: array 𝑓 ∈ ℤ𝑞 .   256
                                              ▷ the coefficients of the NTT of the input polynomial
  1: 𝑓 ̂ ← 𝑓                                        ▷ will compute in place on a copy of input array
  2: 𝑖 ← 1
  3: for (len ← 128; len ≥ 2; len ← len/2)
  4:      for (start ← 0; start < 256; start ← start + 2 ⋅ len)
  5:          zeta ← 𝜁 BitRev7 (𝑖) mod 𝑞
  6:          𝑖 ← 𝑖+1
  7:          for (𝑗 ← start; 𝑗 < start + len; 𝑗 ++)
  8:              𝑡 ← zeta ⋅ 𝑓[𝑗̂ + len]                                ▷ steps 8-10 done modulo 𝑞
  9:                 ̂             ̂
                  𝑓[𝑗 + len] ← 𝑓[𝑗] − 𝑡
10:               𝑓[𝑗] ̂ ← 𝑓[𝑗]
                             ̂ +𝑡
11:           end for
12:       end for
13: end for
14: return 𝑓 ̂
```

## 输入与输出

输入、输出、取值域和错误返回以完整算法块中的 `Input`、`Output` 及其步骤为准；标准未列出的字段不由项目自行补写。

## 项目映射

本页是标准结构化参考条目；项目是否有同名 Blockly 块、源码入口或 demo，按本目录 README 和覆盖矩阵核对。本页不把文档条目等同于已实现。

## 核验与缺项

已机械核对完整算法块与 source 算法标题及行号；标准向量、实现语义、边界负例和认证结论仍须按本目录记录分别核验。
