# Algorithm 5 — AES 等价逆密钥扩展（NIST FIPS 197）

## 条目元数据

| 字段 | 内容 |
|---|---|
| 类型 | 算法 |
| 标准定位 | NIST FIPS 197 §5.3.5，Algorithm 5 |
| 原文证据 | [AES source](./00-Standard-Source.md#L1227) · [PDF](./NIST.FIPS.197.pdf) |
| 原文位置 | `00-Standard-Source.md` 第 1227 行起；PDF 物理页以 PDF 视觉版式核对 |
| 项目状态 | 仅参考 |

## 标准定义

本页只承载 FIPS 197 Algorithm 5 的独立定义；Nb=4、Nk/Nr、状态字节序、S-box、MixColumns 和轮密钥约定必须与标准原文一致。

## 原文定位与引用

该条目从 [FIPS 197 原文提取稿](./00-Standard-Source.md#L1227) 拆出。完整正文、公式、表格、脚注和上下文回到 source 及同目录 PDF 核验。

## 原文摘录
> 以下为 source 中 Algorithm 5 的完整原文算法块；仅移除了 PDF 分页标记和页眉页码。

```text
    Algorithm 5 Pseudocode for K EY E XPANSION EIC()
     1: procedure K EY E XPANSION EIC(key)
     2:    i←0
     3:    while i ≤ Nk − 1 do
     4:        w[i] ← key[4i..4i + 3]
     5:        dw[i] ← w[i]
     6:        i ← i+1
     7:    end while                                . When the loop concludes, i = Nk.
     8:    while i ≤ 4 ∗ Nr + 3 do
     9:        temp ← w[i − 1]
    10:        if i mod Nk = 0 then
    11:             temp ← S UB W ORD(ROT W ORD(temp)) ⊕ Rcon[i/Nk]
    12:        else if Nk > 6 and i mod Nk = 4 then
    13:             temp ← S UB W ORD(temp)
    14:        end if
    15:        w[i] ← w[i − Nk] ⊕ temp
    16:        dw[i] ← w[i]
    17:        i ← i+1
    18:    end while
    19:    for round from 1 to Nr − 1 do
    20:        i ← 4 ∗ round
    21:        dw[i..i + 3] ← I NV M IX C OLUMNS(dw[i..i + 3]) . Note change of type.
    22:    end for
    23:    return dw
    24: end procedure
```

## 公式或伪代码

以下保留 source 提取稿中的算法标题和伪代码；分页造成的空白/字形异常以 PDF 为准。

```text
    Algorithm 5 Pseudocode for K EY E XPANSION EIC()
     1: procedure K EY E XPANSION EIC(key)
     2:    i←0
     3:    while i ≤ Nk − 1 do
     4:        w[i] ← key[4i..4i + 3]
     5:        dw[i] ← w[i]
     6:        i ← i+1
     7:    end while                                . When the loop concludes, i = Nk.
     8:    while i ≤ 4 ∗ Nr + 3 do
     9:        temp ← w[i − 1]
    10:        if i mod Nk = 0 then
    11:             temp ← S UB W ORD(ROT W ORD(temp)) ⊕ Rcon[i/Nk]
    12:        else if Nk > 6 and i mod Nk = 4 then
    13:             temp ← S UB W ORD(temp)
    14:        end if
    15:        w[i] ← w[i − Nk] ⊕ temp
    16:        dw[i] ← w[i]
    17:        i ← i+1
    18:    end while
    19:    for round from 1 to Nr − 1 do
    20:        i ← 4 ∗ round
    21:        dw[i..i + 3] ← I NV M IX C OLUMNS(dw[i..i + 3]) . Note change of type.
    22:    end for
    23:    return dw
    24: end procedure
```

## 输入与输出

以算法正文中的 `Input` / `Output` 或 procedure 参数为准；AES 支持的密钥长度、分组长度、轮数和状态布局是接口边界。

## 项目映射

当前项目没有独立等价逆密钥扩展块。

## 核验与缺项

- 原文覆盖：Algorithm 5 已独立定位到 source 第 1227 行。
- 结构核验：AES 的 CIPHER、逆 CIPHER、等价逆 CIPHER 和两种密钥扩展不是同一条目。
- 向量核验：需覆盖 AES-128/192/256 及标准已给的加解密向量；单个 demo 不能替代全部参数集。
