## 条目元数据

| 字段 | 内容 |
|---|---|
| 类型 | 原语 / 函数 |
| 标准定位 | NIST SP 800-38E — XTS-AES 参考 |
| 原文证据 | [source 提取稿](./00-Standard-Source.md)（本目录 PDF 清单见 source 页） |
| 原文位置 | [提取稿 §3–§5，行 175–298](./00-Standard-Source.md#L175-L298)；PDF 物理页需结合同目录 PDF 核对 |
| 项目状态 | 仅参考（详见本文现有实现/缺项说明） |

## 原文定位与引用

> 本页按 source 中的“NIST SP 800-38E — XTS-AES 参考”拆分；这是定位说明，不替代标准逐字引文。完整正文、公式和表格请回看 [source 提取稿](./00-Standard-Source.md) 与同目录 PDF。

## 原文摘录

> 本页正文是按 source 的“NIST SP 800-38E — XTS-AES 参考”拆出的结构化说明；该定位是概览/组合页，未强行截取不唯一的行号。需要核对时请按 [source 提取稿](./00-Standard-Source.md) 的章节标题和同目录 PDF 查看原文。

原件：[NIST.SP.800-38E.pdf](./NIST.SP.800-38E.pdf)。XTS 是面向存储扇区的 XEX 类分组模式，不提供独立的消息认证。

## 公式或伪代码

> 以下是面向用户的结构化公式/伪代码摘要，不是标准原文的完整逐字摘录；完整规范单元请以本页“原文摘录”、source 提取稿和 PDF 为准。

### 整块计算

将 256-bit 密钥拆成 `K1 || K2`，以扇区号/数据单元号形成 128-bit tweak：

```text
T0 = AES_K2(tweak)
Ci = AES_K1(Pi xor Ti) xor Ti
T(i+1) = α · Ti  in GF(2^128)
```

`α` 的乘法使用标准规定的字节序和约简多项式。数据单元、扇区范围和重复 tweak 的管理属于调用方责任；XTS 本身不替代认证。

## CipherCat 覆盖边界

`xts_encrypt` 使用 AES-128 的双密钥输入、16 字节 tweak 和非空整块数据，返回密文；当前实现拒绝非 16 字节倍数数据，因此没有 ciphertext stealing 的部分块路径，也没有解密块。Demo：`demos/procedures/XTS-Encrypt.json`。
