# Algorithm 20 — SLH-DSA 内部验证（FIPS 205）

## 条目元数据

| 字段 | 内容 |
|---|---|
| 类型 | 函数 |
| 标准定位 | FIPS 205 §9.3，Algorithm 20 `slh_verify_internal` |
| 原文证据 | [FIPS 205 source](./00-Standard-Source.md#L1942) · [PDF](./NIST.FIPS.205.pdf) |
| 原文位置 | `00-Standard-Source.md` 第 1942 行起；PDF 物理页以 PDF 视觉版式核对 |
| 项目状态 | 仅参考 |

## 标准定义

Verifies an SLH-DSA signature. 本页只承载 Algorithm 20 的独立定义；依赖的函数、地址和参数仍按 FIPS 205 的对应章节解释，不能用项目教学参数反推标准参数。

## 原文定位与引用

该条目从 [FIPS 205 原文提取稿](./00-Standard-Source.md#L1942) 拆出。完整正文、公式、脚注和上下文回到 source 及同目录 PDF 核验。

## 原文摘录
> 以下为 source 中 Algorithm 20 的完整原文算法块；仅移除了 PDF 分页标记和页眉页码。

```text
Algorithm 20 slh_verify_internal(𝑀, SIG, PK)
Verifies an SLH-DSA signature.
Input: Message 𝑀, signature SIG, public key PK = (PK.seed, PK.root).
Output: Boolean.
  1: if |SIG| ≠ (1 + 𝑘(1 + 𝑎) + ℎ + 𝑑 ⋅ 𝑙𝑒𝑛) ⋅ 𝑛 then
  2:      return false
  3: end if
  4: ADRS ← toByte(0, 32)
  5: 𝑅 ← SIG.getR()                                                              ▷ SIG[0 ∶ 𝑛]
  6: SIG𝐹 𝑂𝑅𝑆 ← SIG.getSIG_FORS()                                ▷ SIG[𝑛 ∶ (1 + 𝑘(1 + 𝑎)) ⋅ 𝑛]
  7: SIG𝐻𝑇 ← SIG.getSIG_HT()      ▷ SIG[(1 + 𝑘(1 + 𝑎)) ⋅ 𝑛 ∶ (1 + 𝑘(1 + 𝑎) + ℎ + 𝑑 ⋅ 𝑙𝑒𝑛) ⋅ 𝑛]
 8: 𝑑𝑖𝑔𝑒𝑠𝑡 ← H𝑚𝑠𝑔 (𝑅, PK.seed, PK.root, 𝑀 )                          ▷ compute message digest
 9: 𝑚𝑑 ← 𝑑𝑖𝑔𝑒𝑠𝑡 [0 ∶ ⌈ 𝑘⋅𝑎
                        8 ⌉]                                                ▷ first ⌈ 𝑘⋅𝑎
                                                                                       8 ⌉ bytes
                                          ℎ−ℎ/𝑑                                   ℎ−ℎ/𝑑
10: 𝑡𝑚𝑝_𝑖𝑑𝑥𝑡𝑟𝑒𝑒 ← 𝑑𝑖𝑔𝑒𝑠𝑡 [⌈ 𝑘⋅𝑎   𝑘⋅𝑎
                             8 ⌉∶⌈ 8 ⌉+⌈    8 ⌉]                         ▷ next ⌈ 8 ⌉ bytes
                                    ℎ−ℎ/𝑑           ℎ−ℎ/𝑑    ℎ                          ℎ
11: 𝑡𝑚𝑝_𝑖𝑑𝑥𝑙𝑒𝑎𝑓 ← 𝑑𝑖𝑔𝑒𝑠𝑡 [⌈ 𝑘⋅𝑎              𝑘⋅𝑎
                             8 ⌉ + ⌈ 8 ⌉ ∶ ⌈ 8 ⌉ + ⌈ 8 ⌉ + ⌈ 8𝑑 ⌉]             ▷ next ⌈ 8𝑑 ⌉ bytes

12: 𝑖𝑑𝑥𝑡𝑟𝑒𝑒 ← toInt (𝑡𝑚𝑝_𝑖𝑑𝑥𝑡𝑟𝑒𝑒 , ⌈
                                     ℎ−ℎ/𝑑          ℎ−ℎ/𝑑
                                        8 ⌉) mod 2
13: 𝑖𝑑𝑥𝑙𝑒𝑎𝑓 ← toInt (𝑡𝑚𝑝_𝑖𝑑𝑥𝑙𝑒𝑎𝑓 , ⌈ 8𝑑
                                     ℎ
                                        ⌉) mod 2ℎ/𝑑
14: ADRS.setTreeAddress(𝑖𝑑𝑥𝑡𝑟𝑒𝑒 )                                    ▷ compute FORS public key
15: ADRS.setTypeAndClear(FORS_TREE)
16: ADRS.setKeyPairAddress(𝑖𝑑𝑥𝑙𝑒𝑎𝑓 )

17: PK𝐹 𝑂𝑅𝑆 ← fors_pkFromSig(SIG𝐹 𝑂𝑅𝑆 , 𝑚𝑑, PK.seed, ADRS)

18: return ht_verify(PK𝐹 𝑂𝑅𝑆 , SIG𝐻𝑇 , PK.seed, 𝑖𝑑𝑥𝑡𝑟𝑒𝑒 , 𝑖𝑑𝑥𝑙𝑒𝑎𝑓 , PK.root)
```

## 公式或伪代码

以下保留 source 提取稿中的算法标题、输入/输出和伪代码；分页造成的空白/字形异常以 PDF 为准。

```text
Algorithm 20 slh_verify_internal(𝑀, SIG, PK)
Verifies an SLH-DSA signature.
Input: Message 𝑀, signature SIG, public key PK = (PK.seed, PK.root).
Output: Boolean.
  1: if |SIG| ≠ (1 + 𝑘(1 + 𝑎) + ℎ + 𝑑 ⋅ 𝑙𝑒𝑛) ⋅ 𝑛 then
  2:      return false
  3: end if
  4: ADRS ← toByte(0, 32)
  5: 𝑅 ← SIG.getR()                                                              ▷ SIG[0 ∶ 𝑛]
  6: SIG𝐹 𝑂𝑅𝑆 ← SIG.getSIG_FORS()                                ▷ SIG[𝑛 ∶ (1 + 𝑘(1 + 𝑎)) ⋅ 𝑛]
  7: SIG𝐻𝑇 ← SIG.getSIG_HT()      ▷ SIG[(1 + 𝑘(1 + 𝑎)) ⋅ 𝑛 ∶ (1 + 𝑘(1 + 𝑎) + ℎ + 𝑑 ⋅ 𝑙𝑒𝑛) ⋅ 𝑛]
 8: 𝑑𝑖𝑔𝑒𝑠𝑡 ← H𝑚𝑠𝑔 (𝑅, PK.seed, PK.root, 𝑀 )                          ▷ compute message digest
 9: 𝑚𝑑 ← 𝑑𝑖𝑔𝑒𝑠𝑡 [0 ∶ ⌈ 𝑘⋅𝑎
                        8 ⌉]                                                ▷ first ⌈ 𝑘⋅𝑎
                                                                                       8 ⌉ bytes
                                          ℎ−ℎ/𝑑                                   ℎ−ℎ/𝑑
10: 𝑡𝑚𝑝_𝑖𝑑𝑥𝑡𝑟𝑒𝑒 ← 𝑑𝑖𝑔𝑒𝑠𝑡 [⌈ 𝑘⋅𝑎   𝑘⋅𝑎
                             8 ⌉∶⌈ 8 ⌉+⌈    8 ⌉]                         ▷ next ⌈ 8 ⌉ bytes
                                    ℎ−ℎ/𝑑           ℎ−ℎ/𝑑    ℎ                          ℎ
11: 𝑡𝑚𝑝_𝑖𝑑𝑥𝑙𝑒𝑎𝑓 ← 𝑑𝑖𝑔𝑒𝑠𝑡 [⌈ 𝑘⋅𝑎              𝑘⋅𝑎
                             8 ⌉ + ⌈ 8 ⌉ ∶ ⌈ 8 ⌉ + ⌈ 8 ⌉ + ⌈ 8𝑑 ⌉]             ▷ next ⌈ 8𝑑 ⌉ bytes

12: 𝑖𝑑𝑥𝑡𝑟𝑒𝑒 ← toInt (𝑡𝑚𝑝_𝑖𝑑𝑥𝑡𝑟𝑒𝑒 , ⌈
                                     ℎ−ℎ/𝑑          ℎ−ℎ/𝑑
                                        8 ⌉) mod 2
13: 𝑖𝑑𝑥𝑙𝑒𝑎𝑓 ← toInt (𝑡𝑚𝑝_𝑖𝑑𝑥𝑙𝑒𝑎𝑓 , ⌈ 8𝑑
                                     ℎ
                                        ⌉) mod 2ℎ/𝑑
14: ADRS.setTreeAddress(𝑖𝑑𝑥𝑡𝑟𝑒𝑒 )                                    ▷ compute FORS public key
15: ADRS.setTypeAndClear(FORS_TREE)
16: ADRS.setKeyPairAddress(𝑖𝑑𝑥𝑙𝑒𝑎𝑓 )

17: PK𝐹 𝑂𝑅𝑆 ← fors_pkFromSig(SIG𝐹 𝑂𝑅𝑆 , 𝑚𝑑, PK.seed, ADRS)

18: return ht_verify(PK𝐹 𝑂𝑅𝑆 , SIG𝐻𝑇 , PK.seed, 𝑖𝑑𝑥𝑡𝑟𝑒𝑒 , 𝑖𝑑𝑥𝑙𝑒𝑎𝑓 , PK.root)
```

## 输入与输出

以算法正文中的 `Input` / `Output` 为准；字节串长度、`n`、`a`、`k`、`h′`、`d`、`len` 和地址类型必须绑定所选标准参数集。算法返回错误或布尔值时，错误语义也属于接口边界。

## 项目映射

完整签名长度解析、FORS/超树恢复尚未实现。

## 核验与缺项

- 原文覆盖：Algorithm 20 已独立定位到 source 第 1942 行。
- 结构核验：实现/教学块不得以同名替换标准函数；必须区分“标准算法”“项目映射”和“未实现”。
- 向量核验：待接入 FIPS 205/CAVP 完整 SLH-DSA KAT；当前项目已有 demo 只能证明明确列出的教学性质。
