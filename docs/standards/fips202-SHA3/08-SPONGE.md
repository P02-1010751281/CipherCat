# Algorithm 8  SPONGE[f, pad, r](N, d)
## 条目元数据

| 字段 | 内容 |
|---|---|
| 类型 | 算法阶段 / 原语 / 函数 |
| 标准定位 | §4 |
| 原文证据 | [source：fips202-SHA3](./00-Standard-Source.md)（本目录 PDF 清单见 source 页） |
| 原文位置 | [提取稿定位](./00-Standard-Source.md#L1072)；PDF 物理页需结合同目录 PDF 核对 |
| 项目状态 | 部分实现：吸收/挤出阶段固定使用 KECCAK-f[1600]，挤出长度须为非负安全整数值且受运行时内存限制 |

## 原文定位与引用

> 本页按 source 中的“§4”拆分；这是定位说明，不替代标准逐字引文。完整正文、公式和表格请回看 [source 提取稿](./00-Standard-Source.md#L1072) 与同目录 PDF。


**章节**: §4
**类别**: 海绵构造

### 规范

```
Input:  string N;  nonnegative integer d
Output: string Z with len(Z) = d

 1: Let P = N ‖ pad(r, len(N))
 2: Let n = len(P)/r
 3: Let c = b−r
 4: Let P₀,…,P_{n−1} be r-bit blocks of P
 5: Let S = 0^b  (b-bit zero string)
 6: For i from 0 to n−1:
        S ← f(S ⊕ (Pᵢ ‖ 0^c))
 7: Let Z be the empty string
 8: Let Z = Z ‖ Trunc_r(S)
 9: If d ≤ |Z|, return Trunc_d(Z); else continue
10: Let S = f(S), continue with Step 8
```

### 备注

吸收 (absorb): 将每 r-bit 块异或到状态前 r 位后置换。
挤出 (squeeze): 从状态前 r 位读取输出，不足时再置换。

标准算法先对消息应用 `pad(r, len(N))`，再把填充结果切成完整的 rate 位块。项目的 `sponge_absorb` 和 `sponge_squeeze` 接口使用 bytes，而非 bits (`rate_bytes = r/8`)；因此 `sponge_absorb` 只接受输入长度为 rate 字节整数倍的数据，部分块会被拒绝，调用方须先显式填充。空输入对应零次内部吸收，不等同于完整 SPONGE 对空消息执行填充后的结果。

### 块实现

`sponge_absorb` 与 `sponge_squeeze` 分别实现吸收、挤出阶段；调用方负责按所选 `r` 提供状态、填充和完整输入块。JS/Python 生成代码均拒绝非完整 rate 块。这两个海绵阶段块固定调用 KECCAK-f[1600]，不暴露一般化的 `f`、`b`、`c` 参数；另一个独立 `keccak_f` 置换块虽支持 200/400/800 位，但不因此成为 SHA-3/SHAKE 构造。
## 原文摘录
> 以下为 source 中 Algorithm 8 的完整原文算法块；仅移除了 PDF 分页标记和页眉页码。

```text
Algorithm 8: SPONGE[f, pad, r](N, d)

Input:
string N,
nonnegative integer d.



string Z such that len(Z) = d.

Steps:
    1. Let P = N || pad(r, len(N)).
    2. Let n = len(P)/r.
    3. Let c = b - r.
    4. Let P0, … , Pn-1 be the unique sequence of strings of length r such that P = P0 || … || Pn-1.
    5. Let S = 0b.
    6. For i from 0 to n-1, let S = f (S ⊕ (Pi || 0c)).
    7. Let Z be the empty string.
    8. Let Z = Z || Trunc r (S).
    9. If d ≤ |Z|, then return Trunc d (Z); else continue.
    10. Let S = f(S), and continue with Step 8.
```

## 标准定义

本页的规范性定义由下方完整算法块给出；不得用项目实现或摘要替代标准语义。

## 公式或伪代码

> 以下完整保留本条目的标准算法块；只移除了 PDF 页眉、页脚、页码和分页标记。

```text
Algorithm 8: SPONGE[f, pad, r](N, d)

Input:
string N,
nonnegative integer d.



string Z such that len(Z) = d.

Steps:
    1. Let P = N || pad(r, len(N)).
    2. Let n = len(P)/r.
    3. Let c = b - r.
    4. Let P0, … , Pn-1 be the unique sequence of strings of length r such that P = P0 || … || Pn-1.
    5. Let S = 0b.
    6. For i from 0 to n-1, let S = f (S ⊕ (Pi || 0c)).
    7. Let Z be the empty string.
    8. Let Z = Z || Trunc r (S).
    9. If d ≤ |Z|, then return Trunc d (Z); else continue.
    10. Let S = f(S), and continue with Step 8.
```

## 输入与输出

输入、输出、取值域和错误返回以完整算法块中的 `Input`、`Output` 及其步骤为准；标准未列出的字段不由项目自行补写。

## 项目映射

本页是标准结构化参考条目；项目是否有同名 Blockly 块、源码入口或 demo，按本目录 README 和覆盖矩阵核对。本页不把文档条目等同于已实现。

## 核验与缺项

[`sponge-absorb-contract.test.ts`](../../../tests/unit/sponge-absorb-contract.test.ts) 与 [`sponge-squeeze-contract.test.ts`](../../../tests/unit/sponge-squeeze-contract.test.ts) 通过真实 Blockly 块生成并执行双语言代码，核验不完整 rate 块拒绝、完整单块/多块输入、lane 字节序及负数/小数输出长度拒绝。该测试不覆盖所有 rate、完整多块挤出及官方完整测试集；项目内测试也不等同于正式验证或产品认证。
