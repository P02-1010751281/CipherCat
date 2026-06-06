# Algorithm 10  BitsToInteger(𝑦, 𝛼)

**章节**: §3.2  
**类别**: 整数/比特/字节编码

### 规范

```
Algorithm 10 BitsToInteger(𝑦, 𝛼)
Computes the integer value expressed by a bit string using little-endian order.
Input: A positive integer 𝛼 and a bit string 𝑦 of length 𝛼.
Output: A nonnegative integer 𝑥.
1: 𝑥 ← 0
2: for 𝑖 from 1 to 𝛼 do
3:
𝑥 ← 2𝑥 + 𝑦[𝛼 − 𝑖]
4: end for
5: return 𝑥
```

### CipherCat

尚未实现。
