# Algorithm 7  SampleNTT(B)

**章节**: §4.2.2 采样  
**类别**: 采样（XOF 拒绝采样）

### 规范

```
Input:  byte array B ∈ 𝔹^{34}
         (32-byte seed + two 1-byte indices)
Output: array â ∈ ℤ^{256}_q  (NTT-domain polynomial)

 1: ctx ← XOF.Init()
 2: ctx ← XOF.Absorb(ctx, B)
 3: j ← 0
 4: while j < 256 do
 5:    (ctx, C) ← XOF.Squeeze(ctx, 3)      ▷ 3 fresh bytes
 6:    d₁ ← C[0] + 256 · (C[1] mod 16)     ▷ 0 ≤ d₁ < 2¹²
 7:    d₂ ← ⌊C[1]/16⌋ + 16 · C[2]           ▷ 0 ≤ d₂ < 2¹²
 8:    if d₁ < q then
 9:       â[j] ← d₁
10:       j ← j + 1
11:    end if
12:    if d₂ < q and j < 256 then
13:       â[j] ← d₂
14:       j ← j + 1
15:    end if
16: end while
17: return â
```

### 备注

XOF = SHAKE128 (rate=168 bytes)。每 3 字节提取两个 12-bit 候选系数，拒绝 ≥ q (3329) 的值。

附录 B 给出了安全 while-loop 迭代上界。CipherCat 实现中默认起始 out_len=672 字节 (可产 ~448 个候选)，不足时翻倍。

### CipherCat

`pq_sample_ntt`
