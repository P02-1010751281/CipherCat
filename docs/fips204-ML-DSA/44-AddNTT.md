# Algorithm 44  AddNTT(𝑎,̂ 𝑏)̂

**章节**: §3.5  
**类别**: NTT 运算

### 规范

```
Algorithm 44 AddNTT(𝑎,̂ 𝑏)̂
Computes the sum 𝑎̂ + 𝑏̂ of two elements 𝑎,̂ 𝑏̂ ∈ 𝑇𝑞 .
Input: 𝑎,̂ 𝑏̂ ∈ 𝑇𝑞 .
Output: 𝑐 ̂ ∈ 𝑇𝑞 .
1: for 𝑖 from 0 to 255 do
̂
2:
𝑐[𝑖]
̂ ← 𝑎[𝑖]
̂ + 𝑏[𝑖]
3: end for
4: return 𝑐 ̂
```

### CipherCat

尚未实现。
