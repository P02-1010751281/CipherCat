# Algorithm 30  RejNTTPoly(𝜌)

**章节**: §3.3  
**类别**: 采样

### 规范

```
Algorithm 30 RejNTTPoly(𝜌)
Samples a polynomial ∈ 𝑇𝑞 .
Input: A seed 𝜌 ∈ 𝔹34 .
Output: An element 𝑎̂ ∈ 𝑇𝑞 .
1: 𝑗 ← 0
2: ctx ← G.Init()
3: ctx ← G.Absorb(ctx, 𝜌)
4: while 𝑗 < 256 do
5:
(ctx, 𝑠) ← G.Squeeze(ctx, 3)
6:
𝑎[𝑗]
̂ ← CoeffFromThreeBytes(𝑠[0], 𝑠[1], 𝑠[2])
7:
if 𝑎[𝑗]
̂ ≠ ⊥ then
8:
𝑗 ←𝑗+1
9:
end if
10: end while
11: return 𝑎̂

```

### CipherCat

尚未实现。
