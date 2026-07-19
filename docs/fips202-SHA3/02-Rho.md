# Algorithm 2  ρ(A)

**章节**: §3.2.2  
**类别**: KECCAK-p 步映射 — Lane 循环移位

### 规范

```
Input:  state array A
Output: state array A′

1: For all z with 0≤z<w: A′[0,0,z] = A[0,0,z]
2: Let (x,y) = (1,0)
3: For t from 0 to 23:
   a. For all z: A′[x,y,z] = A[x,y, (z − (t+1)(t+2)/2) mod w]
   b. Let (x,y) = (y, (2x+3y) mod 5)
4: Return A′
```

### 备注

每条 lane (除 (0,0)) 循环移位自身偏移量。
偏移量 = (t+1)(t+2)/2 mod w, 遍历 24 条 lane。

移位表 (w=64): R[5][5] = [[0,1,62,28,27],[36,44,6,55,20],[3,10,43,25,39],[41,45,15,21,8],[18,2,61,56,14]]

### CipherCat

内嵌于 `keccak_f1600`
