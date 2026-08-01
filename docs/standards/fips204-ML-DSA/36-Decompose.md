# Algorithm 36  Decompose(𝑟)

**章节**: §3.4  
**类别**: 舍入与分解

### 规范

```
Algorithm 36 Decompose(𝑟)
Decomposes 𝑟 into (𝑟1 , 𝑟0 ) such that 𝑟 ≡ 𝑟1 (2𝛾2 ) + 𝑟0 mod 𝑞.
Input: 𝑟 ∈ ℤ𝑞 .
Output: Integers (𝑟1 , 𝑟0 ).
1: 𝑟+ ← 𝑟 mod 𝑞
±
2: 𝑟0 ← 𝑟+ mod (2𝛾2 )
3: if 𝑟+ − 𝑟0 = 𝑞 − 1 then
4:
𝑟1 ← 0
5:
𝑟0 ← 𝑟 0 − 1
6: else 𝑟1 ← (𝑟+ − 𝑟0 )/(2𝛾2 )
7: end if
8: return (𝑟1 , 𝑟0 )
```

### CipherCat

尚未实现。
