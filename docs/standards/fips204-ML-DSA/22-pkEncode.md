# Algorithm 22  pkEncode(𝜌, 𝐭1 )

**章节**: §3.2  
**类别**: 密钥/签名编解码

### 规范

```
Algorithm 22 pkEncode(𝜌, 𝐭1 )
Encodes a public key for ML-DSA into a byte string.
Input:𝜌 ∈ 𝔹32 , 𝐭1 ∈ 𝑅𝑘 with coefficients in [0, 2bitlen (𝑞−1)−𝑑 − 1].
Output: Public key 𝑝𝑘 ∈ 𝔹32+32𝑘(bitlen (𝑞−1)−𝑑) .
1: 𝑝𝑘 ← 𝜌
2: for 𝑖 from 0 to 𝑘 − 1 do
3:
𝑝𝑘 ← 𝑝𝑘 || SimpleBitPack (𝐭1 [𝑖], 2bitlen (𝑞−1)−𝑑 − 1)
4: end for
5: return 𝑝𝑘
```

### 块实现

尚未实现。
