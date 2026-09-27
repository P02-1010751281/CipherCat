# Algorithm 15 — FORS 子树节点/根（FIPS 205）

## 条目元数据

| 字段 | 内容 |
|---|---|
| 类型 | 函数 |
| 标准定位 | FIPS 205 §8.2，Algorithm 15 `fors_node` |
| 原文证据 | [FIPS 205 source](./00-Standard-Source.md#L1652) · [PDF](./NIST.FIPS.205.pdf) |
| 原文位置 | `00-Standard-Source.md` 第 1652 行起；PDF 物理页以 PDF 视觉版式核对 |
| 项目状态 | 部分实现 |

## 标准定义

Computes the root of a Merkle subtree of FORS public values. 本页只承载 Algorithm 15 的独立定义；依赖的函数、地址和参数仍按 FIPS 205 的对应章节解释，不能用项目教学参数反推标准参数。

## 原文定位与引用

该条目从 [FIPS 205 原文提取稿](./00-Standard-Source.md#L1652) 拆出。完整正文、公式、脚注和上下文回到 source 及同目录 PDF 核验。

## 原文摘录
> 以下为 source 中 Algorithm 15 的完整原文算法块；仅移除了 PDF 分页标记和页眉页码。

```text
Algorithm 15 fors_node(SK.seed, 𝑖, 𝑧, PK.seed, ADRS)
Computes the root of a Merkle subtree of FORS public values.
Input: Secret seed SK.seed, target node index 𝑖, target node height 𝑧, public seed PK.seed,
        address ADRS.
Output: 𝑛-byte root 𝑛𝑜𝑑𝑒.
  1: if 𝑧 = 0 then
  2:      𝑠𝑘 ← fors_skGen(SK.seed, PK.seed, ADRS, 𝑖)
  3:      ADRS.setTreeHeight(0)
  4:      ADRS.setTreeIndex(𝑖)
  5:      𝑛𝑜𝑑𝑒 ← F(PK.seed, ADRS, 𝑠𝑘)
  6: else
  7:      𝑙𝑛𝑜𝑑𝑒 ← fors_node(SK.seed, 2𝑖, 𝑧 − 1, PK.seed, ADRS)
  8:      𝑟𝑛𝑜𝑑𝑒 ← fors_node(SK.seed, 2𝑖 + 1, 𝑧 − 1, PK.seed, ADRS)
  9:      ADRS.setTreeHeight(𝑧)
10:       ADRS.setTreeIndex(𝑖)
11:       𝑛𝑜𝑑𝑒 ← H(PK.seed, ADRS, 𝑙𝑛𝑜𝑑𝑒 ∥ 𝑟𝑛𝑜𝑑𝑒)
12: end if
13: return 𝑛𝑜𝑑𝑒
```

## 公式或伪代码

以下保留 source 提取稿中的算法标题、输入/输出和伪代码；分页造成的空白/字形异常以 PDF 为准。

```text
Algorithm 15 fors_node(SK.seed, 𝑖, 𝑧, PK.seed, ADRS)
Computes the root of a Merkle subtree of FORS public values.
Input: Secret seed SK.seed, target node index 𝑖, target node height 𝑧, public seed PK.seed,
        address ADRS.
Output: 𝑛-byte root 𝑛𝑜𝑑𝑒.
  1: if 𝑧 = 0 then
  2:      𝑠𝑘 ← fors_skGen(SK.seed, PK.seed, ADRS, 𝑖)
  3:      ADRS.setTreeHeight(0)
  4:      ADRS.setTreeIndex(𝑖)
  5:      𝑛𝑜𝑑𝑒 ← F(PK.seed, ADRS, 𝑠𝑘)
  6: else
  7:      𝑙𝑛𝑜𝑑𝑒 ← fors_node(SK.seed, 2𝑖, 𝑧 − 1, PK.seed, ADRS)
  8:      𝑟𝑛𝑜𝑑𝑒 ← fors_node(SK.seed, 2𝑖 + 1, 𝑧 − 1, PK.seed, ADRS)
  9:      ADRS.setTreeHeight(𝑧)
10:       ADRS.setTreeIndex(𝑖)
11:       𝑛𝑜𝑑𝑒 ← H(PK.seed, ADRS, 𝑙𝑛𝑜𝑑𝑒 ∥ 𝑟𝑛𝑜𝑑𝑒)
12: end if
13: return 𝑛𝑜𝑑𝑒
```

## 输入与输出

以算法正文中的 `Input` / `Output` 为准；字节串长度、`n`、`a`、`k`、`h′`、`d`、`len` 和地址类型必须绑定所选标准参数集。算法返回错误或布尔值时，错误语义也属于接口边界。

## 项目映射

`merkle_node` 和 `fors_pk_from_sk` 间接覆盖树合并；标准递归节点尚无独立 API。

## 核验与缺项

- 原文覆盖：Algorithm 15 已独立定位到 source 第 1652 行。
- 结构核验：实现/教学块不得以同名替换标准函数；必须区分“标准算法”“项目映射”和“未实现”。
- 向量核验：待接入 FIPS 205/CAVP 完整 SLH-DSA KAT；当前项目已有 demo 只能证明明确列出的教学性质。
