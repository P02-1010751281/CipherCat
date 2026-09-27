# Algorithm 8  ML-DSA.Verify_internal(𝑝𝑘, 𝑀 ′ , 𝜎)

## 条目元数据

| 字段 | 内容 |
|---|---|
| 类型 | 算法阶段 / 原语 / 函数 |
| 标准定位 | §6.3 |
| 原文证据 | [source 提取稿](./00-Standard-Source.md)（本目录 PDF 清单见 source 页） |
| 原文位置 | [提取稿](./00-Standard-Source.md#L1616)；PDF 物理页需结合同目录 PDF 核对 |
| 项目状态 | 部分实现（详见本文现有实现/缺项说明） |

## 原文定位与引用

> 本页按 source 中的“§6.3”拆分；这是定位说明，不替代标准逐字引文。完整正文、公式和表格请回看 [source 提取稿](./00-Standard-Source.md#L1616) 与同目录 PDF。

## 原文摘录
> 以下为 source 中 Algorithm 8 的完整原文算法块；仅移除了 PDF 分页标记和页眉页码。

```text
Algorithm 8 ML-DSA.Verify_internal(𝑝𝑘, 𝑀 ′ , 𝜎)
Internal function to verify a signature 𝜎 for a formatted message 𝑀 ′ .
Input: Public key 𝑝𝑘 ∈ 𝔹32+32𝑘(bitlen (𝑞−1)−𝑑) and message 𝑀 ′ ∈ {0, 1}∗ .
Input: Signature 𝜎 ∈ 𝔹𝜆/4+ℓ⋅32⋅(1+bitlen (𝛾1 −1))+𝜔+𝑘 .
Output: Boolean
  1: (𝜌, 𝐭1 ) ← pkDecode(𝑝𝑘)
  2: (𝑐,̃ 𝐳, 𝐡) ← sigDecode(𝜎)             ▷ signer’s commitment hash 𝑐,̃ response 𝐳, and hint 𝐡
  3: if 𝐡 = ⊥ then return false                                 ▷ hint was not properly encoded
  4: end if
  5: 𝐀̂ ← ExpandA(𝜌)                    ▷ 𝐀 is generated and stored in NTT representation as 𝐀̂
  6: 𝑡𝑟 ← H(𝑝𝑘, 64)
  7: 𝜇 ← (H(BytesToBits(𝑡𝑟)||𝑀 ′ , 64))           ▷ message representative that may optionally be
     computed in a different cryptographic module
  8: 𝑐 ∈ 𝑅𝑞 ← SampleInBall(𝑐)̃                             ▷ compute verifier’s challenge from 𝑐 ̃
  9: 𝐰Approx ← NTT (𝐀 ∘ NTT(𝐳) − NTT(𝑐) ∘ NTT(𝐭1 ⋅ 2𝑑 ))
         ′            −1   ̂                                               ′
                                                                      ▷ 𝐰Approx  = 𝐀𝐳 − 𝑐𝐭1 ⋅ 2𝑑
10: 𝐰1 ← UseHint(𝐡, 𝐰Approx )
         ′                ′
                                                        ▷ reconstruction of signer’s commitment
11:                   ▷ UseHint is applied componentwise (see explanatory text in Section 7.4)
12: 𝑐 ′̃ ← H(𝜇||w1Encode(𝐰′1 ), 𝜆/4)                               ▷ hash it; this should match 𝑐 ̃
                                              ′
13: return [[ ||𝐳||∞ < 𝛾1 − 𝛽]] and [[𝑐 ̃ = 𝑐 ̃ ]]
```

## 标准定义

本页的规范性定义由下方完整算法块给出；不得用项目实现或摘要替代标准语义。

## 公式或伪代码

> 以下完整保留本条目的标准算法块；只移除了 PDF 页眉、页脚、页码和分页标记。

```text
Algorithm 8 ML-DSA.Verify_internal(𝑝𝑘, 𝑀 ′ , 𝜎)
Internal function to verify a signature 𝜎 for a formatted message 𝑀 ′ .
Input: Public key 𝑝𝑘 ∈ 𝔹32+32𝑘(bitlen (𝑞−1)−𝑑) and message 𝑀 ′ ∈ {0, 1}∗ .
Input: Signature 𝜎 ∈ 𝔹𝜆/4+ℓ⋅32⋅(1+bitlen (𝛾1 −1))+𝜔+𝑘 .
Output: Boolean
  1: (𝜌, 𝐭1 ) ← pkDecode(𝑝𝑘)
  2: (𝑐,̃ 𝐳, 𝐡) ← sigDecode(𝜎)             ▷ signer’s commitment hash 𝑐,̃ response 𝐳, and hint 𝐡
  3: if 𝐡 = ⊥ then return false                                 ▷ hint was not properly encoded
  4: end if
  5: 𝐀̂ ← ExpandA(𝜌)                    ▷ 𝐀 is generated and stored in NTT representation as 𝐀̂
  6: 𝑡𝑟 ← H(𝑝𝑘, 64)
  7: 𝜇 ← (H(BytesToBits(𝑡𝑟)||𝑀 ′ , 64))           ▷ message representative that may optionally be
     computed in a different cryptographic module
  8: 𝑐 ∈ 𝑅𝑞 ← SampleInBall(𝑐)̃                             ▷ compute verifier’s challenge from 𝑐 ̃
  9: 𝐰Approx ← NTT (𝐀 ∘ NTT(𝐳) − NTT(𝑐) ∘ NTT(𝐭1 ⋅ 2𝑑 ))
         ′            −1   ̂                                               ′
                                                                      ▷ 𝐰Approx  = 𝐀𝐳 − 𝑐𝐭1 ⋅ 2𝑑
10: 𝐰1 ← UseHint(𝐡, 𝐰Approx )
         ′                ′
                                                        ▷ reconstruction of signer’s commitment
11:                   ▷ UseHint is applied componentwise (see explanatory text in Section 7.4)
12: 𝑐 ′̃ ← H(𝜇||w1Encode(𝐰′1 ), 𝜆/4)                               ▷ hash it; this should match 𝑐 ̃
                                              ′
13: return [[ ||𝐳||∞ < 𝛾1 − 𝛽]] and [[𝑐 ̃ = 𝑐 ̃ ]]
```

## 输入与输出

输入、输出、取值域和错误返回以完整算法块中的 `Input`、`Output` 及其步骤为准；标准未列出的字段不由项目自行补写。

## 项目映射

本页是标准结构化参考条目；项目是否有同名 Blockly 块、源码入口或 demo，按本目录 README 和覆盖矩阵核对。本页不把文档条目等同于已实现。

## 核验与缺项

已机械核对完整算法块与 source 算法标题及行号；标准向量、实现语义、边界负例和认证结论仍须按本目录记录分别核验。
