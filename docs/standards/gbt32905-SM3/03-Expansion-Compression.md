## 条目元数据

| 字段 | 内容 |
|---|---|
| 类型 | 原语 / 函数 |
| 标准定位 | SM3 — 消息扩展与压缩原语 |
| 原文证据 | [source 提取稿](./00-Standard-Source.md)（本目录 PDF 清单见 source 页） |
| 原文位置 | [提取稿 §§5.2–5.3，行 317–389](./00-Standard-Source.md#L317-L389)；PDF 第 3 页 |
| 项目状态 | 仅参考（详见本文现有实现/缺项说明） |

## 原文定位与引用

> 本页按 source 中的“SM3 — 消息扩展与压缩原语”拆分；这是定位说明，不替代标准逐字引文。完整正文、公式和表格请回看 [source 提取稿](./00-Standard-Source.md) 与同目录 PDF。

## 原文摘录

> 本页对应标准 §§5.2–5.3。原始提取稿中的完整规范单元位于 [行 317–389](./00-Standard-Source.md#L317-L389)；该中文 PDF 的文字层存在字形映射损失，下面的公式是按 source/PDF 对齐后的可读化完整转录，公式语义以 PDF 页面复核。

原件：[GB/T 32905-2016 PDF](./GBT-32905-2016-SM3.pdf)。

```text
Input: the 512-bit message block B(i), 0 <= i <= n-1.

5.2 Message expansion
1. Split B(i) into sixteen 32-bit words W[0], ..., W[15].
2. For j = 16 to 67:
     W[j] = P1(W[j-16] xor W[j-9] xor (W[j-3] <<< 15))
            xor (W[j-13] <<< 7) xor W[j-6].
3. For j = 0 to 63:
     W1[j] = W[j] xor W[j+4].

5.3 Compression function
Let A, B, C, D, E, F, G, H be the working registers and
V(i+1) = CF(V(i), B(i)). Initialize:
  (A, B, C, D, E, F, G, H) = V(i).

For j = 0 to 63:
  SS1 = ((A <<< 12) + E + (T[j] <<< (j mod 32))) <<< 7.
  SS2 = SS1 xor (A <<< 12).
  TT1 = FF_j(A, B, C) + D + SS2 + W1[j].
  TT2 = GG_j(E, F, G) + H + SS1 + W[j].
  D = C;  C = B <<< 9;  B = A;  A = TT1.
  H = G;  G = F <<< 19;  F = E;  E = P0(TT2).

V(i+1) = (A || B || C || D || E || F || G || H) xor V(i).
Words are stored big-endian; the leftmost bit is the most significant bit.
```

## 公式或伪代码

> 以下是面向用户的结构化公式/伪代码摘要，不是标准原文的完整逐字摘录；完整规范单元请以本页“原文摘录”、source 提取稿和 PDF 为准。

### 消息扩展

```text
W[j]  = P1(W[j−16] xor W[j−9] xor (W[j−3] <<< 15))
        xor (W[j−13] <<< 7) xor W[j−6]       (16 ≤ j ≤ 67)
W'[j] = W[j] xor W[j+4]                     (0 ≤ j ≤ 63)
```

其中 `P1(X)=X xor (X<<<15) xor (X<<<23)`，所有运算在 32-bit 字宽内进行。

## 压缩

`hash_sm3_compress(V, W, W')` 使用 SM3 初始向量、常量 `T[j]`、`FF/GG`、`SS1/SS2` 和 `TT1/TT2` 完成 64 轮压缩，并把工作变量异或回链值。

## 核验

核心公开向量为消息 `abc`：

```text
66c7f0f462eeedd9d1f2d46bdc10e4e24167c4875cf2f7a2297da02b8f4ba8e0
```

逐轮检查应同时核对 `W/W'`、工作变量和最终摘要，不能只复制最终值。
