# Algorithm 13  K-PKE.KeyGen(d)

## 条目元数据

| 字段 | 内容 |
|---|---|
| 类型 | 算法阶段 / 原语 / 函数 |
| 标准定位 | §5.1 K-PKE |
| 原文证据 | [source 提取稿](./00-Standard-Source.md)（本目录 PDF 清单见 source 页） |
| 原文位置 | [提取稿 Algorithm 13](./00-Standard-Source.md#L1664)；PDF 物理第 38 页（标准页 29） |
| 项目状态 | 部分实现（详见本文现有实现/缺项说明） |

## 原文定位与引用

> 本页按 source 中的“§5.1 K-PKE”拆分；这是定位说明，不替代标准逐字引文。完整正文、公式和表格请回看 [source 提取稿](./00-Standard-Source.md#L1664) 与同目录 PDF。

## 原文摘录
> 以下为 source 中 Algorithm 13 的完整原文算法块；仅移除了 PDF 分页标记和页眉页码。

```text
Algorithm 13 K-PKE.KeyGen(𝑑)
Uses randomness to generate an encryption key and a corresponding decryption key.
Input: randomness 𝑑 ∈ 𝔹^{32}.
Output: encryption key ek_PKE ∈ 𝔹^{384𝑘+32}.
Output: decryption key dk_PKE ∈ 𝔹^{384𝑘}.
  1: (𝜌, 𝜎) ← G(𝑑‖𝑘) ▷ expand 32+1 bytes to two pseudorandom 32-byte seeds¹
  2: 𝑁 ← 0
  3: for (𝑖 ← 0; 𝑖 < 𝑘; 𝑖++)
      ▷ generate matrix 𝐀̂ ∈ (ℤ_q^{256})^{𝑘×𝑘}

  4:     for (𝑗 ← 0; 𝑗 < 𝑘; 𝑗++)
  5:         𝐀̂[𝑖, 𝑗] ← SampleNTT(𝜌‖𝑗‖𝑖)
          ▷ 𝑗 and 𝑖 are bytes 33 and 34 of the input
  6:     end for
  7: end for
  8: for (𝑖 ← 0; 𝑖 < 𝑘; 𝑖++)
      ▷ generate 𝐬 ∈ (ℤ_q^{256})^𝑘

  9:     𝐬[𝑖] ← SamplePolyCBD_η₁(PRF_η₁(𝜎, 𝑁))
          ▷ 𝐬[𝑖] ∈ ℤ_q^{256}, sampled from CBD
10:      𝑁 ← 𝑁 + 1
11: end for
12: for (𝑖 ← 0; 𝑖 < 𝑘; 𝑖++) ▷ generate 𝐞 ∈ (ℤ_q^{256})^𝑘

13:      𝐞[𝑖] ← SamplePolyCBD_η₁(PRF_η₁(𝜎, 𝑁))
          ▷ 𝐞[𝑖] ∈ ℤ_q^{256}, sampled from CBD
14:      𝑁 ← 𝑁 + 1
15: end for
16: 𝐬̂ ← NTT(𝐬)
      ▷ run NTT 𝑘 times, once per coordinate of 𝐬
17: 𝐞̂ ← NTT(𝐞)
      ▷ run NTT 𝑘 times
18: 𝐭̂ ← 𝐀̂ ∘ 𝐬̂ + 𝐞̂ ▷ noisy linear system in NTT domain
19: ek_PKE ← ByteEncode_12(𝐭̂)‖𝜌 ▷ run ByteEncode_12 𝑘 times, then append the 𝐀̂-seed
20: dk_PKE ← ByteEncode_12(𝐬̂) ▷ run ByteEncode_12 𝑘 times
21: return (ek_PKE, dk_PKE)
```
> ¹ Byte 33 of the input to G is the module dimension 𝑘 ∈ {2, 3, 4} ⊂ 𝔹. This is included to establish domain separation between the three parameter sets. For implementations that use the seed in place of the private key, this ensures that the expansion will produce an unrelated key if the seed is mistakenly expanded using a parameter set other than the originally intended one.

## 标准定义

本页的规范性定义由下方完整算法块给出；不得用项目实现或摘要替代标准语义。

## 公式或伪代码

> 以下再次列出完整算法与脚注，数学上下标依原 PDF 视觉页转写；未删减算法步骤。

```text
Algorithm 13 K-PKE.KeyGen(𝑑)
Uses randomness to generate an encryption key and a corresponding decryption key.
Input: randomness 𝑑 ∈ 𝔹^{32}.
Output: encryption key ek_PKE ∈ 𝔹^{384𝑘+32}.
Output: decryption key dk_PKE ∈ 𝔹^{384𝑘}.
  1: (𝜌, 𝜎) ← G(𝑑‖𝑘) ▷ expand 32+1 bytes to two pseudorandom 32-byte seeds¹
  2: 𝑁 ← 0
  3: for (𝑖 ← 0; 𝑖 < 𝑘; 𝑖++)
      ▷ generate matrix 𝐀̂ ∈ (ℤ_q^{256})^{𝑘×𝑘}

  4:     for (𝑗 ← 0; 𝑗 < 𝑘; 𝑗++)
  5:         𝐀̂[𝑖, 𝑗] ← SampleNTT(𝜌‖𝑗‖𝑖)
          ▷ 𝑗 and 𝑖 are bytes 33 and 34 of the input
  6:     end for
  7: end for
  8: for (𝑖 ← 0; 𝑖 < 𝑘; 𝑖++)
      ▷ generate 𝐬 ∈ (ℤ_q^{256})^𝑘

  9:     𝐬[𝑖] ← SamplePolyCBD_η₁(PRF_η₁(𝜎, 𝑁))
          ▷ 𝐬[𝑖] ∈ ℤ_q^{256}, sampled from CBD
10:      𝑁 ← 𝑁 + 1
11: end for
12: for (𝑖 ← 0; 𝑖 < 𝑘; 𝑖++) ▷ generate 𝐞 ∈ (ℤ_q^{256})^𝑘

13:      𝐞[𝑖] ← SamplePolyCBD_η₁(PRF_η₁(𝜎, 𝑁))
          ▷ 𝐞[𝑖] ∈ ℤ_q^{256}, sampled from CBD
14:      𝑁 ← 𝑁 + 1
15: end for
16: 𝐬̂ ← NTT(𝐬)
      ▷ run NTT 𝑘 times, once per coordinate of 𝐬
17: 𝐞̂ ← NTT(𝐞)
      ▷ run NTT 𝑘 times
18: 𝐭̂ ← 𝐀̂ ∘ 𝐬̂ + 𝐞̂ ▷ noisy linear system in NTT domain
19: ek_PKE ← ByteEncode_12(𝐭̂)‖𝜌 ▷ run ByteEncode_12 𝑘 times, then append the 𝐀̂-seed
20: dk_PKE ← ByteEncode_12(𝐬̂) ▷ run ByteEncode_12 𝑘 times
21: return (ek_PKE, dk_PKE)
```
> ¹ Byte 33 of the input to G is the module dimension 𝑘 ∈ {2, 3, 4} ⊂ 𝔹. This is included to establish domain separation between the three parameter sets. For implementations that use the seed in place of the private key, this ensures that the expansion will produce an unrelated key if the seed is mistakenly expanded using a parameter set other than the originally intended one.

## 输入与输出

输入、输出、取值域和错误返回以完整算法块中的 `Input`、`Output` 及其步骤为准；标准未列出的字段不由项目自行补写。

## 项目映射

本页是标准结构化参考条目；项目是否有同名 Blockly 块、源码入口或 demo，按本目录 README 和覆盖矩阵核对。本页不把文档条目等同于已实现。

## 核验与缺项

已机械核对完整算法块与 source 算法标题及行号；标准向量、实现语义、边界负例和认证结论仍须按本目录记录分别核验。
