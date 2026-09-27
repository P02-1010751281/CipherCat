## 条目元数据

| 字段 | 内容 |
|---|---|
| 类型 | 原语 / 函数 |
| 标准定位 | NIST SP 800-38A §6.2 — CBC |
| 原文证据 | [source 提取稿](./00-Standard-Source.md)（本目录 PDF 清单见 source 页） |
| 原文位置 | [提取稿](./00-Standard-Source.md#L584)；PDF 物理页需结合同目录 PDF 核对 |
| 项目状态 | 仅参考（详见本文现有实现/缺项说明） |

## 原文定位与引用

> 本页按 source 中的“NIST SP 800-38A §6.2 — CBC”拆分；这是定位说明，不替代标准逐字引文。完整正文、公式和表格请回看 [source 提取稿](./00-Standard-Source.md#L584) 与同目录 PDF。

## 原文摘录

> 以下为 00-Standard-Source.md 的说明性定位引文；仅规范化了空白和分页换行，完整正文、公式和表格请回看 [source 提取稿](./00-Standard-Source.md#L584)。

    6.2 The Cipher Block Chaining Mode
    The Cipher Block Chaining (CBC) mode is a confidentiality mode whose encryption process
    features the combining (“chaining”) of the plaintext blocks with the previous ciphertext blocks.

> 逐字原文见 [NIST.SP.800-38A.pdf](./NIST.SP.800-38A.pdf)。本页用文字公式替代原 PDF 图形转录。

CBC 需要与分组长度相同的 IV。IV 不必保密，但必须不可预测，并应保护其完整性。

## 公式或伪代码

> 以下是面向用户的结构化公式/伪代码摘要，不是标准原文的完整逐字摘录；完整规范单元请以本页“原文摘录”、source 提取稿和 PDF 为准。

### 加密

```text
C_1 = CIPH_K(P_1 xor IV)
C_j = CIPH_K(P_j xor C_(j-1))       2 ≤ j ≤ n
```

### 解密

```text
P_1 = CIPH_K⁻¹(C_1) xor IV
P_j = CIPH_K⁻¹(C_j) xor C_(j-1)      2 ≤ j ≤ n
```

CBC 需要完整分组并配合明确的填充规则；它本身不提供认证。

CipherCat：`mode_cbc_encrypt`；示例见 `demos/procedures/Mode-CBC.json`。
