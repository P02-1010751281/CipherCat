# Algorithm 46  AddVectorNTT(𝐯,̂ 𝐰)

**章节**: §3.5  
**类别**: NTT 运算

### 规范

```
Algorithm 46 AddVectorNTT(𝐯,̂ 𝐰)
̂
Computes the sum 𝐯̂ + 𝐰̂ of two vectors 𝐯,̂ 𝐰̂ over 𝑇𝑞 .
Input: ℓ ∈ ℕ, 𝐯̂ ∈ 𝑇𝑞ℓ , 𝐰̂ ∈ 𝑇𝑞ℓ .
Output: 𝐮̂ ∈ 𝑇𝑞ℓ .
1: for 𝑖 from 0 to ℓ − 1 do
2:
𝐮[𝑖]
̂ ← AddNTT(𝐯[𝑖],
̂ 𝐰[𝑖])
̂
3: end for
4: return 𝐮̂

45

FIPS 204

MODULE-LATTICE-BASED DIGITAL SIGNATURE STANDARD

```

### CipherCat

尚未实现。
