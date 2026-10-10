# Algorithm 6  ByteDecode_d(B)

## 条目元数据

| 字段 | 内容 |
|---|---|
| 类型 | 原语 / 函数 |
| 标准定位 | §4.2.1 编码与压缩 |
| 原文证据 | [source 提取稿](./00-Standard-Source.md)（本目录 PDF 清单见 source 页） |
| 原文位置 | [Algorithm 6 提取稿](./00-Standard-Source.md#L1332-L1342)；PDF [物理第 31 页](./NIST.FIPS.203.pdf#page=31)（标准页 22） |
| 项目状态 | 已实现（详见本文现有实现/缺项说明） |

## 原文定位与引用

> 本页按 source 中的“§4.2.1 编码与压缩”拆分；这是定位说明，不替代标准逐字引文。完整正文、公式和表格请回看 [source 提取稿](./00-Standard-Source.md#L1332) 与同目录 PDF。

## 原文摘录
> 以下为 source 中 Algorithm 6 的完整原文算法块；仅移除了 PDF 分页标记和页眉页码。

```text
Algorithm 6 ByteDecode_{𝑑}(𝐵)
Decodes a byte array into an array of 𝑑-bit integers for 1 ≤ 𝑑 ≤ 12.
Input: byte array 𝐵 ∈ 𝔹^{32𝑑}.
Output: integer array 𝐹 ∈ ℤ_{𝑚}^{256}, where 𝑚 = 2^𝑑 if 𝑑 < 12 and
        𝑚 = 𝑞 if 𝑑 = 12.
  1: 𝑏 ← BytesToBits(𝐵)
  2: for (𝑖 ← 0; 𝑖 < 256; 𝑖 ++)
  3:     𝐹[𝑖] ← (∑_{𝑗=0}^{𝑑−1} 𝑏[𝑖 ⋅ 𝑑 + 𝑗] ⋅ 2^𝑗) mod 𝑚
  4: end for
  5: return 𝐹
```

## 标准定义

本页的规范性定义由下方完整算法块给出；不得用项目实现或摘要替代标准语义。

## 公式或伪代码

> 以下完整保留本条目的标准算法块；只移除了 PDF 页眉、页脚、页码和分页标记。

```text
Algorithm 6 ByteDecode_{𝑑}(𝐵)
Decodes a byte array into an array of 𝑑-bit integers for 1 ≤ 𝑑 ≤ 12.
Input: byte array 𝐵 ∈ 𝔹^{32𝑑}.
Output: integer array 𝐹 ∈ ℤ_{𝑚}^{256}, where 𝑚 = 2^𝑑 if 𝑑 < 12 and
        𝑚 = 𝑞 if 𝑑 = 12.
  1: 𝑏 ← BytesToBits(𝐵)
  2: for (𝑖 ← 0; 𝑖 < 256; 𝑖 ++)
  3:     𝐹[𝑖] ← (∑_{𝑗=0}^{𝑑−1} 𝑏[𝑖 ⋅ 𝑑 + 𝑗] ⋅ 2^𝑗) mod 𝑚
  4: end for
  5: return 𝐹
```

## 输入与输出

输入、输出、取值域和错误返回以完整算法块中的 `Input`、`Output` 及其步骤为准；标准未列出的字段不由项目自行补写。

## 项目映射

项目通过 `pq_byte_decode` 实现该算法：[积木定义](../../../src/blocks/post-quantum/basic/encoding.ts)、[JavaScript 生成器](../../../src/generators/javascript/postquantum/basic/encoding.ts)、[Python 生成器](../../../src/generators/python/postquantum/basic/encoding.ts)。积木下拉框提供项目使用的 `d = 1, 4, 5, 10, 11, 12`，不是 FIPS 203 抽象算法 `1 ≤ d ≤ 12` 的全部取值；输出 256 个元素，并在 `d = 12` 时按标准对 `q = 3329` 取模。双语言回归见 [`pq-bit-encoding.test.ts`](../../../tests/unit/pq-bit-encoding.test.ts)。实现映射不表示完整 ML-KEM 符合性或认证。

## 核验与缺项

已机械核对完整算法块与 source 算法标题及行号；标准向量、实现语义、边界负例和认证结论仍须按本目录记录分别核验。
