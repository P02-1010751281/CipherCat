# Algorithm 21 — SLH-DSA 外部密钥生成（FIPS 205）

## 条目元数据

| 字段 | 内容 |
|---|---|
| 类型 | 函数 |
| 标准定位 | FIPS 205 §10.1，Algorithm 21 `slh_keygen` |
| 原文证据 | [FIPS 205 source](./00-Standard-Source.md#L1996) · [PDF](./NIST.FIPS.205.pdf) |
| 原文位置 | `00-Standard-Source.md` 第 1996 行起；PDF 物理页以 PDF 视觉版式核对 |
| 项目状态 | 仅参考 |

## 标准定义

Generates an SLH-DSA key pair. 本页只承载 Algorithm 21 的独立定义；依赖的函数、地址和参数仍按 FIPS 205 的对应章节解释，不能用项目教学参数反推标准参数。

## 原文定位与引用

该条目从 [FIPS 205 原文提取稿](./00-Standard-Source.md#L1996) 拆出。完整正文、公式、脚注和上下文回到 source 及同目录 PDF 核验。

## 原文摘录
> 以下为 source 中 Algorithm 21 的完整原文算法块；仅移除了 PDF 分页标记和页眉页码。

```text
Algorithm 21 slh_keygen()
Generates an SLH-DSA key pair.
Input: (none)
Output: SLH-DSA key pair (SK, PK).
                       $
 1: SK.seed ←− 𝔹𝑛                               ▷ set SK.seed, SK.prf, and PK.seed to random 𝑛-byte
                   $
                           𝑛
 2: SK.prf ←−𝔹                                        ▷ strings using an approved random bit generator
                       $
 3: PK.seed ←− 𝔹𝑛
 4: if SK.seed = NULL or SK.prf = NULL or PK.seed = NULL then
 5:     return ⊥                ▷ return an error indication if random bit generation failed
 6: end if

 7: return slh_keygen_internal(SK.seed, SK.prf, PK.seed)
```

## 公式或伪代码

以下保留 source 提取稿中的算法标题、输入/输出和伪代码；分页造成的空白/字形异常以 PDF 为准。

```text
Algorithm 21 slh_keygen()
Generates an SLH-DSA key pair.
Input: (none)
Output: SLH-DSA key pair (SK, PK).
                       $
 1: SK.seed ←− 𝔹𝑛                               ▷ set SK.seed, SK.prf, and PK.seed to random 𝑛-byte
                   $
                           𝑛
 2: SK.prf ←−𝔹                                        ▷ strings using an approved random bit generator
                       $
 3: PK.seed ←− 𝔹𝑛
 4: if SK.seed = NULL or SK.prf = NULL or PK.seed = NULL then
 5:     return ⊥                ▷ return an error indication if random bit generation failed
 6: end if

 7: return slh_keygen_internal(SK.seed, SK.prf, PK.seed)
```

## 输入与输出

以算法正文中的 `Input` / `Output` 为准；字节串长度、`n`、`a`、`k`、`h′`、`d`、`len` 和地址类型必须绑定所选标准参数集。算法返回错误或布尔值时，错误语义也属于接口边界。

## 项目映射

完整标准密钥生成 API 尚未实现；随机性必须由后端/密码模块提供。

## 核验与缺项

- 原文覆盖：Algorithm 21 已独立定位到 source 第 1996 行。
- 结构核验：实现/教学块不得以同名替换标准函数；必须区分“标准算法”“项目映射”和“未实现”。
- 向量核验：待接入 FIPS 205/CAVP 完整 SLH-DSA KAT；当前项目已有 demo 只能证明明确列出的教学性质。
