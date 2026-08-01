# Algorithm 12  BitsToBytes(𝑦)

**章节**: §3.2  
**类别**: 整数/比特/字节编码

### 规范

```
Algorithm 12 BitsToBytes(𝑦)
Converts a bit string into a byte string using little-endian order.
Input: A bit string 𝑦 of length 𝛼.
Output: A byte string 𝑧 of length ⌈𝛼/8⌉.
1: 𝑧 ∈ 𝔹⌈𝛼/8⌉ ← 0⌈𝛼/8⌉
2: for 𝑖 from 0 to 𝛼 − 1 do
3:
𝑧 [⌊𝑖/8⌋] ← 𝑧 [⌊𝑖/8⌋] + 𝑦[𝑖] ⋅ 2𝑖 mod 8
4: end for
5: return 𝑧
```

### CipherCat

尚未实现。
