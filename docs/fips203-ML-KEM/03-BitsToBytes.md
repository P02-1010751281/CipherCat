# Algorithm 3  BitsToBytes(b)

**章节**: §4.2.1 编码与压缩  
**类别**: 编码原语

### 规范

```
Input:  bit array b ∈ {0,1}^{8·ℓ}
Output: byte array B ∈ 𝔹^ℓ

 1: B ← (0, …, 0)
 2: for (i ← 0; i < 8ℓ; i++)
 3:    B[⌊i/8⌋] ← B[⌊i/8⌋] + b[i] · 2^{i mod 8}
 4: end for
 5: return B
```

### 备注

将 bit 数组按小端序组装为字节。这是 ByteEncode (Algorithm 5) 的最后一步。

### CipherCat

`pq_bits_to_bytes`
