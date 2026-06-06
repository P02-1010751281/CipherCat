# Algorithm 18  SimpleBitUnpack(𝑣, 𝑏)

**章节**: §3.2  
**类别**: 比特打包

### 规范

```
Algorithm 18 SimpleBitUnpack(𝑣, 𝑏)
Reverses the procedure SimpleBitPack.
Input: 𝑏 ∈ ℕ and a byte string 𝑣 of length 32 ⋅ bitlen 𝑏.
Output: A polynomial 𝑤 ∈ 𝑅 with coefficients in [0, 2𝑐 − 1], where 𝑐 = bitlen 𝑏.
When 𝑏 + 1 is a power of 2, the coefficients are in [0, 𝑏].
1: 𝑐 ← bitlen 𝑏
2: 𝑧 ← BytesToBits(𝑣)
3: for 𝑖 from 0 to 255 do
4:
𝑤𝑖 ← BitsToInteger((𝑧[𝑖𝑐], 𝑧[𝑖𝑐 + 1], … 𝑧[𝑖𝑐 + 𝑐 − 1]), 𝑐)
5: end for
6: return 𝑤
```

### CipherCat

尚未实现。
