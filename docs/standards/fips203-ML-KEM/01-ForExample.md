# Algorithm 1  ForExample()
## 条目元数据

| 字段 | 内容 |
|---|---|
| 类型 | 算法阶段 / 原语 / 函数 |
| 标准定位 | §2.4 伪代码符号约定 |
| 原文证据 | [source：fips203-ML-KEM](./00-Standard-Source.md)（本目录 PDF 清单见 source 页） |
| 原文位置 | [提取稿定位](./00-Standard-Source.md#L629)；PDF 物理页需结合同目录 PDF 核对 |
| 项目状态 | 仅参考（详见本文现有实现/缺项说明） |

## 原文定位与引用

> 本页按 source 中的“§2.4 伪代码符号约定”拆分；这是定位说明，不替代标准逐字引文。完整正文、公式和表格请回看 [source 提取稿](./00-Standard-Source.md#L629) 与同目录 PDF。


**章节**: §2.4 伪代码符号约定
**类别**: 示例（非规范性）

### 规范

```
Input:  (none)
Output: (none)

 1: for (i ← 0; i < 10; i++)
 2:    A[i] ← i
 3: end for
 4: j ← 0
 5: for (k ← 256; k > 1; k ← k/2)
 6:    B[j] ← k
 7:    j ← j + 1
 8: end for
```

### 备注

非规范性示例，演示 FIPS 203 伪代码中的 for 循环语法。
## 原文摘录
> 以下为 source 中 Algorithm 1 的完整原文算法块；仅移除了 PDF 分页标记和页眉页码。

```text
Algorithm 1 ForExample()
Performs two simple “for” loops.
 1: for (𝑖 ← 0; 𝑖 < 10; 𝑖 ++)
 2:     𝐴[𝑖] ← 𝑖                                                     ▷ 𝐴 is an integer array of length 10
 3: end for                                                 ▷ 𝐴 now has the value (0, 1, 2, 3, 4, 5, 6, 7, 8, 9)
 4: 𝑗 ← 0
 5: for (𝑘 ← 256; 𝑘 > 1; 𝑘 ← 𝑘/2)
 6:     𝐵[𝑗] ← 𝑘                                                         ▷ 𝐵 is an integer array of length 8
 7:     𝑗 ← 𝑗+1
 8: end for                                         ▷ 𝐵 now has the value (256, 128, 64, 32, 16, 8, 4, 2)
```

## 标准定义

本页的规范性定义由下方完整算法块给出；不得用项目实现或摘要替代标准语义。

## 公式或伪代码

> 以下完整保留本条目的标准算法块；只移除了 PDF 页眉、页脚、页码和分页标记。

```text
Algorithm 1 ForExample()
Performs two simple “for” loops.
 1: for (𝑖 ← 0; 𝑖 < 10; 𝑖 ++)
 2:     𝐴[𝑖] ← 𝑖                                                     ▷ 𝐴 is an integer array of length 10
 3: end for                                                 ▷ 𝐴 now has the value (0, 1, 2, 3, 4, 5, 6, 7, 8, 9)
 4: 𝑗 ← 0
 5: for (𝑘 ← 256; 𝑘 > 1; 𝑘 ← 𝑘/2)
 6:     𝐵[𝑗] ← 𝑘                                                         ▷ 𝐵 is an integer array of length 8
 7:     𝑗 ← 𝑗+1
 8: end for                                         ▷ 𝐵 now has the value (256, 128, 64, 32, 16, 8, 4, 2)
```

## 输入与输出

输入、输出、取值域和错误返回以完整算法块中的 `Input`、`Output` 及其步骤为准；标准未列出的字段不由项目自行补写。

## 项目映射

本页是标准结构化参考条目；项目是否有同名 Blockly 块、源码入口或 demo，按本目录 README 和覆盖矩阵核对。本页不把文档条目等同于已实现。

## 核验与缺项

已机械核对完整算法块与 source 算法标题及行号；标准向量、实现语义、边界负例和认证结论仍须按本目录记录分别核验。
