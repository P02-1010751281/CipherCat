# Algorithm 28  w1Encode(𝐰1 )

**章节**: §7.2
**类别**: 密钥/签名编解码

### 规范

```
Algorithm 28 w1Encode(𝐰1 )
Input: 𝐰1 ∈ 𝑅𝑘 whose polynomial coordinates have coefficients in [0, (𝑞 − 1)/(2𝛾2 ) − 1].
Output: A byte string representation 𝐰̃ 1 ∈ 𝔹32𝑘⋅bitlen ((𝑞−1)/(2𝛾2 )−1) .
1: 𝐰̃ 1 ← ()
2: for 𝑖 from 0 to 𝑘 − 1 do
3:
𝐰̃ 1 ← 𝐰̃ 1 || SimpleBitPack (𝐰1 [𝑖], (𝑞 − 1)/(2𝛾2 ) − 1)
4: end for
5: return 𝐰̃ 1







```

### 块实现

尚未实现。
