# Algorithm 8  SamplePolyCBD_η(B)

**章节**: §4.2.2 采样  
**类别**: 采样（PRF CBD 采样）

### 规范

```
Input:  byte array B ∈ 𝔹^{64·η}
Output: array f ∈ ℤ^{256}_q

 1: b ← BytesToBits(B)
 2: for (i ← 0; i < 256; i++)
 3:    x ← Σ_{j=0}^{η−1} b[2·i·η + j]
 4:    y ← Σ_{j=0}^{η−1} b[2·i·η + η + j]
 5:    f[i] ← (x − y) mod q
 6: end for
 7: return f
```

### 备注

PRF = SHAKE256 (rate=136 bytes)。输入 B 来自 PRF(seed, nonce)。

η₁ = 3 (ML-KEM-512) / 2 (ML-KEM-768, -1024)
η₂ = 2 (all parameter sets)

### CipherCat

`pq_sample_poly_cbd` (η ∈ {2,3})
