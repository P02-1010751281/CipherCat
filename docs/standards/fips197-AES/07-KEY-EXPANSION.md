# Algorithm 2 — AES 密钥扩展（NIST FIPS 197）

## 条目元数据

| 字段 | 内容 |
|---|---|
| 类型 | 算法 |
| 标准定位 | NIST FIPS 197 §5.2，Algorithm 2 |
| 原文证据 | [AES source](./00-Standard-Source.md#L1018) · [PDF](./NIST.FIPS.197.pdf) |
| 原文位置 | `00-Standard-Source.md` 第 1018 行起；PDF 物理页以 PDF 视觉版式核对 |
| 项目状态 | 部分实现 |

## 标准定义

本页只承载 FIPS 197 Algorithm 2 的独立定义；Nb=4、Nk/Nr、状态字节序、S-box、MixColumns 和轮密钥约定必须与标准原文一致。

## 原文定位与引用

该条目从 [FIPS 197 原文提取稿](./00-Standard-Source.md#L1018) 拆出。完整正文、公式、表格、脚注和上下文回到 source 及同目录 PDF 核验。

## 原文摘录
> 以下为 source 中 Algorithm 2 的完整原文算法块；仅移除了 PDF 分页标记和页眉页码。

```text
      Algorithm 2 Pseudocode for K EY E XPANSION()
       1: procedure K EY E XPANSION(key)
       2:    i←0
       3:    while i ≤ Nk − 1 do
       4:        w[i] ← key[4 ∗ i..4 ∗ i + 3]
       5:        i ← i+1
       6:    end while                                . When the loop concludes, i = Nk.
       7:    while i ≤ 4 ∗ Nr + 3 do
       8:       temp ← w[i − 1]
       9:        if i mod Nk = 0 then
      10:             temp ← S UB W ORD(ROT W ORD(temp)) ⊕ Rcon[i/Nk]
      11:        else if Nk > 6 and i mod Nk = 4 then
      12:             temp ← S UB W ORD(temp)
      13:        end if
      14:        w[i] ← w[i − Nk] ⊕ temp
      15:        i ← i+1
      16:    end while
      17:    return w
      18: end procedure
```

## 公式或伪代码

以下保留 source 提取稿中的算法标题和伪代码；分页造成的空白/字形异常以 PDF 为准。

```text
      Algorithm 2 Pseudocode for K EY E XPANSION()
       1: procedure K EY E XPANSION(key)
       2:    i←0
       3:    while i ≤ Nk − 1 do
       4:        w[i] ← key[4 ∗ i..4 ∗ i + 3]
       5:        i ← i+1
       6:    end while                                . When the loop concludes, i = Nk.
       7:    while i ≤ 4 ∗ Nr + 3 do
       8:       temp ← w[i − 1]
       9:        if i mod Nk = 0 then
      10:             temp ← S UB W ORD(ROT W ORD(temp)) ⊕ Rcon[i/Nk]
      11:        else if Nk > 6 and i mod Nk = 4 then
      12:             temp ← S UB W ORD(temp)
      13:        end if
      14:        w[i] ← w[i − Nk] ⊕ temp
      15:        i ← i+1
      16:    end while
      17:    return w
      18: end procedure
```

## 输入与输出

以算法正文中的 `Input` / `Output` 或 procedure 参数为准；AES 支持的密钥长度、分组长度、轮数和状态布局是接口边界。

## 项目映射

`aes_key_expand` 的项目路径需与本算法及 AES-128/192/256 参数逐项核对。

## 核验与缺项

- 原文覆盖：Algorithm 2 已独立定位到 source 第 1018 行。
- 结构核验：AES 的 CIPHER、逆 CIPHER、等价逆 CIPHER 和两种密钥扩展不是同一条目。
- 向量核验：需覆盖 AES-128/192/256 及标准已给的加解密向量；单个 demo 不能替代全部参数集。
