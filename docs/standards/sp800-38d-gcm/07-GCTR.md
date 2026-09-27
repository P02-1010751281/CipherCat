# Algorithm 3 — GCTR（NIST SP 800-38D）

## 条目元数据

| 字段 | 内容 |
|---|---|
| 类型 | 原语 / 函数 |
| 标准定位 | NIST SP 800-38D §6.5，Algorithm 3 `GCTR` |
| 原文证据 | [GCM source](./00-Standard-Source.md#L849) · [PDF](./NIST.SP.800-38D.pdf) |
| 原文位置 | `00-Standard-Source.md` 第 849 行起；PDF 物理页以 PDF 视觉版式核对 |
| 项目状态 | 部分实现 |

## 标准定义

Algorithm 3 用计数器模式下的分组密码生成 GCTR 输出。本页只承载该算法的独立定义；计数器、分组长度和截断边界以标准原文为准。

## 原文定位与引用

该条目从 [NIST SP 800-38D 原文提取稿](./00-Standard-Source.md#L849) 拆出。完整正文、公式、脚注和上下文回到 source 及同目录 PDF 核验。

## 原文摘录
> 以下为 source 中 Algorithm 3 的完整原文算法块；仅移除了 PDF 分页标记和页眉页码。

```text
           Algorithm 3: GCTR_K (ICB, X)

           Prerequisites:
           approved block cipher CIPH with a 128-bit block size;
           key K.

           Input:
           initial counter block ICB;
           bit string X, of arbitrary length.

           Output:
           bit string Y of bit length len(X).

           Steps:
           1. If X is the empty string, then return the empty string as Y.
           2. Let n = ⌈len(X)/128⌉.
           3. Let X₁, X₂, ..., Xₙ₋₁, Xₙ* denote the unique sequence of bit strings such that
                           X = X₁ || X₂ || ... || Xₙ₋₁ || Xₙ*;
                           X₁, X₂, ..., Xₙ₋₁ are complete blocks. ²
           4. Let CB₁ = ICB.
           5. For i = 2 to n, let CBᵢ = inc₃₂(CBᵢ₋₁).
           6. For i = 1 to n − 1, let Yᵢ = Xᵢ ⊕ CIPH_K(CBᵢ).
           7. Let Yₙ* = Xₙ* ⊕ MSB_{len(Xₙ*)}(CIPH_K(CBₙ)).
```

## 公式或伪代码

以下保留 source 提取稿中的算法标题、输入/输出和步骤；分页造成的空白/字形异常以 PDF 为准。

```text
           Algorithm 3: GCTR_K (ICB, X)

           Prerequisites:
           approved block cipher CIPH with a 128-bit block size;
           key K.

           Input:
           initial counter block ICB;
           bit string X, of arbitrary length.

           Output:
           bit string Y of bit length len(X).

           Steps:
           1. If X is the empty string, then return the empty string as Y.
           2. Let n = ⌈len(X)/128⌉.
           3. Let X₁, X₂, ..., Xₙ₋₁, Xₙ* denote the unique sequence of bit strings such that
                           X = X₁ || X₂ || ... || Xₙ₋₁ || Xₙ*;
                           X₁, X₂, ..., Xₙ₋₁ are complete blocks. ²
           4. Let CB₁ = ICB.
           5. For i = 2 to n, let CBᵢ = inc₃₂(CBᵢ₋₁).
           6. For i = 1 to n − 1, let Yᵢ = Xᵢ ⊕ CIPH_K(CBᵢ).
           7. Let Yₙ* = Xₙ* ⊕ MSB_{len(Xₙ*)}(CIPH_K(CBₙ)).
```

## 输入与输出

以算法正文中的 `Prerequisites` / `Input` / `Output` 为准；bit/byte 长度、计数器递增、有限域约减、标签长度和失败返回都属于接口边界。

## 项目映射

`gcm_encrypt` 内部使用计数器加密路径；没有独立 GCTR 块。

## 核验与缺项

- 原文覆盖：Algorithm 3 已独立定位到 source 第 849 行。
- 结构核验：GCM-AE/AD、GHASH、GCTR 与块乘法是不同层次，不能由一个高层 demo 代替全部条目。
- 向量核验：需覆盖空/部分块、96-bit 与非 96-bit IV、标签篡改和失败路径；现有 demo 只证明明确列出的加密结果。
