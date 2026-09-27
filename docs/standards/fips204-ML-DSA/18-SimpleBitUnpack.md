# Algorithm 18  SimpleBitUnpack(𝑣, 𝑏)

## 条目元数据

| 字段 | 内容 |
|---|---|
| 类型 | 算法阶段 / 原语 / 函数 |
| 标准定位 | §7.1 |
| 原文证据 | [source 提取稿](./00-Standard-Source.md)（本目录 PDF 清单见 source 页） |
| 原文位置 | [提取稿](./00-Standard-Source.md#L1795)；PDF 物理页需结合同目录 PDF 核对 |
| 项目状态 | 部分实现（详见本文现有实现/缺项说明） |

## 原文定位与引用

> 本页按 source 中的“§7.1”拆分；这是定位说明，不替代标准逐字引文。完整正文、公式和表格请回看 [source 提取稿](./00-Standard-Source.md#L1795) 与同目录 PDF。

## 原文摘录
> 以下为 source 中 Algorithm 18 的完整原文算法块；仅移除了 PDF 分页标记和页眉页码。

```text
Algorithm 18 SimpleBitUnpack(𝑣, 𝑏)
Reverses the procedure SimpleBitPack.
Input: 𝑏 ∈ ℕ and a byte string 𝑣 of length 32 ⋅ bitlen 𝑏.
Output: A polynomial 𝑤 ∈ 𝑅 with coefficients in [0, 2𝑐 − 1], where 𝑐 = bitlen 𝑏.
When 𝑏 + 1 is a power of 2, the coefficients are in [0, 𝑏].
  1: 𝑐 ← bitlen 𝑏
  2: 𝑧 ← BytesToBits(𝑣)
  3: for 𝑖 from 0 to 255 do
  4:     𝑤𝑖 ← BitsToInteger((𝑧[𝑖𝑐], 𝑧[𝑖𝑐 + 1], … 𝑧[𝑖𝑐 + 𝑐 − 1]), 𝑐)
  5: end for
  6: return 𝑤
```

## 标准定义

本页的规范性定义由下方完整算法块给出；不得用项目实现或摘要替代标准语义。

## 公式或伪代码

> 以下完整保留本条目的标准算法块；只移除了 PDF 页眉、页脚、页码和分页标记。

```text
Algorithm 18 SimpleBitUnpack(𝑣, 𝑏)
Reverses the procedure SimpleBitPack.
Input: 𝑏 ∈ ℕ and a byte string 𝑣 of length 32 ⋅ bitlen 𝑏.
Output: A polynomial 𝑤 ∈ 𝑅 with coefficients in [0, 2𝑐 − 1], where 𝑐 = bitlen 𝑏.
When 𝑏 + 1 is a power of 2, the coefficients are in [0, 𝑏].
  1: 𝑐 ← bitlen 𝑏
  2: 𝑧 ← BytesToBits(𝑣)
  3: for 𝑖 from 0 to 255 do
  4:     𝑤𝑖 ← BitsToInteger((𝑧[𝑖𝑐], 𝑧[𝑖𝑐 + 1], … 𝑧[𝑖𝑐 + 𝑐 − 1]), 𝑐)
  5: end for
  6: return 𝑤
```

## 输入与输出

输入、输出、取值域和错误返回以完整算法块中的 `Input`、`Output` 及其步骤为准；标准未列出的字段不由项目自行补写。

## 项目映射

本页是标准结构化参考条目；项目是否有同名 Blockly 块、源码入口或 demo，按本目录 README 和覆盖矩阵核对。本页不把文档条目等同于已实现。

## 核验与缺项

已机械核对完整算法块与 source 算法标题及行号；标准向量、实现语义、边界负例和认证结论仍须按本目录记录分别核验。
