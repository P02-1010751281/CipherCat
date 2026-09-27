# AES — SubBytes 原语

## 条目元数据

| 字段 | 内容 |
|---|---|
| 类型 | 原语 / 非线性字节代换 |
| 标准定位 | FIPS 197 §5.1.1，Eq. (5.2)–(5.4) |
| 原文证据 | [FIPS 197 原文提取](./00-Standard-Source.md) · [PDF](./NIST.FIPS.197.pdf) |
| 原文位置 | PDF 物理第 21 页（标准页 12–13）；[提取稿 §5.1.1](./00-Standard-Source.md#L798) |
| 项目状态 | 已实现；也可作为 AES 轮变换中的独立步骤核对 |

## 原文定位与引用

> “S UB B YTES() is an invertible, non-linear transformation of the state.”
>
> — FIPS 197 §5.1.1；[提取稿第 798 行](./00-Standard-Source.md#L798)

## 原文摘录

> 以下为 00-Standard-Source.md 的说明性定位引文；仅规范化了空白和分页换行，完整正文、公式和表格请回看 [source 提取稿](./00-Standard-Source.md#L798)。

    5.1.1 S UB B YTES()
    S UB B YTES() is an invertible, non-linear transformation of the state in which a substitution table,
    called an S-box, is applied independently to each byte in the state. The AES S-box is denoted by

## 标准定义

SubBytes 对状态的每个字节独立应用 AES S 盒。S 盒先在 `GF(2^8)` 中求乘法逆元（零的逆元定义为零），
再做固定仿射变换；结果仍是一个 8-bit 字节。逆变换使用 `InvSBox`。

## 公式或伪代码

```text
SubBytes(state):
    for r = 0..3, c = 0..3:
        x = state[r,c]
        y = 0                         if x = 0
            x^(-1) in GF(2^8)        otherwise
        state[r,c] = y xor rotl8(y,1) xor rotl8(y,2)
                         xor rotl8(y,3) xor rotl8(y,4) xor 0x63
    return state
```

等价的位公式为 `b'[i] = y[i] xor y[(i+4) mod 8] xor y[(i+5) mod 8] xor
y[(i+6) mod 8] xor y[(i+7) mod 8] xor c[i]`，其中 `c = 0x63`；域多项式为
`x^8 + x^4 + x^3 + x + 1`（`0x11B`）。

## 输入与输出

| 项目 | 约束 |
|---|---|
| 输入 | 4×4 AES 状态，每格 1 字节 |
| 输出 | 相同形状的代换状态 |
| 示例 | `SBox(0x53) = 0xED` |
| 错误条件 | 非 16-byte 状态由调用方拒绝；本原语不处理填充 |

## 项目映射

`aes_sub_bytes` 对应本原语；AES 完整流程见 [01-AES.md](./01-AES.md)。S 盒查表和 GF(2^8)
运算是实现细节，不把 PDF 中的查表复制到用户块输入中。

## 核验与缺项

使用 FIPS 197 Appendix B/C 的 AES-128 轮状态和 `0x53 → 0xED` 单点向量核验。AES-192/256
共用同一 SubBytes 原语；本页不声称实现了侧信道防护或模块认证。
