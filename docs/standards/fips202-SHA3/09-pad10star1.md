# Algorithm 9  pad10*1(x, m)
## 条目元数据

| 字段 | 内容 |
|---|---|
| 类型 | 算法阶段 / 原语 / 函数 |
| 标准定位 | §5.1 |
| 原文证据 | [source：fips202-SHA3](./00-Standard-Source.md)（本目录 PDF 清单见 source 页） |
| 原文位置 | [提取稿定位](./00-Standard-Source.md#L1108)；PDF 物理页需结合同目录 PDF 核对 |
| 项目状态 | 已映射并有定向回归（不代表完整标准验证） |

## 原文定位与引用

> 本页按 source 中的“§5.1”拆分；这是定位说明，不替代标准逐字引文。完整正文、公式和表格请回看 [source 提取稿](./00-Standard-Source.md#L1108) 与同目录 PDF。


**章节**: §5.1
**类别**: 多速率填充规则

### 规范

```
Input:  positive integer x;  non-negative integer m
Output: string P such that m + len(P) is a positive multiple of x

1: Let j = (−m − 2) mod x
2: Return P = 1 ‖ 0^j ‖ 1
```

### 备注

pad10*1 确保输出长度对齐 rate x。
上标 `*` 表示 `0^j` 长度可变 (j≥0)。

通俗理解: 消息后追加 `1`, 再追加 `0` 直到对齐前一组, 最后追加 `1`。

块实现 (标准, 对照 FIPS 202 Table 6)——伪代码按项目实现展开：

```text
q = rate_bytes - (m_len % rate_bytes)
# q ∈ [1, rate_bytes]；q=1 时两个 pad 位 + suffix 落在同一字节（M‖0x86，SHA-3）
# 无需扩展——若 q == 1 则 j = (−m−2) mod x = x−1，P = 1‖0^(x−1)‖1 长度 x+1 比特，合法
padded = msg + (suffix ^ first_byte) + zeros + (0x80 ^ last_byte)
```

### 块实现

`sha3_pad` — 支持可配置 suffix (SHA-3: 0x06, SHAKE: 0x1F)
## 原文摘录
> 以下为 source 中 Algorithm 9 的完整原文算法块；仅移除了 PDF 分页标记和页眉页码。PDF 中 `j` 是 `0` 的上标，线性文本以 `0^j` 表示。

```text
Algorithm 9: pad10*1(x, m)

Input:
positive integer x;
non-negative integer m.

Output:
string P such that m + len(P) is a positive multiple of x.

Steps:
    1. Let j = (– m – 2) mod x.
    2. Return P = 1 || 0^j || 1.
```

## 标准定义

本页的规范性定义由下方完整算法块给出；不得用项目实现或摘要替代标准语义。

## 公式或伪代码

> 以下完整保留本条目的标准算法块；只移除了 PDF 页眉、页脚、页码和分页标记。PDF 中 `j` 是 `0` 的上标，线性文本以 `0^j` 表示。

```text
Algorithm 9: pad10*1(x, m)

Input:
positive integer x;
non-negative integer m.

Output:
string P such that m + len(P) is a positive multiple of x.

Steps:
    1. Let j = (– m – 2) mod x.
    2. Return P = 1 || 0^j || 1.
```

## 输入与输出

输入、输出、取值域和错误返回以完整算法块中的 `Input`、`Output` 及其步骤为准；标准未列出的字段不由项目自行补写。

## 项目映射

`hash_sha3_pad_text` 提供严格 UTF-8 文本入口，`hash_sha3_pad_hex` 提供严格 Hex 入口；通用 `sponge_pad` 支持按 rate/suffix 配置的字节填充。文本拒绝孤立代理项，Hex 要求偶数长度且不含空白，原始字节值限 `0..255`。这些是项目接口契约，不是 FIPS 202 新增限制。SHA-3 与 SHAKE 分别使用各自规定的 suffix，不能互换。

## 核验与缺项

[`sha256-padding-contract.test.ts`](../../../tests/unit/sha256-padding-contract.test.ts) 从真实 Blockly 块生成并执行双语言代码，核对 SHA-3 文本/Hex 填充、严格文本与 Hex 输入、非法字节，以及五种受支持 rate（SHA3-224/256/384/512、SHAKE128）在 `rate−1`、`rate`、`rate+1` 输入长度和 `0x06`/`0x1F` suffix 下的边界行为。测试覆盖的是项目回归，不是 FIPS 202 完整测试向量集或正式算法验证。
