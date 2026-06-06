# Algorithm 12  BaseCaseMultiply(a₀, a₁, b₀, b₁, γ)

**章节**: §4.3 NTT 变换  
**类别**: NTT 乘法基例

### 规范

```
Input:  a₀, a₁, b₀, b₁, γ ∈ ℤ_q
Output: (c₀, c₁) ∈ ℤ_q × ℤ_q

 1: c₀ ← a₀·b₀ + γ · a₁·b₁ mod q
 2: c₁ ← a₀·b₁ + a₁·b₀ mod q
 3: return (c₀, c₁)
```

### 备注

计算 (a₀ + a₁·X)(b₀ + b₁·X) mod (X² − γ)。
Algorithm 11 的每个偶数/奇数对以此公式在 ℤ_q[X]/(X² − γ) 中相乘。
CipherCat 无独立块，内嵌于 ntt_mul。

