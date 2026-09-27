# Algorithm 17 — 由签名恢复 FORS 公钥（FIPS 205）

## 条目元数据

| 字段 | 内容 |
|---|---|
| 类型 | 函数 |
| 标准定位 | FIPS 205 §8.4，Algorithm 17 `fors_pkFromSig` |
| 原文证据 | [FIPS 205 source](./00-Standard-Source.md#L1741) · [PDF](./NIST.FIPS.205.pdf) |
| 原文位置 | `00-Standard-Source.md` 第 1741 行起；PDF 物理页以 PDF 视觉版式核对 |
| 项目状态 | 部分实现 |

## 标准定义

Computes a FORS public key from a FORS signature. 本页只承载 Algorithm 17 的独立定义；依赖的函数、地址和参数仍按 FIPS 205 的对应章节解释，不能用项目教学参数反推标准参数。

## 原文定位与引用

该条目从 [FIPS 205 原文提取稿](./00-Standard-Source.md#L1741) 拆出。完整正文、公式、脚注和上下文回到 source 及同目录 PDF 核验。

## 原文摘录
> 以下为 source 中 Algorithm 17 的完整原文算法块；仅移除了 PDF 分页标记和页眉页码。

```text
Algorithm 17 fors_pkFromSig(SIG𝐹 𝑂𝑅𝑆 , 𝑚𝑑, PK.seed, ADRS)
Computes a FORS public key from a FORS signature.
Input: FORS signature SIG𝐹 𝑂𝑅𝑆 , message digest 𝑚𝑑, public seed PK.seed, address ADRS.
Output: FORS public key.
  1: 𝑖𝑛𝑑𝑖𝑐𝑒𝑠 ← base_2b (𝑚𝑑, 𝑎, 𝑘)
  2: for 𝑖 from 0 to 𝑘 − 1 do
  3:     𝑠𝑘 ← SIG𝐹 𝑂𝑅𝑆 .getSK(𝑖)             ▷ SIG𝐹 𝑂𝑅𝑆 [𝑖 ⋅ (𝑎 + 1) ⋅ 𝑛 ∶ (𝑖 ⋅ (𝑎 + 1) + 1) ⋅ 𝑛]
  4:     ADRS.setTreeHeight(0)                                                   ▷ compute leaf
  5:     ADRS.setTreeIndex(𝑖 ⋅ 2𝑎 + 𝑖𝑛𝑑𝑖𝑐𝑒𝑠[𝑖])
  6:     𝑛𝑜𝑑𝑒[0] ← F(PK.seed, ADRS, 𝑠𝑘)
 7:     𝑎𝑢𝑡ℎ ← SIG𝐹 𝑂𝑅𝑆 .getAUTH(𝑖) ▷ SIG𝐹 𝑂𝑅𝑆 [(𝑖 ⋅ (𝑎 + 1) + 1) ⋅ 𝑛 ∶ (𝑖 + 1) ⋅ (𝑎 + 1) ⋅ 𝑛]
 8:     for 𝑗 from 0 to 𝑎 − 1 do                          ▷ compute root from leaf and AUTH
 9:         ADRS.setTreeHeight(𝑗 + 1)
10:         if ⌊𝑖𝑛𝑑𝑖𝑐𝑒𝑠[𝑖]/2𝑗 ⌋ is even then
11:              ADRS.setTreeIndex(ADRS.getTreeIndex()/2)
12:              𝑛𝑜𝑑𝑒[1] ← H(PK.seed, ADRS, 𝑛𝑜𝑑𝑒[0] ∥ 𝑎𝑢𝑡ℎ[𝑗])
13:         else
14:              ADRS.setTreeIndex((ADRS.getTreeIndex() − 1)/2)
15:              𝑛𝑜𝑑𝑒[1] ← H(PK.seed, ADRS, 𝑎𝑢𝑡ℎ[𝑗] ∥ 𝑛𝑜𝑑𝑒[0])
16:         end if
17:         𝑛𝑜𝑑𝑒[0] ← 𝑛𝑜𝑑𝑒[1]
18:     end for
19:     𝑟𝑜𝑜𝑡[𝑖] ← 𝑛𝑜𝑑𝑒[0]
20: end for
21: forspkADRS ← ADRS                        ▷ copy address to create a FORS public-key address
22: forspkADRS.setTypeAndClear(FORS_ROOTS)
23: forspkADRS.setKeyPairAddress(ADRS.getKeyPairAddress())
24: 𝑝𝑘 ← T𝑘 (PK.seed, forspkADRS, 𝑟𝑜𝑜𝑡)                         ▷ compute the FORS public key
25: return 𝑝𝑘
```

## 公式或伪代码

以下保留 source 提取稿中的算法标题、输入/输出和伪代码；分页造成的空白/字形异常以 PDF 为准。

```text
Algorithm 17 fors_pkFromSig(SIG𝐹 𝑂𝑅𝑆 , 𝑚𝑑, PK.seed, ADRS)
Computes a FORS public key from a FORS signature.
Input: FORS signature SIG𝐹 𝑂𝑅𝑆 , message digest 𝑚𝑑, public seed PK.seed, address ADRS.
Output: FORS public key.
  1: 𝑖𝑛𝑑𝑖𝑐𝑒𝑠 ← base_2b (𝑚𝑑, 𝑎, 𝑘)
  2: for 𝑖 from 0 to 𝑘 − 1 do
  3:     𝑠𝑘 ← SIG𝐹 𝑂𝑅𝑆 .getSK(𝑖)             ▷ SIG𝐹 𝑂𝑅𝑆 [𝑖 ⋅ (𝑎 + 1) ⋅ 𝑛 ∶ (𝑖 ⋅ (𝑎 + 1) + 1) ⋅ 𝑛]
  4:     ADRS.setTreeHeight(0)                                                   ▷ compute leaf
  5:     ADRS.setTreeIndex(𝑖 ⋅ 2𝑎 + 𝑖𝑛𝑑𝑖𝑐𝑒𝑠[𝑖])
  6:     𝑛𝑜𝑑𝑒[0] ← F(PK.seed, ADRS, 𝑠𝑘)
 7:     𝑎𝑢𝑡ℎ ← SIG𝐹 𝑂𝑅𝑆 .getAUTH(𝑖) ▷ SIG𝐹 𝑂𝑅𝑆 [(𝑖 ⋅ (𝑎 + 1) + 1) ⋅ 𝑛 ∶ (𝑖 + 1) ⋅ (𝑎 + 1) ⋅ 𝑛]
 8:     for 𝑗 from 0 to 𝑎 − 1 do                          ▷ compute root from leaf and AUTH
 9:         ADRS.setTreeHeight(𝑗 + 1)
10:         if ⌊𝑖𝑛𝑑𝑖𝑐𝑒𝑠[𝑖]/2𝑗 ⌋ is even then
11:              ADRS.setTreeIndex(ADRS.getTreeIndex()/2)
12:              𝑛𝑜𝑑𝑒[1] ← H(PK.seed, ADRS, 𝑛𝑜𝑑𝑒[0] ∥ 𝑎𝑢𝑡ℎ[𝑗])
13:         else
14:              ADRS.setTreeIndex((ADRS.getTreeIndex() − 1)/2)
15:              𝑛𝑜𝑑𝑒[1] ← H(PK.seed, ADRS, 𝑎𝑢𝑡ℎ[𝑗] ∥ 𝑛𝑜𝑑𝑒[0])
16:         end if
17:         𝑛𝑜𝑑𝑒[0] ← 𝑛𝑜𝑑𝑒[1]
18:     end for
19:     𝑟𝑜𝑜𝑡[𝑖] ← 𝑛𝑜𝑑𝑒[0]
20: end for
21: forspkADRS ← ADRS                        ▷ copy address to create a FORS public-key address
22: forspkADRS.setTypeAndClear(FORS_ROOTS)
23: forspkADRS.setKeyPairAddress(ADRS.getKeyPairAddress())
24: 𝑝𝑘 ← T𝑘 (PK.seed, forspkADRS, 𝑟𝑜𝑜𝑡)                         ▷ compute the FORS public key
25: return 𝑝𝑘
```

## 输入与输出

以算法正文中的 `Input` / `Output` 为准；字节串长度、`n`、`a`、`k`、`h′`、`d`、`len` 和地址类型必须绑定所选标准参数集。算法返回错误或布尔值时，错误语义也属于接口边界。

## 项目映射

`fors_verify` 覆盖教学恢复/比对语义；尚未覆盖全部标准参数集。

## 核验与缺项

- 原文覆盖：Algorithm 17 已独立定位到 source 第 1741 行。
- 结构核验：实现/教学块不得以同名替换标准函数；必须区分“标准算法”“项目映射”和“未实现”。
- 向量核验：待接入 FIPS 205/CAVP 完整 SLH-DSA KAT；当前项目已有 demo 只能证明明确列出的教学性质。
