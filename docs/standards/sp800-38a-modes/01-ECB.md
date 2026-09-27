# NIST SP 800-38A §6.1 — ECB

## 条目元数据

| 字段 | 内容 |
|---|---|
| 类型 | 原语 / 函数 |
| 标准定位 | NIST SP 800-38A §6.1 — ECB |
| 原文证据 | [source 提取稿](./00-Standard-Source.md)（本目录 PDF 清单见 source 页） |
| 原文位置 | [提取稿](./00-Standard-Source.md#L531)；PDF 物理页需结合同目录 PDF 核对 |
| 项目状态 | 仅参考（详见本文现有实现/缺项说明） |

## 原文定位与引用

> 本页按 source 中的“NIST SP 800-38A §6.1 — ECB”拆分；这是定位说明，不替代标准逐字引文。完整正文、公式和表格请回看 [source 提取稿](./00-Standard-Source.md#L531) 与同目录 PDF。

## 原文摘录

> 以下为 00-Standard-Source.md 的说明性定位引文；仅规范化了空白和分页换行，完整正文、公式和表格请回看 [source 提取稿](./00-Standard-Source.md#L531)。

    6.1 The Electronic Codebook Mode
    The Electronic Codebook (ECB) mode is a confidentiality mode that features, for a given key,
    the assignment of a fixed ciphertext block to each plaintext block, analogous to the assignment of

> 逐字原文见 [NIST.SP.800-38A.pdf](./NIST.SP.800-38A.pdf)。本页只保留核对后的算法公式。

## 公式或伪代码

> 以下完整保留本页已有的公式规范单元；仅补充统一字段，不删减公式、步骤、符号或边界。

ECB 对每个分组独立处理：

```text
C_j = CIPH_K(P_j)
P_j = CIPH_K⁻¹(C_j)       1 ≤ j ≤ n
```

ECB 不隐藏相同明文分组的重复模式，通常不应单独用于结构化数据。

CipherCat：`mode_ecb_encrypt`、`mode_ecb_decrypt`；SM4 官方示例见
`demos/procedures/Mode-ECB.json`。
