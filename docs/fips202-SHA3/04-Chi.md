# Algorithm 4  χ(A)

**章节**: §3.2.4  
**类别**: KECCAK-p 步映射 — 非线性行运算

### 规范

```
Input:  state array A
Output: state array A′

1: For all (x,y,z):
       A′[x,y,z] = A[x,y,z] ⊕ ((NOT A[(x+1) mod 5, y, z]) · A[(x+2) mod 5, y, z])
2: Return A′
```

### 备注

每行 5 bits: A[x] = B[x] ⊕ ((¬B[x+1]) ∧ B[x+2])。
`·` = 整数乘法 = 布尔 AND。
这是 Keccak 唯一的非线性部分。

### CipherCat

内嵌于 `keccak_f1600`
