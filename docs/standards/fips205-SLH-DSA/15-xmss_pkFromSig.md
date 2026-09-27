# Algorithm 11 — 由签名恢复 XMSS 公钥（FIPS 205）

## 条目元数据

| 字段 | 内容 |
|---|---|
| 类型 | 函数 |
| 标准定位 | FIPS 205 §6.3，Algorithm 11 `xmss_pkFromSig` |
| 原文证据 | [FIPS 205 source](./00-Standard-Source.md#L1430) · [PDF](./NIST.FIPS.205.pdf) |
| 原文位置 | `00-Standard-Source.md` 第 1430 行起；PDF 物理页以 PDF 视觉版式核对 |
| 项目状态 | 仅参考 |

## 标准定义

Computes an XMSS public key from an XMSS signature. 本页只承载 Algorithm 11 的独立定义；依赖的函数、地址和参数仍按 FIPS 205 的对应章节解释，不能用项目教学参数反推标准参数。

## 原文定位与引用

该条目从 [FIPS 205 原文提取稿](./00-Standard-Source.md#L1430) 拆出。完整正文、公式、脚注和上下文回到 source 及同目录 PDF 核验。

## 原文摘录
> 以下为 source 中 Algorithm 11 的完整原文算法块；仅移除了 PDF 分页标记和页眉页码。

```text
Algorithm 11 xmss_pkFromSig(𝑖𝑑𝑥, SIG𝑋𝑀𝑆𝑆 , 𝑀, PK.seed, ADRS)
Computes an XMSS public key from an XMSS signature.
Input: Index 𝑖𝑑𝑥, XMSS signature SIG𝑋𝑀𝑆𝑆 = (𝑠𝑖𝑔 ∥ AUTH), 𝑛-byte message 𝑀,
       public seed PK.seed, address ADRS.
Output: 𝑛-byte root value 𝑛𝑜𝑑𝑒[0].
  1: ADRS.setTypeAndClear(WOTS_HASH)               ▷ compute WOTS+ pk from WOTS+ 𝑠𝑖𝑔
  2: ADRS.setKeyPairAddress(𝑖𝑑𝑥)
  3: 𝑠𝑖𝑔 ← SIG𝑋𝑀𝑆𝑆 .getWOTSSig()                                 ▷ SIG𝑋𝑀𝑆𝑆 [0 ∶ 𝑙𝑒𝑛 ⋅ 𝑛]
  4: AUTH ← SIG𝑋𝑀𝑆𝑆 .getXMSSAUTH()                    ▷ SIG𝑋𝑀𝑆𝑆 [𝑙𝑒𝑛 ⋅ 𝑛 ∶ (𝑙𝑒𝑛 + ℎ′ ) ⋅ 𝑛]
  5: 𝑛𝑜𝑑𝑒[0] ← wots_pkFromSig(𝑠𝑖𝑔, 𝑀 , PK.seed, ADRS)

 6: ADRS.setTypeAndClear(TREE)              ▷ compute root from WOTS+ pk and AUTH
 7: ADRS.setTreeIndex(𝑖𝑑𝑥)
 8: for 𝑘 from 0 to ℎ′ − 1 do
 9:     ADRS.setTreeHeight(𝑘 + 1)
10:     if ⌊𝑖𝑑𝑥/2𝑘 ⌋ is even then
11:          ADRS.setTreeIndex(ADRS.getTreeIndex()/2)
12:          𝑛𝑜𝑑𝑒[1] ← H(PK.seed, ADRS, 𝑛𝑜𝑑𝑒[0] ∥ AUTH[𝑘])
13:     else
14:          ADRS.setTreeIndex((ADRS.getTreeIndex() − 1)/2)
15:          𝑛𝑜𝑑𝑒[1] ← H(PK.seed, ADRS, AUTH[𝑘] ∥ 𝑛𝑜𝑑𝑒[0])
16:     end if
17:     𝑛𝑜𝑑𝑒[0] ← 𝑛𝑜𝑑𝑒[1]
18: end for
19: return 𝑛𝑜𝑑𝑒[0]
```

## 公式或伪代码

以下保留 source 提取稿中的算法标题、输入/输出和伪代码；分页造成的空白/字形异常以 PDF 为准。

```text
Algorithm 11 xmss_pkFromSig(𝑖𝑑𝑥, SIG𝑋𝑀𝑆𝑆 , 𝑀, PK.seed, ADRS)
Computes an XMSS public key from an XMSS signature.
Input: Index 𝑖𝑑𝑥, XMSS signature SIG𝑋𝑀𝑆𝑆 = (𝑠𝑖𝑔 ∥ AUTH), 𝑛-byte message 𝑀,
       public seed PK.seed, address ADRS.
Output: 𝑛-byte root value 𝑛𝑜𝑑𝑒[0].
  1: ADRS.setTypeAndClear(WOTS_HASH)               ▷ compute WOTS+ pk from WOTS+ 𝑠𝑖𝑔
  2: ADRS.setKeyPairAddress(𝑖𝑑𝑥)
  3: 𝑠𝑖𝑔 ← SIG𝑋𝑀𝑆𝑆 .getWOTSSig()                                 ▷ SIG𝑋𝑀𝑆𝑆 [0 ∶ 𝑙𝑒𝑛 ⋅ 𝑛]
  4: AUTH ← SIG𝑋𝑀𝑆𝑆 .getXMSSAUTH()                    ▷ SIG𝑋𝑀𝑆𝑆 [𝑙𝑒𝑛 ⋅ 𝑛 ∶ (𝑙𝑒𝑛 + ℎ′ ) ⋅ 𝑛]
  5: 𝑛𝑜𝑑𝑒[0] ← wots_pkFromSig(𝑠𝑖𝑔, 𝑀 , PK.seed, ADRS)

 6: ADRS.setTypeAndClear(TREE)              ▷ compute root from WOTS+ pk and AUTH
 7: ADRS.setTreeIndex(𝑖𝑑𝑥)
 8: for 𝑘 from 0 to ℎ′ − 1 do
 9:     ADRS.setTreeHeight(𝑘 + 1)
10:     if ⌊𝑖𝑑𝑥/2𝑘 ⌋ is even then
11:          ADRS.setTreeIndex(ADRS.getTreeIndex()/2)
12:          𝑛𝑜𝑑𝑒[1] ← H(PK.seed, ADRS, 𝑛𝑜𝑑𝑒[0] ∥ AUTH[𝑘])
13:     else
14:          ADRS.setTreeIndex((ADRS.getTreeIndex() − 1)/2)
15:          𝑛𝑜𝑑𝑒[1] ← H(PK.seed, ADRS, AUTH[𝑘] ∥ 𝑛𝑜𝑑𝑒[0])
16:     end if
17:     𝑛𝑜𝑑𝑒[0] ← 𝑛𝑜𝑑𝑒[1]
18: end for
19: return 𝑛𝑜𝑑𝑒[0]
```

## 输入与输出

以算法正文中的 `Input` / `Output` 为准；字节串长度、`n`、`a`、`k`、`h′`、`d`、`len` 和地址类型必须绑定所选标准参数集。算法返回错误或布尔值时，错误语义也属于接口边界。

## 项目映射

没有独立块；由上层验证流程内部实现。

## 核验与缺项

- 原文覆盖：Algorithm 11 已独立定位到 source 第 1430 行。
- 结构核验：实现/教学块不得以同名替换标准函数；必须区分“标准算法”“项目映射”和“未实现”。
- 向量核验：待接入 FIPS 205/CAVP 完整 SLH-DSA KAT；当前项目已有 demo 只能证明明确列出的教学性质。
