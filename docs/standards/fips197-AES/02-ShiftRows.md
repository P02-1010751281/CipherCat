# AES — ShiftRows 原语

## 条目元数据

| 字段 | 内容 |
|---|---|
| 类型 | 原语 / 状态置换 |
| 标准定位 | FIPS 197 §5.1.2，Eq. (5.5) |
| 原文证据 | [FIPS 197 原文提取](./00-Standard-Source.md) · [PDF](./NIST.FIPS.197.pdf) |
| 原文位置 | PDF 物理第 22 页（标准页 14）；[提取稿 §5.1.2](./00-Standard-Source.md#L883) |
| 项目状态 | 已实现；可作为 AES 轮变换中的独立步骤核对 |

## 原文定位与引用

> “The first row, where r = 0, is unchanged.”
>
> — FIPS 197 §5.1.2；[提取稿第 883 行](./00-Standard-Source.md#L883)

## 原文摘录

> 以下为 00-Standard-Source.md 的说明性定位引文；仅规范化了空白和分页换行，完整正文、公式和表格请回看 [source 提取稿](./00-Standard-Source.md#L883)。

    5.1.2 S HIFT R OWS()
    S HIFT ROWS() is a transformation of the state in which the bytes in the last three rows of the state
    are cyclically shifted. The number of positions by which the bytes are shifted depends on the row

## 标准定义

ShiftRows 对状态的第 `r` 行循环左移 `r` 个字节。第 0 行保持不变，行内不发生字节丢失或复制。
逆变换按相同距离循环右移。

## 公式或伪代码

```text
ShiftRows(state):
    for r = 0..3:
        for c = 0..3:
            output[r,c] = state[r,(c+r) mod 4]
    return output
```

## 输入与输出

| 项目 | 约束 |
|---|---|
| 输入 | 4×4 AES 状态；状态按列装入 |
| 输出 | 4×4 状态置换；每行仍含 4 个字节 |
| 行偏移 | `0, 1, 2, 3` 字节 |
| 错误条件 | 非 4×4 状态由调用方拒绝；本原语不做字节序转换 |

## 项目映射

`aes_shift_rows` 对应本原语；输入输出的列主序装载规则见 [01-AES.md](./01-AES.md)。

## 核验与缺项

使用 FIPS 197 Appendix B/C 的 AES-128 中间状态向量核验，并检查四行循环置换可逆。该页不包含
InvShiftRows 的独立 Blockly 块；完整解密路径仍以项目实现状态为准。
