# Algorithm 7  SampleNTT(B)

## 条目元数据

| 字段 | 内容 |
|---|---|
| 类型 | 算法阶段 / 原语 / 函数 |
| 标准定位 | §4.2.2 采样 |
| 原文证据 | [source 提取稿](./00-Standard-Source.md)（本目录 PDF 清单见 source 页） |
| 原文位置 | [提取稿](./00-Standard-Source.md#L1367)；[PDF 物理第 32 页（标准页 23）](./NIST.FIPS.203.pdf#page=32) |
| 项目状态 | 已实现（详见本文现有实现/缺项说明） |

## 原文定位与引用

> 本页按 source 中的“§4.2.2 采样”拆分；这是定位说明，不替代标准逐字引文。完整正文、公式和表格请回看 [source 提取稿](./00-Standard-Source.md#L1367) 与同目录 PDF。算法中的 `2¹²` 已按 PDF 物理第 32 页（标准页 23）核正旧提取稿丢失的上标。

## 原文摘录
> 以下为 source 中 Algorithm 7 的完整原文算法块；仅移除了 PDF 分页标记和页眉页码。

```text
Algorithm 7 SampleNTT(𝐵)
Takes a 32-byte seed and two indices as input and outputs a pseudorandom element of 𝑇𝑞 .
Input: byte array 𝐵 ∈ 𝔹^{34} .                          ▷ a 32-byte seed along with two indices
Output: array 𝑎̂ ∈ ℤ_q^{256}
                                                       ▷ the coefficients of the NTT of a polynomial
  1: ctx ← XOF.Init()
  2: ctx ← XOF.Absorb(ctx, 𝐵)                              ▷ input the given byte array into XOF
  3: 𝑗 ← 0
  4: while 𝑗 < 256 do
  5:     (ctx, 𝐶) ← XOF.Squeeze(ctx, 3)                    ▷ get a fresh 3-byte array 𝐶 from XOF
  6:     𝑑1 ← 𝐶[0] + 256 ⋅ (𝐶[1] mod 16)                                          ▷ 0 ≤ 𝑑1 < 2¹²
  7:     𝑑2 ← ⌊𝐶[1]/16⌋ + 16 ⋅ 𝐶[2]                                               ▷ 0 ≤ 𝑑2 < 2¹²
  8:     if 𝑑1 < 𝑞 then
  9:         𝑎[𝑗] ← 𝑑1
               ̂                                                                     ▷ 𝑎̂ ∈ ℤ_q^{256}

10:          𝑗 ← 𝑗+1
11:      end if
12:      if 𝑑2 < 𝑞 and 𝑗 < 256 then
13:          𝑎[𝑗] ← 𝑑2
                 ̂
14:          𝑗 ← 𝑗+1
15:      end if
16: end while
17: return 𝑎̂
```

## 标准定义

本页的规范性定义由下方完整算法块给出；不得用项目实现或摘要替代标准语义。

## 公式或伪代码

```text
Algorithm 7 SampleNTT(𝐵)
Takes a 32-byte seed and two indices as input and outputs a pseudorandom element of 𝑇𝑞 .
Input: byte array 𝐵 ∈ 𝔹^{34} .                          ▷ a 32-byte seed along with two indices
Output: array 𝑎̂ ∈ ℤ_q^{256}
                                                       ▷ the coefficients of the NTT of a polynomial
  1: ctx ← XOF.Init()
  2: ctx ← XOF.Absorb(ctx, 𝐵)                              ▷ input the given byte array into XOF
  3: 𝑗 ← 0
  4: while 𝑗 < 256 do
  5:     (ctx, 𝐶) ← XOF.Squeeze(ctx, 3)                    ▷ get a fresh 3-byte array 𝐶 from XOF
  6:     𝑑1 ← 𝐶[0] + 256 ⋅ (𝐶[1] mod 16)                                          ▷ 0 ≤ 𝑑1 < 2¹²
  7:     𝑑2 ← ⌊𝐶[1]/16⌋ + 16 ⋅ 𝐶[2]                                               ▷ 0 ≤ 𝑑2 < 2¹²
  8:     if 𝑑1 < 𝑞 then
  9:         𝑎[𝑗] ← 𝑑1
               ̂                                                                     ▷ 𝑎̂ ∈ ℤ_q^{256}

10:          𝑗 ← 𝑗+1
11:      end if
12:      if 𝑑2 < 𝑞 and 𝑗 < 256 then
13:          𝑎[𝑗] ← 𝑑2
                 ̂
14:          𝑗 ← 𝑗+1
15:      end if
16: end while
17: return 𝑎̂
```

Algorithm 7 的完整标准伪代码见上方[原文摘录](#原文摘录)；此处引用同一完整算法，不重复抄录。原文位置：[FIPS 203 PDF 物理第 32 页（标准页 23）](./NIST.FIPS.203.pdf#page=32)。

## 输入与输出

输入、输出、取值域和错误返回以完整算法块中的 `Input`、`Output` 及其步骤为准；标准未列出的字段不由项目自行补写。

## 项目映射

本页是标准结构化参考条目；项目是否有同名 Blockly 块、源码入口或 demo，按本目录 README 和覆盖矩阵核对。本页不把文档条目等同于已实现。

## 核验与缺项

已机械核对完整算法块与 source 算法标题及行号；标准向量、实现语义、边界负例和认证结论仍须按本目录记录分别核验。
