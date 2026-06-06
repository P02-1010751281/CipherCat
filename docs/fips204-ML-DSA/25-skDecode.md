# Algorithm 25  skDecode(𝑠𝑘)

**章节**: §3.2  
**类别**: 密钥/签名编解码

### 规范

```
Algorithm 25 skDecode(𝑠𝑘)
Reverses the procedure skEncode.
Input: Private key 𝑠𝑘 ∈ 𝔹32+32+64+32⋅((ℓ+𝑘)⋅bitlen (2𝜂)+𝑑𝑘) .
Output: 𝜌 ∈ 𝔹32 , 𝐾 ∈ 𝔹32 , 𝑡𝑟 ∈ 𝔹64 ,
𝐬1 ∈ 𝑅ℓ , 𝐬2 ∈ 𝑅𝑘 , 𝐭0 ∈ 𝑅𝑘 with coefficients in [−2𝑑−1 + 1, 2𝑑−1 ].
ℓ

1: (𝜌, 𝐾, 𝑡𝑟, 𝑦0 , … , 𝑦ℓ−1 , 𝑧0 , … , 𝑧𝑘−1 , 𝑤0 , … , 𝑤𝑘−1 ) ∈ 𝔹32 × 𝔹32 × 𝔹64 × (𝔹32⋅bitlen (2𝜂) )
32⋅bitlen (2𝜂) 𝑘

×

32𝑑 𝑘

) × (𝔹 ) ← 𝑠𝑘
(𝔹
2: for 𝑖 from 0 to ℓ − 1 do
3:
𝐬1 [𝑖] ← BitUnpack(𝑦𝑖 , 𝜂, 𝜂)
▷ this may lie outside [−𝜂, 𝜂] if input is malformed
4: end for
5: for 𝑖 from 0 to 𝑘 − 1 do
6:
𝐬2 [𝑖] ← BitUnpack(𝑧𝑖 , 𝜂, 𝜂)
▷ this may lie outside [−𝜂, 𝜂] if input is malformed
7: end for
8: for 𝑖 from 0 to 𝑘 − 1 do
9:
𝐭0 [𝑖] ← BitUnpack(𝑤𝑖 , 2𝑑−1 − 1, 2𝑑−1 )
▷ this is always in the correct range
10: end for
11: return (𝜌, 𝐾, 𝑡𝑟, 𝐬1 , 𝐬2 , 𝐭0 )
Next, sigEncode and sigDecode translate ML-DSA signatures into byte strings and vice versa. When
verifying a signature, sigDecode might take input that comes from an untrusted source. Thus, care is
required when using BitUnpack. As used here, BitUnpack always returns values in the correct range.

34

FIPS 204

MODULE-LATTICE-BASED DIGITAL SIGNATURE STANDARD

```

### CipherCat

尚未实现。
