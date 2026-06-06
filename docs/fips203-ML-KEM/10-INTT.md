# Algorithm 10  NTT⁻¹(f̂) — 逆数论变换

**章节**: §4.3 NTT 变换  
**类别**: NTT 变换（Gentleman-Sande 蝶形）

### 规范

```
Input:  array f̂ ∈ ℤ^{256}_q  (NTT evaluation form)
Output: array f ∈ ℤ^{256}_q   (coefficient form)

 1: f ← f̂
 2: m ← 1
 3: z ← 127
 4: while (m < 256) do
 5:    for (start ← 0; start < 256; start ← start + 2·m) do
 6:       P ← ζ^{BitRev₇(z)}
 7:       for (j ← start; j < start + m; j++) do
 8:          t ← f[j]
 9:          f[j] ← t + f[j + m] mod q
10:          f[j + m] ← P · (f[j + m] − t) mod q
11:       end for
12:       z ← z − 1
13:    end for
14:    m ← 2·m
15: end while
16: for (j ← 0; j < 256; j++) do
17:    f[j] ← f[j] · 256⁻¹ mod q
18: end for
19: return f
```

### 备注

Gentleman-Sande (GS) 蝶形: (a, b) → (a+b, ζ·(b−a))。
最后乘以 256⁻¹ mod 3329 = pow(256, 3327, 3329)。

### CipherCat

`pq_intt`
