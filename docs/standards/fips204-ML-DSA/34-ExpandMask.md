# Algorithm 34  ExpandMask(𝜌, 𝜇)

**章节**: §7.3
**类别**: 采样

### 规范

```
Algorithm 34 ExpandMask(𝜌, 𝜇)
Samples a vector 𝐲 ∈ 𝑅ℓ such that each polynomial 𝐲[𝑟] has coefficients between −𝛾1 + 1 and
𝛾1 .
Input: A seed 𝜌 ∈ 𝔹64 and a nonnegative integer 𝜇.
Output: Vector 𝐲 ∈ 𝑅ℓ .
1: 𝑐 ← 1 + bitlen (𝛾1 − 1)
2: for 𝑟 from 0 to ℓ − 1 do
3:
𝜌′ ← 𝜌||IntegerToBytes(𝜇 + 𝑟, 2)
4:
𝑣 ← H(𝜌′ , 32𝑐)
5:
𝐲[𝑟] ← BitUnpack(𝑣, 𝛾1 − 1, 𝛾1 )
6: end for
7: return 𝐲

▷ 𝛾1 is always a power of 2
▷ seed depends on 𝜇 + 𝑟


```

### 块实现

尚未实现。
