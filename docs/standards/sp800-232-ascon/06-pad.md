# Algorithm 2 — 分隔填充（NIST SP 800-232）

## 条目元数据

| 字段 | 内容 |
|---|---|
| 类型 | 原语 / 函数 |
| 标准定位 | NIST SP 800-232 §2.1，Algorithm 2 `pad` |
| 原文证据 | [Ascon source](./00-Standard-Source.md#L572) · [PDF](./NIST.SP.800-232.pdf) |
| 原文位置 | `00-Standard-Source.md` 第 572 行起；PDF 物理页以 PDF 视觉版式核对 |
| 项目状态 | 仅参考 |

## 标准定义

Algorithm 2 在 bitstring `X` 后追加分隔 bit `1` 和足量的 `0`，使结果长度成为 `r` 的倍数。本页只承载该算法的独立定义；具体边界以标准原文为准。

## 原文定位与引用

该条目从 [NIST SP 800-232 原文提取稿](./00-Standard-Source.md#L572) 拆出。完整正文、公式、表格和上下文回到 source 及同目录 PDF 核验。

## 原文摘录
> 以下为 source 中 Algorithm 2 的完整原文算法块；仅移除了 PDF 分页标记和页眉页码。

```text
Algorithm 2 pad(𝑋, 𝑟)
  Input: bitstring 𝑋, a positive integer 𝑟
  Output: padded bitstring 𝑋 ′

  𝑗 ← (−|𝑋| − 1) mod 𝑟
  𝑋 ′ ← 𝑋 ∥ 1 ∥ 0𝑗
  return 𝑋 ′
```

## 公式或伪代码

以下保留 source 提取稿中的算法标题、输入/输出和伪代码；分页造成的空白/字形异常以 PDF 为准。

```text
Algorithm 2 pad(𝑋, 𝑟)
  Input: bitstring 𝑋, a positive integer 𝑟
  Output: padded bitstring 𝑋 ′

  𝑗 ← (−|𝑋| − 1) mod 𝑟
  𝑋 ′ ← 𝑋 ∥ 1 ∥ 0𝑗
  return 𝑋 ′
```

## 输入与输出

以算法正文中的 `Input` / `Output` 为准；消息、关联数据、密钥、nonce、定制字符串和输出长度的单位（bit/byte）必须与标准保持一致。认证失败时不得把明文作为成功输出。

## 项目映射

标准内部辅助函数；当前没有独立 Blockly 块。

## 核验与缺项

- 原文覆盖：Algorithm 2 已独立定位到 source 第 572 行。
- 标准最终版优先：以同目录最终版 PDF 为准，不把旧草案的算法编号或初始值混入现行条目。
- 向量核验：`pad` 是 Hash/XOF/CXOF 和 AEAD 的内部辅助算法；扩展 Demo 间接覆盖空消息和末块填充，独立 bitstring 边界向量仍需补充。
