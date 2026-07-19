# Algorithm 9  IntegerToBits(𝑥, 𝛼)

**章节**: §3.2  
**类别**: 整数/比特/字节编码

### 规范

```
Algorithm 9 IntegerToBits(𝑥, 𝛼)
Computes a base-2 representation of 𝑥 mod 2𝛼 using little-endian order.
Input: A nonnegative integer 𝑥 and a positive integer 𝛼.
Output: A bit string 𝑦 of length 𝛼.
1: 𝑥′ ← 𝑥
2: for 𝑖 from 0 to 𝛼 − 1 do
3:
𝑦[𝑖] ← 𝑥′ mod 2
4:
𝑥′ ← ⌊𝑥′ /2⌋
5: end for
6: return 𝑦
```

### CipherCat

尚未实现。
