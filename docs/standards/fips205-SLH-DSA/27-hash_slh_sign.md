# Algorithm 23 — 预哈希 SLH-DSA 签名（FIPS 205）

## 条目元数据

| 字段 | 内容 |
|---|---|
| 类型 | 函数 |
| 标准定位 | FIPS 205 §10.2.2，Algorithm 23 `hash_slh_sign` |
| 原文证据 | [FIPS 205 source](./00-Standard-Source.md#L2128) · [PDF](./NIST.FIPS.205.pdf) |
| 原文位置 | `00-Standard-Source.md` 第 2128 行起；PDF 物理页以 PDF 视觉版式核对 |
| 项目状态 | 仅参考 |

## 标准定义

Generates a pre-hash SLH-DSA signature. 本页只承载 Algorithm 23 的独立定义；依赖的函数、地址和参数仍按 FIPS 205 的对应章节解释，不能用项目教学参数反推标准参数。

## 原文定位与引用

该条目从 [FIPS 205 原文提取稿](./00-Standard-Source.md#L2128) 拆出。完整正文、公式、脚注和上下文回到 source 及同目录 PDF 核验。

## 原文摘录
> 以下为 source 中 Algorithm 23 的完整原文算法块；仅移除了 PDF 分页标记和页眉页码。

```text
Algorithm 23 hash_slh_sign(𝑀, 𝑐𝑡𝑥, PH, SK)
Generates a pre-hash SLH-DSA signature.
Input: Message 𝑀, context string 𝑐𝑡𝑥, pre-hash function PH, private key SK.
Output: SLH-DSA signature SIG.
  1: if |𝑐𝑡𝑥| > 255 then
  2:      return ⊥                ▷ return an error indication if the context string is too long
  3: end if
              $
 4: 𝑎𝑑𝑑𝑟𝑛𝑑 ←  − 𝔹𝑛                        ▷ skip lines 4 through 7 for the deterministic variant
 5: if 𝑎𝑑𝑑𝑟𝑛𝑑 = NULL then
 6:     return ⊥                   ▷ return an error indication if random bit generation failed
 7: end if

 8: switch PH do
 9:    case SHA-256:
10:        OID ← toByte(0x0609608648016503040201, 11)                 ▷ 2.16.840.1.101.3.4.2.1
11:        PH𝑀 ← SHA-256(𝑀 )
12:     case SHA-512:
13:        OID ← toByte(0x0609608648016503040203, 11)             ▷ 2.16.840.1.101.3.4.2.3
14:        PH𝑀 ← SHA-512(𝑀 )
15:     case SHAKE128:
16:        OID ← toByte(0x060960864801650304020B, 11)            ▷ 2.16.840.1.101.3.4.2.11
17:        PH𝑀 ← SHAKE128(𝑀 , 256)
18:     case SHAKE256:
19:        OID ← toByte(0x060960864801650304020C, 11)            ▷ 2.16.840.1.101.3.4.2.12
20:        PH𝑀 ← SHAKE256(𝑀 , 512)
21:     case …                                     ▷ other approved hash functions or XOFs
22:        …
23: end switch
24: 𝑀 ′ ← toByte(1, 1) ∥ toByte(|𝑐𝑡𝑥|, 1) ∥ 𝑐𝑡𝑥 ∥ OID ∥ PH𝑀
25: SIG ← slh_sign_internal(𝑀 ′ , SK, 𝑎𝑑𝑑𝑟𝑛𝑑)    ▷ omit 𝑎𝑑𝑑𝑟𝑛𝑑 for the deterministic variant
26: return SIG
```

## 公式或伪代码

以下保留 source 提取稿中的算法标题、输入/输出和伪代码；分页造成的空白/字形异常以 PDF 为准。

```text
Algorithm 23 hash_slh_sign(𝑀, 𝑐𝑡𝑥, PH, SK)
Generates a pre-hash SLH-DSA signature.
Input: Message 𝑀, context string 𝑐𝑡𝑥, pre-hash function PH, private key SK.
Output: SLH-DSA signature SIG.
  1: if |𝑐𝑡𝑥| > 255 then
  2:      return ⊥                ▷ return an error indication if the context string is too long
  3: end if
              $
 4: 𝑎𝑑𝑑𝑟𝑛𝑑 ←  − 𝔹𝑛                        ▷ skip lines 4 through 7 for the deterministic variant
 5: if 𝑎𝑑𝑑𝑟𝑛𝑑 = NULL then
 6:     return ⊥                   ▷ return an error indication if random bit generation failed
 7: end if

 8: switch PH do
 9:    case SHA-256:
10:        OID ← toByte(0x0609608648016503040201, 11)                 ▷ 2.16.840.1.101.3.4.2.1
11:        PH𝑀 ← SHA-256(𝑀 )
12:     case SHA-512:
13:        OID ← toByte(0x0609608648016503040203, 11)             ▷ 2.16.840.1.101.3.4.2.3
14:        PH𝑀 ← SHA-512(𝑀 )
15:     case SHAKE128:
16:        OID ← toByte(0x060960864801650304020B, 11)            ▷ 2.16.840.1.101.3.4.2.11
17:        PH𝑀 ← SHAKE128(𝑀 , 256)
18:     case SHAKE256:
19:        OID ← toByte(0x060960864801650304020C, 11)            ▷ 2.16.840.1.101.3.4.2.12
20:        PH𝑀 ← SHAKE256(𝑀 , 512)
21:     case …                                     ▷ other approved hash functions or XOFs
22:        …
23: end switch
24: 𝑀 ′ ← toByte(1, 1) ∥ toByte(|𝑐𝑡𝑥|, 1) ∥ 𝑐𝑡𝑥 ∥ OID ∥ PH𝑀
25: SIG ← slh_sign_internal(𝑀 ′ , SK, 𝑎𝑑𝑑𝑟𝑛𝑑)    ▷ omit 𝑎𝑑𝑑𝑟𝑛𝑑 for the deterministic variant
26: return SIG
```

## 输入与输出

以算法正文中的 `Input` / `Output` 为准；字节串长度、`n`、`a`、`k`、`h′`、`d`、`len` 和地址类型必须绑定所选标准参数集。算法返回错误或布尔值时，错误语义也属于接口边界。

## 项目映射

预哈希外部 API 尚未实现；PH、OID 和上下文编码未接入。

## 核验与缺项

- 原文覆盖：Algorithm 23 已独立定位到 source 第 2128 行。
- 结构核验：实现/教学块不得以同名替换标准函数；必须区分“标准算法”“项目映射”和“未实现”。
- 向量核验：待接入 FIPS 205/CAVP 完整 SLH-DSA KAT；当前项目已有 demo 只能证明明确列出的教学性质。
