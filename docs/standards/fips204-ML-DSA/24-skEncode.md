# Algorithm 24  skEncode(𝜌, 𝐾, 𝑡𝑟, 𝐬1 , 𝐬2 , 𝐭0 )

**章节**: §3.2  
**类别**: 密钥/签名编解码

### 规范

```
Algorithm 24 skEncode(𝜌, 𝐾, 𝑡𝑟, 𝐬1 , 𝐬2 , 𝐭0 )
Encodes a secret key for ML-DSA into a byte string.
Input: 𝜌 ∈ 𝔹32 , 𝐾 ∈ 𝔹32 , 𝑡𝑟 ∈ 𝔹64 , 𝐬1 ∈ 𝑅ℓ with coefficients in [−𝜂, 𝜂], 𝐬2 ∈ 𝑅𝑘 with
coefficients in [−𝜂, 𝜂], 𝐭0 ∈ 𝑅𝑘 with coefficients in [−2𝑑−1 + 1, 2𝑑−1 ].
Output: Private key 𝑠𝑘 ∈ 𝔹32+32+64+32⋅((𝑘+ℓ)⋅bitlen (2𝜂)+𝑑𝑘) .
1: 𝑠𝑘 ← 𝜌||𝐾||𝑡𝑟
2: for 𝑖 from 0 to ℓ − 1 do
3:
𝑠𝑘 ← 𝑠𝑘 || BitPack (𝐬1 [𝑖], 𝜂, 𝜂)
4: end for
5: for 𝑖 from 0 to 𝑘 − 1 do
6:
𝑠𝑘 ← 𝑠𝑘 || BitPack (𝐬2 [𝑖], 𝜂, 𝜂)
7: end for
8: for 𝑖 from 0 to 𝑘 − 1 do
9:
𝑠𝑘 ← 𝑠𝑘 || BitPack (𝐭0 [𝑖], 2𝑑−1 − 1, 2𝑑−1 )
10: end for
11: return 𝑠𝑘
```

### CipherCat

尚未实现。
