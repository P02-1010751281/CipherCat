# NIST SP 800-38A §6.3 — CFB

## 条目元数据

| 字段 | 内容 |
|---|---|
| 类型 | 原语 / 函数 |
| 标准定位 | NIST SP 800-38A §6.3 — CFB |
| 原文证据 | [source 提取稿](./00-Standard-Source.md)（本目录 PDF 清单见 source 页） |
| 原文位置 | [提取稿](./00-Standard-Source.md#L672)；PDF 物理页需结合同目录 PDF 核对 |
| 项目状态 | 仅参考（详见本文现有实现/缺项说明） |

## 原文定位与引用

> 本页按 source 中的“NIST SP 800-38A §6.3 — CFB”拆分；这是定位说明，不替代标准逐字引文。完整正文、公式和表格请回看 [source 提取稿](./00-Standard-Source.md#L672) 与同目录 PDF。

## 原文摘录

> 以下为 00-Standard-Source.md 的说明性定位引文；仅规范化了空白和分页换行，完整正文、公式和表格请回看 [source 提取稿](./00-Standard-Source.md#L672)。

    6.3 The Cipher Feedback Mode
    The Cipher Feedback (CFB) mode is a confidentiality mode that features the feedback of
    successive ciphertext segments into the input blocks of the forward cipher to generate output

> 逐字原文见 [NIST.SP.800-38A.pdf](./NIST.SP.800-38A.pdf)。本页只保留公式与适用边界。

## 公式或伪代码

> 以下完整保留本页已有的公式规范单元；仅补充统一字段，不删减公式、步骤、符号或边界。

CFB 使用 `s` bit 分段，`1 ≤ s ≤ b`，并以 IV 初始化输入寄存器 `I_1`：

```text
I_1 = IV
C_1 = P_1 xor MSB_s(CIPH_K(I_1))
I_j = LSB_(b-s)(I_(j-1)) || C_(j-1)
C_j = P_j xor MSB_s(CIPH_K(I_j))       2 ≤ j ≤ n
```

解密使用相同的密钥加密函数和寄存器更新，只把 `C_j` 与密钥流异或得到 `P_j`：

```text
P_j = C_j xor MSB_s(CIPH_K(I_j))
```

本项目暂未提供 CFB Blockly 块或 demo；不要将当前 CBC/CTR 实现标成 CFB 覆盖。
