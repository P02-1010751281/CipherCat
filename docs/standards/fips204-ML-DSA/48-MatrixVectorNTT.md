# Algorithm 48 — MatrixVectorNTT(`M̂`, `v̂`)

## 条目元数据

| 字段 | 内容 |
|---|---|
| 类型 | 原语 / 函数 |
| 标准定位 | Algorithm 48 — MatrixVectorNTT(`M̂`, `v̂`) |
| 原文证据 | [source 提取稿](./00-Standard-Source.md)（本目录 PDF 清单见 source 页） |
| 原文位置 | [提取稿定位](./00-Standard-Source.md#L2507)；PDF 物理页需结合同目录 PDF 核对 |
| 项目状态 | 仅参考（详见本文现有实现/缺项说明） |

## 原文定位与引用

> 本页按 source 中的“Algorithm 48 — MatrixVectorNTT(`M̂`, `v̂`)”拆分；这是定位说明，不替代标准逐字引文。完整正文、公式和表格请回看 [source 提取稿](./00-Standard-Source.md#L2507) 与同目录 PDF。

## 原文摘录
> 以下为 source 中 Algorithm 48 的完整原文算法块；仅移除了 PDF 分页标记和页眉页码。

```text
Algorithm 48 MatrixVectorNTT(𝐌,
                              ̂ 𝐯)̂

Computes the product 𝐌̂ ∘ 𝐯̂ of a matrix 𝐌̂ and a vector 𝐯̂ over 𝑇𝑞 .
Input: 𝑘, ℓ ∈ ℕ, 𝐌̂ ∈ 𝑇𝑞𝑘×ℓ , 𝐯̂ ∈ 𝑇𝑞ℓ .
Output: 𝐰̂ ∈ 𝑇𝑞𝑘 .
 1: 𝐰̂ ← 0𝑘
 2: for 𝑖 from 0 to 𝑘 − 1 do
 3:     for 𝑗 from 0 to ℓ − 1 do
 4:          𝐰[𝑖] ← AddNTT(𝐰[𝑖],
              ̂                 ̂ MultiplyNTT(𝐌[𝑖,
                                               ̂ 𝑗], ̂
                                                    𝐯[𝑗]))
 5:     end for
 6: end for
 7: return 𝐰̂
```

## 规范

计算 NTT 域矩阵 `M̂` 与向量 `v̂` 在 `T_q` 上的乘积。

```text
Input:  k, ℓ ∈ N, M̂ ∈ T_q^(k×ℓ), v̂ ∈ T_q^ℓ
Output: ŵ ∈ T_q^k

ŵ ← 0^k
for i from 0 to k − 1 do
    for j from 0 to ℓ − 1 do
        ŵ[i] ← AddNTT(ŵ[i], MultiplyNTT(M̂[i,j], v̂[j]))
    end for
end for
return ŵ
```

`AddNTT` 和 `MultiplyNTT` 都是逐系数运算；这里不是先做 INTT 再做普通多项式乘法。ML-DSA 的矩阵由 `ExpandA` 生成，向量通常来自秘密向量或掩码向量的 NTT 表示。

## 项目状态

该页用于 FIPS 204 算法导航和术语对照；项目的高层 `mldsa_sign` / `mldsa_verify` 路径与部分 NTT 原语分别维护，不能据此声称完整实现 FIPS 204 的所有参数集、拒绝路径和编码边界。

相关原件：[NIST.FIPS.204.pdf](./NIST.FIPS.204.pdf) · [FIPS 204 官方页面](https://csrc.nist.gov/pubs/fips/204/final)。

## 标准定义

本页的规范性定义由下方完整算法块给出；不得用项目实现或摘要替代标准语义。

## 公式或伪代码

> 以下完整保留本条目的标准算法块；只移除了 PDF 页眉、页脚、页码和分页标记。

```text
Algorithm 48 MatrixVectorNTT(𝐌,
                              ̂ 𝐯)̂

Computes the product 𝐌̂ ∘ 𝐯̂ of a matrix 𝐌̂ and a vector 𝐯̂ over 𝑇𝑞 .
Input: 𝑘, ℓ ∈ ℕ, 𝐌̂ ∈ 𝑇𝑞𝑘×ℓ , 𝐯̂ ∈ 𝑇𝑞ℓ .
Output: 𝐰̂ ∈ 𝑇𝑞𝑘 .
 1: 𝐰̂ ← 0𝑘
 2: for 𝑖 from 0 to 𝑘 − 1 do
 3:     for 𝑗 from 0 to ℓ − 1 do
 4:          𝐰[𝑖] ← AddNTT(𝐰[𝑖],
              ̂                 ̂ MultiplyNTT(𝐌[𝑖,
                                               ̂ 𝑗], ̂
                                                    𝐯[𝑗]))
 5:     end for
 6: end for
 7: return 𝐰̂
```

## 输入与输出

输入、输出、取值域和错误返回以完整算法块中的 `Input`、`Output` 及其步骤为准；标准未列出的字段不由项目自行补写。

## 项目映射

本页是标准结构化参考条目；项目是否有同名 Blockly 块、源码入口或 demo，按本目录 README 和覆盖矩阵核对。本页不把文档条目等同于已实现。

## 核验与缺项

已机械核对完整算法块与 source 算法标题及行号；标准向量、实现语义、边界负例和认证结论仍须按本目录记录分别核验。
