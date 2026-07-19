# Algorithm 4  BytesToBits(B)

**章节**: §4.2.1 编码与压缩  
**类别**: 编码原语

### 规范

```
Input:  byte array B ∈ 𝔹^ℓ
Output: bit array b ∈ {0,1}^{8·ℓ}

 1: C ← B
 2: for (i ← 0; i < ℓ; i++)
 3:    for (j ← 0; j < 8; j++)
 4:       b[8·i + j] ← C[i] mod 2
 5:       C[i] ← (C[i] − b[8·i + j]) / 2
 6:    end for
 7: end for
 8: return b
```

### 备注

将字节数组按小端序拆为 bit 数组。这是 ByteDecode (Algorithm 6) 的第一步。

### CipherCat

`pq_bytes_to_bits`
