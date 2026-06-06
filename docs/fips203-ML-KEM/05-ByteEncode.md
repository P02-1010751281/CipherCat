# Algorithm 5  ByteEncode_d(F)

**章节**: §4.2.1 编码与压缩  
**类别**: 编码原语

### 规范

```
Input:  integer array F ∈ ℤ^{256}_m,
         where m = 2^d (d < 12) or m = q (d = 12)
Output: byte array B ∈ 𝔹^{32·d}

 1: for (i ← 0; i < 256; i++)
 2:    a ← F[i]
 3:    for (j ← 0; j < d; j++)
 4:       b[i·d + j] ← a mod 2
 5:       a ← (a − b[i·d + j]) / 2          ▷ always even
 6:    end for
 7: end for
 8: B ← BitsToBytes(b)
 9: return B
```

### 备注

将 256 个 d-bit 系数打包为 32·d 字节。d=12 时输入必须是 mod q 整数 (≤3328)。

### CipherCat

`pq_byte_encode` (d ∈ {1,4,5,10,11,12})
