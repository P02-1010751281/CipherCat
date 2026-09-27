# Algorithm 19 — SLH-DSA 内部签名（FIPS 205）

## 条目元数据

| 字段 | 内容 |
|---|---|
| 类型 | 函数 |
| 标准定位 | FIPS 205 §9.2，Algorithm 19 `slh_sign_internal` |
| 原文证据 | [FIPS 205 source](./00-Standard-Source.md#L1876) · [PDF](./NIST.FIPS.205.pdf) |
| 原文位置 | `00-Standard-Source.md` 第 1876 行起；PDF 物理页以 PDF 视觉版式核对 |
| 项目状态 | 仅参考 |

## 标准定义

Generates an SLH-DSA signature. 本页只承载 Algorithm 19 的独立定义；依赖的函数、地址和参数仍按 FIPS 205 的对应章节解释，不能用项目教学参数反推标准参数。

## 原文定位与引用

该条目从 [FIPS 205 原文提取稿](./00-Standard-Source.md#L1876) 拆出。完整正文、公式、脚注和上下文回到 source 及同目录 PDF 核验。

## 原文摘录
> 以下为 source 中 Algorithm 19 的完整原文算法块；仅移除了 PDF 分页标记和页眉页码。

```text
Algorithm 19 slh_sign_internal(𝑀, SK, 𝑎𝑑𝑑𝑟𝑛𝑑)
Generates an SLH-DSA signature.
Input: Message 𝑀, private key SK = (SK.seed, SK.prf, PK.seed, PK.root),
       (optional) additional randomness 𝑎𝑑𝑑𝑟𝑛𝑑.
Output: SLH-DSA signature SIG.
  1: ADRS ← toByte(0, 32)

 2: 𝑜𝑝𝑡_𝑟𝑎𝑛𝑑 ← 𝑎𝑑𝑑𝑟𝑛𝑑    ▷ substitute 𝑜𝑝𝑡_𝑟𝑎𝑛𝑑 ← PK.seed for the deterministic variant
 3: 𝑅 ← PRF𝑚𝑠𝑔 (SK.prf, 𝑜𝑝𝑡_𝑟𝑎𝑛𝑑, 𝑀 )                         ▷ generate randomizer
 4: SIG ← 𝑅

 5: 𝑑𝑖𝑔𝑒𝑠𝑡 ← H𝑚𝑠𝑔 (𝑅, PK.seed, PK.root, 𝑀 )                        ▷ compute message digest
 6: 𝑚𝑑 ← 𝑑𝑖𝑔𝑒𝑠𝑡 [0 ∶ ⌈ 𝑘⋅𝑎
                        8 ⌉]                                              ▷ first ⌈ 𝑘⋅𝑎
                                                                                     8 ⌉ bytes
                                          ℎ−ℎ/𝑑                                 ℎ−ℎ/𝑑
 7: 𝑡𝑚𝑝_𝑖𝑑𝑥𝑡𝑟𝑒𝑒 ← 𝑑𝑖𝑔𝑒𝑠𝑡 [⌈ 𝑘⋅𝑎   𝑘⋅𝑎
                             8 ⌉∶⌈ 8 ⌉+⌈    8 ⌉]                       ▷ next ⌈ 8 ⌉ bytes
                                    ℎ−ℎ/𝑑           ℎ−ℎ/𝑑
 8: 𝑡𝑚𝑝_𝑖𝑑𝑥𝑙𝑒𝑎𝑓 ← 𝑑𝑖𝑔𝑒𝑠𝑡 [⌈ 𝑘⋅𝑎              𝑘⋅𝑎             ℎ
                             8 ⌉ + ⌈ 8 ⌉ ∶ ⌈ 8 ⌉ + ⌈ 8 ⌉ + ⌈ 8𝑑 ⌉]
                                                                                    ℎ
                                                                           ▷ next ⌈ 8𝑑 ⌉ bytes

 9: 𝑖𝑑𝑥𝑡𝑟𝑒𝑒 ← toInt (𝑡𝑚𝑝_𝑖𝑑𝑥𝑡𝑟𝑒𝑒 , ⌈
                                     ℎ−ℎ/𝑑          ℎ−ℎ/𝑑
                                        8 ⌉) mod 2
10: 𝑖𝑑𝑥𝑙𝑒𝑎𝑓 ← toInt (𝑡𝑚𝑝_𝑖𝑑𝑥𝑙𝑒𝑎𝑓 , ⌈ 8𝑑
                                     ℎ
                                        ⌉) mod 2ℎ/𝑑
11: ADRS.setTreeAddress(𝑖𝑑𝑥𝑡𝑟𝑒𝑒 )
12: ADRS.setTypeAndClear(FORS_TREE)
13: ADRS.setKeyPairAddress(𝑖𝑑𝑥𝑙𝑒𝑎𝑓 )
14: SIG𝐹 𝑂𝑅𝑆 ← fors_sign(𝑚𝑑, SK.seed, PK.seed, ADRS)
15: SIG ← SIG ∥ SIG𝐹 𝑂𝑅𝑆

16: PK𝐹 𝑂𝑅𝑆 ← fors_pkFromSig(SIG𝐹 𝑂𝑅𝑆 , 𝑚𝑑, PK.seed, ADRS)                    ▷ get FORS key
17: SIG𝐻𝑇 ← ht_sign(PK𝐹 𝑂𝑅𝑆 , SK.seed, PK.seed, 𝑖𝑑𝑥𝑡𝑟𝑒𝑒 , 𝑖𝑑𝑥𝑙𝑒𝑎𝑓 )
18: SIG ← SIG ∥ SIG𝐻𝑇
19: return SIG
```

## 公式或伪代码

以下保留 source 提取稿中的算法标题、输入/输出和伪代码；分页造成的空白/字形异常以 PDF 为准。

```text
Algorithm 19 slh_sign_internal(𝑀, SK, 𝑎𝑑𝑑𝑟𝑛𝑑)
Generates an SLH-DSA signature.
Input: Message 𝑀, private key SK = (SK.seed, SK.prf, PK.seed, PK.root),
       (optional) additional randomness 𝑎𝑑𝑑𝑟𝑛𝑑.
Output: SLH-DSA signature SIG.
  1: ADRS ← toByte(0, 32)

 2: 𝑜𝑝𝑡_𝑟𝑎𝑛𝑑 ← 𝑎𝑑𝑑𝑟𝑛𝑑    ▷ substitute 𝑜𝑝𝑡_𝑟𝑎𝑛𝑑 ← PK.seed for the deterministic variant
 3: 𝑅 ← PRF𝑚𝑠𝑔 (SK.prf, 𝑜𝑝𝑡_𝑟𝑎𝑛𝑑, 𝑀 )                         ▷ generate randomizer
 4: SIG ← 𝑅

 5: 𝑑𝑖𝑔𝑒𝑠𝑡 ← H𝑚𝑠𝑔 (𝑅, PK.seed, PK.root, 𝑀 )                        ▷ compute message digest
 6: 𝑚𝑑 ← 𝑑𝑖𝑔𝑒𝑠𝑡 [0 ∶ ⌈ 𝑘⋅𝑎
                        8 ⌉]                                              ▷ first ⌈ 𝑘⋅𝑎
                                                                                     8 ⌉ bytes
                                          ℎ−ℎ/𝑑                                 ℎ−ℎ/𝑑
 7: 𝑡𝑚𝑝_𝑖𝑑𝑥𝑡𝑟𝑒𝑒 ← 𝑑𝑖𝑔𝑒𝑠𝑡 [⌈ 𝑘⋅𝑎   𝑘⋅𝑎
                             8 ⌉∶⌈ 8 ⌉+⌈    8 ⌉]                       ▷ next ⌈ 8 ⌉ bytes
                                    ℎ−ℎ/𝑑           ℎ−ℎ/𝑑
 8: 𝑡𝑚𝑝_𝑖𝑑𝑥𝑙𝑒𝑎𝑓 ← 𝑑𝑖𝑔𝑒𝑠𝑡 [⌈ 𝑘⋅𝑎              𝑘⋅𝑎             ℎ
                             8 ⌉ + ⌈ 8 ⌉ ∶ ⌈ 8 ⌉ + ⌈ 8 ⌉ + ⌈ 8𝑑 ⌉]
                                                                                    ℎ
                                                                           ▷ next ⌈ 8𝑑 ⌉ bytes

 9: 𝑖𝑑𝑥𝑡𝑟𝑒𝑒 ← toInt (𝑡𝑚𝑝_𝑖𝑑𝑥𝑡𝑟𝑒𝑒 , ⌈
                                     ℎ−ℎ/𝑑          ℎ−ℎ/𝑑
                                        8 ⌉) mod 2
10: 𝑖𝑑𝑥𝑙𝑒𝑎𝑓 ← toInt (𝑡𝑚𝑝_𝑖𝑑𝑥𝑙𝑒𝑎𝑓 , ⌈ 8𝑑
                                     ℎ
                                        ⌉) mod 2ℎ/𝑑
11: ADRS.setTreeAddress(𝑖𝑑𝑥𝑡𝑟𝑒𝑒 )
12: ADRS.setTypeAndClear(FORS_TREE)
13: ADRS.setKeyPairAddress(𝑖𝑑𝑥𝑙𝑒𝑎𝑓 )
14: SIG𝐹 𝑂𝑅𝑆 ← fors_sign(𝑚𝑑, SK.seed, PK.seed, ADRS)
15: SIG ← SIG ∥ SIG𝐹 𝑂𝑅𝑆

16: PK𝐹 𝑂𝑅𝑆 ← fors_pkFromSig(SIG𝐹 𝑂𝑅𝑆 , 𝑚𝑑, PK.seed, ADRS)                    ▷ get FORS key
17: SIG𝐻𝑇 ← ht_sign(PK𝐹 𝑂𝑅𝑆 , SK.seed, PK.seed, 𝑖𝑑𝑥𝑡𝑟𝑒𝑒 , 𝑖𝑑𝑥𝑙𝑒𝑎𝑓 )
18: SIG ← SIG ∥ SIG𝐻𝑇
19: return SIG
```

## 输入与输出

以算法正文中的 `Input` / `Output` 为准；字节串长度、`n`、`a`、`k`、`h′`、`d`、`len` 和地址类型必须绑定所选标准参数集。算法返回错误或布尔值时，错误语义也属于接口边界。

## 项目映射

完整 H_msg、FORS 和 hypertree 编排尚未实现。

## 核验与缺项

- 原文覆盖：Algorithm 19 已独立定位到 source 第 1876 行。
- 结构核验：实现/教学块不得以同名替换标准函数；必须区分“标准算法”“项目映射”和“未实现”。
- 向量核验：待接入 FIPS 205/CAVP 完整 SLH-DSA KAT；当前项目已有 demo 只能证明明确列出的教学性质。
