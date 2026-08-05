# Algorithm 26  sigEncode(𝑐,̃ 𝐳, 𝐡)

**章节**: §7.2
**类别**: 密钥/签名编解码

### 规范

```
Algorithm 26 sigEncode(𝑐,̃ 𝐳, 𝐡)
Encodes a signature into a byte string.
Input: 𝑐 ̃ ∈ 𝔹𝜆/4 , 𝐳 ∈ 𝑅ℓ with coefficients in [−𝛾1 + 1, 𝛾1 ], 𝐡 ∈ 𝑅2𝑘 .
Output: Signature 𝜎 ∈ 𝔹𝜆/4+ℓ⋅32⋅(1+bitlen (𝛾1 −1))+𝜔+𝑘 .
1: 𝜎 ← 𝑐 ̃
2: for 𝑖 from 0 to ℓ − 1 do
3:
𝜎 ← 𝜎 || BitPack (𝐳[𝑖], 𝛾1 − 1, 𝛾1 )
4: end for
5: 𝜎 ← 𝜎 || HintBitPack (𝐡)
6: return 𝜎
```

### 块实现

尚未实现。
