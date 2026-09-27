# CCM — B0、AAD 与计数器编码原语

## 条目元数据

| 字段 | 内容 |
|---|---|
| 类型 | 原语族 / 分组编码 |
| 标准定位 | NIST SP 800-38C §6.1–§6.2 |
| 原文证据 | [CCM 原文提取](./00-Standard-Source.md) · [PDF](./NIST.SP.800-38C.pdf) |
| 原文位置 | PDF 物理第 15–16 页（标准页 9–10）；[提取稿 §6.1](./00-Standard-Source.md#L592) |
| 项目状态 | 由 `ccm_encrypt` 内部实现 |

## 原文定位与引用

> “The following is a specification of the generation-encryption process of CCM:”
>
> — NIST SP 800-38C §6.1；[提取稿第 592–612 行](./00-Standard-Source.md#L592)

## 原文摘录

> 以下为 00-Standard-Source.md 的说明性定位引文；仅规范化了空白和分页换行，完整正文、公式和表格请回看 [source 提取稿](./00-Standard-Source.md#L592)。

    6.1 Generation-Encryption Process
    The following is a specification of the generation-encryption process of CCM:
    Prerequisites:

## 标准定义

CCM 使用 128-bit AES 分组。nonce 长度 `7..13` 字节时，`L=15−nonceLen`；`B0` 的 flags 编码
AAD 存在性、标签长度和 `L`，末尾编码消息长度。AAD 先编码长度，再按分组补齐。

## 公式或伪代码

```text
L = 15 - len(nonce)
B0 = Flags(hasAAD, tagLen, L) || nonce || BE_encode(len(M), L)

if hasAAD:
    A_blocks = EncodeAAD(len(A), A) || zero_pad_to_block
else:
    A_blocks = []

Ctr(i) = Flags(0, 0, L) || nonce || BE_encode(i, L)
S_i = AES_K(Ctr(i))
```

消息长度必须能用 `L` 字节编码；计数器从 `0` 开始，`S0` 用于标签掩码。

## 输入与输出

| 项目 | 约束 |
|---|---|
| AES 分组 | 16 字节 |
| nonce | 7–13 字节 |
| 标签 | 标准允许的偶数长度；项目 demo 覆盖 4/6/8 字节 |
| 输出 | `C || T` |

## 项目映射

编码由 `ccm_encrypt` 内部完成；CBC-MAC 和 CTR 的独立语义分别见 [03-CBC-MAC.md](./03-CBC-MAC.md)
和 [04-CTR.md](./04-CTR.md)。

## 核验与缺项

核验不同 nonce/tag 长度、空/非空 AAD、长度字段边界和 SP 800-38C 附录 C 向量。非法 nonce、
标签、消息长度的独立负例仍需补齐。
