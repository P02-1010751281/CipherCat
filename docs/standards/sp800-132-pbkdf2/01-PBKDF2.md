## 条目元数据

| 字段 | 内容 |
|---|---|
| 类型 | 原语 / 函数 |
| 标准定位 | NIST SP 800-132 — PBKDF2 参考 |
| 原文证据 | [source 提取稿](./00-Standard-Source.md)（本目录 PDF 清单见 source 页） |
| 原文位置 | [提取稿 §5，行 296–407](./00-Standard-Source.md#L296-L407)；PDF 物理页需结合同目录 PDF 核对 |
| 项目状态 | 仅参考（详见本文现有实现/缺项说明） |

## 原文定位与引用

> 本页按 source 中的“NIST SP 800-132 — PBKDF2 参考”拆分；这是定位说明，不替代标准逐字引文。完整正文、公式和表格请回看 [source 提取稿](./00-Standard-Source.md) 与同目录 PDF。

## 原文摘录

> 本页正文是按 source 的“NIST SP 800-132 — PBKDF2 参考”拆出的结构化说明；该定位是概览/组合页，未强行截取不唯一的行号。需要核对时请按 [source 提取稿](./00-Standard-Source.md) 的章节标题和同目录 PDF 查看原文。

原件：[NIST.SP.800-132.pdf](./NIST.SP.800-132.pdf) · 结构与 RFC 8018 PBKDF2 对照；SP 800-132 的适用范围和密码管理要求仍以标准全文为准。

## 公式或伪代码

> 以下是面向用户的结构化公式/伪代码摘要，不是标准原文的完整逐字摘录；完整规范单元请以本页“原文摘录”、source 提取稿和 PDF 为准。

### 定义

PBKDF2 使用 PRF、口令 `P`、盐 `S`、迭代次数 `c` 和派生长度 `dkLen`：

```text
U1 = PRF(P, S || INT32_BE(i))
Uj = PRF(P, U(j-1))                 (2 ≤ j ≤ c)
Ti = U1 xor U2 xor ... xor Uc
DK = T1 || T2 || ...，截断到 dkLen
```

块编号从 `i=1` 开始，`INT32_BE(i)` 为 4 字节大端表示。`c` 必须为正，盐应独立、不可预测且与口令分离；派生结果仍需配合安全的存储、用途绑定和参数升级策略。

## CipherCat 映射

`pbkdf2(password, salt, iterations, keylen)` 支持 SHA-256 和 SM3-HMAC 两条教学路径；对应 SM3 路径也用于 GM/T 0091 参考。Demo：`demos/procedures/PBKDF2-SHA256.json`、`PBKDF2-SM3.json`。

当前没有独立的口令存储协议、参数自动升级或验证式解码块；不能把 PBKDF2 一次成功运行当作口令安全评估。
