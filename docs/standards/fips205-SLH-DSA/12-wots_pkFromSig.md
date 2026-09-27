# Algorithm 8 — 由签名恢复 WOTS+ 公钥（FIPS 205）

## 条目元数据

| 字段 | 内容 |
|---|---|
| 类型 | 函数 |
| 标准定位 | FIPS 205 §5.3，Algorithm 8 `wots_pkFromSig` |
| 原文证据 | [FIPS 205 source](./00-Standard-Source.md#L1250) · [PDF](./NIST.FIPS.205.pdf) |
| 原文位置 | `00-Standard-Source.md` 第 1250 行起；PDF 物理页以 PDF 视觉版式核对 |
| 项目状态 | 仅参考 |

## 标准定义

Computes a WOTS+ public key from a message and its signature. 本页只承载 Algorithm 8 的独立定义；依赖的函数、地址和参数仍按 FIPS 205 的对应章节解释，不能用项目教学参数反推标准参数。

## 原文定位与引用

该条目从 [FIPS 205 原文提取稿](./00-Standard-Source.md#L1250) 拆出。完整正文、公式、脚注和上下文回到 source 及同目录 PDF 核验。

## 原文摘录
> 以下为 source 中 Algorithm 8 的完整原文算法块；仅移除了 PDF 分页标记和页眉页码。

```text
Algorithm 8 wots_pkFromSig(𝑠𝑖𝑔, 𝑀, PK.seed, ADRS)
Computes a WOTS+ public key from a message and its signature.
Input: WOTS+ signature 𝑠𝑖𝑔, message 𝑀, public seed PK.seed, address ADRS.
Output: WOTS+ public key 𝑝𝑘𝑠𝑖𝑔 derived from 𝑠𝑖𝑔.
  1: 𝑐𝑠𝑢𝑚 ← 0

 2: 𝑚𝑠𝑔 ← base_2b (𝑀 , 𝑙𝑔𝑤 , 𝑙𝑒𝑛1 )                                  ▷ convert message to base 𝑤
 3: for 𝑖 from 0 to 𝑙𝑒𝑛1 − 1 do                                              ▷ compute checksum
 4:     𝑐𝑠𝑢𝑚 ← 𝑐𝑠𝑢𝑚 + 𝑤 − 1 − 𝑚𝑠𝑔[𝑖]
 5: end for

 6: 𝑐𝑠𝑢𝑚 ← 𝑐𝑠𝑢𝑚 ≪ ((8 − ((𝑙𝑒𝑛2 ⋅ 𝑙𝑔𝑤 ) mod 8)) mod 8)                  ▷ for 𝑙𝑔𝑤 = 4, left shift by 4
 7: 𝑚𝑠𝑔 ← 𝑚𝑠𝑔 ∥ base_2b (toByte (𝑐𝑠𝑢𝑚, ⌈
                                               𝑙𝑒𝑛2 ⋅𝑙𝑔𝑤
                                                  8      ⌉) , 𝑙𝑔𝑤 , 𝑙𝑒𝑛2 )    ▷ convert to base 𝑤
 8: for 𝑖 from 0 to 𝑙𝑒𝑛 − 1 do
 9:     ADRS.setChainAddress(𝑖)
10:     𝑡𝑚𝑝[𝑖] ← chain(𝑠𝑖𝑔[𝑖], 𝑚𝑠𝑔[𝑖], 𝑤 − 1 − 𝑚𝑠𝑔[𝑖], PK.seed, ADRS)
11: end for
12: wotspkADRS ← ADRS                    ▷ copy address to create WOTS+ public key address
13: wotspkADRS.setTypeAndClear(WOTS_PK)
14: wotspkADRS.setKeyPairAddress(ADRS.getKeyPairAddress())
15: 𝑝𝑘𝑠𝑖𝑔 ← T𝑙𝑒𝑛 (PK.seed, wotspkADRS, 𝑡𝑚𝑝)
16: return 𝑝𝑘𝑠𝑖𝑔
```

## 公式或伪代码

以下保留 source 提取稿中的算法标题、输入/输出和伪代码；分页造成的空白/字形异常以 PDF 为准。

```text
Algorithm 8 wots_pkFromSig(𝑠𝑖𝑔, 𝑀, PK.seed, ADRS)
Computes a WOTS+ public key from a message and its signature.
Input: WOTS+ signature 𝑠𝑖𝑔, message 𝑀, public seed PK.seed, address ADRS.
Output: WOTS+ public key 𝑝𝑘𝑠𝑖𝑔 derived from 𝑠𝑖𝑔.
  1: 𝑐𝑠𝑢𝑚 ← 0

 2: 𝑚𝑠𝑔 ← base_2b (𝑀 , 𝑙𝑔𝑤 , 𝑙𝑒𝑛1 )                                  ▷ convert message to base 𝑤
 3: for 𝑖 from 0 to 𝑙𝑒𝑛1 − 1 do                                              ▷ compute checksum
 4:     𝑐𝑠𝑢𝑚 ← 𝑐𝑠𝑢𝑚 + 𝑤 − 1 − 𝑚𝑠𝑔[𝑖]
 5: end for

 6: 𝑐𝑠𝑢𝑚 ← 𝑐𝑠𝑢𝑚 ≪ ((8 − ((𝑙𝑒𝑛2 ⋅ 𝑙𝑔𝑤 ) mod 8)) mod 8)                  ▷ for 𝑙𝑔𝑤 = 4, left shift by 4
 7: 𝑚𝑠𝑔 ← 𝑚𝑠𝑔 ∥ base_2b (toByte (𝑐𝑠𝑢𝑚, ⌈
                                               𝑙𝑒𝑛2 ⋅𝑙𝑔𝑤
                                                  8      ⌉) , 𝑙𝑔𝑤 , 𝑙𝑒𝑛2 )    ▷ convert to base 𝑤
 8: for 𝑖 from 0 to 𝑙𝑒𝑛 − 1 do
 9:     ADRS.setChainAddress(𝑖)
10:     𝑡𝑚𝑝[𝑖] ← chain(𝑠𝑖𝑔[𝑖], 𝑚𝑠𝑔[𝑖], 𝑤 − 1 − 𝑚𝑠𝑔[𝑖], PK.seed, ADRS)
11: end for
12: wotspkADRS ← ADRS                    ▷ copy address to create WOTS+ public key address
13: wotspkADRS.setTypeAndClear(WOTS_PK)
14: wotspkADRS.setKeyPairAddress(ADRS.getKeyPairAddress())
15: 𝑝𝑘𝑠𝑖𝑔 ← T𝑙𝑒𝑛 (PK.seed, wotspkADRS, 𝑡𝑚𝑝)
16: return 𝑝𝑘𝑠𝑖𝑔
```

## 输入与输出

以算法正文中的 `Input` / `Output` 为准；字节串长度、`n`、`a`、`k`、`h′`、`d`、`len` 和地址类型必须绑定所选标准参数集。算法返回错误或布尔值时，错误语义也属于接口边界。

## 项目映射

没有独立块；由上层验证流程内部实现。

## 核验与缺项

- 原文覆盖：Algorithm 8 已独立定位到 source 第 1250 行。
- 结构核验：实现/教学块不得以同名替换标准函数；必须区分“标准算法”“项目映射”和“未实现”。
- 向量核验：待接入 FIPS 205/CAVP 完整 SLH-DSA KAT；当前项目已有 demo 只能证明明确列出的教学性质。
