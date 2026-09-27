# Algorithm 9  pad10*1(x, m)
## 条目元数据

| 字段 | 内容 |
|---|---|
| 类型 | 算法阶段 / 原语 / 函数 |
| 标准定位 | §5.1 |
| 原文证据 | [source：fips202-SHA3](./00-Standard-Source.md)（本目录 PDF 清单见 source 页） |
| 原文位置 | [提取稿定位](./00-Standard-Source.md#L1108)；PDF 物理页需结合同目录 PDF 核对 |
| 项目状态 | 已实现（详见本文现有实现/缺项说明） |

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

块实现 (标准, 对照 FIPS 202 Table 6):
  q = rate_bytes - (m_len % rate_bytes)
  # q ∈ [1, rate_bytes]；q=1 时两个 pad 位 + suffix 落在同一字节（M‖0x86，SHA-3），
  # 无需扩展——若 q == 1 则 j=(−m−2) mod x = x−1，P = 1‖0^(x−1)‖1 长度 x+1 比特，合法。
  padded = msg + (suffix ^ first_byte) + zeros + (0x80 ^ last_byte)

### 块实现

`sha3_pad` — 支持可配置 suffix (SHA-3: 0x06, SHAKE: 0x1F)
## 原文摘录
> 以下为 source 中 Algorithm 9 的完整原文算法块；仅移除了 PDF 分页标记和页眉页码。

```text
Algorithm 9: pad10*1(x, m)

Input:
positive integer x;
non-negative integer m.

Output:
string P such that m + len(P) is a positive multiple of x.

Steps:
    1. Let j = (– m – 2) mod x.
    2. Return P = 1 || 0j || 1.
```

## 标准定义

本页的规范性定义由下方完整算法块给出；不得用项目实现或摘要替代标准语义。

## 公式或伪代码

> 以下完整保留本条目的标准算法块；只移除了 PDF 页眉、页脚、页码和分页标记。

```text
Algorithm 9: pad10*1(x, m)

Input:
positive integer x;
non-negative integer m.

Output:
string P such that m + len(P) is a positive multiple of x.

Steps:
    1. Let j = (– m – 2) mod x.
    2. Return P = 1 || 0j || 1.
```

## 输入与输出

输入、输出、取值域和错误返回以完整算法块中的 `Input`、`Output` 及其步骤为准；标准未列出的字段不由项目自行补写。

## 项目映射

本页是标准结构化参考条目；项目是否有同名 Blockly 块、源码入口或 demo，按本目录 README 和覆盖矩阵核对。本页不把文档条目等同于已实现。

## 核验与缺项

已机械核对完整算法块与 source 算法标题及行号；标准向量、实现语义、边界负例和认证结论仍须按本目录记录分别核验。
