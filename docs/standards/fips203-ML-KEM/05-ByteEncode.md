# Algorithm 5  ByteEncode_d(F)

## 条目元数据

| 字段 | 内容 |
|---|---|
| 类型 | 原语 / 函数 |
| 标准定位 | §4.2.1 编码与压缩 |
| 原文证据 | [source 提取稿](./00-Standard-Source.md)（本目录 PDF 清单见 source 页） |
| 原文位置 | [提取稿](./00-Standard-Source.md#L1316)；PDF 物理页需结合同目录 PDF 核对 |
| 项目状态 | 已实现（详见本文现有实现/缺项说明） |

## 原文定位与引用

> 本页按 source 中的“§4.2.1 编码与压缩”拆分；这是定位说明，不替代标准逐字引文。完整正文、公式和表格请回看 [source 提取稿](./00-Standard-Source.md#L1316) 与同目录 PDF。

## 原文摘录
> 以下为 source 中 Algorithm 5 的完整原文算法块；仅移除了 PDF 分页标记和页眉页码。

```text
Algorithm 5 ByteEncode𝑑 (𝐹 )
Encodes an array of 𝑑-bit integers into a byte array for 1 ≤ 𝑑 ≤ 12.
Input: integer array 𝐹 ∈ ℤ256                𝑑
                              𝑚 , where 𝑚 = 2 if 𝑑 < 12, and 𝑚 = 𝑞 if 𝑑 = 12.
Output: byte array 𝐵 ∈ 𝔹32𝑑 .
  1: for (𝑖 ← 0; 𝑖 < 256; 𝑖 ++)
  2:     𝑎 ← 𝐹 [𝑖]                                                                      ▷ 𝑎 ∈ ℤ𝑚
  3:     for (𝑗 ← 0; 𝑗 < 𝑑; 𝑗 ++)
  4:         𝑏[𝑖 ⋅ 𝑑 + 𝑗] ← 𝑎 mod 2                                            ▷ 𝑏 ∈ {0, 1}256⋅𝑑
  5:         𝑎 ← (𝑎 − 𝑏[𝑖 ⋅ 𝑑 + 𝑗])/2                      ▷ note 𝑎 − 𝑏[𝑖 ⋅ 𝑑 + 𝑗] is always even
  6:     end for
  7: end for
  8: 𝐵 ← BitsToBytes(𝑏)
  9: return 𝐵
```

## 标准定义

本页的规范性定义由下方完整算法块给出；不得用项目实现或摘要替代标准语义。

## 公式或伪代码

> 以下完整保留本条目的标准算法块；只移除了 PDF 页眉、页脚、页码和分页标记。

```text
Algorithm 5 ByteEncode𝑑 (𝐹 )
Encodes an array of 𝑑-bit integers into a byte array for 1 ≤ 𝑑 ≤ 12.
Input: integer array 𝐹 ∈ ℤ256                𝑑
                              𝑚 , where 𝑚 = 2 if 𝑑 < 12, and 𝑚 = 𝑞 if 𝑑 = 12.
Output: byte array 𝐵 ∈ 𝔹32𝑑 .
  1: for (𝑖 ← 0; 𝑖 < 256; 𝑖 ++)
  2:     𝑎 ← 𝐹 [𝑖]                                                                      ▷ 𝑎 ∈ ℤ𝑚
  3:     for (𝑗 ← 0; 𝑗 < 𝑑; 𝑗 ++)
  4:         𝑏[𝑖 ⋅ 𝑑 + 𝑗] ← 𝑎 mod 2                                            ▷ 𝑏 ∈ {0, 1}256⋅𝑑
  5:         𝑎 ← (𝑎 − 𝑏[𝑖 ⋅ 𝑑 + 𝑗])/2                      ▷ note 𝑎 − 𝑏[𝑖 ⋅ 𝑑 + 𝑗] is always even
  6:     end for
  7: end for
  8: 𝐵 ← BitsToBytes(𝑏)
  9: return 𝐵
```

## 输入与输出

输入、输出、取值域和错误返回以完整算法块中的 `Input`、`Output` 及其步骤为准；标准未列出的字段不由项目自行补写。

## 项目映射

本页是标准结构化参考条目；项目是否有同名 Blockly 块、源码入口或 demo，按本目录 README 和覆盖矩阵核对。本页不把文档条目等同于已实现。

## 核验与缺项

已机械核对完整算法块与 source 算法标题及行号；标准向量、实现语义、边界负例和认证结论仍须按本目录记录分别核验。
