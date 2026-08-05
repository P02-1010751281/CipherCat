# Algorithm 10  NTT⁻¹(f̂) — 逆数论变换

**章节**: §4.3 NTT 变换  
**类别**: NTT 变换（Gentleman-Sande 蝶形）

### 规范

```
Input:  array f̂ ∈ ℤ^{256}_q  (NTT evaluation form)
Output: array f ∈ ℤ^{256}_q   (coefficient form)

 1: f ← f̂
 2: i ← 127
 3: for (len ← 2; len ≤ 128; len ← 2·len) do
 4:    for (start ← 0; start < 256; start ← start + 2·len) do
 5:       zeta ← ζ^BitRev₇(i) mod q
 6:       i ← i − 1
 7:       for (j ← start; j < start + len; j++) do
 8:          t ← f[j]
 9:          f[j] ← t + f[j + len] mod q
10:          f[j + len] ← zeta · (f[j + len] − t) mod q
11:       end for
12:    end for
13: end for
14: f ← f · 3303 mod q
15: return f
```

### 备注

Gentleman-Sande (GS) 蝶形: (a, b) → (a+b, ζ·(b−a))。
最后乘以 3303 mod 3329（3303 ≡ 128⁻¹ mod q，非 256⁻¹；对照 FIPS 203 Algorithm 10
从 len=2 起共 7 层，zeta 计数器 i 从 127 递减）。

### 块实现

`pq_intt`
