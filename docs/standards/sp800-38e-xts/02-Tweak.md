## 条目元数据

| 字段 | 内容 |
|---|---|
| 类型 | 原语 / 函数 |
| 标准定位 | XTS — tweak 与有限域加倍原语 |
| 原文证据 | [source 提取稿](./00-Standard-Source.md)（本目录 PDF 清单见 source 页） |
| 原文位置 | [提取稿 §3、§4，行 187–227](./00-Standard-Source.md#L187-L227)；PDF 物理页需结合同目录 PDF 核对 |
| 项目状态 | 仅参考（详见本文现有实现/缺项说明） |

## 原文定位与引用

> 本页按 source 中的“XTS — tweak 与有限域加倍原语”拆分；这是定位说明，不替代标准逐字引文。完整正文、公式和表格请回看 [source 提取稿](./00-Standard-Source.md) 与同目录 PDF。

## 原文摘录

> 本页正文是按 source 的“XTS — tweak 与有限域加倍原语”拆出的结构化说明；该定位是概览/组合页，未强行截取不唯一的行号。需要核对时请按 [source 提取稿](./00-Standard-Source.md) 的章节标题和同目录 PDF 查看原文。

原件：[NIST SP 800-38E PDF](./NIST.SP.800-38E.pdf)。

## 公式或伪代码

> 以下是面向用户的结构化公式/伪代码摘要，不是标准原文的完整逐字摘录；完整规范单元请以本页“原文摘录”、source 提取稿和 PDF 为准。

### 计算

将数据单元号编码为 128-bit tweak，先计算：

```text
T0 = AES_K2(tweak)
T(i+1) = α · Ti  in GF(2^128)
```

这里的 `α` 是按 XTS 规定字节序和约减规则的乘 `x`。不要复用 CMAC 的 `Rb=0x87` 代码而不核对字节序。

## CipherCat 映射

`xts_encrypt` 内部完成 tweak 初始化和逐块更新；没有独立 tweak 块。
