# Algorithm 10 — XMSS 签名生成（FIPS 205）

## 条目元数据

| 字段 | 内容 |
|---|---|
| 类型 | 函数 |
| 标准定位 | FIPS 205 §6.2，Algorithm 10 `xmss_sign` |
| 原文证据 | [FIPS 205 source](./00-Standard-Source.md#L1375) · [PDF](./NIST.FIPS.205.pdf) |
| 原文位置 | `00-Standard-Source.md` 第 1375 行起；PDF 物理页以 PDF 视觉版式核对 |
| 项目状态 | 仅参考 |

## 标准定义

Generates an XMSS signature. 本页只承载 Algorithm 10 的独立定义；依赖的函数、地址和参数仍按 FIPS 205 的对应章节解释，不能用项目教学参数反推标准参数。

## 原文定位与引用

该条目从 [FIPS 205 原文提取稿](./00-Standard-Source.md#L1375) 拆出。完整正文、公式、脚注和上下文回到 source 及同目录 PDF 核验。

## 原文摘录
> 以下为 source 中 Algorithm 10 的完整原文算法块；仅移除了 PDF 分页标记和页眉页码。

```text
Algorithm 10 xmss_sign(𝑀, SK.seed, 𝑖𝑑𝑥, PK.seed, ADRS)
Generates an XMSS signature.
Input: 𝑛-byte message 𝑀, secret seed SK.seed, index 𝑖𝑑𝑥, public seed PK.seed,
        address ADRS.
Output: XMSS signature SIG𝑋𝑀𝑆𝑆 = (𝑠𝑖𝑔 ∥ AUTH).
  1: for 𝑗 from 0 to ℎ′ − 1 do                                  ▷ build authentication path
                      𝑗
  2:     𝑘 ← ⌊𝑖𝑑𝑥/2 ⌋ ⊕ 1
  3:     AUTH[𝑗] ← xmss_node(SK.seed, 𝑘, 𝑗, PK.seed, ADRS)
  4: end for

 5: ADRS.setTypeAndClear(WOTS_HASH)
 6: ADRS.setKeyPairAddress(𝑖𝑑𝑥)
 7: 𝑠𝑖𝑔 ← wots_sign(𝑀 , SK.seed, PK.seed, ADRS)
 8: SIG𝑋𝑀𝑆𝑆 ← 𝑠𝑖𝑔 ∥ AUTH
 9: return SIG𝑋𝑀𝑆𝑆
```

## 公式或伪代码

以下保留 source 提取稿中的算法标题、输入/输出和伪代码；分页造成的空白/字形异常以 PDF 为准。

```text
Algorithm 10 xmss_sign(𝑀, SK.seed, 𝑖𝑑𝑥, PK.seed, ADRS)
Generates an XMSS signature.
Input: 𝑛-byte message 𝑀, secret seed SK.seed, index 𝑖𝑑𝑥, public seed PK.seed,
        address ADRS.
Output: XMSS signature SIG𝑋𝑀𝑆𝑆 = (𝑠𝑖𝑔 ∥ AUTH).
  1: for 𝑗 from 0 to ℎ′ − 1 do                                  ▷ build authentication path
                      𝑗
  2:     𝑘 ← ⌊𝑖𝑑𝑥/2 ⌋ ⊕ 1
  3:     AUTH[𝑗] ← xmss_node(SK.seed, 𝑘, 𝑗, PK.seed, ADRS)
  4: end for

 5: ADRS.setTypeAndClear(WOTS_HASH)
 6: ADRS.setKeyPairAddress(𝑖𝑑𝑥)
 7: 𝑠𝑖𝑔 ← wots_sign(𝑀 , SK.seed, PK.seed, ADRS)
 8: SIG𝑋𝑀𝑆𝑆 ← 𝑠𝑖𝑔 ∥ AUTH
 9: return SIG𝑋𝑀𝑆𝑆
```

Figure 12. Merkle hash tree (ASCII transcription)

                         n3,0 = H(n2,0 || n2,1)
                         /                 \
       n2,0 = H(n1,0 || n1,1)       n2,1 = H(n1,2 || n1,3)
              /             \               /             \
 n1,0 = H(K0 || K1)  n1,1 = H(K2 || K3)  n1,2 = H(K4 || K5)  n1,3 = H(K6 || K7)
          /       \          /       \          /       \          /       \
        K0         K1       K2         K3       K4         K5       K6         K7
```

## 输入与输出

以算法正文中的 `Input` / `Output` 为准；字节串长度、`n`、`a`、`k`、`h′`、`d`、`len` 和地址类型必须绑定所选标准参数集。算法返回错误或布尔值时，错误语义也属于接口边界。

## 项目映射

没有独立块；认证路径和 WOTS+ 签名由上层流程内部实现。

## 核验与缺项

- 原文覆盖：Algorithm 10 已独立定位到 source 第 1375 行。
- 结构核验：实现/教学块不得以同名替换标准函数；必须区分“标准算法”“项目映射”和“未实现”。
- 向量核验：待接入 FIPS 205/CAVP 完整 SLH-DSA KAT；当前项目已有 demo 只能证明明确列出的教学性质。
