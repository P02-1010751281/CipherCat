# Algorithm 3 — Ascon-AEAD128 加密（NIST SP 800-232）

## 条目元数据

| 字段 | 内容 |
|---|---|
| 类型 | 函数 |
| 标准定位 | NIST SP 800-232 §4.1.1，Algorithm 3 `Ascon-AEAD128-enc` |
| 原文证据 | [Ascon source](./00-Standard-Source.md#L781) · [PDF](./NIST.SP.800-232.pdf) |
| 原文位置 | `00-Standard-Source.md` 第 781 行起；PDF 物理页以 PDF 视觉版式核对 |
| 项目状态 | 部分实现 |

## 标准定义

Algorithm 3 规定 Ascon-AEAD128 的状态初始化、关联数据吸收、明文处理和终结标签计算。本页只承载该算法的独立定义；完整参数和边界条件以标准原文为准。

## 原文定位与引用

该条目从 [NIST SP 800-232 原文提取稿](./00-Standard-Source.md#L781) 拆出。完整正文、公式、表格和上下文回到 source 及同目录 PDF 核验。

## 原文摘录
> 以下为 source 中 Algorithm 3 的完整原文算法块；仅移除了 PDF 分页标记和页眉页码。

```text
Algorithm 3 Ascon-AEAD128.enc(𝐾, 𝑁 , 𝐴, 𝑃 )
Input: 128-bit key 𝐾, 128-bit nonce 𝑁, associated data 𝐴, plaintext 𝑃
Output: ciphertext 𝐶, 128-bit tag 𝑇

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

                  ̃
  𝑃0 , … , 𝑃𝑛−1 , 𝑃𝑛 ← parse(𝑃 , 128)                                  ▷ Processing plaintext
        ̃
  ℓ ← |𝑃𝑛 |
  for 𝑖 = 0 to 𝑛 − 1 do
       S[0∶127] ← S[0∶127] ⊕ 𝑃𝑖
       𝐶𝑖 ← S[0∶127]
       S ← 𝐴𝑠𝑐𝑜𝑛-𝑝[8](S)
  end for
  S[0∶127] ← S[0∶127] ⊕pad(𝑃 ̃𝑛 , 128)
  ̃ ←S
  𝐶 𝑛      [0∶ℓ−1]
                      ̃
  𝐶 ← 𝐶0 ‖ … ‖ 𝐶𝑛−1 ‖ 𝐶 𝑛

  S ← 𝐴𝑠𝑐𝑜𝑛-𝑝[12](S ⊕ (0128 ‖ 𝐾 ‖ 064 ))                                         ▷ Finalization
  𝑇 ← S[192∶319] ⊕ 𝐾
  return 𝐶, 𝑇
```

## 公式或伪代码

以下保留 source 提取稿中的算法标题、输入/输出和伪代码；分页造成的空白/字形异常以 PDF 为准。

```text
Algorithm 3 Ascon-AEAD128.enc(𝐾, 𝑁 , 𝐴, 𝑃 )
Input: 128-bit key 𝐾, 128-bit nonce 𝑁, associated data 𝐴, plaintext 𝑃
Output: ciphertext 𝐶, 128-bit tag 𝑇

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

                  ̃
  𝑃0 , … , 𝑃𝑛−1 , 𝑃𝑛 ← parse(𝑃 , 128)                                  ▷ Processing plaintext
        ̃
  ℓ ← |𝑃𝑛 |
  for 𝑖 = 0 to 𝑛 − 1 do
       S[0∶127] ← S[0∶127] ⊕ 𝑃𝑖
       𝐶𝑖 ← S[0∶127]
       S ← 𝐴𝑠𝑐𝑜𝑛-𝑝[8](S)
  end for
  S[0∶127] ← S[0∶127] ⊕pad(𝑃 ̃𝑛 , 128)
  ̃ ←S
  𝐶 𝑛      [0∶ℓ−1]
                      ̃
  𝐶 ← 𝐶0 ‖ … ‖ 𝐶𝑛−1 ‖ 𝐶 𝑛

  S ← 𝐴𝑠𝑐𝑜𝑛-𝑝[12](S ⊕ (0128 ‖ 𝐾 ‖ 064 ))                                         ▷ Finalization
  𝑇 ← S[192∶319] ⊕ 𝐾
  return 𝐶, 𝑇
```

## 输入与输出

以算法正文中的 `Input` / `Output` 为准；消息、关联数据、密钥、nonce、定制字符串和输出长度的单位（bit/byte）必须与标准保持一致。认证失败时不得把明文作为成功输出。

## 项目映射

`ascon_encrypt` 覆盖加密输出路径；`ascon_decrypt` 在 [Algorithm 4 条目](./08-Ascon-AEAD128-dec.md)
中单独映射。所有边界和独立置换仍需分别核验。

## 核验与缺项

- 原文覆盖：Algorithm 3 已独立定位到 source 第 781 行。
- 标准最终版优先：以同目录最终版 PDF 为准，不把旧草案的算法编号或初始值混入现行条目。
- 向量核验：`ASCON.json` 已覆盖加密 KAT；Hash/XOF/CXOF 和解密拒绝由扩展 Demo 单独核验，独立置换中间状态仍需补向量。
