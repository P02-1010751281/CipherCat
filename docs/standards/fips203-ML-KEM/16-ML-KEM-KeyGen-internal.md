# Algorithm 16  ML-KEM.KeyGen_internal(d, z)

**章节**: §6.1 ML-KEM 内部  
**类别**: ML-KEM 内部密钥生成

### 规范

```
Input:  randomness d, z ∈ 𝔹^{32}
Output: encapsulation key ek ∈ 𝔹^{384k+32}
        decapsulation key dk ∈ 𝔹^{768k+96}

 1: (ekPKE, dkPKE) ← K-PKE.KeyGen(d)
 2: ek ← ekPKE                                ▷ KEM encaps key = PKE encrypt key
 3: dk ← (dkPKE ‖ ekPKE ‖ H(ekPKE) ‖ z)
 4: return (ek, dk)
```

### 备注

CipherCat 未实现。

ek = ekPKE (直接使用 PKE 加密密钥)。
dk 包含 PKE 密钥对 + H(ekPKE) 哈希 + 隐式拒绝值 z。

