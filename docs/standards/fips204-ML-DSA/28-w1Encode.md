# Algorithm 28  w1Encode(𝐰1 )

**章节**: §3.2  
**类别**: 密钥/签名编解码

### 规范

```
Algorithm 28 w1Encode(𝐰1 )
Encodes a polynomial vector 𝐰1 into a byte string.
Input: 𝐰1 ∈ 𝑅𝑘 whose polynomial coordinates have coefficients in [0, (𝑞 − 1)/(2𝛾2 ) − 1].
Output: A byte string representation 𝐰̃ 1 ∈ 𝔹32𝑘⋅bitlen ((𝑞−1)/(2𝛾2 )−1) .
1: 𝐰̃ 1 ← ()
2: for 𝑖 from 0 to 𝑘 − 1 do
3:
𝐰̃ 1 ← 𝐰̃ 1 || SimpleBitPack (𝐰1 [𝑖], (𝑞 − 1)/(2𝛾2 ) − 1)
4: end for
5: return 𝐰̃ 1

35

FIPS 204

7.3

MODULE-LATTICE-BASED DIGITAL SIGNATURE STANDARD

Pseudorandom Sampling

This section specifies various algorithms for generating algebraic objects pseudorandomly from a seed
𝜌, where 𝜌 is a byte string whose length varies depending on the algorithm. The first procedure to be
defined is SampleInBall. As in Section 2.3, 𝐵𝜏 denotes the set of all polynomials 𝑐 ∈ 𝑅 such that
• Each coefficient of 𝑐 is either −1, 0, or 1, and
• Exactly 𝜏 of the coefficients of 𝑐 are nonzero.
SampleInBall pseudorandomly generates an element of 𝐵𝜏 using the XOF of a seed 𝜌. The procedure
is based on the Fisher-Yates shuffle. H is applied to 𝜌, and the first 8 bytes of the output are used to
choose the signs of the nonzero entries of 𝑐.12 Subsequent bytes are used to choose the positions of
those nonzero entries.

```

### CipherCat

尚未实现。
