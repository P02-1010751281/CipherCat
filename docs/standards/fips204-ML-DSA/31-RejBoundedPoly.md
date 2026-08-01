# Algorithm 31  RejBoundedPoly(𝜌)

**章节**: §3.3  
**类别**: 采样

### 规范

```
Algorithm 31 RejBoundedPoly(𝜌)
Samples an element 𝑎 ∈ 𝑅 with coefficients in [−𝜂, 𝜂] computed via rejection sampling from 𝜌.
Input: A seed 𝜌 ∈ 𝔹66 .
Output: A polynomial 𝑎 ∈ 𝑅.
1: 𝑗 ← 0
2: ctx ← H.Init()
3: ctx ← H.Absorb(ctx, 𝜌)
4: while 𝑗 < 256 do
5:
𝑧 ← H.Squeeze(ctx, 1)
6:
𝑧0 ← CoeffFromHalfByte(𝑧 mod 16)
7:
𝑧1 ← CoeffFromHalfByte(⌊𝑧/16⌋)
8:
if 𝑧0 ≠ ⊥ then
9:
𝑎𝑗 ← 𝑧0
10:
𝑗 ←𝑗+1
11:
end if
12:
if 𝑧1 ≠ ⊥ and 𝑗 < 256 then
13:
𝑎𝑗 ← 𝑧1
14:
𝑗 ←𝑗+1
15:
end if
16: end while
17: return 𝑎

37

FIPS 204

MODULE-LATTICE-BASED DIGITAL SIGNATURE STANDARD

```

### CipherCat

尚未实现。
