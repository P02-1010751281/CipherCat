# Algorithm 14  K-PKE.Encrypt(ekPKE, m, r)

## 条目元数据

| 字段 | 内容 |
|---|---|
| 类型 | 算法阶段 / 原语 / 函数 |
| 标准定位 | §5.2 K-PKE |
| 原文证据 | [source 提取稿](./00-Standard-Source.md)（本目录 PDF 清单见 source 页） |
| 原文位置 | [提取稿](./00-Standard-Source.md#L1727)；PDF 物理页需结合同目录 PDF 核对 |
| 项目状态 | 已实现（详见本文现有实现/缺项说明） |

## 原文定位与引用

> 本页按 source 中的“§5.2 K-PKE”拆分；这是定位说明，不替代标准逐字引文。完整正文、公式和表格请回看 [source 提取稿](./00-Standard-Source.md#L1727) 与同目录 PDF。

## 原文摘录
> 以下为 source 中 Algorithm 14 的完整原文算法块；仅移除了 PDF 分页标记和页眉页码。

```text
Algorithm 14 K-PKE.Encrypt(ekPKE , 𝑚, 𝑟)
Uses the encryption key to encrypt a plaintext message using the randomness 𝑟.
Input: encryption key ekPKE ∈ 𝔹384𝑘+32 .
Input: message 𝑚 ∈ 𝔹32 .
Input: randomness 𝑟 ∈ 𝔹32 .
Output: ciphertext 𝑐 ∈ 𝔹32(𝑑𝑢 𝑘+𝑑𝑣 ) .
  1: 𝑁 ← 0
  2: 𝐭̂ ← ByteDecode12 (ekPKE [0 ∶ 384𝑘]) ▷ run ByteDecode12 𝑘 times to decode 𝐭̂ ∈ (ℤ256   𝑞 )
                                                                                                 𝑘

  3: 𝜌 ← ekPKE [384𝑘 ∶ 384𝑘 + 32]                               ▷ extract 32-byte seed from ekPKE
  4: for (𝑖 ← 0; 𝑖 < 𝑘; 𝑖 )
                          ++               ▷ re-generate matrix 𝐀̂ ∈ (ℤ256
                                                                        𝑞 )
                                                                            𝑘×𝑘
                                                                                sampled in Alg. 13
  5:     for (𝑗 ← 0; 𝑗 < 𝑘; 𝑗 ++)
  6:            ̂ 𝑗] ← SampleNTT(𝜌‖𝑗‖𝑖)
              𝐀[𝑖,                                      ▷ 𝑗 and 𝑖 are bytes 33 and 34 of the input
  7:     end for
  8: end for
  9: for (𝑖 ← 0; 𝑖 < 𝑘; 𝑖 ++)                                              ▷ generate 𝐲 ∈ (ℤ256
                                                                                             𝑞 )
                                                                                                  𝑘

10:      𝐲[𝑖] ← SamplePolyCBD𝜂 (PRF𝜂1 (𝑟, 𝑁 ))                   ▷ 𝐲[𝑖] ∈ ℤ256
                                                                            𝑞   sampled from CBD
11:      𝑁 ← 𝑁 +1
12: end for
13: for (𝑖 ← 0; 𝑖 < 𝑘; 𝑖 ++)                                              ▷ generate 𝐞𝟏 ∈ (ℤ256
                                                                                             𝑞 )
                                                                                                  𝑘

14:      𝐞𝟏 [𝑖] ← SamplePolyCBD𝜂 (PRF𝜂2 (𝑟, 𝑁 ))                            256
                                                                ▷ 𝐞𝟏 [𝑖] ∈ ℤ𝑞 sampled from CBD
15:      𝑁 ← 𝑁 +1
16: end for
17: 𝑒2 ← SamplePolyCBD𝜂 (PRF𝜂 (𝑟, 𝑁 ))                              ▷ sample 𝑒2 ∈ ℤ256
                                                                                     𝑞  from CBD
                               2        2
18: 𝐲̂ ← NTT(𝐲)                                                                ▷ run NTT 𝑘 times
19: 𝐮 ← NTT (𝐀 ∘ 𝐲)  ̂                                                       ▷ run NTT−1 𝑘 times
                 −1    ⊺
                            ̂ + 𝐞𝟏
20: 𝜇 ← Decompress1 (ByteDecode1 (𝑚))
21: 𝑣 ← NTT (𝐭̂⊺ ∘ 𝐲)
                 −1
                          ̂ + 𝑒2 + 𝜇                      ▷ encode plaintext 𝑚 into polynomial 𝑣
22: 𝑐1 ← ByteEncode𝑑 (Compress𝑑 (𝐮))                ▷ run ByteEncode𝑑 and Compress𝑑 𝑘 times
                          𝑢              𝑢                              𝑢               𝑢
23: 𝑐2 ← ByteEncode𝑑 (Compress𝑑 (𝑣))
                          𝑣              𝑣
24: return 𝑐 ← (𝑐1 ‖𝑐2 )
```

## 标准定义

本页的规范性定义由下方完整算法块给出；不得用项目实现或摘要替代标准语义。

## 公式或伪代码

> 以下完整保留本条目的标准算法块；只移除了 PDF 页眉、页脚、页码和分页标记。

```text
Algorithm 14 K-PKE.Encrypt(ekPKE , 𝑚, 𝑟)
Uses the encryption key to encrypt a plaintext message using the randomness 𝑟.
Input: encryption key ekPKE ∈ 𝔹384𝑘+32 .
Input: message 𝑚 ∈ 𝔹32 .
Input: randomness 𝑟 ∈ 𝔹32 .
Output: ciphertext 𝑐 ∈ 𝔹32(𝑑𝑢 𝑘+𝑑𝑣 ) .
  1: 𝑁 ← 0
  2: 𝐭̂ ← ByteDecode12 (ekPKE [0 ∶ 384𝑘]) ▷ run ByteDecode12 𝑘 times to decode 𝐭̂ ∈ (ℤ256   𝑞 )
                                                                                                 𝑘

  3: 𝜌 ← ekPKE [384𝑘 ∶ 384𝑘 + 32]                               ▷ extract 32-byte seed from ekPKE
  4: for (𝑖 ← 0; 𝑖 < 𝑘; 𝑖 )
                          ++               ▷ re-generate matrix 𝐀̂ ∈ (ℤ256
                                                                        𝑞 )
                                                                            𝑘×𝑘
                                                                                sampled in Alg. 13
  5:     for (𝑗 ← 0; 𝑗 < 𝑘; 𝑗 ++)
  6:            ̂ 𝑗] ← SampleNTT(𝜌‖𝑗‖𝑖)
              𝐀[𝑖,                                      ▷ 𝑗 and 𝑖 are bytes 33 and 34 of the input
  7:     end for
  8: end for
  9: for (𝑖 ← 0; 𝑖 < 𝑘; 𝑖 ++)                                              ▷ generate 𝐲 ∈ (ℤ256
                                                                                             𝑞 )
                                                                                                  𝑘

10:      𝐲[𝑖] ← SamplePolyCBD𝜂 (PRF𝜂1 (𝑟, 𝑁 ))                   ▷ 𝐲[𝑖] ∈ ℤ256
                                                                            𝑞   sampled from CBD
11:      𝑁 ← 𝑁 +1
12: end for
13: for (𝑖 ← 0; 𝑖 < 𝑘; 𝑖 ++)                                              ▷ generate 𝐞𝟏 ∈ (ℤ256
                                                                                             𝑞 )
                                                                                                  𝑘

14:      𝐞𝟏 [𝑖] ← SamplePolyCBD𝜂 (PRF𝜂2 (𝑟, 𝑁 ))                            256
                                                                ▷ 𝐞𝟏 [𝑖] ∈ ℤ𝑞 sampled from CBD
15:      𝑁 ← 𝑁 +1
16: end for
17: 𝑒2 ← SamplePolyCBD𝜂 (PRF𝜂 (𝑟, 𝑁 ))                              ▷ sample 𝑒2 ∈ ℤ256
                                                                                     𝑞  from CBD
                               2        2
18: 𝐲̂ ← NTT(𝐲)                                                                ▷ run NTT 𝑘 times
19: 𝐮 ← NTT (𝐀 ∘ 𝐲)  ̂                                                       ▷ run NTT−1 𝑘 times
                 −1    ⊺
                            ̂ + 𝐞𝟏
20: 𝜇 ← Decompress1 (ByteDecode1 (𝑚))
21: 𝑣 ← NTT (𝐭̂⊺ ∘ 𝐲)
                 −1
                          ̂ + 𝑒2 + 𝜇                      ▷ encode plaintext 𝑚 into polynomial 𝑣
22: 𝑐1 ← ByteEncode𝑑 (Compress𝑑 (𝐮))                ▷ run ByteEncode𝑑 and Compress𝑑 𝑘 times
                          𝑢              𝑢                              𝑢               𝑢
23: 𝑐2 ← ByteEncode𝑑 (Compress𝑑 (𝑣))
                          𝑣              𝑣
24: return 𝑐 ← (𝑐1 ‖𝑐2 )
```

## 输入与输出

输入、输出、取值域和错误返回以完整算法块中的 `Input`、`Output` 及其步骤为准；标准未列出的字段不由项目自行补写。

## 项目映射

本页是标准结构化参考条目；项目是否有同名 Blockly 块、源码入口或 demo，按本目录 README 和覆盖矩阵核对。本页不把文档条目等同于已实现。

## 核验与缺项

已机械核对完整算法块与 source 算法标题及行号；标准向量、实现语义、边界负例和认证结论仍须按本目录记录分别核验。
