# Algorithm 47  ScalarVectorNTT(𝑐,̂ 𝐯)̂

**章节**: §3.5  
**类别**: NTT 运算

### 规范

```
Algorithm 47 ScalarVectorNTT(𝑐,̂ 𝐯)̂
Computes the product 𝑐 ̂ ∘ 𝐯̂ of a scalar 𝑐 ̂ and a vector 𝐯̂ over 𝑇𝑞 .
Input: 𝑐 ̂ ∈ 𝑇𝑞 , ℓ ∈ ℕ, 𝐯̂ ∈ 𝑇𝑞ℓ .
Output: 𝐰̂ ∈ 𝑇𝑞ℓ .
1: for 𝑖 from 0 to ℓ − 1 do
2:
𝐰[𝑖]
̂ ← MultiplyNTT(𝑐,̂ 𝐯[𝑖])
̂
3: end for
4: return 𝐰̂

̂ 𝐯)̂
```

### CipherCat

尚未实现。
