# Algorithm 15  K-PKE.Decrypt(dkPKE, c)

## 条目元数据

| 字段 | 内容 |
|---|---|
| 类型 | 算法阶段 / 原语 / 函数 |
| 标准定位 | §5.3 K-PKE |
| 原文证据 | [source 提取稿](./00-Standard-Source.md)（本目录 PDF 清单见 source 页） |
| 原文位置 | [Algorithm 15 提取稿](./00-Standard-Source.md#L1823-L1839)；PDF [物理第 40 页](./NIST.FIPS.203.pdf#page=40)（标准页 31） |
| 项目状态 | 部分实现（详见本文现有实现/缺项说明） |

## 原文定位与引用

> 本页按 source 中的“§5.3 K-PKE”拆分；这是定位说明，不替代标准逐字引文。完整正文、公式和表格请回看 [source 提取稿](./00-Standard-Source.md#L1823) 与同目录 PDF。

## 原文摘录
> 以下为 source 中 Algorithm 15 的完整原文算法块。为修复 PDF 文本抽取造成的下标断行，已将下标合并写作 `_{...}`；另移除分页标记和页眉页码。PDF 原页链接见上方。

```text
Algorithm 15 K-PKE.Decrypt(dkPKE , 𝑐)
Uses the decryption key to decrypt a ciphertext.
Input: decryption key dkPKE ∈ 𝔹^{384k}.
Input: ciphertext 𝑐 ∈ 𝔹^{32(d_u k+d_v)}.
Output: message 𝑚 ∈ 𝔹^{32}.
  1: 𝑐1 ← 𝑐[0 ∶ 32d_u k]
  2: 𝑐2 ← 𝑐[32d_u k ∶ 32(d_u k + d_v)]
  3: 𝐮′ ← Decompress_{d_u}(ByteDecode_{d_u}(𝑐1)) ▷ run Decompress_{d_u} and ByteDecode_{d_u} 𝑘 times

  4: 𝑣′ ← Decompress_{d_v}(ByteDecode_{d_v}(𝑐2))

  5: 𝐬̂ ← ByteDecode_{12}(dkPKE) ▷ run ByteDecode_{12} 𝑘 times
  6: 𝑤 ← 𝑣′ − NTT⁻¹(𝐬̂ᵀ ∘ NTT(𝐮′)) ▷ run NTT 𝑘 times; run NTT⁻¹ once
  7: 𝑚 ← ByteEncode_{1}(Compress_{1}(𝑤)) ▷ decode plaintext 𝑚 from polynomial 𝑣
  8: return 𝑚
```

## 标准定义

本页的规范性定义由下方完整算法块给出；不得用项目实现或摘要替代标准语义。

## 公式或伪代码

> 以下完整保留本条目的标准算法块。为修复 PDF 文本抽取造成的下标断行，已将下标合并写作 `_{...}`；另移除 PDF 页眉、页脚、页码和分页标记。PDF 原页链接见上方。

```text
Algorithm 15 K-PKE.Decrypt(dkPKE , 𝑐)
Uses the decryption key to decrypt a ciphertext.
Input: decryption key dkPKE ∈ 𝔹^{384k}.
Input: ciphertext 𝑐 ∈ 𝔹^{32(d_u k+d_v)}.
Output: message 𝑚 ∈ 𝔹^{32}.
  1: 𝑐1 ← 𝑐[0 ∶ 32d_u k]
  2: 𝑐2 ← 𝑐[32d_u k ∶ 32(d_u k + d_v)]
  3: 𝐮′ ← Decompress_{d_u}(ByteDecode_{d_u}(𝑐1)) ▷ run Decompress_{d_u} and ByteDecode_{d_u} 𝑘 times

  4: 𝑣′ ← Decompress_{d_v}(ByteDecode_{d_v}(𝑐2))

  5: 𝐬̂ ← ByteDecode_{12}(dkPKE) ▷ run ByteDecode_{12} 𝑘 times
  6: 𝑤 ← 𝑣′ − NTT⁻¹(𝐬̂ᵀ ∘ NTT(𝐮′)) ▷ run NTT 𝑘 times; run NTT⁻¹ once
  7: 𝑚 ← ByteEncode_{1}(Compress_{1}(𝑤)) ▷ decode plaintext 𝑚 from polynomial 𝑣
  8: return 𝑚
```

## 输入与输出

输入、输出、取值域和错误返回以完整算法块中的 `Input`、`Output` 及其步骤为准；标准未列出的字段不由项目自行补写。

## 项目映射

本页是标准结构化参考条目；项目是否有同名 Blockly 块、源码入口或 demo，按本目录 README 和覆盖矩阵核对。本页不把文档条目等同于已实现。

## 核验与缺项

已机械核对完整算法块与 source 算法标题及行号。当前正式原文第 7 步注释保留 `v`；NIST 潜在更新表建议改为 `w`，该建议尚非正式变更，详见 [FIPS 203 README](./README.md)。标准向量、实现语义、边界负例和认证结论仍须按本目录记录分别核验。
