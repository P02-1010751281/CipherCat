# Algorithm 4 — base-2^b 消息拆分（FIPS 205）

## 条目元数据

| 字段 | 内容 |
|---|---|
| 类型 | 原语 / 函数 |
| 标准定位 | FIPS 205 §4.4，Algorithm 4 `base_2b` |
| 原文证据 | [FIPS 205 source](./00-Standard-Source.md#L1034) · [PDF](./NIST.FIPS.205.pdf) |
| 原文位置 | `00-Standard-Source.md` 第 1034 行起；PDF 物理页以 PDF 视觉版式核对 |
| 项目状态 | 部分实现 |

## 标准定义

Computes the base 2𝑏 representation of 𝑋. 本页只承载 Algorithm 4 的独立定义；依赖的函数、地址和参数仍按 FIPS 205 的对应章节解释，不能用项目教学参数反推标准参数。

## 原文定位与引用

该条目从 [FIPS 205 原文提取稿](./00-Standard-Source.md#L1034) 拆出。完整正文、公式、脚注和上下文回到 source 及同目录 PDF 核验。

## 原文摘录
> 以下为 source 中 Algorithm 4 的完整原文算法块；仅移除了 PDF 分页标记和页眉页码。

```text
Algorithm 4 base_2b (𝑋, 𝑏, 𝑜𝑢𝑡_𝑙𝑒𝑛)
Computes the base 2𝑏 representation of 𝑋.
Input: Byte string 𝑋 of length at least ⌈ 𝑜𝑢𝑡_8𝑙𝑒𝑛⋅𝑏 ⌉, integer 𝑏, output length 𝑜𝑢𝑡_𝑙𝑒𝑛.
Output: Array of 𝑜𝑢𝑡_𝑙𝑒𝑛 integers in the range [0, … , 2𝑏 − 1].
  1: 𝑖𝑛 ← 0
  2: 𝑏𝑖𝑡𝑠 ← 0
  3: 𝑡𝑜𝑡𝑎𝑙 ← 0

 4: for 𝑜𝑢𝑡 from 0 to 𝑜𝑢𝑡_𝑙𝑒𝑛 − 1 do
 5:     while 𝑏𝑖𝑡𝑠 < 𝑏 do
 6:         𝑡𝑜𝑡𝑎𝑙 ← (𝑡𝑜𝑡𝑎𝑙 ≪ 8) + 𝑋[𝑖𝑛]
 7:         𝑖𝑛 ← 𝑖𝑛 + 1
 8:         𝑏𝑖𝑡𝑠 ← 𝑏𝑖𝑡𝑠 + 8
 9:     end while
10:     𝑏𝑖𝑡𝑠 ← 𝑏𝑖𝑡𝑠 − 𝑏
11:     𝑏𝑎𝑠𝑒𝑏[𝑜𝑢𝑡] ← (𝑡𝑜𝑡𝑎𝑙 ≫ 𝑏𝑖𝑡𝑠) mod 2𝑏
12: end for
13: return 𝑏𝑎𝑠𝑒𝑏




    𝑏 will be the value of 𝑙𝑔𝑤 when the base_2b function is used in WOTS+ , and 𝑏 will be the value of 𝑎 when the
    base_2b function is used in FORS. For the parameter sets in this standard, 𝑙𝑔𝑤 is 4, and 𝑎 is 6, 8, 9, 12, or 14.
```

## 公式或伪代码

以下保留 source 提取稿中的算法标题、输入/输出和伪代码；分页造成的空白/字形异常以 PDF 为准。

```text
Algorithm 4 base_2b (𝑋, 𝑏, 𝑜𝑢𝑡_𝑙𝑒𝑛)
Computes the base 2𝑏 representation of 𝑋.
Input: Byte string 𝑋 of length at least ⌈ 𝑜𝑢𝑡_8𝑙𝑒𝑛⋅𝑏 ⌉, integer 𝑏, output length 𝑜𝑢𝑡_𝑙𝑒𝑛.
Output: Array of 𝑜𝑢𝑡_𝑙𝑒𝑛 integers in the range [0, … , 2𝑏 − 1].
  1: 𝑖𝑛 ← 0
  2: 𝑏𝑖𝑡𝑠 ← 0
  3: 𝑡𝑜𝑡𝑎𝑙 ← 0

 4: for 𝑜𝑢𝑡 from 0 to 𝑜𝑢𝑡_𝑙𝑒𝑛 − 1 do
 5:     while 𝑏𝑖𝑡𝑠 < 𝑏 do
 6:         𝑡𝑜𝑡𝑎𝑙 ← (𝑡𝑜𝑡𝑎𝑙 ≪ 8) + 𝑋[𝑖𝑛]
 7:         𝑖𝑛 ← 𝑖𝑛 + 1
 8:         𝑏𝑖𝑡𝑠 ← 𝑏𝑖𝑡𝑠 + 8
 9:     end while
10:     𝑏𝑖𝑡𝑠 ← 𝑏𝑖𝑡𝑠 − 𝑏
11:     𝑏𝑎𝑠𝑒𝑏[𝑜𝑢𝑡] ← (𝑡𝑜𝑡𝑎𝑙 ≫ 𝑏𝑖𝑡𝑠) mod 2𝑏
12: end for
13: return 𝑏𝑎𝑠𝑒𝑏




    𝑏 will be the value of 𝑙𝑔𝑤 when the base_2b function is used in WOTS+ , and 𝑏 will be the value of 𝑎 when the
    base_2b function is used in FORS. For the parameter sets in this standard, 𝑙𝑔𝑤 is 4, and 𝑎 is 6, 8, 9, 12, or 14.
```

## 输入与输出

以算法正文中的 `Input` / `Output` 为准；字节串长度、`n`、`a`、`k`、`h′`、`d`、`len` 和地址类型必须绑定所选标准参数集。算法返回错误或布尔值时，错误语义也属于接口边界。

## 项目映射

`wots_checksum` 只覆盖 WOTS+ 的 b=4 教学路径；FORS 的通用 b=a 尚未独立实现。

## 核验与缺项

- 原文覆盖：Algorithm 4 已独立定位到 source 第 1034 行。
- 结构核验：实现/教学块不得以同名替换标准函数；必须区分“标准算法”“项目映射”和“未实现”。
- 向量核验：待接入 FIPS 205/CAVP 完整 SLH-DSA KAT；当前项目已有 demo 只能证明明确列出的教学性质。
