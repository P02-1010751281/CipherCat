## 条目元数据

| 字段 | 内容 |
|---|---|
| 类型 | 原语 / 函数 |
| 标准定位 | GCM — GHASH 原语 |
| 原文证据 | [source 提取稿](./00-Standard-Source.md)（本目录 PDF 清单见 source 页） |
| 原文位置 | [提取稿 Algorithm 2](./00-Standard-Source.md#L799)；PDF 物理页需结合同目录 PDF 核对 |
| 项目状态 | 仅参考（详见本文现有实现/缺项说明） |

## 原文定位与引用

> 本页按 source 中的“GCM — GHASH 原语”拆分；这是定位说明，不替代标准逐字引文。完整正文、公式和表格请回看 [source 提取稿](./00-Standard-Source.md#L799) 与同目录 PDF。

## 原文摘录

> 以下为 GHASH 算法的说明性定位引文；完整算法、有限域定义和长度编码请回看 [source 提取稿](./00-Standard-Source.md#L799)。

    Algorithm 2: GHASH_H (X)
    Output: block GHASH_H (X).

原件：[NIST SP 800-38D PDF](./NIST.SP.800-38D.pdf)。

## 公式或伪代码

> 以下是面向用户的结构化公式/伪代码摘要，不是标准原文的完整逐字摘录；完整规范单元请以本页“原文摘录”、source 提取稿和 PDF 为准。

### 计算

`H = AES_K(0^128)`。GHASH 在 `GF(2^128)` 中将 AAD、密文及其 bit 长度编码为块并迭代乘以 `H`：

```text
Y0 = 0
Yi = (Y(i−1) xor Xi) · H
```

有限域乘法的约减多项式和 bit/byte 顺序必须按标准执行；不能用普通整数乘法替代。

## CipherCat 边界

GHASH 由 `gcm_encrypt` 内部使用，目前没有独立 `ghash` 块或标签验证块。非 96-bit IV 的 `J0` 派生另见 [03-GCTR-and-J0.md](./03-GCTR-and-J0.md)。
