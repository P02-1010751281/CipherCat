# Algorithm 4  BytesToBits(B)

## 条目元数据

| 字段 | 内容 |
|---|---|
| 类型 | 原语 / 函数 |
| 标准定位 | §4.2.1 编码与压缩 |
| 原文证据 | [source 提取稿](./00-Standard-Source.md)（本目录 PDF 清单见 source 页） |
| 原文位置 | [提取稿](./00-Standard-Source.md#L1248)；PDF 物理页需结合同目录 PDF 核对 |
| 项目状态 | 已实现（详见本文现有实现/缺项说明） |

## 原文定位与引用

> 本页按 source 中的“§4.2.1 编码与压缩”拆分；这是定位说明，不替代标准逐字引文。完整正文、公式和表格请回看 [source 提取稿](./00-Standard-Source.md#L1248) 与同目录 PDF。

## 原文摘录
> 以下为 source 中 Algorithm 4 的完整原文算法块；仅移除了 PDF 分页标记和页眉页码。

```text
Algorithm 4 BytesToBits(𝐵)
Performs the inverse of BitsToBytes, converting a byte array into a bit array.
Input: byte array 𝐵 ∈ 𝔹ℓ .
Output: bit array 𝑏 ∈ {0, 1}8⋅ℓ .
  1: 𝐶 ← 𝐵                                                              ▷ copy 𝐵 into array 𝐶 ∈ 𝔹ℓ
  2: for (𝑖 ← 0; 𝑖 < ℓ; 𝑖 ++)
  3:     for (𝑗 ← 0; 𝑗 < 8; 𝑗 ++)
  4:         𝑏[8𝑖 + 𝑗] ← 𝐶[𝑖] mod 2
  5:         𝐶[𝑖] ← ⌊𝐶[𝑖]/2⌋
  6:     end for
  7: end for
  8: return 𝑏
```

## 标准定义

本页的规范性定义由下方完整算法块给出；不得用项目实现或摘要替代标准语义。

## 公式或伪代码

> 以下完整保留本条目的标准算法块；只移除了 PDF 页眉、页脚、页码和分页标记。

```text
Algorithm 4 BytesToBits(𝐵)
Performs the inverse of BitsToBytes, converting a byte array into a bit array.
Input: byte array 𝐵 ∈ 𝔹ℓ .
Output: bit array 𝑏 ∈ {0, 1}8⋅ℓ .
  1: 𝐶 ← 𝐵                                                              ▷ copy 𝐵 into array 𝐶 ∈ 𝔹ℓ
  2: for (𝑖 ← 0; 𝑖 < ℓ; 𝑖 ++)
  3:     for (𝑗 ← 0; 𝑗 < 8; 𝑗 ++)
  4:         𝑏[8𝑖 + 𝑗] ← 𝐶[𝑖] mod 2
  5:         𝐶[𝑖] ← ⌊𝐶[𝑖]/2⌋
  6:     end for
  7: end for
  8: return 𝑏
```

## 输入与输出

输入、输出、取值域和错误返回以完整算法块中的 `Input`、`Output` 及其步骤为准；标准未列出的字段不由项目自行补写。

## 项目映射

本页是标准结构化参考条目；项目是否有同名 Blockly 块、源码入口或 demo，按本目录 README 和覆盖矩阵核对。本页不把文档条目等同于已实现。

## 核验与缺项

已机械核对完整算法块与 source 算法标题及行号；标准向量、实现语义、边界负例和认证结论仍须按本目录记录分别核验。
