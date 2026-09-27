# Compress / Decompress (§4.2.1)

## 条目元数据

| 字段 | 内容 |
|---|---|
| 类型 | 算法阶段 / 原语 / 函数 |
| 标准定位 | Compress / Decompress (§4.2.1) |
| 原文证据 | [source 提取稿](./00-Standard-Source.md)（本目录 PDF 清单见 source 页） |
| 原文位置 | [提取稿](./00-Standard-Source.md#L1232)；PDF 物理页需结合同目录 PDF 核对 |
| 项目状态 | 已实现（详见本文现有实现/缺项说明） |

## 原文定位与引用

> 本页按 source 中的“Compress / Decompress (§4.2.1)”拆分；这是定位说明，不替代标准逐字引文。完整正文、公式和表格请回看 [source 提取稿](./00-Standard-Source.md#L1232) 与同目录 PDF。

## 标准定义

ML-KEM 在 `q=3329` 上定义整数压缩与解压缩；`d<12`，计算在有理数上完成并按标准取最近整数，禁止使用浮点近似。

## 公式或伪代码

```text
q = 3329
Compress_d:   Z_q -> Z_(2^d)
    x -> ceil((2^d / q) * x) mod 2^d

Decompress_d: Z_(2^d) -> Z_q
    y -> ceil((q / 2^d) * y)

For all y in Z_(2^d), d < 12:
    Compress_d(Decompress_d(y)) = y
```

除法和舍入在有理数集合中执行；实现必须使用整数等价算法，不能将浮点结果作为规范语义。

## 输入与输出

输入为 `x ∈ Z_q` 或 `y ∈ Z_(2^d)`，`1 ≤ d < 12`；输出分别为 `Z_(2^d)` 或 `Z_q`。ML-KEM 参数集使用 `d_u/d_v=(10,4)` 或 `(11,5)`。

## 原文摘录

> 以下为 00-Standard-Source.md 的说明性定位引文；仅规范化了空白和分页换行，完整正文、公式和表格请回看 [source 提取稿](./00-Standard-Source.md#L1232)。

    4.2.1 Conversion and Compression Algorithms
    This section specifies several algorithms for converting between bit arrays, byte arrays, and arrays
    of integers modulo 𝑚. It also specifies a certain operation for compressing integers modulo 𝑞,

非正式算法编号，为 ML-KEM 核心压缩公式。各算法（14, 15, 20, 21）中通过 `d_u`、`d_v` 参数化调用。

### 公式

```
Compress_d: ℤ_q → ℤ_{2^d}
    Compress_d(x) = ⌈(2^d / q) · x⌋ mod 2^d

Decompress_d: ℤ_{2^d} → ℤ_q
    Decompress_d(y) = ⌈(q / 2^d) · y⌋
```

其中 ⌈·⌋ 为四舍五入到最近整数。**不得使用浮点运算。**

### 整数实现

```python
# Compress_d(x, d, q):
return ((x * (1 << d) + q // 2) // q) & ((1 << d) - 1)

# Decompress_d(y, d, q):
return (y * q + (1 << (d - 1))) // (1 << d)
```

### ML-KEM 参数

| 参数集 | d_u | d_v |
|--------|:---:|:---:|
| ML-KEM-512  | 10 | 4 |
| ML-KEM-768  | 10 | 4 |
| ML-KEM-1024 | 11 | 5 |

### 块实现

- `pq_compress`: Compress_d(x, d, q)  — 下拉框选择 d ∈ {1,3,4,5,6,10,11,12}
- `pq_decompress`: Decompress_d(y, d, q)

## 项目映射

`pq_compress` 与 `pq_decompress` 对应本条目；ML-KEM 的编码、解码和封装流程分别在编号算法页中核对。

## 核验与缺项

至少核验 `d=1`、`d=10`、`d=11`、边界系数和 `Compress(Decompress(y))=y`；完整 source 规范单元见上方原文摘录。
