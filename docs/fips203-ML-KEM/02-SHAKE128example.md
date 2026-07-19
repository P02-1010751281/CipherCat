# Algorithm 2  SHAKE128example(str₁, …, strₘ, b₁, …, bₗ)

**章节**: §2.4 伪代码符号约定  
**类别**: 示例（非规范性）

### 规范

```
Input:  byte strings str₁,…,strₘ, output lengths b₁,…,bₗ
Output: byte arrays out₁,…,outₗ

 1: ctx ← XOF.Init()
 2: for i ← 1 to m:
 3:    ctx ← XOF.Absorb(ctx, strᵢ)
 4: end for
 5: for i ← 1 to ℓ:
 6:    (ctx, outᵢ) ← XOF.Squeeze(ctx, bᵢ)
 7: end for
 8: return (out₁, …, outₗ)
```

### 备注

非规范性示例，演示 XOF 对象语法。XOF = SHAKE128 (rate=168 bytes)。

