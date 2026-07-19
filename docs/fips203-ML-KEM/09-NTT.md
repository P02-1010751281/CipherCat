# Algorithm 9  NTT(f) — 前向数论变换

**章节**: §4.3 NTT 变换  
**类别**: NTT 变换（Cooley-Tukey 蝶形）

### 规范

```
Input:  array f ∈ ℤ^{256}_q  (coefficient form)
Output: array f̂ ∈ ℤ^{256}_q  (NTT evaluation form)

 1: f̂ ← f
 2: m ← 1
 3: for (len ← 128; len ≥ 1; len ← len/2) do
 4:    for (start ← 0; start < 256; start ← start + 2·len) do
 5:       z ← z + 1
 6:       P ← ζ^{BitRev₇(z)}
 7:       for (j ← start; j < start + len; j++) do
 8:          t ← P · f̂[j + len] mod q
 9:          f̂[j + len] ← f̂[j] − t mod q
10:          f̂[j] ← f̂[j] + t mod q
11:       end for
12:    end for
13: end for
14: return f̂
```

### 备注

Cooley-Tukey (CT) 蝶形: (a, b) → (a + ζ·b, a − ζ·b)。
ζ = 17 是 ℤ_3329 中 256 次本原单位根。BitRev₇(z) 将 z ∈ [0,127] 的 7-bit 表示反转。

CipherCat 实现: Python 用 `pow(17, _brv(zz, 7), 3329)`，JS 用 `powMod(17, brv(zz, 7), 3329)`。

### CipherCat

`pq_ntt`
