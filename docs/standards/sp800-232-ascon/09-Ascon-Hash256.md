# Algorithm 5 — Ascon-Hash256（NIST SP 800-232）

## 条目元数据

| 字段 | 内容 |
|---|---|
| 类型 | 函数 |
| 标准定位 | NIST SP 800-232 §5.1，Algorithm 5 `Ascon-Hash256` |
| 原文证据 | [Ascon source](./00-Standard-Source.md#L1401) · [PDF](./NIST.SP.800-232.pdf) |
| 原文位置 | `00-Standard-Source.md` 第 1401 行起；PDF 物理页以 PDF 视觉版式核对 |
| 项目状态 | 已实现选定单次调用路径；官方 Hash KAT 仍待补充 |

## 标准定义

Algorithm 5 规定 Ascon-Hash256 的吸收、置换和 256-bit 摘要输出。本页只承载该算法的独立定义；完整参数和边界条件以标准原文为准。

## 原文定位与引用

该条目从 [NIST SP 800-232 原文提取稿](./00-Standard-Source.md#L1401) 拆出。完整正文、公式、表格和上下文回到 source 及同目录 PDF 核验。

## 原文摘录
> 以下为 source 中 Algorithm 5 的完整原文算法块；仅移除了 PDF 分页标记和页眉页码。

```text
Algorithm 5 Ascon-Hash256(𝑀)
Input: Bitstring 𝑀 ∈ {0, 1}∗
Output: Digest 𝐻 ∈ {0, 1}256
  𝐼𝑉 ←0x0000080100cc0002                                                     ▷ Initialization
  S ← 𝐴𝑠𝑐𝑜𝑛-𝑝[12](𝐼𝑉 ‖ 0256 )

                  ̃𝑛 ← parse(𝑀 , 64)
  𝑀0 , … , 𝑀𝑛−1 , 𝑀                                                            ▷ Absorbing
  𝑀𝑛 ← pad(𝑀   ̃𝑛 , 64)
  for 𝑖 = 0 to 𝑛 − 1 do
      S[0∶63] ← S[0∶63] ⊕ 𝑀𝑖
      S ← 𝐴𝑠𝑐𝑜𝑛-𝑝[12](S)
  end for
  S[0∶63] ← S[0∶63] ⊕ 𝑀𝑛

  S ← 𝐴𝑠𝑐𝑜𝑛-𝑝[12](S)                                                           ▷ Squeezing
  for 𝑖 = 0 to 2 do
      𝐻𝑖 ← S[0∶63]
      S ← 𝐴𝑠𝑐𝑜𝑛-𝑝[12](S)
  end for
  𝐻3 ← S[0∶63]

  𝐻 ← 𝐻 0 ‖ 𝐻1 ‖ 𝐻2 ‖ 𝐻 3
  return 𝐻


5.2. Specification of Ascon-XOF128
```

## 公式或伪代码

以下保留 source 提取稿中的算法标题、输入/输出和伪代码；分页造成的空白/字形异常以 PDF 为准。

```text
Algorithm 5 Ascon-Hash256(𝑀)
Input: Bitstring 𝑀 ∈ {0, 1}∗
Output: Digest 𝐻 ∈ {0, 1}256
  𝐼𝑉 ←0x0000080100cc0002                                                     ▷ Initialization
  S ← 𝐴𝑠𝑐𝑜𝑛-𝑝[12](𝐼𝑉 ‖ 0256 )

                  ̃𝑛 ← parse(𝑀 , 64)
  𝑀0 , … , 𝑀𝑛−1 , 𝑀                                                            ▷ Absorbing
  𝑀𝑛 ← pad(𝑀   ̃𝑛 , 64)
  for 𝑖 = 0 to 𝑛 − 1 do
      S[0∶63] ← S[0∶63] ⊕ 𝑀𝑖
      S ← 𝐴𝑠𝑐𝑜𝑛-𝑝[12](S)
  end for
  S[0∶63] ← S[0∶63] ⊕ 𝑀𝑛

  S ← 𝐴𝑠𝑐𝑜𝑛-𝑝[12](S)                                                           ▷ Squeezing
  for 𝑖 = 0 to 2 do
      𝐻𝑖 ← S[0∶63]
      S ← 𝐴𝑠𝑐𝑜𝑛-𝑝[12](S)
  end for
  𝐻3 ← S[0∶63]

  𝐻 ← 𝐻 0 ‖ 𝐻1 ‖ 𝐻2 ‖ 𝐻 3
  return 𝐻


5.2. Specification of Ascon-XOF128
```

## 输入与输出

以算法正文中的 `Input` / `Output` 为准；消息、关联数据、密钥、nonce、定制字符串和输出长度的单位（bit/byte）必须与标准保持一致。认证失败时不得把明文作为成功输出。

## 项目映射

项目提供 `ascon_hash256` 块，输出固定为 32 字节。空消息结果已与 Botan 独立实现核对，
并在 `ASCON-Extended.json` 中通过 Python/JavaScript 双语言生成验证。

## 核验与缺项

- 原文覆盖：Algorithm 5 已独立定位到 source 第 1401 行。
- 标准最终版优先：以同目录最终版 PDF 为准，不把旧草案的算法编号或初始值混入现行条目。
- 向量核验：已覆盖空消息摘要；标准官方 Hash KAT、多块消息和独立置换向量仍需补充。
