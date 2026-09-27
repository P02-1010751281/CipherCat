# Algorithm 1 — WOTS+ 校验和链数计算（FIPS 205）

## 条目元数据

| 字段 | 内容 |
|---|---|
| 类型 | 公式 / 函数 |
| 标准定位 | FIPS 205 §3.1，Algorithm 1 `gen_len2` |
| 原文证据 | [FIPS 205 source](./00-Standard-Source.md#L735) · [PDF](./NIST.FIPS.205.pdf) |
| 原文位置 | `00-Standard-Source.md` 第 735 行起；PDF 物理页以 PDF 视觉版式核对 |
| 项目状态 | 仅参考 |

## 标准定义

Computes 𝑙𝑒𝑛2 (Equation 5.3). 本页只承载 Algorithm 1 的独立定义；依赖的函数、地址和参数仍按 FIPS 205 的对应章节解释，不能用项目教学参数反推标准参数。

## 原文定位与引用

该条目从 [FIPS 205 原文提取稿](./00-Standard-Source.md#L735) 拆出。完整正文、公式、脚注和上下文回到 source 及同目录 PDF 核验。

## 原文摘录
> 以下为 source 中 Algorithm 1 的完整原文算法块；仅移除了 PDF 分页标记和页眉页码。

```text
Algorithm 1 gen_len2 (𝑛, 𝑙𝑔𝑤 )
Computes 𝑙𝑒𝑛2 (Equation 5.3).
Input: Security parameter 𝑛, bits per hash chain 𝑙𝑔𝑤 .
Output: 𝑙𝑒𝑛2 .
  1: 𝑤 ← 2𝑙𝑔𝑤                                                                  ▷ Equation 5.1
               8⋅𝑛+𝑙𝑔𝑤 −1
  2: 𝑙𝑒𝑛1 ← ⌊     𝑙𝑔𝑤     ⌋                                                    ▷ Equation 5.2
  3: 𝑚𝑎𝑥_𝑐ℎ𝑒𝑐𝑘𝑠𝑢𝑚 = 𝑙𝑒𝑛1 ⋅ (𝑤 − 1)                         ▷ maximum possible checksum value
 4: 𝑙𝑒𝑛2 ← 1                                        ▷ maximum value that may be signed using
 5: 𝑐𝑎𝑝𝑎𝑐𝑖𝑡𝑦 ← 𝑤                                ▷ 𝑙𝑒𝑛2 hash chains is 𝑤𝑙𝑒𝑛2 − 1 = 𝑐𝑎𝑝𝑎𝑐𝑖𝑡𝑦 − 1
 6: while 𝑐𝑎𝑝𝑎𝑐𝑖𝑡𝑦 ≤ 𝑚𝑎𝑥_𝑐ℎ𝑒𝑐𝑘𝑠𝑢𝑚 do
 7:     𝑙𝑒𝑛2 ← 𝑙𝑒𝑛2 + 1
 8:     𝑐𝑎𝑝𝑎𝑐𝑖𝑡𝑦 ← 𝑐𝑎𝑝𝑎𝑐𝑖𝑡𝑦 ⋅ 𝑤
 9: end while
10: return 𝑙𝑒𝑛2
```

## 公式或伪代码

以下保留 source 提取稿中的算法标题、输入/输出和伪代码；分页造成的空白/字形异常以 PDF 为准。

```text
Algorithm 1 gen_len2 (𝑛, 𝑙𝑔𝑤 )
Computes 𝑙𝑒𝑛2 (Equation 5.3).
Input: Security parameter 𝑛, bits per hash chain 𝑙𝑔𝑤 .
Output: 𝑙𝑒𝑛2 .
  1: 𝑤 ← 2𝑙𝑔𝑤                                                                  ▷ Equation 5.1
               8⋅𝑛+𝑙𝑔𝑤 −1
  2: 𝑙𝑒𝑛1 ← ⌊     𝑙𝑔𝑤     ⌋                                                    ▷ Equation 5.2
  3: 𝑚𝑎𝑥_𝑐ℎ𝑒𝑐𝑘𝑠𝑢𝑚 = 𝑙𝑒𝑛1 ⋅ (𝑤 − 1)                         ▷ maximum possible checksum value
 4: 𝑙𝑒𝑛2 ← 1                                        ▷ maximum value that may be signed using
 5: 𝑐𝑎𝑝𝑎𝑐𝑖𝑡𝑦 ← 𝑤                                ▷ 𝑙𝑒𝑛2 hash chains is 𝑤𝑙𝑒𝑛2 − 1 = 𝑐𝑎𝑝𝑎𝑐𝑖𝑡𝑦 − 1
 6: while 𝑐𝑎𝑝𝑎𝑐𝑖𝑡𝑦 ≤ 𝑚𝑎𝑥_𝑐ℎ𝑒𝑐𝑘𝑠𝑢𝑚 do
 7:     𝑙𝑒𝑛2 ← 𝑙𝑒𝑛2 + 1
 8:     𝑐𝑎𝑝𝑎𝑐𝑖𝑡𝑦 ← 𝑐𝑎𝑝𝑎𝑐𝑖𝑡𝑦 ⋅ 𝑤
 9: end while
10: return 𝑙𝑒𝑛2
```

## 输入与输出

以算法正文中的 `Input` / `Output` 为准；字节串长度、`n`、`a`、`k`、`h′`、`d`、`len` 和地址类型必须绑定所选标准参数集。算法返回错误或布尔值时，错误语义也属于接口边界。

## 项目映射

标准参数中 `len2` 可预计算；没有独立 Blockly 块。

## 核验与缺项

- 原文覆盖：Algorithm 1 已独立定位到 source 第 735 行。
- 结构核验：实现/教学块不得以同名替换标准函数；必须区分“标准算法”“项目映射”和“未实现”。
- 向量核验：待接入 FIPS 205/CAVP 完整 SLH-DSA KAT；当前项目已有 demo 只能证明明确列出的教学性质。
