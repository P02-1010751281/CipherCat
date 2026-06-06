# Compress / Decompress (§4.2.1)

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

### CipherCat

- `pq_compress`: Compress_d(x, d, q)  — 下拉框选择 d ∈ {1,3,4,5,6,10,11,12}
- `pq_decompress`: Decompress_d(y, d, q)
