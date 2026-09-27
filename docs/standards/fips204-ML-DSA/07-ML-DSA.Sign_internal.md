# Algorithm 7  ML-DSA.Sign_internal(𝑠𝑘, 𝑀 ′ , 𝑟𝑛𝑑)

## 条目元数据

| 字段 | 内容 |
|---|---|
| 类型 | 算法阶段 / 原语 / 函数 |
| 标准定位 | §6.2 |
| 原文证据 | [source 提取稿](./00-Standard-Source.md)（本目录 PDF 清单见 source 页） |
| 原文位置 | [提取稿定位](./00-Standard-Source.md#L1516)；PDF 物理页需结合同目录 PDF 核对 |
| 项目状态 | 部分实现（详见本文现有实现/缺项说明） |

## 原文定位与引用

> 本页按 source 中的“§6.2”拆分；这是定位说明，不替代标准逐字引文。完整正文、公式和表格请回看 [source 提取稿](./00-Standard-Source.md#L1516) 与同目录 PDF。

## 原文摘录
> 以下为 source 中 Algorithm 7 的完整原文算法块；仅移除了 PDF 分页标记和页眉页码。

```text
Algorithm 7 ML-DSA.Sign_internal(𝑠𝑘, 𝑀 ′ , 𝑟𝑛𝑑)
Deterministic algorithm to generate a signature for a formatted message 𝑀 ′ .
Input: Private key 𝑠𝑘 ∈ 𝔹32+32+64+32⋅((ℓ+𝑘)⋅bitlen (2𝜂)+𝑑𝑘) , formatted message 𝑀 ′ ∈ {0, 1}∗ , and
per message randomness or dummy variable 𝑟𝑛𝑑 ∈ 𝔹32 .
Output: Signature 𝜎 ∈ 𝔹𝜆/4+ℓ⋅32⋅(1+bitlen (𝛾1 −1))+𝜔+𝑘 .
  1: (𝜌, 𝐾, 𝑡𝑟, 𝐬1 , 𝐬2 , 𝐭0 ) ← skDecode(𝑠𝑘)
  2: 𝐬1̂ ← NTT(𝐬1 )
  3: 𝐬 ̂2 ← NTT(𝐬2 )
  4: 𝐭0̂ ← NTT(𝐭0 )
  5: 𝐀̂ ← ExpandA(𝜌)                         ▷ 𝐀 is generated and stored in NTT representation as 𝐀̂
                                      ′
  6: 𝜇 ← H(BytesToBits(𝑡𝑟)||𝑀 , 64)                 ▷ message representative that may optionally be
     computed in a different cryptographic module
  7: 𝜌″ ← H(𝐾||𝑟𝑛𝑑||𝜇, 64)                                          ▷ compute private random seed
  8: 𝜅 ← 0                                                                     ▷ initialize counter 𝜅
  9: (𝐳, 𝐡) ← ⊥
 10: while (𝐳, 𝐡) = ⊥ do                                                  ▷ rejection sampling loop
 11:      𝐲 ∈ 𝑅𝑞 ← ExpandMask(𝜌 , 𝜅)
                  ℓ                     ″

 12:      𝐰 ← NTT−1 (𝐀̂ ∘ NTT(𝐲))
 13:      𝐰1 ← HighBits(𝐰)                                                   ▷ signer’s commitment
 14:                      ▷ HighBits is applied componentwise (see explanatory text in Section 7.4)
 15:      𝑐 ̃ ← H(𝜇||w1Encode(𝐰1 ), 𝜆/4)                                       ▷ commitment hash
 16:      𝑐 ∈ 𝑅𝑞 ← SampleInBall(𝑐)̃                                            ▷ verifier’s challenge
 17:      𝑐 ̂ ← NTT(𝑐)
 18:      ⟨⟨𝑐𝐬1 ⟩⟩ ← NTT−1 (𝑐 ̂ ∘ 𝐬1̂ )
 19:      ⟨⟨𝑐𝐬2 ⟩⟩ ← NTT−1 (𝑐 ̂ ∘ 𝐬2̂ )
 20:      𝐳 ← 𝐲 + ⟨⟨𝑐𝐬1 ⟩⟩                                                      ▷ signer’s response
 21:      𝐫0 ← LowBits(𝐰 − ⟨⟨𝑐𝐬2 ⟩⟩)
 22:                      ▷ LowBits is applied componentwise (see explanatory text in Section 7.4)
 23:      if ||𝐳||∞ ≥ 𝛾1 − 𝛽 or ||𝐫0 ||∞ ≥ 𝛾2 − 𝛽 then (z, h) ← ⊥                  ▷ validity checks
 24:      else
 25:           ⟨⟨𝑐𝐭0 ⟩⟩ ← NTT−1 (𝑐 ̂ ∘ 𝐭0̂ )
 26:           𝐡 ← MakeHint(−⟨⟨𝑐𝐭0 ⟩⟩, 𝐰 − ⟨⟨𝑐𝐬2 ⟩⟩ + ⟨⟨𝑐𝐭0 ⟩⟩)                       ▷ Signer’s hint
 27:                   ▷ MakeHint is applied componentwise (see explanatory text in Section 7.4)
 28:           if ||⟨⟨𝑐𝐭0 ⟩⟩||∞ ≥ 𝛾2 or the number of 1’s in 𝐡 is greater than 𝜔, then (z, h) ← ⊥
 29:           end if
 30:      end if
 31:      𝜅←𝜅+ℓ                                                                ▷ increment counter
 32: end while
 33: 𝜎 ← sigEncode(𝑐,̃ 𝐳 mod 𝑞, 𝐡)
                                  ±

 34: return 𝜎
```

## 标准定义

本页的规范性定义由下方完整算法块给出；不得用项目实现或摘要替代标准语义。

## 公式或伪代码

> 以下完整保留本条目的标准算法块；只移除了 PDF 页眉、页脚、页码和分页标记。

```text
Algorithm 7 ML-DSA.Sign_internal(𝑠𝑘, 𝑀 ′ , 𝑟𝑛𝑑)
Deterministic algorithm to generate a signature for a formatted message 𝑀 ′ .
Input: Private key 𝑠𝑘 ∈ 𝔹32+32+64+32⋅((ℓ+𝑘)⋅bitlen (2𝜂)+𝑑𝑘) , formatted message 𝑀 ′ ∈ {0, 1}∗ , and
per message randomness or dummy variable 𝑟𝑛𝑑 ∈ 𝔹32 .
Output: Signature 𝜎 ∈ 𝔹𝜆/4+ℓ⋅32⋅(1+bitlen (𝛾1 −1))+𝜔+𝑘 .
  1: (𝜌, 𝐾, 𝑡𝑟, 𝐬1 , 𝐬2 , 𝐭0 ) ← skDecode(𝑠𝑘)
  2: 𝐬1̂ ← NTT(𝐬1 )
  3: 𝐬 ̂2 ← NTT(𝐬2 )
  4: 𝐭0̂ ← NTT(𝐭0 )
  5: 𝐀̂ ← ExpandA(𝜌)                         ▷ 𝐀 is generated and stored in NTT representation as 𝐀̂
                                      ′
  6: 𝜇 ← H(BytesToBits(𝑡𝑟)||𝑀 , 64)                 ▷ message representative that may optionally be
     computed in a different cryptographic module
  7: 𝜌″ ← H(𝐾||𝑟𝑛𝑑||𝜇, 64)                                          ▷ compute private random seed
  8: 𝜅 ← 0                                                                     ▷ initialize counter 𝜅
  9: (𝐳, 𝐡) ← ⊥
 10: while (𝐳, 𝐡) = ⊥ do                                                  ▷ rejection sampling loop
 11:      𝐲 ∈ 𝑅𝑞 ← ExpandMask(𝜌 , 𝜅)
                  ℓ                     ″

 12:      𝐰 ← NTT−1 (𝐀̂ ∘ NTT(𝐲))
 13:      𝐰1 ← HighBits(𝐰)                                                   ▷ signer’s commitment
 14:                      ▷ HighBits is applied componentwise (see explanatory text in Section 7.4)
 15:      𝑐 ̃ ← H(𝜇||w1Encode(𝐰1 ), 𝜆/4)                                       ▷ commitment hash
 16:      𝑐 ∈ 𝑅𝑞 ← SampleInBall(𝑐)̃                                            ▷ verifier’s challenge
 17:      𝑐 ̂ ← NTT(𝑐)
 18:      ⟨⟨𝑐𝐬1 ⟩⟩ ← NTT−1 (𝑐 ̂ ∘ 𝐬1̂ )
 19:      ⟨⟨𝑐𝐬2 ⟩⟩ ← NTT−1 (𝑐 ̂ ∘ 𝐬2̂ )
 20:      𝐳 ← 𝐲 + ⟨⟨𝑐𝐬1 ⟩⟩                                                      ▷ signer’s response
 21:      𝐫0 ← LowBits(𝐰 − ⟨⟨𝑐𝐬2 ⟩⟩)
 22:                      ▷ LowBits is applied componentwise (see explanatory text in Section 7.4)
 23:      if ||𝐳||∞ ≥ 𝛾1 − 𝛽 or ||𝐫0 ||∞ ≥ 𝛾2 − 𝛽 then (z, h) ← ⊥                  ▷ validity checks
 24:      else
 25:           ⟨⟨𝑐𝐭0 ⟩⟩ ← NTT−1 (𝑐 ̂ ∘ 𝐭0̂ )
 26:           𝐡 ← MakeHint(−⟨⟨𝑐𝐭0 ⟩⟩, 𝐰 − ⟨⟨𝑐𝐬2 ⟩⟩ + ⟨⟨𝑐𝐭0 ⟩⟩)                       ▷ Signer’s hint
 27:                   ▷ MakeHint is applied componentwise (see explanatory text in Section 7.4)
 28:           if ||⟨⟨𝑐𝐭0 ⟩⟩||∞ ≥ 𝛾2 or the number of 1’s in 𝐡 is greater than 𝜔, then (z, h) ← ⊥
 29:           end if
 30:      end if
 31:      𝜅←𝜅+ℓ                                                                ▷ increment counter
 32: end while
 33: 𝜎 ← sigEncode(𝑐,̃ 𝐳 mod 𝑞, 𝐡)
                                  ±

 34: return 𝜎
```

## 输入与输出

输入、输出、取值域和错误返回以完整算法块中的 `Input`、`Output` 及其步骤为准；标准未列出的字段不由项目自行补写。

## 项目映射

本页是标准结构化参考条目；项目是否有同名 Blockly 块、源码入口或 demo，按本目录 README 和覆盖矩阵核对。本页不把文档条目等同于已实现。

## 核验与缺项

已机械核对完整算法块与 source 算法标题及行号；标准向量、实现语义、边界负例和认证结论仍须按本目录记录分别核验。
