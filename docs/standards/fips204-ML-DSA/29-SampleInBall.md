# Algorithm 29  SampleInBall(𝜌)

**章节**: §7.3
**类别**: 采样

### 规范

```
Algorithm 29 SampleInBall(𝜌)
Samples a polynomial 𝑐 ∈ 𝑅 with coefficients from {−1, 0, 1} and Hamming weight 𝜏 ≤ 64.
Input: A seed 𝜌 ∈ 𝔹𝜆/4
Output: A polynomial 𝑐 in 𝑅.
1: 𝑐 ← 0
2: ctx ← H.Init()
3: ctx ← H.Absorb(ctx, 𝜌)
4: (ctx, 𝑠) ← H.Squeeze(ctx, 8)
5: ℎ ← BytesToBits(𝑠)
6: for 𝑖 from 256 − 𝜏 to 255 do
7:
(ctx, 𝑗) ← H.Squeeze(ctx, 1)
8:
while 𝑗 > 𝑖 do
9:
(ctx, 𝑗) ← H.Squeeze(ctx, 1)
10:
end while
11:
𝑐𝑖 ← 𝑐 𝑗
12:
𝑐𝑗 ← (−1)ℎ[𝑖+𝜏−256]
13: end for
14: return 𝑐

▷ ℎ is a bit string of length 64

▷ rejection sampling in {0, … , 𝑖}
▷ 𝑗 is a pseudorandom byte that is ≤ 𝑖

Algorithms 30–34 are the pseudorandom procedures RejNTTPoly, RejBoundedPoly, ExpandA, ExpandS,






```

### 块实现

尚未实现。
