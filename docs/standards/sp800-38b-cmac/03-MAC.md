## 条目元数据

| 字段 | 内容 |
|---|---|
| 类型 | 原语 / 函数 |
| 标准定位 | CMAC — CBC-MAC 与标签输出原语 |
| 原文证据 | [source 提取稿](./00-Standard-Source.md)（本目录 PDF 清单见 source 页） |
| 原文位置 | [提取稿 §6.2，行 600–666](./00-Standard-Source.md#L600-L666)；PDF 第 7–8 页 |
| 项目状态 | 仅参考（详见本文现有实现/缺项说明） |

## 原文定位与引用

> 本页按 source 中的“CMAC — CBC-MAC 与标签输出原语”拆分；这是定位说明，不替代标准逐字引文。完整正文、公式和表格请回看 [source 提取稿](./00-Standard-Source.md) 与同目录 PDF。

## 原文摘录

> 本页对应标准 §6.2。可读化的完整步骤单元见下方；原始提取稿中的对应范围是 [§6.2，行 600–666](./00-Standard-Source.md#L600-L666)，公式字形与排版应以 PDF 第 7–8 页复核。

原件：[NIST SP 800-38B PDF](./NIST.SP.800-38B.pdf)。以下为保留完整步骤的可读化转录；仅统一了空格、下标和位串记法。

```text
Prerequisites:
  block cipher CIPH with block size b;
  key K;
  MAC length parameter Tlen.
Input: message M of bit length Mlen.
Output: MAC T of bit length Tlen.
Suggested notation: CMAC(K, M, Tlen).

1. Apply SUBK(K) from Section 6.1 to produce K1 and K2.
2. If Mlen = 0, let n = 1; otherwise let n = ceil(Mlen / b).
3. Let M1, ..., M(n-1), Mn* be the unique sequence such that
   M = M1 || ... || M(n-1) || Mn*, with the preceding blocks complete.
4. If Mn* is complete, let Mn = K1 xor Mn*;
   otherwise let Mn = K2 xor (Mn* || 1 || 0^j), where j = n*b - Mlen - 1.
5. Let C0 = 0^b.
6. For i = 1 to n, let Ci = CIPH_K(C(i-1) xor Mi).
7. Let T = MSB_Tlen(Cn).
8. Return T.
```

## 公式或伪代码

> 以下是面向用户的结构化公式/伪代码摘要，不是标准原文的完整逐字摘录；完整规范单元请以本页“原文摘录”、source 提取稿和 PDF 为准。

### 计算

完整块消息的最后块异或 `K1`；空消息或不完整最后块先追加 `1` 后跟 `0`，再异或 `K2`。从 `X0=0` 开始：

```text
Xi = E_K(X(i−1) xor Mi)
Tag = Xn
```

标签截断由上层协议决定，不能默认为认证能力已经完成。

## CipherCat 边界

`cmac_mac` 当前输出完整 16-byte 标签，已有 AES-CMAC 向量和 SM4 同构路径；没有独立验证、截断策略或失败拒绝块。
