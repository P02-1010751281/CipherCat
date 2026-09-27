# Algorithm 1 — GF(2^128) 块乘法（NIST SP 800-38D）

## 条目元数据

| 字段 | 内容 |
|---|---|
| 类型 | 原语 / 函数 |
| 标准定位 | NIST SP 800-38D §6.3，Algorithm 1 `multiply` |
| 原文证据 | [R 常量定义](./00-Standard-Source.md#L757) · [Algorithm 1](./00-Standard-Source.md#L760) · [PDF](./NIST.SP.800-38D.pdf) |
| 原文位置 | `R` 定义见 source 第 757 行；Algorithm 1 从第 760 行开始；PDF 印刷页 11 |
| 项目状态 | 仅参考 |

## 标准定义

Algorithm 1 在 GF(2^128) 上计算两个 128-bit block 的乘积。本页只承载该算法的独立定义；有限域约定和边界条件以标准原文为准。

## 原文定位与引用

Algorithm 1 使用的约减常量 `R` 定义在算法标题之前。本条目将该定义与完整算法一并摘录；位置分别见 [source 第 757 行](./00-Standard-Source.md#L757) 和 [Algorithm 1 标题](./00-Standard-Source.md#L760)。

## 原文摘录
> 以下包含 Algorithm 1 的前置常量定义和完整原文算法块；仅移除了 PDF 分页标记和页眉页码。

```text
Let R be the bit string 11100001 || 0¹²⁰. Given two blocks X and Y, Algorithm 1 below
computes a “product” block, denoted X •Y:

       Algorithm 1: X •Y

       Input:
       blocks X, Y.

       Output:
       block X •Y.

       Steps:
       1.     Let x₀x₁...x₁₂₇ denote the sequence of bits in X.
       2.     Let Z₀ = 0¹²⁸ and V₀ = Y.
       3.     For i = 0 to 127, calculate blocks Zᵢ₊₁ and Vᵢ₊₁ as follows:





                           Zᵢ₊₁ = Zᵢ if xᵢ = 0; Zᵢ ⊕ Vᵢ if xᵢ = 1.
                           Vᵢ₊₁ = Vᵢ >> 1 if LSB₁(Vᵢ) = 0; (Vᵢ >> 1) ⊕ R if LSB₁(Vᵢ) = 1.
       4.      Return Z₁₂₈.
```

## 公式或伪代码

以下保留 `R` 的标准定义及完整算法公式；分页造成的空白以 source 和 PDF 为准。

```text
Let R be the bit string 11100001 || 0¹²⁰. Given two blocks X and Y, Algorithm 1 below
computes a “product” block, denoted X •Y:

       Algorithm 1: X •Y

       Input:
       blocks X, Y.

       Output:
       block X •Y.

       Steps:
       1.     Let x₀x₁...x₁₂₇ denote the sequence of bits in X.
       2.     Let Z₀ = 0¹²⁸ and V₀ = Y.
       3.     For i = 0 to 127, calculate blocks Zᵢ₊₁ and Vᵢ₊₁ as follows:





                           Zᵢ₊₁ = Zᵢ if xᵢ = 0; Zᵢ ⊕ Vᵢ if xᵢ = 1.
                           Vᵢ₊₁ = Vᵢ >> 1 if LSB₁(Vᵢ) = 0; (Vᵢ >> 1) ⊕ R if LSB₁(Vᵢ) = 1.
       4.      Return Z₁₂₈.
```

## 输入与输出

以算法正文中的 `Prerequisites` / `Input` / `Output` 为准；bit/byte 长度、计数器递增、有限域约减、标签长度和失败返回都属于接口边界。

## 项目映射

没有独立块；应由 GCM 内部按有限域乘法实现，不能用普通整数乘法替代。

## 核验与缺项

- 原文覆盖：`R` 定义与 Algorithm 1 已一并摘录；source 行锚点为第 757、760 行。
- 结构核验：GCM-AE/AD、GHASH、GCTR 与块乘法是不同层次，不能由一个高层 demo 代替全部条目。
- 向量核验：需覆盖空/部分块、96-bit 与非 96-bit IV、标签篡改和失败路径；现有 demo 只证明明确列出的加密结果。
