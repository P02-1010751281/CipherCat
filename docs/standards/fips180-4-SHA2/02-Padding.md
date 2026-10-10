# SHA-2 — 消息填充原语

## 条目元数据

| 字段 | 内容 |
|---|---|
| 类型 | 原语 / 消息预处理 |
| 标准定位 | FIPS 180-4 §5.1，§5.2 |
| 原文证据 | [SHA-2 原文提取](./00-Standard-Source.md) · [PDF](./NIST.FIPS.180-4.pdf) |
| 原文位置 | PDF 物理第 18–19 页（标准页 13–14）；[提取稿 §5.1](./00-Standard-Source.md#L652) |
| 项目状态 | SHA-224/256、SHA-384/512 填充路径已映射 |

## 原文定位与引用

> “The purpose of this padding is to ensure that the padded message is a multiple of 512 or 1024 bits, depending on the algorithm.”
>
> — FIPS 180-4 §5.1；[提取稿第 652 行](./00-Standard-Source.md#L652)

## 原文摘录

> 以下为 00-Standard-Source.md 的说明性定位引文；仅规范化了空白和分页换行，完整正文、公式和表格请回看 [source 提取稿](./00-Standard-Source.md#L652)。

    5.1 Padding the Message
    The purpose of this padding is to ensure that the padded message is a multiple of 512 or 1024
    bits, depending on the algorithm. Padding can be inserted before hash computation begins on a

## 标准定义

对消息追加一个 `1` 位、`k` 个 `0` 位和原始消息 bit 长度的大端编码，使结果成为完整分组。
长度字段使用原始消息长度，不能把 UTF-8 字符数当作字节长度。

## 公式或伪代码

```text
SHA2-PAD(M, blockBits, lengthBits):
    L = bit_length(M)
    k = (blockBits - lengthBits - 1 - (L mod blockBits)) mod blockBits
    return M || 1 || 0^k || BE_encode(L, lengthBits)
```

参数为：SHA-224/256 使用 `(blockBits,lengthBits)=(512,64)`；SHA-384/512 使用
`(1024,128)`。填充后的结果满足 `len(result) mod blockBits = 0`。

## 输入与输出

| 变体 | 输入 | 输出分组 |
|---|---|---|
| SHA-224/256 | 任意长度字节串 | 512-bit 分组串 |
| SHA-384/512 | 任意长度字节串 | 1024-bit 分组串 |
| 长度边界 | `L` 必须能用标准长度字段表示 | 超界输入应拒绝 |

## 项目映射

原始字节、UTF-8 文本和十六进制输入分别进入 `hash_sha256_pad`、`hash_sha256_pad_text`、
`hash_sha256_pad_hex`；SHA-512 路径使用 `hash_sha512_pad`。本原语不负责消息扩展、压缩或摘要截断。

项目输入契约：字节输入仅接受字节串或取值为 `0..255` 的整数序列；文本按严格 UTF-8 编码，
JavaScript 与 Python 均拒绝孤立 UTF-16 代理项；Hex 输入必须是偶数长度、连续的 ASCII 十六进制字符，
不接受空白或其他分隔符。这些是 Blockly 端口契约，不是 FIPS 180-4 对消息编码的额外规定。

## 核验与缺项

[`sha256-padding-contract.test.ts`](../../../tests/unit/sha256-padding-contract.test.ts) 从实际 Blockly 块生成并执行
JavaScript/Python，核验 0、1、55、56、63、64、119、120 字节边界、`abc` 固定填充块、严格 UTF-8/Hex
输入及非法字节拒绝。这是项目回归测试，不是完整 NIST 测试向量集或正式算法验证。SHA-512/224 与
SHA-512/256 的专用 IV 尚未接入；填充正确不等于完整变体已实现。
