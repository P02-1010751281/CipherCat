# SHA-2 — 摘要输出与变体原语

## 条目元数据

| 字段 | 内容 |
|---|---|
| 类型 | 原语 / 链状态输出 |
| 标准定位 | FIPS 180-4 §6 |
| 原文证据 | [SHA-2 原文提取](./00-Standard-Source.md) · [PDF](./NIST.FIPS.180-4.pdf) |
| 原文位置 | SHA-256：[提取稿 §6.2 第 1029 行](./00-Standard-Source.md#L1029)；SHA-512：[§6.4 第 1130 行](./00-Standard-Source.md#L1130) |
| 项目状态 | SHA-224/256、SHA-384/512 已覆盖；SHA-512/t 未覆盖 |

## 原文定位与引用

> “The final result of SHA-256 is a 256-bit message digest.”
>
> — FIPS 180-4 §6.2；[提取稿第 1029 行](./00-Standard-Source.md#L1029)

## 原文摘录

```text
6.2 SHA-256
SHA-256 may be used to hash a message, M, having a length of λ bits, where 0 ≤ λ < 2^64.
The algorithm uses a message schedule of sixty-four 32-bit words, eight working variables,
and a hash value of eight 32-bit words. The final result of SHA-256 is a 256-bit message digest.

6.3 SHA-224
The function is defined in the exact same manner as SHA-256, with a different initial hash value
and a 224-bit digest obtained by truncating the final hash value.
```

## 标准定义

每个分组压缩后，将工作变量按字宽加回当前链状态；全部分组处理完后按大端顺序串联链状态，
再按变体输出长度截取。SHA-512/224 和 SHA-512/256 使用标准指定的专用 IV，不是简单截断 SHA-512。

## 公式或伪代码

```text
H = IV(variant)
for block in SHA2-PAD(M):
    W = MessageExpansion(block)
    (a,b,c,d,e,f,g,h) = H
    (a,b,c,d,e,f,g,h) = Compress((a,b,c,d,e,f,g,h), W)
    H = (H + (a,b,c,d,e,f,g,h)) mod 2^w
return BE_encode(H)[0 : digest_bytes(variant)]
```

对 SHA-224/256，链值按 32-bit 字输出；对 SHA-384/512，按 64-bit 字输出。上式中的“加回”
是 SHA-2 压缩定义的模 `2^w` 加法，不应实现成普通字符串拼接。

## 输入与输出

| 变体 | 输出长度 |
|---|---:|
| SHA-224 | 28 字节 |
| SHA-256 | 32 字节 |
| SHA-384 | 48 字节 |
| SHA-512 | 64 字节 |

## 项目映射

`hash_sha224_hash` 提供 SHA-224 IV 和 28-byte 输出；`hash_sha512_hash` 的 HASH 下拉提供
SHA-384/512。消息扩展和压缩分别见 [03-MessageExpansion.md](./03-MessageExpansion.md) 与
[04-Compression.md](./04-Compression.md)。

## 核验与缺项

使用标准空消息、`abc` 和跨分组消息向量核验输出长度及大端编码。SHA-512/t 两个变体尚未接入，
项目向量通过不代表 FIPS 140-3 模块认证。
