# Algorithm 4 — Ascon-AEAD128 解密（NIST SP 800-232）

## 条目元数据

| 字段 | 内容 |
|---|---|
| 类型 | 函数 |
| 标准定位 | NIST SP 800-232 §4.1.2，Algorithm 4 `Ascon-AEAD128-dec` |
| 原文证据 | [Ascon source](./00-Standard-Source.md#L993) · [PDF](./NIST.SP.800-232.pdf) |
| 原文位置 | `00-Standard-Source.md` 第 993 行起；PDF 物理页以 PDF 视觉版式核对 |
| 项目状态 | 已实现选定单次调用路径；官方解密 KAT 仍待补充 |

## 标准定义

Algorithm 4 规定 Ascon-AEAD128 的解密、标签重算和认证失败返回。本页只承载该算法的独立定义；完整参数和边界条件以标准原文为准。

## 原文定位与引用

该条目从 [NIST SP 800-232 原文提取稿](./00-Standard-Source.md#L993) 拆出。完整正文、公式、表格和上下文回到 source 及同目录 PDF 核验。

## 原文摘录
> 以下为 source 中 Algorithm 4 的完整原文算法块；仅移除了 PDF 分页标记和页眉页码。

```text
Algorithm 4 Ascon-AEAD128.dec(𝐾, 𝑁 , 𝐴, 𝐶, 𝑇 )
Input: 128-bit key 𝐾, 128-bit nonce 𝑁, associated data 𝐴, ciphertext 𝐶, 128-bit tag 𝑇
Output: plaintext 𝑃 or fail

  𝐼𝑉 ← 0x00001000808c0001                                                       ▷ Initialization
  S ← 𝐼𝑉 ‖ 𝐾 ‖ 𝑁
  S ← 𝐴𝑠𝑐𝑜𝑛-𝑝[12](S)
  S ← S ⊕ (0192 ‖ 𝐾)

  if |𝐴| > 0 then                                              ▷ Processing associated data
                       ̃ ← parse(𝐴, 128)
       𝐴0 , … , 𝐴𝑚−1 , 𝐴 𝑚
       𝐴𝑚 ←pad(𝐴    ̃ , 128)
                     𝑚
       for 𝑖 = 0 to 𝑚 do
           S ← 𝐴𝑠𝑐𝑜𝑛-𝑝[8]((S[0∶127] ⊕ 𝐴𝑖 ) ‖ S[128∶319] )
       end for
  end if
  S ← S ⊕ (0319 ‖ 1)

  𝐶0 , … , 𝐶𝑛−1 , 𝐶̃ ← parse(𝐶, 128)                                 ▷ Processing ciphertext
                     𝑛
  for 𝑖 = 0 to 𝑛 − 1 do
      𝑃𝑖 ← S[0∶127] ⊕ 𝐶𝑖
      S[0∶127] ← 𝐶𝑖
      S ← 𝐴𝑠𝑐𝑜𝑛-𝑝[8](S)
  end for
  ℓ = |𝐶̃|
          𝑛
  ̃
  𝑃   ←               ̃
    𝑛     S [0∶ℓ−1] ⊕ 𝐶𝑛
  S[ℓ∶127] ← S[ℓ∶127] ⊕ (1||0127−ℓ )
  S [0∶ℓ−1] ← 𝐶̃  𝑛


  S ← 𝐴𝑠𝑐𝑜𝑛-𝑝[12](S ⊕ (0128 ‖ 𝐾 ‖ 064 ))                                         ▷ Finalization
  𝑇 ′ ← S[192∶319] ⊕ 𝐾
  if 𝑇 ′ == 𝑇 then
                           ̃
       𝑃 ← 𝑃0 ‖ … ‖ 𝑃𝑛−1 ‖ 𝑃𝑛
       return 𝑃
  else
       return fail
  end if
```

## 公式或伪代码

以下保留 source 提取稿中的算法标题、输入/输出和伪代码；分页造成的空白/字形异常以 PDF 为准。

```text
Algorithm 4 Ascon-AEAD128.dec(𝐾, 𝑁 , 𝐴, 𝐶, 𝑇 )
Input: 128-bit key 𝐾, 128-bit nonce 𝑁, associated data 𝐴, ciphertext 𝐶, 128-bit tag 𝑇
Output: plaintext 𝑃 or fail

  𝐼𝑉 ← 0x00001000808c0001                                                       ▷ Initialization
  S ← 𝐼𝑉 ‖ 𝐾 ‖ 𝑁
  S ← 𝐴𝑠𝑐𝑜𝑛-𝑝[12](S)
  S ← S ⊕ (0192 ‖ 𝐾)

  if |𝐴| > 0 then                                              ▷ Processing associated data
                       ̃ ← parse(𝐴, 128)
       𝐴0 , … , 𝐴𝑚−1 , 𝐴 𝑚
       𝐴𝑚 ←pad(𝐴    ̃ , 128)
                     𝑚
       for 𝑖 = 0 to 𝑚 do
           S ← 𝐴𝑠𝑐𝑜𝑛-𝑝[8]((S[0∶127] ⊕ 𝐴𝑖 ) ‖ S[128∶319] )
       end for
  end if
  S ← S ⊕ (0319 ‖ 1)

  𝐶0 , … , 𝐶𝑛−1 , 𝐶̃ ← parse(𝐶, 128)                                 ▷ Processing ciphertext
                     𝑛
  for 𝑖 = 0 to 𝑛 − 1 do
      𝑃𝑖 ← S[0∶127] ⊕ 𝐶𝑖
      S[0∶127] ← 𝐶𝑖
      S ← 𝐴𝑠𝑐𝑜𝑛-𝑝[8](S)
  end for
  ℓ = |𝐶̃|
          𝑛
  ̃
  𝑃   ←               ̃
    𝑛     S [0∶ℓ−1] ⊕ 𝐶𝑛
  S[ℓ∶127] ← S[ℓ∶127] ⊕ (1||0127−ℓ )
  S [0∶ℓ−1] ← 𝐶̃  𝑛


  S ← 𝐴𝑠𝑐𝑜𝑛-𝑝[12](S ⊕ (0128 ‖ 𝐾 ‖ 064 ))                                         ▷ Finalization
  𝑇 ′ ← S[192∶319] ⊕ 𝐾
  if 𝑇 ′ == 𝑇 then
                           ̃
       𝑃 ← 𝑃0 ‖ … ‖ 𝑃𝑛−1 ‖ 𝑃𝑛
       return 𝑃
  else
       return fail
  end if
```

## 输入与输出

以算法正文中的 `Input` / `Output` 为准；消息、关联数据、密钥、nonce、定制字符串和输出长度的单位（bit/byte）必须与标准保持一致。认证失败时不得把明文作为成功输出。

## 项目映射

项目提供 `ascon_decrypt` 块，输入为 key、nonce、associated data 和 `C || T`；标签比较失败时抛出认证
错误，不返回明文。`ASCON-Extended.json` 已核验空消息成功解密和错误标签拒绝。

## 核验与缺项

- 原文覆盖：Algorithm 4 已独立定位到 source 第 993 行。
- 标准最终版优先：以同目录最终版 PDF 为准，不把旧草案的算法编号或初始值混入现行条目。
- 向量核验：扩展 Demo 覆盖空消息解密和错误标签拒绝；官方解密 KAT、多块消息、非法长度边界和独立置换向量仍需补充。
