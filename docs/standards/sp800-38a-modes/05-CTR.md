# NIST SP 800-38A §6.5 — CTR

## 条目元数据

| 字段 | 内容 |
|---|---|
| 类型 | 原语 / 函数 |
| 标准定位 | NIST SP 800-38A §6.5 — CTR |
| 原文证据 | [source 提取稿](./00-Standard-Source.md)（本目录 PDF 清单见 source 页） |
| 原文位置 | [提取稿](./00-Standard-Source.md#L928)；PDF 物理页需结合同目录 PDF 核对 |
| 项目状态 | 仅参考（详见本文现有实现/缺项说明） |

## 原文定位与引用

> 本页按 source 中的“NIST SP 800-38A §6.5 — CTR”拆分；这是定位说明，不替代标准逐字引文。完整正文、公式和表格请回看 [source 提取稿](./00-Standard-Source.md#L928) 与同目录 PDF。

## 原文摘录

> 以下为 00-Standard-Source.md 的说明性定位引文；仅规范化了空白和分页换行，完整正文、公式和表格请回看 [source 提取稿](./00-Standard-Source.md#L928)。

    6.5 The Counter Mode
    The Counter (CTR) mode is a confidentiality mode that features the application of the forward
    cipher to a set of input blocks, called counters, to produce a sequence of output blocks that are

> 逐字原文见 [NIST.SP.800-38A.pdf](./NIST.SP.800-38A.pdf)。本页用文字公式替代原 PDF 图形转录。

## 公式或伪代码

> 以下完整保留本页已有的公式规范单元；仅补充统一字段，不删减公式、步骤、符号或边界。

令 `T_j` 为在同一密钥下唯一的计数器块：

```text
O_j = CIPH_K(T_j)
C_j = P_j xor O_j
P_j = C_j xor O_j
```

计数器按标准定义的字段和递增函数逐块生成。最后一个分组不足 `b` bit 时，截取同样长度的密钥流前缀；
不要填充后再把填充长度误算入 CTR 算法。

CTR 可并行、可随机访问，但计数器块重复会直接破坏机密性。

CipherCat：`mode_ctr_encrypt`；示例见 `demos/procedures/Mode-CTR.json`。
