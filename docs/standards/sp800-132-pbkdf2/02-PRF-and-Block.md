## 条目元数据

| 字段 | 内容 |
|---|---|
| 类型 | 原语 / 函数 |
| 标准定位 | PBKDF2 — PRF 与派生块原语 |
| 原文证据 | [source 提取稿](./00-Standard-Source.md)（本目录 PDF 清单见 source 页） |
| 原文位置 | [提取稿 §5.3，行 360–407](./00-Standard-Source.md#L360-L407)；PDF 物理页需结合同目录 PDF 核对 |
| 项目状态 | 仅参考（详见本文现有实现/缺项说明） |

## 原文定位与引用

> 本页按 source 中的“PBKDF2 — PRF 与派生块原语”拆分；这是定位说明，不替代标准逐字引文。完整正文、公式和表格请回看 [source 提取稿](./00-Standard-Source.md) 与同目录 PDF。

## 原文摘录

> 本页正文是按 source 的“PBKDF2 — PRF 与派生块原语”拆出的结构化说明；该定位是概览/组合页，未强行截取不唯一的行号。需要核对时请按 [source 提取稿](./00-Standard-Source.md) 的章节标题和同目录 PDF 查看原文。

原件：[NIST SP 800-132 PDF](./NIST.SP.800-132.pdf)。PBKDF2 的构造也与 RFC 8018 的 PBKDF2 定义对照核验。

## 公式或伪代码

> 以下是面向用户的结构化公式/伪代码摘要，不是标准原文的完整逐字摘录；完整规范单元请以本页“原文摘录”、source 提取稿和 PDF 为准。

### 单个派生块

对块编号 `i`：

```text
U1 = PRF(P, S || INT32_BE(i))
Uj = PRF(P, U(j−1))
Ti = U1 xor U2 xor ... xor Uc
```

所有 `U` 保持 PRF 输出长度，块编号从 1 开始；最后将 `T1||T2||...` 截断到 `dkLen`。

## CipherCat 映射

`pbkdf2` 支持 SHA-256 和 SM3-HMAC 两条路径；外层 KDF、PRF、迭代和截断在一键块中完成，没有独立的 `U`/`T` Blockly 原语。
