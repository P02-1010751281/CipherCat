# Algorithm 35  Power2Round(𝑟)

**章节**: §3.4  
**类别**: 舍入与分解

### 规范

```
Algorithm 35 Power2Round(𝑟)
Decomposes 𝑟 into (𝑟1 , 𝑟0 ) such that 𝑟 ≡ 𝑟1 2𝑑 + 𝑟0 mod 𝑞.
Input: 𝑟 ∈ ℤ𝑞 .
Output: Integers (𝑟1 , 𝑟0 ).
1: 𝑟+ ← 𝑟 mod 𝑞
±
2: 𝑟0 ← 𝑟+ mod 2𝑑
3: return ((𝑟+ − 𝑟0 )/2𝑑 , 𝑟0 )
```

### CipherCat

尚未实现。
