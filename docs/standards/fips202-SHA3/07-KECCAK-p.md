# Algorithm 7  KECCAK-p[b, nr](S)
## 条目元数据

| 字段 | 内容 |
|---|---|
| 类型 | 算法阶段 / 原语 / 函数 |
| 标准定位 | §3.3 |
| 原文证据 | [source：fips202-SHA3](./00-Standard-Source.md)（本目录 PDF 清单见 source 页） |
| 原文位置 | [提取稿定位](./00-Standard-Source.md#L998)；PDF 物理页需结合同目录 PDF 核对 |
| 项目状态 | 已实现（详见本文现有实现/缺项说明） |

## 原文定位与引用

> 本页按 source 中的“§3.3”拆分；这是定位说明，不替代标准逐字引文。完整正文、公式和表格请回看 [source 提取稿](./00-Standard-Source.md#L998) 与同目录 PDF。


**章节**: §3.3
**类别**: KECCAK-p 置换

### 规范

```
Input:  string S of length b;  number of rounds nr
Output: string S′ of length b

1: Convert S into a state array A (§3.1.2)
2: For ir from 12+2l−nr to 12+2l−1:
       A ← Rnd(A, ir)
   where Rnd(A, ir) = ι(χ(π(ρ(θ(A)))), ir)
3: Convert A into string S′ (§3.1.3)
4: Return S′
```

### 备注

5 步映射复合: θ → ρ → π → χ → ι, 共 nr 轮。
KECCAK-f[1600] = KECCAK-p[1600, 24] (nr=24, l=6)。

### 块实现

`keccak_f1600` — KECCAK-p[1600, 24] 即 KECCAK-f[1600]

`hash_sha3_keccak_f` 块支持 b ∈ {200, 400, 800, 1600}
## 原文摘录
> 以下为 source 中 Algorithm 7 的完整原文算法块；仅移除了 PDF 分页标记和页眉页码。

```text
Algorithm 7: KECCAK-p[b, nr](S)

Input:
string S of length b;
number of rounds nr.

Output:
string S′ of length b.

Steps:
    1. Convert S into a state array, A, as described in Sec. 3.1.2.
    2. For ir from 12 + 2l – nr to 12 + 2l – 1, let A = Rnd(A, ir).
    3. Convert A into a string S′ of length b, as described in Sec. 3.1.3.
    4. Return S′.
```

## 标准定义

本页的规范性定义由下方完整算法块给出；不得用项目实现或摘要替代标准语义。

## 公式或伪代码

> 以下完整保留本条目的标准算法块；只移除了 PDF 页眉、页脚、页码和分页标记。

```text
Algorithm 7: KECCAK-p[b, nr](S)

Input:
string S of length b;
number of rounds nr.

Output:
string S′ of length b.

Steps:
    1. Convert S into a state array, A, as described in Sec. 3.1.2.
    2. For ir from 12 + 2l – nr to 12 + 2l – 1, let A = Rnd(A, ir).
    3. Convert A into a string S′ of length b, as described in Sec. 3.1.3.
    4. Return S′.
```

## 输入与输出

输入、输出、取值域和错误返回以完整算法块中的 `Input`、`Output` 及其步骤为准；标准未列出的字段不由项目自行补写。

## 项目映射

本页是标准结构化参考条目；项目是否有同名 Blockly 块、源码入口或 demo，按本目录 README 和覆盖矩阵核对。本页不把文档条目等同于已实现。

## 核验与缺项

已机械核对完整算法块与 source 算法标题及行号；标准向量、实现语义、边界负例和认证结论仍须按本目录记录分别核验。
