# NIST SP 800-38A §6.4 — OFB

## 条目元数据

| 字段 | 内容 |
|---|---|
| 类型 | 原语 / 函数 |
| 标准定位 | NIST SP 800-38A §6.4 — OFB |
| 原文证据 | [source 提取稿](./00-Standard-Source.md)（本目录 PDF 清单见 source 页） |
| 原文位置 | [提取稿](./00-Standard-Source.md#L805)；PDF 物理页需结合同目录 PDF 核对 |
| 项目状态 | 仅参考（详见本文现有实现/缺项说明） |

## 原文定位与引用

> 本页按 source 中的“NIST SP 800-38A §6.4 — OFB”拆分；这是定位说明，不替代标准逐字引文。完整正文、公式和表格请回看 [source 提取稿](./00-Standard-Source.md#L805) 与同目录 PDF。

## 原文摘录

> 以下为 00-Standard-Source.md 的说明性定位引文；仅规范化了空白和分页换行，完整正文、公式和表格请回看 [source 提取稿](./00-Standard-Source.md#L805)。

    6.4 The Output Feedback Mode
    The Output Feedback (OFB) mode is a confidentiality mode that features the iteration of the
    forward cipher on an IV to generate a sequence of output blocks that are exclusive-ORed with

> 逐字原文见 [NIST.SP.800-38A.pdf](./NIST.SP.800-38A.pdf)。本页用文字公式替代原 PDF 图形转录。

## 公式或伪代码

> 以下完整保留本页已有的公式规范单元；仅补充统一字段，不删减公式、步骤、符号或边界。

OFB 迭代产生密钥流，明文和密文不参与下一轮状态：

```text
I_1 = IV
O_j = CIPH_K(I_j)
C_j = P_j xor O_j
I_j = O_(j-1)                         2 ≤ j ≤ n
```

解密同样计算 `O_j` 并执行 `P_j = C_j xor O_j`。同一密钥下不得重复使用相同 IV；OFB 本身不提供认证。

本项目暂未提供 OFB Blockly 块或 demo。
