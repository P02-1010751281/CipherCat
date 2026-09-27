# Algorithm 13 — 超树签名验证（FIPS 205）

## 条目元数据

| 字段 | 内容 |
|---|---|
| 类型 | 函数 |
| 标准定位 | FIPS 205 §7.2，Algorithm 13 `ht_verify` |
| 原文证据 | [FIPS 205 source](./00-Standard-Source.md#L1557) · [PDF](./NIST.FIPS.205.pdf) |
| 原文位置 | `00-Standard-Source.md` 第 1557 行起；PDF 物理页以 PDF 视觉版式核对 |
| 项目状态 | 仅参考 |

## 标准定义

Verifies a hypertree signature. 本页只承载 Algorithm 13 的独立定义；依赖的函数、地址和参数仍按 FIPS 205 的对应章节解释，不能用项目教学参数反推标准参数。

## 原文定位与引用

该条目从 [FIPS 205 原文提取稿](./00-Standard-Source.md#L1557) 拆出。完整正文、公式、脚注和上下文回到 source 及同目录 PDF 核验。

## 原文摘录
> 以下为 source 中 Algorithm 13 的完整原文算法块；仅移除了 PDF 分页标记和页眉页码。

```text
Algorithm 13 ht_verify(𝑀, SIG𝐻𝑇 , PK.seed, 𝑖𝑑𝑥𝑡𝑟𝑒𝑒 , 𝑖𝑑𝑥𝑙𝑒𝑎𝑓 , PK.root)
Verifies a hypertree signature.
Input: Message 𝑀, signature SIG𝐻𝑇 , public seed PK.seed, tree index 𝑖𝑑𝑥𝑡𝑟𝑒𝑒 , leaf index 𝑖𝑑𝑥𝑙𝑒𝑎𝑓 ,
       HT public key PK.root.
Output: Boolean.
  1: ADRS ← toByte(0, 32)

 2: ADRS.setTreeAddress(𝑖𝑑𝑥𝑡𝑟𝑒𝑒 )
 3: SIG𝑡𝑚𝑝 ← SIG𝐻𝑇 .getXMSSSignature(0)                         ▷ SIG𝐻𝑇 [0 ∶ (ℎ′ + 𝑙𝑒𝑛) ⋅ 𝑛]
 4: 𝑛𝑜𝑑𝑒 ← xmss_pkFromSig(𝑖𝑑𝑥𝑙𝑒𝑎𝑓 , SIG𝑡𝑚𝑝 , 𝑀 , PK.seed, ADRS)
 5: for 𝑗 from 1 to 𝑑 − 1 do
                                 ′
 6:     𝑖𝑑𝑥𝑙𝑒𝑎𝑓 ← 𝑖𝑑𝑥𝑡𝑟𝑒𝑒 mod 2ℎ                        ▷ ℎ′ least significant bits of 𝑖𝑑𝑥𝑡𝑟𝑒𝑒
 7:     𝑖𝑑𝑥𝑡𝑟𝑒𝑒 ← 𝑖𝑑𝑥𝑡𝑟𝑒𝑒 ≫ ℎ′               ▷ remove least significant ℎ′ bits from 𝑖𝑑𝑥𝑡𝑟𝑒𝑒
 8:     ADRS.setLayerAddress(𝑗)
 9:     ADRS.setTreeAddress(𝑖𝑑𝑥𝑡𝑟𝑒𝑒 )
10:     SIG𝑡𝑚𝑝 ← SIG𝐻𝑇 .getXMSSSignature(𝑗) ▷ SIG𝐻𝑇 [𝑗 ⋅ (ℎ′ + 𝑙𝑒𝑛) ⋅ 𝑛 ∶ (𝑗 + 1)(ℎ′ + 𝑙𝑒𝑛) ⋅ 𝑛]
11:     𝑛𝑜𝑑𝑒 ← xmss_pkFromSig(𝑖𝑑𝑥𝑙𝑒𝑎𝑓 , SIG𝑡𝑚𝑝 , 𝑛𝑜𝑑𝑒, PK.seed, ADRS)
12: end for
13: if 𝑛𝑜𝑑𝑒 = PK.root then
14:     return true
15: else
16:     return false
17: end if
```

## 公式或伪代码

以下保留 source 提取稿中的算法标题、输入/输出和伪代码；分页造成的空白/字形异常以 PDF 为准。

```text
Algorithm 13 ht_verify(𝑀, SIG𝐻𝑇 , PK.seed, 𝑖𝑑𝑥𝑡𝑟𝑒𝑒 , 𝑖𝑑𝑥𝑙𝑒𝑎𝑓 , PK.root)
Verifies a hypertree signature.
Input: Message 𝑀, signature SIG𝐻𝑇 , public seed PK.seed, tree index 𝑖𝑑𝑥𝑡𝑟𝑒𝑒 , leaf index 𝑖𝑑𝑥𝑙𝑒𝑎𝑓 ,
       HT public key PK.root.
Output: Boolean.
  1: ADRS ← toByte(0, 32)

 2: ADRS.setTreeAddress(𝑖𝑑𝑥𝑡𝑟𝑒𝑒 )
 3: SIG𝑡𝑚𝑝 ← SIG𝐻𝑇 .getXMSSSignature(0)                         ▷ SIG𝐻𝑇 [0 ∶ (ℎ′ + 𝑙𝑒𝑛) ⋅ 𝑛]
 4: 𝑛𝑜𝑑𝑒 ← xmss_pkFromSig(𝑖𝑑𝑥𝑙𝑒𝑎𝑓 , SIG𝑡𝑚𝑝 , 𝑀 , PK.seed, ADRS)
 5: for 𝑗 from 1 to 𝑑 − 1 do
                                 ′
 6:     𝑖𝑑𝑥𝑙𝑒𝑎𝑓 ← 𝑖𝑑𝑥𝑡𝑟𝑒𝑒 mod 2ℎ                        ▷ ℎ′ least significant bits of 𝑖𝑑𝑥𝑡𝑟𝑒𝑒
 7:     𝑖𝑑𝑥𝑡𝑟𝑒𝑒 ← 𝑖𝑑𝑥𝑡𝑟𝑒𝑒 ≫ ℎ′               ▷ remove least significant ℎ′ bits from 𝑖𝑑𝑥𝑡𝑟𝑒𝑒
 8:     ADRS.setLayerAddress(𝑗)
 9:     ADRS.setTreeAddress(𝑖𝑑𝑥𝑡𝑟𝑒𝑒 )
10:     SIG𝑡𝑚𝑝 ← SIG𝐻𝑇 .getXMSSSignature(𝑗) ▷ SIG𝐻𝑇 [𝑗 ⋅ (ℎ′ + 𝑙𝑒𝑛) ⋅ 𝑛 ∶ (𝑗 + 1)(ℎ′ + 𝑙𝑒𝑛) ⋅ 𝑛]
11:     𝑛𝑜𝑑𝑒 ← xmss_pkFromSig(𝑖𝑑𝑥𝑙𝑒𝑎𝑓 , SIG𝑡𝑚𝑝 , 𝑛𝑜𝑑𝑒, PK.seed, ADRS)
12: end for
13: if 𝑛𝑜𝑑𝑒 = PK.root then
14:     return true
15: else
16:     return false
17: end if
```

## 输入与输出

以算法正文中的 `Input` / `Output` 为准；字节串长度、`n`、`a`、`k`、`h′`、`d`、`len` 和地址类型必须绑定所选标准参数集。算法返回错误或布尔值时，错误语义也属于接口边界。

## 项目映射

没有独立块；多层 XMSS 验证尚未实现。

## 核验与缺项

- 原文覆盖：Algorithm 13 已独立定位到 source 第 1557 行。
- 结构核验：实现/教学块不得以同名替换标准函数；必须区分“标准算法”“项目映射”和“未实现”。
- 向量核验：待接入 FIPS 205/CAVP 完整 SLH-DSA KAT；当前项目已有 demo 只能证明明确列出的教学性质。
