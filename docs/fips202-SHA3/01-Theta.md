# Algorithm 1  θ(A)

**章节**: §3.2.1  
**类别**: KECCAK-p 步映射 — 列扩散

### 规范

```
Input:  state array A (5×5×w)
Output: state array A′

1: For all (x,z) with 0≤x<5, 0≤z<w:
       C[x,z] = A[x,0,z] ⊕ A[x,1,z] ⊕ A[x,2,z] ⊕ A[x,3,z] ⊕ A[x,4,z]
2: For all (x,z) with 0≤x<5, 0≤z<w:
       D[x,z] = C[(x−1) mod 5, z] ⊕ C[(x+1) mod 5, (z−1) mod w]
3: For all (x,y,z):
       A′[x,y,z] = A[x,y,z] ⊕ D[x,z]
```

### 备注

将每列 (x) 的奇偶校验异或到每个 bit。
CipherCat 实现: 5 条 lane 求和, 旋转后异或回每条 lane。

### CipherCat

内嵌于 `keccak_f1600`
