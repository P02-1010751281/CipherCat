# Algorithm 6  ByteDecode_d(B)

**章节**: §4.2.1 编码与压缩  
**类别**: 编码原语

### 规范

```
Input:  byte array B ∈ 𝔹^{32·d}
Output: integer array F ∈ ℤ^{256}_m,
         where m = 2^d (d < 12) or m = q (d = 12)

 1: b ← BytesToBits(B)
 2: for (i ← 0; i < 256; i++)
 3:    F[i] ← Σ_{j=0}^{d-1} b[i·d + j] · 2^j  mod m
 4: end for
 5: return F
```

### 备注

将 32·d 字节解包为 256 个 d-bit 系数。d=12 时输出为 mod q 整数。

**重要**: d=12 时 ByteDecode₁₂ 对每个 12-bit 段先还原为 0..4095 的整数再 mod q (3329)，导致部分输入段映射到同一系数。但 ByteEncode₁₂ 输出的字节数组不会产生这种碰撞，这在 §7.2 封装密钥检查中被利用。

### CipherCat

`pq_byte_decode` (d ∈ {1,4,5,10,11,12})
