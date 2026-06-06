# Algorithm 6  ι(A, ir)

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

24 轮常数 (hex): 0x01, 0x8082, 0x808A, 0x80008000, 0x808B, ...

### CipherCat

内嵌于 `keccak_f1600`
