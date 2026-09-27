# Algorithm 1 — AES CIPHER（NIST FIPS 197）

## 条目元数据

| 字段 | 内容 |
|---|---|
| 类型 | 算法 |
| 标准定位 | NIST FIPS 197 §5.1，Algorithm 1 |
| 原文证据 | [AES source](./00-Standard-Source.md#L765) · [PDF](./NIST.FIPS.197.pdf) |
| 原文位置 | `00-Standard-Source.md` 第 765 行起；PDF 物理页以 PDF 视觉版式核对 |
| 项目状态 | 部分实现 |

## 标准定义

本页只承载 FIPS 197 Algorithm 1 的独立定义；Nb=4、Nk/Nr、状态字节序、S-box、MixColumns 和轮密钥约定必须与标准原文一致。

## 原文定位与引用

该条目从 [FIPS 197 原文提取稿](./00-Standard-Source.md#L765) 拆出。完整正文、公式、表格、脚注和上下文回到 source 及同目录 PDF 核验。

## 原文摘录
> 以下为 source 中 Algorithm 1 的完整原文算法块；仅移除了 PDF 分页标记和页眉页码。

```text
      Algorithm 1 Pseudocode for C IPHER()
       1: procedure C IPHER(in, Nr, w)
       2:    state ← in                                                . See Sec. 3.4
       3:    state ← A DD ROUND K EY(state, w[0..3])                   . See Sec. 5.1.4
       4:    for round from 1 to Nr − 1 do
       5:        state ← S UB B YTES(state)                            . See Sec. 5.1.1
       6:        state ← S HIFT ROWS(state)                            . See Sec. 5.1.2
       7:        state ← M IX C OLUMNS(state)                          . See Sec. 5.1.3
       8:        state ← A DD ROUND K EY(state, w[4 ∗ round..4 ∗ round + 3])
       9:    end for
      10:    state ← S UB B YTES(state)
      11:    state ← S HIFT ROWS(state)
      12:    state ← A DD ROUND K EY(state, w[4 ∗ Nr..4 ∗ Nr + 3])
      13:    return state                                              . See Sec. 3.4
      14: end procedure
```

## 公式或伪代码

以下保留 source 提取稿中的算法标题和伪代码；分页造成的空白/字形异常以 PDF 为准。

```text
      Algorithm 1 Pseudocode for C IPHER()
       1: procedure C IPHER(in, Nr, w)
       2:    state ← in                                                . See Sec. 3.4
       3:    state ← A DD ROUND K EY(state, w[0..3])                   . See Sec. 5.1.4
       4:    for round from 1 to Nr − 1 do
       5:        state ← S UB B YTES(state)                            . See Sec. 5.1.1
       6:        state ← S HIFT ROWS(state)                            . See Sec. 5.1.2
       7:        state ← M IX C OLUMNS(state)                          . See Sec. 5.1.3
       8:        state ← A DD ROUND K EY(state, w[4 ∗ round..4 ∗ round + 3])
       9:    end for
      10:    state ← S UB B YTES(state)
      11:    state ← S HIFT ROWS(state)
      12:    state ← A DD ROUND K EY(state, w[4 ∗ Nr..4 ∗ Nr + 3])
      13:    return state                                              . See Sec. 3.4
      14: end procedure
```

## 输入与输出

以算法正文中的 `Input` / `Output` 或 procedure 参数为准；AES 支持的密钥长度、分组长度、轮数和状态布局是接口边界。

## 项目映射

`aes_encrypt` 采用等价的高层 AES 加密路径；本页保留标准轮次顺序。

## 核验与缺项

- 原文覆盖：Algorithm 1 已独立定位到 source 第 765 行。
- 结构核验：AES 的 CIPHER、逆 CIPHER、等价逆 CIPHER 和两种密钥扩展不是同一条目。
- 向量核验：需覆盖 AES-128/192/256 及标准已给的加解密向量；单个 demo 不能替代全部参数集。
