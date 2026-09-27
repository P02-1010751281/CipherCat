# Algorithm 4 — AES 等价逆 CIPHER（NIST FIPS 197）

## 条目元数据

| 字段 | 内容 |
|---|---|
| 类型 | 算法 |
| 标准定位 | NIST FIPS 197 §5.3.5，Algorithm 4 |
| 原文证据 | [AES source](./00-Standard-Source.md#L1209) · [PDF](./NIST.FIPS.197.pdf) |
| 原文位置 | `00-Standard-Source.md` 第 1209 行起；PDF 物理页以 PDF 视觉版式核对 |
| 项目状态 | 仅参考 |

## 标准定义

本页只承载 FIPS 197 Algorithm 4 的独立定义；Nb=4、Nk/Nr、状态字节序、S-box、MixColumns 和轮密钥约定必须与标准原文一致。

## 原文定位与引用

该条目从 [FIPS 197 原文提取稿](./00-Standard-Source.md#L1209) 拆出。完整正文、公式、表格、脚注和上下文回到 source 及同目录 PDF 核验。

## 原文摘录
> 以下为 source 中 Algorithm 4 的完整原文算法块；仅移除了 PDF 分页标记和页眉页码。

```text
    Algorithm 4 Pseudocode for E Q I NV C IPHER()
     1: procedure E Q I NV C IPHER(in, Nr, dw)
     2:    state ← in
     3:    state ← A DD ROUND K EY(state, dw[4 ∗ Nr..4 ∗ Nr + 3])
     4:    for round from Nr − 1 downto 1 do
     5:        state ← I NV S UB B YTES(state)
     6:        state ← I NV S HIFT ROWS(state)
     7:        state ← I NV M IX C OLUMNS(state)
     8:        state ← A DD ROUND K EY(state, dw[4 ∗ round..4 ∗ round + 3])
     9:    end for
    10:    state ← I NV S UB B YTES(state)
    11:    state ← I NV S HIFT ROWS(state)
    12:    state ← A DD ROUND K EY(state, dw[0..3])
    13:    return state
    14: end procedure
```

## 公式或伪代码

以下保留 source 提取稿中的算法标题和伪代码；分页造成的空白/字形异常以 PDF 为准。

```text
    Algorithm 4 Pseudocode for E Q I NV C IPHER()
     1: procedure E Q I NV C IPHER(in, Nr, dw)
     2:    state ← in
     3:    state ← A DD ROUND K EY(state, dw[4 ∗ Nr..4 ∗ Nr + 3])
     4:    for round from Nr − 1 downto 1 do
     5:        state ← I NV S UB B YTES(state)
     6:        state ← I NV S HIFT ROWS(state)
     7:        state ← I NV M IX C OLUMNS(state)
     8:        state ← A DD ROUND K EY(state, dw[4 ∗ round..4 ∗ round + 3])
     9:    end for
    10:    state ← I NV S UB B YTES(state)
    11:    state ← I NV S HIFT ROWS(state)
    12:    state ← A DD ROUND K EY(state, dw[0..3])
    13:    return state
    14: end procedure
```

## 输入与输出

以算法正文中的 `Input` / `Output` 或 procedure 参数为准；AES 支持的密钥长度、分组长度、轮数和状态布局是接口边界。

## 项目映射

当前项目没有独立等价逆 CIPHER 块。

## 核验与缺项

- 原文覆盖：Algorithm 4 已独立定位到 source 第 1209 行。
- 结构核验：AES 的 CIPHER、逆 CIPHER、等价逆 CIPHER 和两种密钥扩展不是同一条目。
- 向量核验：需覆盖 AES-128/192/256 及标准已给的加解密向量；单个 demo 不能替代全部参数集。
