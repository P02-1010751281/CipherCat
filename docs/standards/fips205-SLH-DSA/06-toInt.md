# Algorithm 2 — 大端字节串转整数（FIPS 205）

## 条目元数据

| 字段 | 内容 |
|---|---|
| 类型 | 原语 / 函数 |
| 标准定位 | FIPS 205 §4.4，Algorithm 2 `toInt` |
| 原文证据 | [FIPS 205 source](./00-Standard-Source.md#L994) · [PDF](./NIST.FIPS.205.pdf) |
| 原文位置 | `00-Standard-Source.md` 第 994 行起；PDF 物理页以 PDF 视觉版式核对 |
| 项目状态 | 仅参考 |

## 标准定义

Converts a byte string to an integer. 本页只承载 Algorithm 2 的独立定义；依赖的函数、地址和参数仍按 FIPS 205 的对应章节解释，不能用项目教学参数反推标准参数。

## 原文定位与引用

该条目从 [FIPS 205 原文提取稿](./00-Standard-Source.md#L994) 拆出。完整正文、公式、脚注和上下文回到 source 及同目录 PDF 核验。

## 原文摘录
> 以下为 source 中 Algorithm 2 的完整原文算法块；仅移除了 PDF 分页标记和页眉页码。

```text
Algorithm 2 toInt(𝑋, 𝑛)
Converts a byte string to an integer.
Input: 𝑛-byte string 𝑋.
Output: Integer value of 𝑋.
  1: 𝑡𝑜𝑡𝑎𝑙 ← 0

 2: for 𝑖 from 0 to 𝑛 − 1 do
 3:     𝑡𝑜𝑡𝑎𝑙 ← 256 ⋅ 𝑡𝑜𝑡𝑎𝑙 + 𝑋[𝑖]
 4: end for
 5: return 𝑡𝑜𝑡𝑎𝑙
```

## 公式或伪代码

以下保留 source 提取稿中的算法标题、输入/输出和伪代码；分页造成的空白/字形异常以 PDF 为准。

```text
Algorithm 2 toInt(𝑋, 𝑛)
Converts a byte string to an integer.
Input: 𝑛-byte string 𝑋.
Output: Integer value of 𝑋.
  1: 𝑡𝑜𝑡𝑎𝑙 ← 0

 2: for 𝑖 from 0 to 𝑛 − 1 do
 3:     𝑡𝑜𝑡𝑎𝑙 ← 256 ⋅ 𝑡𝑜𝑡𝑎𝑙 + 𝑋[𝑖]
 4: end for
 5: return 𝑡𝑜𝑡𝑎𝑙
```

## 输入与输出

以算法正文中的 `Input` / `Output` 为准；字节串长度、`n`、`a`、`k`、`h′`、`d`、`len` 和地址类型必须绑定所选标准参数集。算法返回错误或布尔值时，错误语义也属于接口边界。

## 项目映射

`slh_adrs_full` 的地址字段语义依赖同类大端转换；项目没有独立标准 API。

## 核验与缺项

- 原文覆盖：Algorithm 2 已独立定位到 source 第 994 行。
- 结构核验：实现/教学块不得以同名替换标准函数；必须区分“标准算法”“项目映射”和“未实现”。
- 向量核验：待接入 FIPS 205/CAVP 完整 SLH-DSA KAT；当前项目已有 demo 只能证明明确列出的教学性质。
