# Algorithm 39  MakeHint(𝑧, 𝑟)

**章节**: §3.4  
**类别**: 舍入与分解

### 规范

```
Algorithm 39 MakeHint(𝑧, 𝑟)
Computes hint bit indicating whether adding 𝑧 to 𝑟 alters the high bits of 𝑟.
Input: 𝑧, 𝑟 ∈ ℤ𝑞 .
Output: Boolean.
1: 𝑟1 ← HighBits(𝑟)
2: 𝑣1 ← HighBits(𝑟 + 𝑧)
3: return [[𝑟1 ≠ 𝑣1 ]]

```

### CipherCat

尚未实现。
