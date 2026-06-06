# Algorithm 33  ExpandS(𝜌)

**章节**: §3.3  
**类别**: 采样

### 规范

```
Algorithm 33 ExpandS(𝜌)
Samples vectors 𝐬1 ∈ 𝑅ℓ and 𝐬2 ∈ 𝑅𝑘 , each with polynomial coordinates whose coefficients are
in the interval [−𝜂, 𝜂].
Input: A seed 𝜌 ∈ 𝔹64 .
Output: Vectors 𝐬1 , 𝐬2 of polynomials in 𝑅.
1: for 𝑟 from 0 to ℓ − 1 do
2:
𝐬𝟏 [𝑟] ← RejBoundedPoly(𝜌||IntegerToBytes(𝑟, 2))
3: end for
4: for 𝑟 from 0 to 𝑘 − 1 do
5:
𝐬𝟐 [𝑟] ← RejBoundedPoly(𝜌||IntegerToBytes(𝑟 + ℓ, 2))
6: end for
7: return (𝐬𝟏 , 𝐬𝟐 )

▷ seed depends on 𝑟

▷ seed depends on 𝑟 + ℓ

```

### CipherCat

尚未实现。
