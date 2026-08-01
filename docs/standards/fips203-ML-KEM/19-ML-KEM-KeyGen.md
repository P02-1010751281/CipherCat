# Algorithm 19  ML-KEM.KeyGen()

**章节**: §7.1 ML-KEM 公开接口  
**类别**: ML-KEM 密钥生成

### 规范

```
Output: encapsulation key ek ∈ 𝔹^{384k+32}
        decapsulation key dk ∈ 𝔹^{768k+96}

 1: d ←$ 𝔹^{32}                              ▷ 32 random bytes
 2: z ←$ 𝔹^{32}
 3: if d == NULL or z == NULL then
 4:    return ⊥
 5: end if
 6: (ek, dk) ← ML-KEM.KeyGen_internal(d, z)
 7: return (ek, dk)
```

### 备注

CipherCat 未实现。

需符合 §3.3 的 RBG 安全强度: 128-bit (ML-KEM-512), 192-bit (768), 256-bit (1024)。

