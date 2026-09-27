# Algorithm 4 — GCM 认证加密（NIST SP 800-38D）

## 条目元数据

| 字段 | 内容 |
|---|---|
| 类型 | 函数 |
| 标准定位 | NIST SP 800-38D §7.1，Algorithm 4 `GCM-AE` |
| 原文证据 | [GCM source](./00-Standard-Source.md#L926) · [PDF](./NIST.SP.800-38D.pdf) |
| 原文位置 | `00-Standard-Source.md` 第 926 行起；PDF 物理页以 PDF 视觉版式核对 |
| 项目状态 | 部分实现 |

## 标准定义

Algorithm 4 规定 GCM 的认证加密流程，包括 J0、GCTR、GHASH 和认证标签。本页只承载该算法的独立定义；输入长度和标签边界以标准原文为准。

## 原文定位与引用

该条目从 [NIST SP 800-38D 原文提取稿](./00-Standard-Source.md#L926) 拆出。完整正文、公式、脚注和上下文回到 source 及同目录 PDF 核验。

## 原文摘录
> 以下为 source 中 Algorithm 4 的完整原文算法块；仅移除了 PDF 分页标记和页眉页码。

```text
       Algorithm 4: GCM-AE_K (IV, P, A)

       Prerequisites:
       approved block cipher CIPH with a 128-bit block size;
       key K;
       definitions of supported input-output lengths;
       supported tag length t associated with the key.

       Input:
       initialization vector IV (whose length is supported);
       plaintext P (whose length is supported);
       additional authenticated data A (whose length is supported).

       Output:
       ciphertext C;
       authentication tag T.

       Steps:
       1. Let H = CIPH_K(0¹²⁸).
       2. Define a block, J₀, as follows:
           If len(IV)=96, then let J₀ = IV || 0³¹ || 1.
           If len(IV) ≠ 96, then let s = 128 ⌈len(IV)/128⌉ − len(IV), and let
                J₀ = GHASH_H(IV || 0^(s+64) || [len(IV)]_64).
       3. Let C = GCTR_K(inc₃₂(J₀), P).
       4. Let u = 128 ⋅ ⌈len(C)/128⌉ − len(C) and let v = 128 ⋅ ⌈len(A)/128⌉ − len(A).
       5. Define a block, S, as follows:
                       S = GHASH_H(A || 0^v || C || 0^u || [len(A)]_64 || [len(C)]_64).
       6. Let T = MSB_t(GCTR_K(J₀, S)).
       7. Return (C, T).
```

## 公式或伪代码

以下保留 source 提取稿中的算法标题、输入/输出和步骤；分页造成的空白/字形异常以 PDF 为准。

```text
       Algorithm 4: GCM-AE_K (IV, P, A)

       Prerequisites:
       approved block cipher CIPH with a 128-bit block size;
       key K;
       definitions of supported input-output lengths;
       supported tag length t associated with the key.

       Input:
       initialization vector IV (whose length is supported);
       plaintext P (whose length is supported);
       additional authenticated data A (whose length is supported).

       Output:
       ciphertext C;
       authentication tag T.

       Steps:
       1. Let H = CIPH_K(0¹²⁸).
       2. Define a block, J₀, as follows:
           If len(IV)=96, then let J₀ = IV || 0³¹ || 1.
           If len(IV) ≠ 96, then let s = 128 ⌈len(IV)/128⌉ − len(IV), and let
                J₀ = GHASH_H(IV || 0^(s+64) || [len(IV)]_64).
       3. Let C = GCTR_K(inc₃₂(J₀), P).
       4. Let u = 128 ⋅ ⌈len(C)/128⌉ − len(C) and let v = 128 ⋅ ⌈len(A)/128⌉ − len(A).
       5. Define a block, S, as follows:
                       S = GHASH_H(A || 0^v || C || 0^u || [len(A)]_64 || [len(C)]_64).
       6. Let T = MSB_t(GCTR_K(J₀, S)).
       7. Return (C, T).
```

## 输入与输出

以算法正文中的 `Prerequisites` / `Input` / `Output` 为准；bit/byte 长度、计数器递增、有限域约减、标签长度和失败返回都属于接口边界。

## 项目映射

`gcm_encrypt` 覆盖选定加密路径；完整 IV、标签长度和调用限制仍需按标准核验。

## 核验与缺项

- 原文覆盖：Algorithm 4 已独立定位到 source 第 926 行。
- 结构核验：GCM-AE/AD、GHASH、GCTR 与块乘法是不同层次，不能由一个高层 demo 代替全部条目。
- 向量核验：需覆盖空/部分块、96-bit 与非 96-bit IV、标签篡改和失败路径；现有 demo 只证明明确列出的加密结果。
