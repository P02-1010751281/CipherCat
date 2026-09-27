# Ascon — Hash、XOF 与 CXOF 原语族

## 条目元数据

| 字段 | 内容 |
|---|---|
| 类型 | 原语族 / 海绵哈希与可扩展输出 |
| 标准定位 | NIST SP 800-232 §5.1–§5.3 |
| 原文证据 | [Ascon 原文提取](./00-Standard-Source.md) · [PDF](./NIST.SP.800-232.pdf) |
| 原文位置 | PDF 物理第 34–41 页（标准页 23–30）；[提取稿 Algorithm 5](./00-Standard-Source.md#L1401) |
| 项目状态 | `ascon_hash256`、`ascon_xof128`、`ascon_cxof128` 已实现选定单次调用路径 |

## 原文定位与引用

> “Ascon-Hash256 takes a variable length message M as input and produces a 256-bit digest.”
>
> — NIST SP 800-232 §5.1；[提取稿第 1341 行](./00-Standard-Source.md#L1341)

## 原文摘录

> 以下为 00-Standard-Source.md 的说明性定位引文；仅规范化了空白和分页换行，完整正文、公式和表格请回看 [source 提取稿](./00-Standard-Source.md#L1401)。

    Algorithm 5 Ascon-Hash256(𝑀)
    The full specification of Ascon-Hash256 is given in Algorithm 5.
    Input: Bitstring 𝑀 ∈ {0, 1}∗

## 标准定义

最终版标准定义 Ascon-Hash256、Ascon-XOF128 和 Ascon-CXOF128。三者使用相同的 320-bit 置换族，
但初始化值、rate、域分离、输出长度以及 CXOF 的定制字符串编码不同；不能用 AEAD 结果截取代替。

## 公式或伪代码

```text
SpongeHash(IV, rate, domain, M, outLen):
    S = IV
    absorb each rate-byte block of domain || M with standard padding:
        S[rate_part] ^= block
        S = Ascon-p[12](S) or the variant-specified permutation
    squeeze:
        output += S[rate_part]
        S = Ascon-p[12](S) when more output is needed
    return output[0:outLen]
```

`Ascon-Hash256` 固定输出 32 字节；`Ascon-XOF128` 输出调用方请求的长度；`Ascon-CXOF128` 还要
按标准编码 customization string。上式是结构化语义，具体 IV、rate、域分隔常量以标准算法页为准。

## 输入与输出

| 算法 | 输入 | 输出 |
|---|---|---|
| Hash256 | 消息字节串 | 32 字节 |
| XOF128 | 消息字节串、输出长度 | 任意允许长度的字节串 |
| CXOF128 | 定制字符串、消息、输出长度 | 任意允许长度的字节串 |

## 项目映射

当前提供 `ascon_hash256`、`ascon_xof128` 和 `ascon_cxof128` Blockly 块；它们复用置换实现，
但不复用 AEAD 块冒充哈希/XOF。输出长度单位为字节，CXOF 定制字符串最多 256 字节（对应标准的
2048 bit 上限）。

## 核验与缺项

扩展 Demo 已覆盖空消息、32 字节输出、`abc` 定制字符串、双语言一致性以及非法标签拒绝。仍待补充
标准 Hash/XOF/CXOF 官方 KAT、多块/截断边界和标准定义的增量 `Init/Absorb/Squeeze` API；现有 AEAD
KAT 不覆盖这三个算法。
