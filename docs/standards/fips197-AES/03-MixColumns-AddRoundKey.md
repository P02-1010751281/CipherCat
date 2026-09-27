# AES — MixColumns 与 AddRoundKey 原语

## 条目元数据

| 字段 | 内容 |
|---|---|
| 类型 | 原语族 / 列混合与轮密钥异或 |
| 标准定位 | FIPS 197 §5.1.3–§5.1.4，Eq. (5.6)–(5.9) |
| 原文证据 | [FIPS 197 原文提取](./00-Standard-Source.md) · [PDF](./NIST.FIPS.197.pdf) |
| 原文位置 | PDF 物理第 23–24 页（标准页 15–16）；[提取稿 §5.1.3](./00-Standard-Source.md#L906)、[§5.1.4](./00-Standard-Source.md#L906) |
| 项目状态 | `aes_mix_columns`、`aes_add_round_key` 已实现 |

## 原文定位与引用

> “M IX C OLUMNS() is a transformation of the state that multiplies each of the four columns of the state by a single fixed matrix.”
>
> — FIPS 197 §5.1.3；[提取稿第 906 行](./00-Standard-Source.md#L906)

## 原文摘录

> 以下为 00-Standard-Source.md 的说明性定位引文；仅规范化了空白和分页换行，完整正文、公式和表格请回看 [source 提取稿](./00-Standard-Source.md#L906)。

    5.1.3 M IX C OLUMNS()
    M IX C OLUMNS() is a transformation of the state that multiplies each of the four columns of the
    state by a single fxed matrix, as described in Section 4.3, with its entries taken from the following

## 标准定义

MixColumns 将每一列视为 `GF(2^8)` 上的 4 元向量并乘以固定矩阵。AddRoundKey 将当前状态与
该轮四个扩展密钥字按列异或；初始轮和每个加密轮都调用它，最后一轮不调用 MixColumns。

## 公式或伪代码

```text
MixColumns:
    [s'0,c]   [02 03 01 01] [s0,c]
    [s'1,c] = [01 02 03 01] [s1,c]   over GF(2^8), c = 0..3
    [s'2,c]   [01 01 02 03] [s2,c]
    [s'3,c]   [03 01 01 02] [s3,c]

AddRoundKey(state, round):
    for c = 0..3:
        state[0..3,c] = state[0..3,c] xor w[4*round+c]
```

域乘法按 `x^8+x^4+x^3+x+1` 约减。逆 MixColumns 的四行系数分别为
`[0E 0B 0D 09]`、`[09 0E 0B 0D]`、`[0D 09 0E 0B]`、`[0B 0D 09 0E]`。

## 输入与输出

| 原语 | 输入 | 输出 |
|---|---|---|
| MixColumns | 4×4 状态 | 4×4 状态；逐列变换 |
| AddRoundKey | 状态、轮号、扩展字数组 `w` | 同形状状态 |
| 边界 | 完整 AES 状态；密钥扩展须先完成 | 不处理填充、模式或认证 |

## 项目映射

`aes_mix_columns` 和 `aes_add_round_key` 是对应块；密钥扩展见 [04-KeyExpansion.md](./04-KeyExpansion.md)，
完整轮次见 [01-AES.md](./01-AES.md)。

## 核验与缺项

以 FIPS 197 Appendix B/C 的 AES-128 轮状态和最终密文向量核验。MixColumns 的逆路径及侧信道
性质不因正向向量通过而自动获得认证。
