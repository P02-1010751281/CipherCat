# Ascon — 320-bit 置换原语

## 条目元数据

| 字段 | 内容 |
|---|---|
| 类型 | 原语 / 320-bit 置换 |
| 标准定位 | NIST SP 800-232 §4，Ascon-p[12] / Ascon-p[8] |
| 原文证据 | [Ascon 原文提取](./00-Standard-Source.md) · [PDF](./NIST.SP.800-232.pdf) |
| 原文位置 | PDF 物理第 19–22 页（标准页 8–10）；[提取稿 §3.1–§3.4](./00-Standard-Source.md#L599) |
| 项目状态 | 由 Ascon 加密、解密、Hash 和 XOF 块内部调用；无独立置换块 |

## 原文定位与引用

> “The permutations follow the Substitution-Permutation-Network (SPN) structure.”
>
> — NIST SP 800-232 §3；[提取稿第 584–588 行](./00-Standard-Source.md#L584)

## 原文摘录

> 以下为 00-Standard-Source.md 的说明性定位引文；仅规范化了空白和分页换行，完整正文、公式和表格请回看 [source 提取稿](./00-Standard-Source.md#L599)。

    The permutations operate on the 320-bit state S, represented as five 64-bit words.
    p = pL ∘ pS ∘ pC.
    The constant-addition, substitution, and linear diffusion layers are specified in §3.2–§3.4.

## 标准定义

状态由五个 64-bit lane `x0..x4` 组成。每轮依次执行轮常量注入、5-bit S 盒层和线性扩散；认证
加密初始化/终结使用 12 轮，中间吸收/挤出使用 8 轮。

## 公式或伪代码

```text
Round(x0..x4, c):
    x2 = x2 xor c
    x0 ^= x4; x4 ^= x3; x2 ^= x1
    t0 = ~x0 & x1; t1 = ~x1 & x2; t2 = ~x2 & x3
    t3 = ~x3 & x4; t4 = ~x4 & x0
    x0 ^= t1; x1 ^= t2; x2 ^= t3; x3 ^= t4; x4 ^= t0
    x1 ^= x0; x0 ^= x4; x3 ^= x2; x2 = ~x2
    x0 ^= rotr64(x0,19) ^ rotr64(x0,28)
    x1 ^= rotr64(x1,61) ^ rotr64(x1,39)
    x2 ^= rotr64(x2,1)  ^ rotr64(x2,6)
    x3 ^= rotr64(x3,10) ^ rotr64(x3,17)
    x4 ^= rotr64(x4,7)  ^ rotr64(x4,41)
    return (x0,x1,x2,x3,x4)

Ascon-p^nr(S): apply Round for nr round constants
```

S 盒层按标准的 bit-sliced 语义实现；lane 字节序、轮常量序列和 `p[12]/p[8]` 选择不可由 AEAD
页面自行推断。

## 输入与输出

| 项目 | 约束 |
|---|---|
| 输入 | 5 个 64-bit lane（320 bit）和轮数 |
| 输出 | 同形状的 320-bit 状态 |
| 轮数 | `12` 或 `8` |
| 错误条件 | 轮数、字宽、字节序不符时拒绝 |

## 项目映射

没有独立 `ascon_permutation` Blockly 块；现有 Ascon 高层块内部使用 `p[12]` / `p[8]`。若开放原子块，
必须同时补轮常量、lane 序列和逐轮向量。

## 核验与缺项

应对照 SP 800-232 的置换中间状态及 AEAD KAT 检查每轮输出。目前项目只以 AEAD 完整向量间接覆盖
置换，不能据此宣称独立置换 API 已实现。
