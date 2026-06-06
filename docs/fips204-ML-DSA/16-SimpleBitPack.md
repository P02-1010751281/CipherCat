# Algorithm 16  SimpleBitPack(𝑤, 𝑏)

**章节**: §3.2  
**类别**: 比特打包

### 规范

```
Algorithm 16 SimpleBitPack(𝑤, 𝑏)
Encodes a polynomial 𝑤 into a byte string.
Input: 𝑏 ∈ ℕ and 𝑤 ∈ 𝑅 such that the coefficients of 𝑤 are all in [0, 𝑏].
Output: A byte string of length 32 ⋅ bitlen 𝑏.
1: 𝑧 ← ()
▷ set 𝑧 to the empty bit string
2: for 𝑖 from 0 to 255 do
3:
𝑧 ← 𝑧||IntegerToBits(𝑤𝑖 , bitlen 𝑏)
4: end for
5: return BitsToBytes(𝑧)
```

### CipherCat

尚未实现。
