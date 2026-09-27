# Algorithm 4  HashML-DSA.Sign(𝑠𝑘, 𝑀 , 𝑐𝑡𝑥, PH)

## 条目元数据

| 字段 | 内容 |
|---|---|
| 类型 | 算法阶段 / 原语 / 函数 |
| 标准定位 | §5.4.1 |
| 原文证据 | [source 提取稿](./00-Standard-Source.md)（本目录 PDF 清单见 source 页） |
| 原文位置 | [提取稿](./00-Standard-Source.md#L1285)；PDF 物理页需结合同目录 PDF 核对 |
| 项目状态 | 部分实现（详见本文现有实现/缺项说明） |

## 原文定位与引用

> 本页按 source 中的“§5.4.1”拆分；这是定位说明，不替代标准逐字引文。完整正文、公式和表格请回看 [source 提取稿](./00-Standard-Source.md#L1285) 与同目录 PDF。

## 原文摘录
> 以下为 source 中 Algorithm 4 的完整原文算法块；仅移除了 PDF 分页标记和页眉页码。

```text
Algorithm 4 HashML-DSA.Sign(𝑠𝑘, 𝑀 , 𝑐𝑡𝑥, PH)
Generate a “pre-hash” ML-DSA signature.
Input: Private key 𝑠𝑘 ∈ 𝔹32+32+64+32⋅((ℓ+𝑘)⋅bitlen (2𝜂)+𝑑𝑘) , message 𝑀 ∈ {0, 1}∗ ,
context string 𝑐𝑡𝑥 (a byte string of 255 or fewer bytes), pre-hash function PH.
Output: ML-DSA signature 𝜎 ∈ 𝔹𝜆/4+ℓ⋅32⋅(1+bitlen (𝛾1 −1))+𝜔+𝑘 .
  1: if |𝑐𝑡𝑥| > 255 then
  2:      return ⊥                    ▷ return an error indication if the context string is too long
  3: end if
 4:
 5: 𝑟𝑛𝑑 ← 𝔹32               ▷ for the optional deterministic variant, substitute 𝑟𝑛𝑑 ← {0}32
 6: if 𝑟𝑛𝑑 = NULL then
 7:     return ⊥                 ▷ return an error indication if random bit generation failed
 8: end if
 9:
10: switch PH do
11:     case SHA-256:
12:         OID ← 0x06, 0x09, 0x60, 0x86, 0x48, 0x01, 0x65, 0x03, 0x04, 0x02, 0x01
                                                                     ▷ 2.16.840.1.101.3.4.2.1
13:        PH𝑀 ← SHA256(𝑀 )
14:     case SHA-512:
15:        OID ← 0x06, 0x09, 0x60, 0x86, 0x48, 0x01, 0x65, 0x03, 0x04, 0x02, 0x03
                                                                     ▷ 2.16.840.1.101.3.4.2.3
16:        PH𝑀 ← SHA512(𝑀 )
17:     case SHAKE128:
18:        OID ← 0x06, 0x09, 0x60, 0x86, 0x48, 0x01, 0x65, 0x03, 0x04, 0x02, 0x0B
                                                                    ▷ 2.16.840.1.101.3.4.2.11
19:        PH𝑀 ← SHAKE128(𝑀 , 256)
20:     case …
21:        …
22: end switch
23: 𝑀 ′ ← BytesToBits(IntegerToBytes(1, 1) ∥ IntegerToBytes(|𝑐𝑡𝑥|, 1) ∥ 𝑐𝑡𝑥 ∥ OID ∥ PH𝑀 )
24: 𝜎 ← ML-DSA.Sign_internal(𝑠𝑘, 𝑀 ′ , 𝑟𝑛𝑑)
25: return 𝜎
```

## 标准定义

本页的规范性定义由下方完整算法块给出；不得用项目实现或摘要替代标准语义。

## 公式或伪代码

> 以下完整保留本条目的标准算法块；只移除了 PDF 页眉、页脚、页码和分页标记。

```text
Algorithm 4 HashML-DSA.Sign(𝑠𝑘, 𝑀 , 𝑐𝑡𝑥, PH)
Generate a “pre-hash” ML-DSA signature.
Input: Private key 𝑠𝑘 ∈ 𝔹32+32+64+32⋅((ℓ+𝑘)⋅bitlen (2𝜂)+𝑑𝑘) , message 𝑀 ∈ {0, 1}∗ ,
context string 𝑐𝑡𝑥 (a byte string of 255 or fewer bytes), pre-hash function PH.
Output: ML-DSA signature 𝜎 ∈ 𝔹𝜆/4+ℓ⋅32⋅(1+bitlen (𝛾1 −1))+𝜔+𝑘 .
  1: if |𝑐𝑡𝑥| > 255 then
  2:      return ⊥                    ▷ return an error indication if the context string is too long
  3: end if
 4:
 5: 𝑟𝑛𝑑 ← 𝔹32               ▷ for the optional deterministic variant, substitute 𝑟𝑛𝑑 ← {0}32
 6: if 𝑟𝑛𝑑 = NULL then
 7:     return ⊥                 ▷ return an error indication if random bit generation failed
 8: end if
 9:
10: switch PH do
11:     case SHA-256:
12:         OID ← 0x06, 0x09, 0x60, 0x86, 0x48, 0x01, 0x65, 0x03, 0x04, 0x02, 0x01
                                                                     ▷ 2.16.840.1.101.3.4.2.1
13:        PH𝑀 ← SHA256(𝑀 )
14:     case SHA-512:
15:        OID ← 0x06, 0x09, 0x60, 0x86, 0x48, 0x01, 0x65, 0x03, 0x04, 0x02, 0x03
                                                                     ▷ 2.16.840.1.101.3.4.2.3
16:        PH𝑀 ← SHA512(𝑀 )
17:     case SHAKE128:
18:        OID ← 0x06, 0x09, 0x60, 0x86, 0x48, 0x01, 0x65, 0x03, 0x04, 0x02, 0x0B
                                                                    ▷ 2.16.840.1.101.3.4.2.11
19:        PH𝑀 ← SHAKE128(𝑀 , 256)
20:     case …
21:        …
22: end switch
23: 𝑀 ′ ← BytesToBits(IntegerToBytes(1, 1) ∥ IntegerToBytes(|𝑐𝑡𝑥|, 1) ∥ 𝑐𝑡𝑥 ∥ OID ∥ PH𝑀 )
24: 𝜎 ← ML-DSA.Sign_internal(𝑠𝑘, 𝑀 ′ , 𝑟𝑛𝑑)
25: return 𝜎
```

## 输入与输出

输入、输出、取值域和错误返回以完整算法块中的 `Input`、`Output` 及其步骤为准；标准未列出的字段不由项目自行补写。

## 项目映射

本页是标准结构化参考条目；项目是否有同名 Blockly 块、源码入口或 demo，按本目录 README 和覆盖矩阵核对。本页不把文档条目等同于已实现。

## 核验与缺项

已机械核对完整算法块与 source 算法标题及行号；标准向量、实现语义、边界负例和认证结论仍须按本目录记录分别核验。
