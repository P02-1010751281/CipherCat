# Algorithm 27  sigDecode(𝜎)

**章节**: §3.2  
**类别**: 密钥/签名编解码

### 规范

```
Algorithm 27 sigDecode(𝜎)
Reverses the procedure sigEncode.
Input: Signature 𝜎 ∈ 𝔹𝜆/4+ℓ⋅32⋅(1+bitlen (𝛾1 −1))+𝜔+𝑘 .
Output: 𝑐 ̃ ∈ 𝔹𝜆/4 , 𝐳 ∈ 𝑅ℓ with coefficients in [−𝛾1 + 1, 𝛾1 ], 𝐡 ∈ 𝑅2𝑘 , or ⊥.
ℓ

1: (𝑐,̃ 𝑥0 , … , 𝑥ℓ−1 , 𝑦) ∈ 𝔹𝜆/4 × (𝔹32⋅(1+bitlen (𝛾1 −1)) ) × 𝔹𝜔+𝑘 ← 𝜎
2: for 𝑖 from 0 to ℓ − 1 do
3:
𝐳[𝑖] ← BitUnpack(𝑥𝑖 , 𝛾1 − 1, 𝛾1 ) ▷ this is in the correct range, as 𝛾1 is a power of 2
4: end for
5: 𝐡 ← HintBitUnpack(𝑦)
6: return (𝑐,̃ 𝐳, 𝐡)

w1Encode is a specific subroutine used in ML-DSA.Sign. The procedure w1Encode encodes a polynomial
vector 𝐰1 into a string of bytes so that it can be processed by the function H.

```

### CipherCat

尚未实现。
