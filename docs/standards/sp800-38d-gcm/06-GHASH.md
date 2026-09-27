# Algorithm 2 — GHASH（NIST SP 800-38D）

## 条目元数据

| 字段 | 内容 |
|---|---|
| 类型 | 原语 / 函数 |
| 标准定位 | NIST SP 800-38D §6.4，Algorithm 2 `GHASH` |
| 原文证据 | [GCM source](./00-Standard-Source.md#L799) · [PDF](./NIST.SP.800-38D.pdf) |
| 原文位置 | `00-Standard-Source.md` 第 799 行起；PDF 物理页以 PDF 视觉版式核对 |
| 项目状态 | 仅参考 |

## 标准定义

Algorithm 2 用 hash subkey `H` 对 128-bit 分块输入计算 GHASH。本页只承载该算法的独立定义；分块、有限域和长度边界以标准原文为准。

## 原文定位与引用

该条目从 [NIST SP 800-38D 原文提取稿](./00-Standard-Source.md#L799) 拆出。完整正文、公式、脚注和上下文回到 source 及同目录 PDF 核验。

## 原文摘录
> 以下为 source 中 Algorithm 2 的完整原文算法块；仅移除了 PDF 分页标记和页眉页码。

```text
       Algorithm 2: GHASH_H (X)

       Prerequisites:
       block H, the hash subkey.

       Input:
       bit string X such that len(X) = 128m for some positive integer m.

       Output:
       block GHASH_H (X).

       Steps:
       1. Let X₁, X₂, ..., Xₘ₋₁, Xₘ denote the unique sequence of blocks such that X = X₁ || X₂ ||
           ... || Xₘ₋₁ || Xₘ.
       2. Let Y₀ be the “zero block,” 0¹²⁸.
       3. For i = 1, ..., m, let Yᵢ = (Yᵢ₋₁ ⊕ Xᵢ) • H.
       4. Return Yₘ.
```

## 公式或伪代码

以下保留 source 提取稿中的算法标题、输入/输出和步骤；分页造成的空白/字形异常以 PDF 为准。

```text
       Algorithm 2: GHASH_H (X)

       Prerequisites:
       block H, the hash subkey.

       Input:
       bit string X such that len(X) = 128m for some positive integer m.

       Output:
       block GHASH_H (X).

       Steps:
       1. Let X₁, X₂, ..., Xₘ₋₁, Xₘ denote the unique sequence of blocks such that X = X₁ || X₂ ||
           ... || Xₘ₋₁ || Xₘ.
       2. Let Y₀ be the “zero block,” 0¹²⁸.
       3. For i = 1, ..., m, let Yᵢ = (Yᵢ₋₁ ⊕ Xᵢ) • H.
       4. Return Yₘ.
```

## 输入与输出

以算法正文中的 `Prerequisites` / `Input` / `Output` 为准；bit/byte 长度、计数器递增、有限域约减、标签长度和失败返回都属于接口边界。

## 项目映射

没有独立 `ghash` 块；`gcm_encrypt` 的标签计算应按该算法核验。

## 核验与缺项

- 原文覆盖：Algorithm 2 已独立定位到 source 第 799 行。
- 结构核验：GCM-AE/AD、GHASH、GCTR 与块乘法是不同层次，不能由一个高层 demo 代替全部条目。
- 向量核验：需覆盖空/部分块、96-bit 与非 96-bit IV、标签篡改和失败路径；现有 demo 只证明明确列出的加密结果。
