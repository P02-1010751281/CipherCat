# Algorithm 6  ι(A, ir)
## 条目元数据

| 字段 | 内容 |
|---|---|
| 类型 | 算法阶段 / 原语 / 函数 |
| 标准定位 | §3.2.5 |
| 原文证据 | [source：fips202-SHA3](./00-Standard-Source.md)（本目录 PDF 清单见 source 页） |
| 原文位置 | [提取稿定位](./00-Standard-Source.md#L967)；PDF 物理页需结合同目录 PDF 核对 |
| 项目状态 | 已实现（详见本文现有实现/缺项说明） |

## 原文定位与引用

> 本页按 source 中的“§3.2.5”拆分；这是定位说明，不替代标准逐字引文。完整正文、公式和表格请回看 [source 提取稿](./00-Standard-Source.md#L967) 与同目录 PDF。


**章节**: §3.2.5
**类别**: KECCAK-p 步映射 — 轮常数异或

### 规范

```
Input:  state array A;  round index ir
Output: state array A′

1: For all (x,y,z): A′[x,y,z] = A[x,y,z]  (copy)
2: Let RC = 0^w
3: For j from 0 to l: RC[2^j − 1] = rc(j + 7·ir)
4: For all z: A′[0,0,z] = A′[0,0,z] ⊕ RC[z]
5: Return A′
```

### 备注

仅修改 Lane(0,0) 的 l+1 个 bit。
轮常数 = Σ_{j=0}^l rc(j+7·ir)·2^{2^j−1}。

24 轮常数 (hex, 完整 64-bit): 0x01, 0x8082, 0x800000000000808A, 0x8000000080008000, 0x808B, ...

### 块实现

内嵌于 `keccak_f1600`
## 原文摘录
> 以下为 source 中 Algorithm 6 的完整原文算法块；仅移除了 PDF 分页标记和页眉页码。

```text
Algorithm 6: ι(A, ir)

Input:
state array A;
round index ir.

Output:
state array A′.

Steps:
    1. For all triples (x, y, z) such that 0 ≤ x < 5, 0 ≤ y < 5, and 0 ≤ z < w, let A′[x, y, z] = A[x, y, z].
    2. Let RC = 0w.
    3. For j from 0 to l, let RC[2j – 1] = rc(j + 7ir).
    4. For all z such that 0 ≤ z < w, let A′ [0, 0, z] = A′ [0, 0, z] ⊕ RC[z].
    5. Return A′.
```

## 标准定义

本页的规范性定义由下方完整算法块给出；不得用项目实现或摘要替代标准语义。

## 公式或伪代码

> 以下完整保留本条目的标准算法块；只移除了 PDF 页眉、页脚、页码和分页标记。

```text
Algorithm 6: ι(A, ir)

Input:
state array A;
round index ir.

Output:
state array A′.

Steps:
    1. For all triples (x, y, z) such that 0 ≤ x < 5, 0 ≤ y < 5, and 0 ≤ z < w, let A′[x, y, z] = A[x, y, z].
    2. Let RC = 0w.
    3. For j from 0 to l, let RC[2j – 1] = rc(j + 7ir).
    4. For all z such that 0 ≤ z < w, let A′ [0, 0, z] = A′ [0, 0, z] ⊕ RC[z].
    5. Return A′.
```

## 输入与输出

输入、输出、取值域和错误返回以完整算法块中的 `Input`、`Output` 及其步骤为准；标准未列出的字段不由项目自行补写。

## 项目映射

本页是标准结构化参考条目；项目是否有同名 Blockly 块、源码入口或 demo，按本目录 README 和覆盖矩阵核对。本页不把文档条目等同于已实现。

## 核验与缺项

已机械核对完整算法块与 source 算法标题及行号；标准向量、实现语义、边界负例和认证结论仍须按本目录记录分别核验。
