# Algorithm 32  ExpandA(𝜌)

**章节**: §3.3  
**类别**: 采样

### 规范

```
Algorithm 32 ExpandA(𝜌)
Samples a 𝑘 × ℓ matrix 𝐀̂ of elements of 𝑇𝑞 .
Input: A seed 𝜌 ∈ 𝔹32 .
Output: Matrix 𝐀̂ ∈ (𝑇𝑞 )𝑘×ℓ .
1: for 𝑟 from 0 to 𝑘 − 1 do
2:
for 𝑠 from 0 to ℓ − 1 do
3:
𝜌′ ← 𝜌||IntegerToBytes(𝑠, 1)||IntegerToBytes(𝑟, 1)
̂ 𝑠] ← RejNTTPoly(𝜌′ )
4:
𝐀[𝑟,
▷ seed 𝜌′ depends on 𝑠 and 𝑟
5:
end for
6: end for
7: return 𝐀̂

```

### CipherCat

尚未实现。
