# Algorithm 11  IntegerToBytes(𝑥, 𝛼)

**章节**: §3.2  
**类别**: 整数/比特/字节编码

### 规范

```
Algorithm 11 IntegerToBytes(𝑥, 𝛼)
Computes a base-256 representation of 𝑥 mod 256𝛼 using little-endian order.
Input: A nonnegative integer 𝑥 and a positive integer 𝛼.
Output: A byte string 𝑦 of length 𝛼.
1: 𝑥′ ← 𝑥
2: for 𝑖 from 0 to 𝛼 − 1 do
3:
𝑦[𝑖] ← 𝑥′ mod 256
4:
𝑥′ ← ⌊𝑥′ /256⌋
5: end for
6: return 𝑦
28

FIPS 204

MODULE-LATTICE-BASED DIGITAL SIGNATURE STANDARD

```

### CipherCat

尚未实现。
