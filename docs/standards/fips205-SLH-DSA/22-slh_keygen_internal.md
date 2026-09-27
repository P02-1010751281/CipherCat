# Algorithm 18 — SLH-DSA 内部密钥生成（FIPS 205）

## 条目元数据

| 字段 | 内容 |
|---|---|
| 类型 | 函数 |
| 标准定位 | FIPS 205 §9.1，Algorithm 18 `slh_keygen_internal` |
| 原文证据 | [FIPS 205 source](./00-Standard-Source.md#L1841) · [PDF](./NIST.FIPS.205.pdf) |
| 原文位置 | `00-Standard-Source.md` 第 1841 行起；PDF 物理页以 PDF 视觉版式核对 |
| 项目状态 | 仅参考 |

## 标准定义

Generates an SLH-DSA key pair. 本页只承载 Algorithm 18 的独立定义；依赖的函数、地址和参数仍按 FIPS 205 的对应章节解释，不能用项目教学参数反推标准参数。

## 原文定位与引用

该条目从 [FIPS 205 原文提取稿](./00-Standard-Source.md#L1841) 拆出。完整正文、公式、脚注和上下文回到 source 及同目录 PDF 核验。

## 原文摘录
> 以下为 source 中 Algorithm 18 的完整原文算法块；仅移除了 PDF 分页标记和页眉页码。

```text
Algorithm 18 slh_keygen_internal(SK.seed, SK.prf, PK.seed)
Generates an SLH-DSA key pair.
Input: Secret seed SK.seed, PRF key SK.prf, public seed PK.seed
Output: SLH-DSA key pair (SK, PK).
  1: ADRS ← toByte(0, 32)             ▷ generate the public key for the top-level XMSS tree
  2: ADRS.setLayerAddress(𝑑 − 1)
  3: PK.root ← xmss_node(SK.seed, 0, ℎ′ , PK.seed, ADRS)

 4: return ( (SK.seed, SK.prf, PK.seed, PK.root), (PK.seed, PK.root) )
```

## 公式或伪代码

以下保留 source 提取稿中的算法标题、输入/输出和伪代码；分页造成的空白/字形异常以 PDF 为准。

```text
Algorithm 18 slh_keygen_internal(SK.seed, SK.prf, PK.seed)
Generates an SLH-DSA key pair.
Input: Secret seed SK.seed, PRF key SK.prf, public seed PK.seed
Output: SLH-DSA key pair (SK, PK).
  1: ADRS ← toByte(0, 32)             ▷ generate the public key for the top-level XMSS tree
  2: ADRS.setLayerAddress(𝑑 − 1)
  3: PK.root ← xmss_node(SK.seed, 0, ℎ′ , PK.seed, ADRS)

 4: return ( (SK.seed, SK.prf, PK.seed, PK.root), (PK.seed, PK.root) )
```

## 输入与输出

以算法正文中的 `Input` / `Output` 为准；字节串长度、`n`、`a`、`k`、`h′`、`d`、`len` 和地址类型必须绑定所选标准参数集。算法返回错误或布尔值时，错误语义也属于接口边界。

## 项目映射

完整超树根生成尚未实现；现有结构块不应冒充该 API。

## 核验与缺项

- 原文覆盖：Algorithm 18 已独立定位到 source 第 1841 行。
- 结构核验：实现/教学块不得以同名替换标准函数；必须区分“标准算法”“项目映射”和“未实现”。
- 向量核验：待接入 FIPS 205/CAVP 完整 SLH-DSA KAT；当前项目已有 demo 只能证明明确列出的教学性质。
