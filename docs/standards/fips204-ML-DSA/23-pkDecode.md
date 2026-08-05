# Algorithm 23  pkDecode(𝑝𝑘)

**章节**: §7.2
**类别**: 密钥/签名编解码

### 规范

```
Algorithm 23 pkDecode(𝑝𝑘)
Reverses the procedure pkEncode.
Input: Public key 𝑝𝑘 ∈ 𝔹32+32𝑘(bitlen (𝑞−1)−𝑑) .
Output: (𝜌, 𝐭1) ∈ 𝔹32 × (𝔹32⋅bitlen (𝑞−1) )𝑘, 𝐭1 with coefficients in [0, 2bitlen (𝑞−1)−𝑑 − 1].

1: (𝜌, 𝑧0 , … , 𝑧𝑘−1 ) ∈ 𝔹32 × (𝔹32(bitlen (𝑞−1)−𝑑) ) ← 𝑝𝑘
2: for 𝑖 from 0 to 𝑘 − 1 do
3:
𝐭1 [𝑖] ← SimpleBitUnpack(𝑧𝑖 , 2bitlen (𝑞−1)−𝑑 − 1)
4: end for
5: return (𝜌, 𝐭1 )

▷ This is always in the correct range

Next, skEncode and skDecode translate ML-DSA secret keys into byte strings and vice versa. Note that
there exist malformed inputs that can cause skDecode to return values that are not in the correct range.
Hence, skDecode should only be run on inputs that come from trusted sources.




```

### 块实现

尚未实现。
