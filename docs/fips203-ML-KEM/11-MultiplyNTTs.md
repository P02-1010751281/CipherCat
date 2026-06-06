# Algorithm 11  MultiplyNTTs(f̂, ĝ)

**章节**: §4.3 NTT 变换  
**类别**: NTT 域逐点乘法

### 规范

```
Input:  arrays f̂, ĝ ∈ ℤ^{256}_q (NTT domain)
Output: array ĥ ∈ ℤ^{256}_q (NTT domain)

 1: for (i ← 0; i < 128; i++) do
 2:    ĥ[2i]   ← f̂[2i]·ĝ[2i] + ζ^{2·BitRev₇(i)+1} · f̂[2i+1]·ĝ[2i+1] mod q
 3:    ĥ[2i+1] ← f̂[2i+1]·ĝ[2i] + f̂[2i]·ĝ[2i+1] mod q
 4: end for
 5: return ĥ
```

### 备注

Kyber half-NTT 技巧: 将 256 系数分为 128 对 (even, odd)，
每对乘以常数 ζ^{2·BitRev₇(i)+1} 实现负缠绕卷积 (NWC)。
基例 = Algorithm 12 (BaseCaseMultiply)。

### CipherCat

`pq_ntt_mul`
